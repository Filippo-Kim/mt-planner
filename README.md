# MT Planner

학과 MT·소모임 행사를 처음 맡은 학생회 임원을 위한 AI 기획 도우미입니다.
인원·기간·예산만 입력하면 타임테이블, 준비물, 예산 배분안을 자동으로 만들어 드립니다.

**배포 URL:** https://mt-planner.vercel.app

---

## 서비스 소개

MT를 처음 기획하면 선배가 남긴 엑셀 한 장에 의존하게 되고, 인원이나 예산이 바뀌면 처음부터 다시 계산해야 합니다. MT Planner는 이 초기 진입 장벽을 없애는 것을 목표로 합니다.

### 주요 기능

| 페이지 | 기능 | AI 사용 |
|---|---|---|
| 홈 | 서비스 소개 및 진입 | — |
| 기획 시작하기 | 행사 정보 입력 → AI 기획안 생성 | ○ |
| 준비물 계산기 | 인원수 기반 준비물 수량 자동 계산 | — |
| 소개 | 제작 배경, 사용법, FAQ | — |

---

## 기술 스택

- **프론트엔드:** HTML / CSS / JavaScript (바닐라, 프레임워크 미사용)
- **백엔드:** Vercel Serverless Functions (Python, WSGI)
- **AI:** Google Gemini API (`gemini-3.6-flash`)
- **배포:** Vercel
- **버전 관리:** Git / GitHub

---

## 프로젝트 구조
mt-planner/
├── index.html # 홈
├── plan.html # 기획 시작하기 (AI 기능)
├── checklist.html # 준비물 계산기
├── about.html # 소개
├── css/
│ └── style.css
├── js/
│ ├── ai.js # AI API 호출 및 결과 렌더링
│ └── checklist.js # 준비물 계산 로직
├── api/
│ └── generate.py # Gemini API 연동 서버리스 함수
├── docs/ # 기획서 및 증빙 자료
├── requirements.txt
├── vercel.json # 함수 실행 시간 설정
└── README.md

---

## 실행 방법

### 1. 저장소 클론

```bash
git clone https://github.com/Filippo-Kim/mt-planner.git
cd mt-planner
```

### 2. 가상환경 생성 및 패키지 설치

```bash
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

### 3. 환경 변수 설정

프로젝트 루트에 `.env` 파일을 만들고 아래 내용을 작성합니다.
GEMINI_API_KEY=발급받은_API_키
> API 키는 [Google AI Studio](https://aistudio.google.com)에서 발급받을 수 있습니다.
> `.env` 파일은 `.gitignore`에 포함되어 있어 저장소에 올라가지 않습니다.

### 4. 로컬 실행

```bash
vercel dev
```

---

## 배포 방법

### 1. Vercel 프로젝트 연결

```bash
vercel link
```

### 2. 환경 변수 등록

```bash
vercel env add GEMINI_API_KEY
```

Production / Preview / Development 환경에 모두 등록합니다.
환경 변수는 등록 후 **재배포해야 반영**됩니다.

### 3. 배포

```bash
vercel --prod
```

GitHub 저장소를 Vercel에 연결한 경우, `main` 브랜치에 push하면 자동 배포됩니다.

---

## 환경 변수

| 변수명 | 설명 | 필수 |
|---|---|---|
| `GEMINI_API_KEY` | Google Gemini API 키 | ○ |

API 키는 서버리스 함수 내부에서만 사용되며, 프론트엔드 코드에 노출되지 않습니다.

---

## AI 기능 명세

**입력**
- 행사 종류 (MT / 세미나 / 답사 / 뒷풀이)
- 인원 (필수)
- 기간 (당일 / 1박2일 / 2박3일)
- 1인 예산 (필수)
- 컨셉·요청사항 (선택)

**출력**
- 시간대별 타임테이블
- 준비물 목록 (품목 / 수량 / 예상 단가)
- 항목별 예산 배분 및 총액

**실패 처리**

| 상황 | 응답 |
|---|---|
| 필수값 누락 | 요청 전 차단, 안내 메시지 표시 |
| 요청 형식 오류 | 400 |
| API 호출 실패 | 502 |
| 응답 지연 (50초 초과) | 504 |
| JSON 파싱 실패 | 502 |

---

## 라이선스

이 프로젝트는 학습 목적으로 제작되었습니다.