---
description: Obsidian vault 초기 세팅. vault 경로, 폴더 구조, 의존성을 대화형으로 설정한다.
allowed-tools: Read, Write, Edit, Bash, Glob
---

# Obsidian Vault Setup

Obsidian vault를 초기 설정하는 대화형 워크플로우.

## 설정 파일 경로

**`~/.claude/plugins/config/obsidian.json`**

이미 설정 파일이 존재하면 내용을 보여주고 "재설정할까요?" 확인 후 진행한다.

## 1단계: Vault 경로

사용자에게 vault 경로를 물어본다.

```
Obsidian vault 경로를 설정합니다.

기본값: ~/claude-obsidian-vault
직접 지정하려면 경로를 입력해주세요.
```

- 기존 Obsidian vault가 해당 경로에 있으면: "기존 vault를 발견했습니다. 연결합니다."
- 없으면: "새 vault를 생성합니다."

## 2단계: 폴더 구조

기본 구조를 보여주고 확인한다:

```
기본 폴더 구조:

  00-inbox/       임시 보관 (분류 전)
  10-work/        업무 기술 (Kafka, K8s, Spring 등)
  20-projects/    사이드 프로젝트
  30-learning/    학습 (영어, 트레이딩 등)
  40-reference/   외부 참고 자료
  90-archive/     아카이브
  _moc/           Map of Content
  _templates/     노트 템플릿

이대로 진행할까요? 폴더명을 변경하고 싶으면 알려주세요.
```

사용자가 커스텀 요청 시:
- 폴더명 변경 (예: "10-work" → "work")
- 폴더 추가/제거
- 변경 내용을 반영하여 다시 확인

## 3단계: 의존성 확인

```bash
python3 --version 2>/dev/null
```

- Python3 있으면: 플러그인 번들 search.py를 vault의 `.vectors/` 디렉토리에 복사
- Python3 없으면: "Python3이 없습니다. 시맨틱 검색 없이 키워드 검색만 사용합니다."

## 4단계: 생성 및 저장

### 4a. 설정 파일 저장

`~/.claude/plugins/config/` 디렉토리가 없으면 생성.

`~/.claude/plugins/config/obsidian.json` 작성:

```json
{
  "vaultPath": "<사용자가 선택한 경로>",
  "folders": {
    "inbox": "00-inbox",
    "work": "10-work",
    "projects": "20-projects",
    "learning": "30-learning",
    "reference": "40-reference",
    "archive": "90-archive",
    "moc": "_moc",
    "templates": "_templates"
  },
  "setupComplete": true
}
```

### 4b. 폴더 생성

설정에 정의된 모든 폴더를 vault 경로 하위에 생성한다.
이미 존재하는 폴더는 건너뛴다.

### 4c. 템플릿 복사

플러그인의 `templates/` 디렉토리에서 vault의 `_templates/` 디렉토리로 복사한다.
플러그인 루트 경로는 `${CLAUDE_PLUGIN_ROOT}` 환경변수 또는 상대경로로 참조한다.
템플릿이 이미 있으면 덮어쓰지 않는다.

### 4d. .vectors 디렉토리

```bash
mkdir -p <vaultPath>/.vectors
```

Python3가 있으면 search.py를 복사한다.

### 4e. .gitignore

vault 루트에 `.gitignore`가 없으면 생성:

```
.vectors/
.obsidian/
```

## 5단계: 완료 보고

```
Obsidian vault 설정 완료!

  경로: ~/claude-obsidian-vault
  폴더: 8개 생성
  템플릿: 3개 복사
  시맨틱 검색: 활성화 (Python3 감지)

사용 가능한 커맨드:
  /obsidian:save [주제]      노트 저장
  /obsidian:recall [키워드]  노트 검색
  /obsidian:organize         vault 정리
  /obsidian:moc [주제]       MOC 관리
```
