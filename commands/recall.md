---
description: Obsidian vault에서 관련 노트를 검색하여 현재 작업 컨텍스트에 가져온다. "저번에 어떻게 했더라", "vault에서 찾아줘", "관련 노트 있어?" 같은 요청에 사용.
argument-hint: [검색 키워드] [--reindex]
allowed-tools: Read, Bash, Grep, Glob
---

# Recall from Obsidian Vault

Obsidian vault에서 관련 노트를 검색하여 현재 작업에 활용할 수 있도록 내용을 가져온다.

## 설정 로드

먼저 `~/.claude/plugins/config/obsidian.json`을 읽어 vault 경로와 폴더 구조를 확인한다.
설정 파일이 없으면 `/obsidian:setup`을 먼저 실행하라고 안내하고 중단한다.

이하 `VAULT`는 설정의 `vaultPath`, `FOLDERS`는 설정의 `folders` 객체를 의미한다.

## 실행 순서

### 0. 인덱스 갱신 (옵션)

`$ARGUMENTS`에 `--reindex`가 포함되어 있으면 먼저 인덱스를 재구축한다:
```bash
python3 VAULT/.vectors/search.py reindex
```
`--reindex`를 제거한 나머지를 검색 키워드로 사용한다.

### 1. 키워드 준비

`$ARGUMENTS`에서 검색 키워드를 추출한다.
한국어/영어 변형도 준비한다:
- "카프카" <-> "kafka"
- "쿠버네티스" <-> "kubernetes" <-> "k8s"
- "스프링" <-> "spring"
- "비트코인" <-> "bitcoin" <-> "btc"

### 2. 프로젝트 컨텍스트 태그 추출

CWD가 vault가 아니면, 기술 스택을 감지하여 boost 태그를 준비한다:
- `package.json` -> `infra/nodejs`, `infra/react` 등
- `build.gradle` -> `infra/spring`, `infra/java`
- `go.mod` -> `infra/go`

이 태그는 검색 시 boost에 사용된다.

### 3. 하이브리드 검색 파이프라인

**Stage 1 — 시맨틱 검색** (search.py + 임베딩 있을 때):
```bash
python3 VAULT/.vectors/search.py search "$KEYWORDS" --top=10 --boost-tags="$PROJECT_TAGS"
```

**Stage 2 — 키워드 fallback** (Stage 1이 3개 미만이거나 불가 시):

검색 대상: `VAULT/` 하위 모든 `.md` 파일
제외: `FOLDERS.templates`, `.obsidian/`, `.vectors/`

- **2a — 파일명 매칭**: Glob으로 `**/*키워드*.md` 패턴
- **2b — frontmatter 태그 매칭**: Grep으로 `tags:.*키워드`
- **2c — 본문 전체 텍스트**: Grep으로 본문 검색
- **2d — 한영 변형으로 재검색**

각 단계에서 결과가 충분하면 (3개 이상) 다음 단계는 건너뛴다.

**Stage 3 — 하이브리드 랭킹**:

Stage 1과 Stage 2 결과를 병합하여 랭킹:
- 시맨틱 점수: `0.6 * semantic_score`
- 키워드 점수: `0.2 * keyword_hit`
- 태그 점수: `0.1 * tag_match`
- 최신도: `0.1 * recency` (최근 30일 = 1.0)
- 최종 top 5 선택

**Stage 4 — 관련 노트 체이닝**:

Top 3 결과 노트의 `## Related` 섹션에서 `[[wikilink]]` 추출.
아직 결과에 없으면 "also related"로 간략히 제시.

### 4. 결과 정리

**찾은 경우:**
- 관련도 높은 순으로 최대 5개 선택
- 각 노트: 제목, 경로, 핵심 2-3줄 요약, 검색 모드(semantic/keyword) 표시

**못 찾은 경우:**
- "관련 노트를 찾지 못했습니다"
- 유사한 키워드의 노트가 있으면 "혹시 이걸 찾으시나요?"로 제안

### 5. 컨텍스트 활용

찾은 노트를 현재 작업에 자연스럽게 반영한다:
- 이전 해결 방법 참조
- 관련 코드 스니펫 활용
- 가장 관련도 높은 1-2개는 전문을 읽어서 현재 대화에 활용

## 주의사항

- 노트를 수정하지 않는다. 읽기 전용.
- `FOLDERS.archive` 폴더는 다른 결과가 없을 때만 포함.
- 검색 결과를 현재 프로젝트에 파일로 복사하지 않는다. 읽어서 대화에 활용만.
