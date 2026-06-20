# internal-asset-hub

`internal-asset-hub`는 사내 고성능 서버를 중앙 자산 허브로 활용하기 위한 **frontend-first MVP** 프로토타입입니다.
프로젝트 문서, 디자인 산출물, 개발 문서, 배포 결과물, 운영 문서를 프로젝트 단위로 등록/검색/조회할 수 있는 내부 관리자 대시보드를 목표로 합니다.

## Tech Stack

- React
- TypeScript
- Vite
- React Router
- Tailwind CSS
- Zustand (확장 준비)
- lucide-react
- Mock service/data layer

## Architecture Overview

이 프로젝트는 **Feature-Sliced Design (FSD)** 아키텍처를 따릅니다.

레이어 구조:

```txt
src/
  app/
  pages/
  widgets/
  features/
  entities/
  shared/
```

의존성 규칙:

```txt
app → pages → widgets → features → entities → shared
```

- 상위 레이어는 하위 레이어를 import 할 수 있습니다.
- 하위 레이어는 상위 레이어를 import 하지 않습니다.
- 각 슬라이스는 `index.ts` 공개 API를 통해 사용합니다.

## Naming Convention

- 폴더/파일명: **kebab-case**
- 컴포넌트명: PascalCase
- 훅 함수명: camelCase (파일명은 kebab-case)
- Type/Interface: PascalCase
- 정적 상수: UPPER_SNAKE_CASE
- 기본적으로 named export 사용

## Run Project

```bash
npm install
npm run dev
```

검증:

```bash
npm run lint
npm run build
```

## Folder Structure

```txt
src/
  app/
    providers/
    router/
    styles/
  pages/
    dashboard/
    projects/project-list/
    projects/project-detail/
    assets/asset-register/
    assets/asset-detail/
    search/
    ai-extension/
    settings/
  widgets/
    app-layout/
    app-sidebar/
    app-header/
    dashboard-summary/
    recent-projects/
    recent-assets/
    project-card-list/
    asset-table/
    search-filter/
    search-results/
    ai-extension-preview/
  features/
    project-create/
    project-filter/
    asset-register/
    asset-category-filter/
    asset-search/
    file-upload/
    tag-input/
  entities/
    project/
    asset/
    server/
    user/
  shared/
    api/
    config/
    constants/
    lib/
    mocks/
    types/
    ui/
```

## Design System

shadcn/ui 스타일의 디자인 토큰과 공유 컴포넌트를 `shared/ui/`에서 관리합니다.

- **색상 토큰:** `src/app/styles/globals.css` (`:root` + `.dark` CSS 변수가 단일 소스)
- **레이아웃/간격 참조:** `src/shared/constants/layout-tokens.ts`, `src/shared/constants/css-var-names.ts`
- **테마:** `next-themes` (`ThemeProvider`), 헤더/설정의 `ThemeToggle` (light / dark / system)
- **유틸:** `cn()` (`clsx` + `tailwind-merge`), `cva` 기반 variant
- **Typography:** `Heading`, `Text` (`shared/ui/typography`)
- **Spacing:** semantic token (`gap-widget`, `gap-page`, `px-card-x`, `py-list-row-y` 등 — `globals.css` + `tailwind.config.js`)
- **레이아웃:** `widgets/app-layout` (사이드바/헤더/메인 패딩)
- **주요 컴포넌트:** Button, Card, Badge, Input, Textarea, Select, Tabs, Table, Dialog, EmptyState, Skeleton, FormField, Tag

색상은 semantic token(`background`, `foreground`, `muted`, `primary`, `destructive` 등)을 사용하며, raw Tailwind palette 직접 사용은 지양합니다.

## Main Routes

- `/` : 대시보드
- `/projects` : 프로젝트 목록
- `/projects/:projectId` : 프로젝트 상세
- `/assets/new` : 자산 등록
- `/assets/:assetId` : 자산 상세
- `/search` : 통합 검색
- `/ai-extension` : AI 확장
- `/settings` : 설정

## Key Screens

- KPI 요약 카드, 서버 상태, 최근 프로젝트/자산
- 프로젝트 검색/상태 필터/카드 목록
- 프로젝트 상세 + 카테고리 탭 + 자산 테이블
- 자산 등록 폼 + 파일 업로드 UI mock
- 통합 검색 + 필터 + 결과 미리보기
- 자산 상세 + 관련 자산 + 향후 AI 패널
- AI 확장 로드맵 카드
- 기본 설정 섹션

## MVP Included Scope

- 프로젝트 등록/조회 중심 UI
- 자산 등록 UI (파일 업로드는 mock)
- 자산 목록/검색/상세
- 서버 상태 mock 표시
- AI 확장 페이지(계획 상태 표시)
- 한국어 사용자 UI 라벨
- FSD 구조 + 확장 가능한 mock service layer

## MVP Excluded Scope

- 실파일 업로드
- 실백엔드 API
- 인증/인가
- 실 AI 챗봇/요약/자동 태깅
- 실서버 모니터링/스토리지 연동
- DB 연동/권한 정책/배포 파이프라인

## Mock Data Structure

- `shared/mocks/mock-projects.ts`
- `shared/mocks/mock-assets.ts`
- `shared/mocks/mock-server-status.ts`
- `shared/mocks/mock-users.ts`

주요 데이터는 프로젝트, 자산, 서버 상태, 사용자 정보로 구성되며 서비스 레이어에서 비동기 함수 형태로 소비됩니다.

## Future Extension Plan

- 실제 API 연동 (`entities/*/api` 교체)
- 권한/접근 제어
- 실시간 서버 메트릭
- AI 기반 문서 요약/태그 추천/분류
- 임베딩 검색 및 내부 문서 질의

## API Integration Points

- `src/entities/project/api/project-service.ts`
- `src/entities/asset/api/asset-service.ts`
- `src/entities/server/api/server-service.ts`
- `src/features/asset-search/model/search-service.ts`

현재는 mock 기반이지만 반환 형태를 async로 맞춰 실제 API로 쉽게 치환 가능합니다.

## Korean Labels + English Code Policy

- 사용자 화면 라벨은 한국어 중심으로 구성합니다.
- 코드 식별자, 타입명, 파일/폴더명은 영어 + kebab-case 규칙을 유지합니다.
