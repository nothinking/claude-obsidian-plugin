---
description: 현재 작업 중인 내용을 Obsidian vault에 노트로 저장한다. "이거 정리해둬", "노트로 저장해", "vault에 저장" 같은 요청에 사용.
argument-hint: [주제 또는 키워드]
allowed-tools: Read, Write, Edit, Bash, Grep, Glob
---

# Save to Obsidian Vault

현재 대화에서 작업 중인 내용을 Obsidian vault에 마크다운 노트로 저장한다.

## 설정 로드

먼저 `~/.claude/plugins/config/obsidian.json`을 읽어 vault 경로와 폴더 구조를 확인한다.
설정 파일이 없으면 `/obsidian:setup`을 먼저 실행하라고 안내하고 중단한다.

이하 `VAULT`는 설정의 `vaultPath`, `FOLDERS`는 설정의 `folders` 객체를 의미한다.

## 실행 순서

### 1. 저장할 내용 결정

`$ARGUMENTS`가 있으면 해당 주제에 대해 현재 대화 맥락에서 핵심 내용을 추출한다.
`$ARGUMENTS`가 없으면 현재 대화의 최근 작업 내용을 요약하여 저장한다.

### 2. 노트 유형 판단

내용의 성격에 따라 템플릿을 선택한다:

- **문제 해결 과정** → `til` (Problem → Solution → Key Takeaway)
- **개념 정리 / 학습** → `note` (Summary → Details)
- **외부 자료 정리** → `article` (핵심 요약 → 내가 가져갈 것)

템플릿 파일은 `VAULT/FOLDERS.templates/`에 있다. 참조만 하고 복사하지는 않는다.

### 3. 폴더 배치

내용을 보고 적절한 폴더를 선택한다:

| 내용 | 폴더 키 |
|------|---------|
| Kafka, K8s, Spring, DB, 인프라 등 업무 기술 | `FOLDERS.work` |
| 사이드 프로젝트 | `FOLDERS.projects` |
| 영어, 트레이딩, 역사 등 학습 | `FOLDERS.learning` |
| 외부 아티클, 참고 자료 | `FOLDERS.reference` |
| 판단 어려움 | `FOLDERS.inbox` |

### 4. 파일 생성

```bash
# 파일명: 소문자 + 하이픈
VAULT/{폴더}/{파일명}.md
```

frontmatter 필수:

```yaml
---
title: "노트 제목"
created: YYYY-MM-DD
tags: [계층형/태그]
type: note | til | article
---
```

태그 규칙:
- 계층형 사용: `infra/kafka`, `infra/k8s`, `trading/btc`, `english/movietalk`
- 현재 프로젝트명이 명확하면 포함: `project/movietalk`

### 5. 본문 작성

- 간결하고 핵심만. 나중에 훑어보기 좋은 분량으로.
- 코드 스니펫이 있으면 반드시 포함하되, 언어 표시를 붙인다 (```java, ```yaml 등)
- 현재 프로젝트 경로처럼 로컬 환경에 종속적인 정보는 빼거나 일반화한다.

### 6. 관련 노트 링크 (시맨틱 + 키워드)

저장한 노트에 대해 관련 노트를 탐색한다.

**6a. 시맨틱 검색 (우선)**:
```bash
python3 VAULT/.vectors/search.py similar VAULT/{폴더}/{파일명}.md --top=3
```
- 결과가 있으면 `similarity > 0.3`인 노트를 관련 노트로 사용.

**6b. 키워드 fallback** (시맨틱 결과가 2개 미만이거나 실패 시):
vault 내 관련 키워드를 Grep으로 검색한다.

**6c. 링크 추가**:
- 찾으면 새 노트 하단 `## Related` 섹션에 `[[파일명]]` (확장자 제외) 추가
- **양방향**: 기존 노트의 `## Related`에도 새 노트 링크 추가
  - `## Related` 섹션이 있으면 그 아래에 추가
  - 없으면 노트 끝에 `## Related` 섹션 생성 후 추가
  - 이미 해당 링크가 있으면 중복 추가하지 않음
- 못 찾으면 `## Related` 섹션만 비워두기

### 7. MOC 자동 등록

`VAULT/FOLDERS.moc/` 디렉토리를 스캔하여 기존 MOC 파일이 있는지 확인한다.

- 새 노트의 태그를 MOC 파일명과 매칭 (태그 prefix 기준)
- 매칭되는 MOC의 `## Core` 섹션에 `[[새노트]]` 추가
- 이미 등록되어 있으면 중복 추가하지 않음
- 매칭되는 MOC가 없으면 건너뜀 (자동 생성하지 않음)

### 8. 임베딩 인덱스 갱신

```bash
python3 VAULT/.vectors/search.py embed VAULT/{폴더}/{파일명}.md
```

- 실행 실패 시 무시하고 진행한다.

### 9. 프로젝트 컨텍스트 태깅

현재 작업 디렉토리(CWD)에서 기술 스택을 감지하여 태그를 보강한다.

감지 파일 → 태그 매핑:
| 파일 | 추가 태그 |
|------|-----------|
| `package.json` | 내용에 따라: `infra/nodejs`, `infra/react`, `infra/nextjs` 등 |
| `build.gradle` 또는 `build.gradle.kts` | `infra/spring` 또는 `infra/java` |
| `go.mod` | `infra/go` |
| `pom.xml` | `infra/java` 또는 `infra/spring` |
| `Cargo.toml` | `infra/rust` |
| `requirements.txt` 또는 `pyproject.toml` | `infra/python` |
| `docker-compose.yml` | `infra/docker` |
| `k8s/` 또는 `kubernetes/` 디렉토리 | `infra/k8s` |

- CWD가 vault 자체이면 이 단계를 건너뜀.
- 이미 해당 태그가 frontmatter에 있으면 중복 추가하지 않음.

### 10. 완료 보고

저장 완료 후 한 줄 요약:
```
VAULT/{폴더}/{파일명}.md [{태그}]
```
연결된 관련 노트가 있으면 함께 표시:
```
   -> [[kafka-producer-config]] [[kafka-consumer-group]]
```
MOC에 등록했으면 표시:
```
   MOC: {moc폴더}/kafka.md에 등록
```

## 주의사항

- 절대로 기존 노트를 덮어쓰지 않는다. 같은 이름이 있으면 `-2`, `-3` suffix를 붙인다.
- vault 구조(폴더, 템플릿)가 없으면 `/obsidian:setup`을 안내한다.
- 현재 프로젝트의 소스 코드를 통째로 복사하지 않는다. 핵심 설정이나 패턴만 발췌.
