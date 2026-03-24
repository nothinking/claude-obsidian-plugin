---
description: Obsidian vault의 Map of Content(MOC)를 생성하거나 갱신한다. "MOC 만들어", "kafka MOC", "MOC 업데이트" 같은 요청에 사용.
argument-hint: [주제명 | --update-all | --suggest]
allowed-tools: Read, Write, Edit, Bash, Grep, Glob
---

# MOC (Map of Content) Manager

Obsidian vault의 MOC를 생성하거나 갱신한다.

## 설정 로드

먼저 `~/.claude/plugins/config/obsidian.json`을 읽어 vault 경로와 폴더 구조를 확인한다.
설정 파일이 없으면 `/obsidian:setup`을 먼저 실행하라고 안내하고 중단한다.

이하 `VAULT`는 설정의 `vaultPath`, `FOLDERS`는 설정의 `folders` 객체를 의미한다.

## 서브커맨드

`$ARGUMENTS`를 파싱하여 동작을 결정한다.

### `/moc <주제명>` — MOC 생성/갱신

예: `/moc kafka`, `/moc trading`, `/moc k8s`

**실행 흐름:**

1. **관련 노트 수집**:
   시맨틱 검색 가능 시:
   ```bash
   python3 VAULT/.vectors/search.py search "<주제명>" --top=30
   ```
   추가로 태그 기반 검색 (Grep):
   - 태그에 주제명이 포함된 노트
   두 결과를 합치고 중복 제거.

2. **분류**:
   - **Core**: 주제를 직접 다루는 노트 (제목이나 태그에 주제명 포함)
   - **Related Topics**: 간접 관련 노트 (시맨틱 검색으로만 발견, similarity < 0.7)

3. **MOC 파일 생성/갱신**:

   파일 경로: `VAULT/FOLDERS.moc/<주제명>.md`

   **새로 생성하는 경우:**
   ```markdown
   ---
   title: "<주제명> MOC"
   created: YYYY-MM-DD
   tags: [moc/<주제명>]
   type: moc
   ---

   # <주제명>

   이 주제와 관련된 노트 모음입니다.

   ## Core

   - [[노트1]] — 한 줄 설명
   - [[노트2]] — 한 줄 설명

   ## Related Topics

   - [[관련노트1]] — 한 줄 설명
   ```

   **기존 MOC 갱신하는 경우:**
   - 기존 MOC 파일을 읽음
   - 새로 발견된 노트 중 아직 MOC에 없는 것만 추가
   - 기존 항목은 건드리지 않음

4. **임베딩 갱신** (search.py 있을 때):
   ```bash
   python3 VAULT/.vectors/search.py embed VAULT/FOLDERS.moc/<주제명>.md
   ```

5. **결과 보고**

### `/moc --update-all` — 전체 MOC 갱신

`VAULT/FOLDERS.moc/` 내 모든 MOC 파일을 순회하며 갱신.

### `/moc --suggest` — 새 MOC 제안

3개 이상 노트가 있는 태그 prefix로 새 MOC 생성을 제안.

## 주의사항

- MOC 파일의 type은 항상 `moc`.
- MOC 내 링크는 `[[파일명]]` 형식 (확장자 제외).
- 각 링크 뒤에 ` — ` 구분자와 한 줄 설명을 추가한다.
- `## Core`에는 주제를 직접 다루는 핵심 노트만, `## Related Topics`에는 간접 관련 노트.
