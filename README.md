# FaviconKit

이미지 한 장을 업로드하면 파비콘, 앱 아이콘, manifest, head snippet을 생성하여 ZIP 파일로 다운로드할 수 있는 웹 도구입니다.

## 주요 기능

- PNG/JPEG 이미지 업로드 (최대 8MB)
- 6가지 사이즈 자동 생성 (16, 32, 48, 180, 192, 512px)
- favicon.ico 자동 생성 (16/32/48px 포함)
- 2가지 프리셋 지원
  - **Classic Web** — `public/` 디렉토리 구조 + head-snippet.html
  - **Next.js App Router** — `app/` + `public/` 디렉토리 구조 + manifest.ts
- 배경색, 패딩, fit(contain/cover) 옵션
- 실시간 캔버스 프리뷰
- ZIP 다운로드 (새 탭에서 네이티브 attachment)

## 기술 스택

| 영역 | 기술 |
|------|------|
| 프레임워크 | Next.js 16 (App Router) |
| 언어 | TypeScript 5 (strict) |
| 스타일링 | Tailwind CSS v4 |
| 이미지 처리 | sharp (서버사이드) |
| ICO 생성 | png-to-ico |
| ZIP 생성 | archiver |
| 아이콘 | lucide-react |
| 패키지 매니저 | pnpm |

## 시작하기

```bash
# 의존성 설치
pnpm install

# 개발 서버 실행
pnpm dev

# 프로덕션 빌드
pnpm build

# 프로덕션 서버 실행
pnpm start
```

## 프로젝트 구조

```
app/
├── api/generate/route.ts       # POST /api/generate - ZIP 생성 API
├── components/
│   ├── upload-form.tsx          # 드래그앤드롭 업로드 + HTML form
│   ├── options-panel.tsx        # 옵션 컨트롤 (프리셋, fit, 패딩, 배경색 등)
│   └── preview-panel.tsx        # 캔버스 기반 실시간 프리뷰
├── lib/
│   ├── validation.ts            # 타입 정의 + 스키마 유효성 검증
│   ├── generate-icons.ts        # 1024px 베이스 캔버스 → 멀티사이즈 아이콘
│   ├── generate-manifest.ts     # manifest, head-snippet, README 텍스트 생성
│   └── build-zip.ts             # 프리셋별 ZIP 조립
├── page.tsx                     # 메인 페이지
├── layout.tsx                   # 루트 레이아웃
└── globals.css                  # Tailwind CSS
```

## API

### `POST /api/generate`

이미지와 옵션을 받아 ZIP 파일을 반환합니다.

**Request:** `multipart/form-data`
- `image` — PNG 또는 JPEG 파일 (최대 8MB)
- `options` — JSON 문자열 (선택)

**Options:**

| 필드 | 타입 | 기본값 | 설명 |
|------|------|--------|------|
| preset | `"classic-web"` \| `"nextjs-app-router"` | `"classic-web"` | ZIP 출력 구조 |
| fit | `"contain"` \| `"cover"` | `"contain"` | 이미지 맞춤 방식 |
| paddingPct | `0` ~ `0.2` | `0` | 아이콘 내부 여백 비율 |
| background | `"transparent"` \| `"#RRGGBB"` | `"transparent"` | 배경색 |
| appName | string | `"My App"` | manifest name |
| shortName | string | `"MyApp"` | manifest short_name |

**Response:**
- `200` — `application/zip` (attachment)
- `400` — `{ "error": "VALIDATION_ERROR", "details": "..." }`
- `413` — `{ "error": "FILE_TOO_LARGE" }`
- `500` — `{ "error": "INTERNAL_ERROR" }`

## 라이선스

MIT
