---
description: Obsidian vault의 구조와 품질을 점검한다. "vault 정리해", "노트 정리", "고아 노트 찾아", "중복 노트 확인", "태그 정리" 같은 요청에 사용.
argument-hint: [inbox | archive | tags | orphans | duplicates]
allowed-tools: Read, Edit, Bash, Grep, Glob
---

# Organize Obsidian Vault

Obsidian vault의 구조적 품질을 점검하고 개선을 제안한다.

## 설정 로드

먼저 `~/.claude/plugins/config/obsidian.json`을 읽어 vault 경로와 폴더 구조를 확인한다.
설정 파일이 없으면 `/obsidian:setup`을 먼저 실행하라고 안내하고 중단한다.

이하 `VAULT`는 설정의 `vaultPath`, `FOLDERS`는 설정의 `folders` 객체를 의미한다.

## 핵심 원칙

**절대 자동으로 수정하지 않는다.** 항상 결과를 제시하고 사용자 확인 후에만 실행한다.

## 서브커맨드

`$ARGUMENTS`를 파싱하여 서브커맨드를 결정한다. 인자가 없으면 전체 체크 요약.

### `/organize` (인자 없음) — 전체 체크 요약

모든 점검을 간략히 실행하여 vault 상태 요약:

```bash
python3 VAULT/.vectors/search.py orphans
python3 VAULT/.vectors/search.py duplicates
python3 VAULT/.vectors/search.py tag-check
```

추가로 `FOLDERS.inbox` 파일 수와 `FOLDERS.archive` 후보 수를 직접 확인.

결과를 테이블로 요약:
```
Vault 상태 요약
| 항목 | 수 | 상태 |
|------|---|------|
| 전체 노트 | 42 | - |
| Inbox 미분류 | 3 | 정리 필요 |
| 고아 노트 | 5 | 링크 필요 |
| 유사 노트 쌍 | 1 | 확인 필요 |
| 태그 불일치 | 2쌍 | 통합 검토 |
| 아카이브 후보 | 4 | 선택적 |
```

search.py가 없으면 Glob/Grep으로 가능한 항목만 점검한다.

### `/organize inbox` — Inbox 정리

`VAULT/FOLDERS.inbox/` 내 파일을 적절한 폴더로 이동 제안:

각 파일에 대해:
1. 파일 내용과 태그를 읽어서 적절한 폴더 판단
2. 시맨틱 검색 가능하면 `search.py suggest-folder` 활용
3. 이동 제안 테이블 작성
4. 사용자가 승인한 항목만 이동

### `/organize archive` — 아카이브 제안

6개월 이상 된 노트 중 다른 노트에서 참조되지 않는 것을 아카이브 후보로 제시:

1. 모든 노트의 `created` 날짜 확인
2. 현재 날짜 기준 6개월 이상 경과 확인
3. 다른 노트의 `[[wikilink]]`에서 참조되는지 확인
4. 미참조 + 6개월+ 노트를 아카이브 후보로 제시
5. 사용자 승인 후 `FOLDERS.archive/`로 이동

### `/organize tags` — 태그 통합 제안

1. 유사한 태그 쌍을 제시 (`k8s` vs `kubernetes`, `db` vs `database`)
2. 태그 없는 노트 목록
3. 통합 제안 테이블 작성
4. 사용자 승인 후 frontmatter 수정

### `/organize orphans` — 고아 노트

들어오는/나가는 wikilink 없는 노트 목록.
각 고아 노트에 대해 유사한 노트를 찾아 링크 제안.
사용자 승인 후 `## Related` 섹션에 링크 추가.

### `/organize duplicates` — 중복 노트

유사도 >0.85 노트 쌍을 찾아 병합/유지 제안.
사용자 승인 후 병합 실행 (한쪽에 통합 후 다른 쪽 아카이브).

## 주의사항

- 모든 변경은 제안 -> 확인 -> 실행 순서. 자동 변경 금지.
- `FOLDERS.templates`, `.obsidian/`, `.vectors/`는 점검 대상에서 제외.
- 파일 이동 시 해당 파일을 참조하는 다른 노트의 wikilink도 함께 수정.
