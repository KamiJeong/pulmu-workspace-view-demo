import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, waitFor, within } from "storybook/test";
import {
  AppShell,
  Button,
  Card,
  CodeReference,
  CollapsibleSidebar,
  ContentWithRail,
  EmbeddedView,
  FilterDataRegion,
  MasterDetail,
  MetricGrid,
  OverflowRegion,
  PageHeader,
  Select,
  StateLayout,
} from "@pulmu/ui";
import "@pulmu/ui/global.css";
import "./LayoutPatterns.css";

const meta = {
  title: "09 Layout Patterns/Responsive workspace",
  parameters: { layout: "fullscreen" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;
type LayoutViewport = "desktop" | "tablet" | "mobile" | "narrow";

async function matchLayoutScreenshot(canvasElement: HTMLElement, name: string) {
  if (!("__vitest_worker__" in window)) return;
  const { expect: browserExpect } = await import("vitest");
  await browserExpect.element(canvasElement.ownerDocument.documentElement).toMatchScreenshot(name);
}

const navigation = (
  <nav aria-label="워크스페이스 메뉴">
    <ul>
      <li><a aria-current="page" href="#overview">개요</a></li>
      <li><a href="#runs">Forge 실행</a></li>
      <li><a href="#checks">검증 결과</a></li>
      <li><a href="#settings">설정</a></li>
    </ul>
  </nav>
);

const WorkspaceSidebar = () => (
  <CollapsibleSidebar
    collapseLabel="탐색 접기"
    expandLabel="탐색 펼치기"
    label="Pulmu 워크스페이스 탐색"
    mobileCloseLabel="탐색 닫기"
    mobileTriggerLabel="탐색 열기"
  >
    {navigation}
  </CollapsibleSidebar>
);

const metrics = [
  ["현재 단계", "🌊 Quench"],
  ["검증", "18 / 18"],
  ["리뷰", "대기 중"],
  ["변경 파일", "12"],
] as const;

function WorkspaceLayout() {
  return (
    <AppShell
      data-testid="app-shell"
      header={(
        <div className="layout-demo__product">
          <span className="layout-demo__brand">🔥 Pulmu</span>
          <span className="layout-demo__workspace">pulmu-workspace-view-demo-for-responsive-layout-validation</span>
        </div>
      )}
      mainId="workspace-main"
      sidebar={<WorkspaceSidebar />}
      skipLinkLabel="본문으로 건너뛰기"
    >
      <PageHeader
        actions={<><Button>검증 실행</Button><Button variant="secondary">변경 내용 보기</Button></>}
        description="긴 작업 설명과 저장소 이름이 있어도 페이지 전체가 가로로 밀리지 않고 정보의 우선순위가 유지됩니다."
        eyebrow="워크스페이스 / issue #11"
        title="반응형 Pulmu 워크스페이스 레이아웃 검토"
      />

      <MetricGrid label="Forge 핵심 지표">
        {metrics.map(([label, value]) => <div className="layout-demo__metric" key={label}><span>{label}</span><strong>{value}</strong></div>)}
      </MetricGrid>

      <ContentWithRail
        data-testid="content-with-rail"
        label="실행 개요와 저장소 정보"
        rail={<Card heading="저장소"><CodeReference>pulmu/feat/responsive-layout-patterns-with-an-unbroken-branch-reference</CodeReference></Card>}
        railLabel="저장소 정보"
      >
        <Card heading="현재 작업">
          <p>git worktree를 구성하고 issue #11의 내용을 확인한 다음, 데스크톱·태블릿·모바일·좁은 화면에서 논리적인 읽기 순서를 유지하는 레이아웃 패턴을 구현합니다.</p>
        </Card>
      </ContentWithRail>

      <FilterDataRegion
        data={(
          <div className="layout-demo__stack">
            <OverflowRegion data-testid="table-overflow" label="저장소 비교 표">
              <table className="layout-demo__table">
                <caption>반응형 기준 결과</caption>
                <thead><tr><th scope="col">뷰포트</th><th scope="col">내비게이션</th><th scope="col">콘텐츠</th><th scope="col">로컬 오버플로</th></tr></thead>
                <tbody>
                  <tr><td>1440px</td><td>접을 수 있는 사이드바</td><td>본문 + 레일 2열</td><td>표 영역만</td></tr>
                  <tr><td>768px</td><td>접을 수 있는 사이드바</td><td>본문 다음 레일</td><td>표 영역만</td></tr>
                  <tr><td>390px / 320px</td><td>모달 사이드 시트</td><td>단일 열</td><td>표 영역만</td></tr>
                </tbody>
              </table>
            </OverflowRegion>
            <OverflowRegion data-testid="chart-overflow" label="검증 추세 차트">
              <svg aria-labelledby="layout-chart-title layout-chart-description" className="layout-demo__chart" role="img" viewBox="0 0 768 180">
                <title id="layout-chart-title">최근 다섯 실행의 검증 추세</title>
                <desc id="layout-chart-description">통과 항목이 12개에서 18개로 증가하고 경고는 4개에서 1개로 감소했습니다.</desc>
                <path className="layout-demo__chart-grid" d="M48 24H744M48 88H744M48 152H744" fill="none" />
                <g className="layout-demo__chart-primary"><rect height="72" width="48" x="88" y="80" /><rect height="88" width="48" x="220" y="64" /><rect height="104" width="48" x="352" y="48" /><rect height="112" width="48" x="484" y="40" /><rect height="120" width="48" x="616" y="32" /></g>
                <g className="layout-demo__chart-secondary"><rect height="32" width="20" x="140" y="120" /><rect height="24" width="20" x="272" y="128" /><rect height="24" width="20" x="404" y="128" /><rect height="16" width="20" x="536" y="136" /><rect height="8" width="20" x="668" y="144" /></g>
              </svg>
            </OverflowRegion>
          </div>
        )}
        dataLabel="반응형 결과"
        filters={<Card className="layout-demo__filter" heading="필터"><Select label="검증 상태" options={[{ label: "전체", value: "all" }, { label: "통과", value: "pass" }]} /></Card>}
        filtersLabel="결과 필터"
        label="검증 데이터와 필터"
      />

      <MasterDetail
        data-testid="master-detail"
        detail={<Card heading="선택한 단계"><p>Quench는 현재 diff에 대해 lint, typecheck, 테스트, 빌드를 확인합니다.</p></Card>}
        detailLabel="선택한 단계 상세"
        label="Forge 단계와 상세"
        master={<div className="layout-demo__stack"><h2>Forge 단계</h2><ol className="layout-demo__list"><li>🔥 Ignite — Prepare</li><li>🔎 Inspect — Explore</li><li>📐 Shape — Design</li><li>🔨 Hammer — Implement</li><li>🌊 Quench — Verify</li></ol></div>}
        masterLabel="Forge 단계 목록"
      />
    </AppShell>
  );
}

async function verifyResponsiveContract(canvasElement: HTMLElement, viewport: LayoutViewport) {
  const canvas = within(canvasElement);
  const shell = canvas.getByTestId("app-shell");
  const expectedWidth = { desktop: 1440, tablet: 768, mobile: 390, narrow: 320 }[viewport];
  await expect(window.innerWidth).toBe(expectedWidth);
  await expect(shell.firstElementChild).toHaveClass("pulmu-skip-link");
  await expect(canvas.getByRole("link", { name: "본문으로 건너뛰기" })).toHaveAttribute("href", "#workspace-main");
  await expect(canvas.getByRole("main")).toHaveAttribute("tabindex", "-1");
  await expect(canvas.getAllByRole("heading", { level: 1 })).toHaveLength(1);

  for (const testId of ["content-with-rail", "master-detail"] as const) {
    const layout = canvas.getByTestId(testId);
    const primary = layout.firstElementChild;
    const supporting = layout.lastElementChild;
    await expect(Boolean(primary && supporting && (primary.compareDocumentPosition(supporting) & Node.DOCUMENT_POSITION_FOLLOWING))).toBe(true);
    const primaryBounds = primary?.getBoundingClientRect();
    const supportingBounds = supporting?.getBoundingClientRect();
    if (viewport === "desktop") {
      await expect(Math.abs((primaryBounds?.top ?? 0) - (supportingBounds?.top ?? 1))).toBeLessThan(1);
      await expect((supportingBounds?.left ?? 0) > (primaryBounds?.left ?? 0)).toBe(true);
    } else {
      await expect((supportingBounds?.top ?? 0) >= (primaryBounds?.bottom ?? 1)).toBe(true);
    }
  }

  if (viewport === "desktop" || viewport === "tablet") {
    await waitFor(() => expect(canvas.getByRole("complementary", { name: "Pulmu 워크스페이스 탐색" })).toBeInTheDocument());
    await expect(canvas.queryByRole("button", { name: "탐색 열기" })).not.toBeInTheDocument();
  } else {
    await waitFor(() => expect(canvas.getByRole("button", { name: "탐색 열기" })).toBeInTheDocument());
    await expect(canvas.queryByRole("complementary", { name: "Pulmu 워크스페이스 탐색" })).not.toBeInTheDocument();
  }

  const tableOverflow = canvas.getByRole("region", { name: "저장소 비교 표" });
  const chartOverflow = canvas.getByRole("region", { name: "검증 추세 차트" });
  await expect(getComputedStyle(tableOverflow).overflowX).toBe("auto");
  await expect(getComputedStyle(chartOverflow).overflowX).toBe("auto");
  if (viewport === "narrow") {
    await expect(tableOverflow.scrollWidth).toBeGreaterThan(tableOverflow.clientWidth);
    await expect(chartOverflow.scrollWidth).toBeGreaterThan(chartOverflow.clientWidth);
  }
  await expect(document.documentElement.scrollWidth).toBeLessThanOrEqual(document.documentElement.clientWidth);
  await expect(document.body.scrollWidth).toBeLessThanOrEqual(document.body.clientWidth);
}

export const Desktop1440: Story = {
  globals: { theme: "dark", viewport: { isRotated: false, value: "desktop" } },
  render: () => <WorkspaceLayout />,
  play: async ({ canvasElement }) => {
    await verifyResponsiveContract(canvasElement, "desktop");
    await matchLayoutScreenshot(canvasElement, "layout-desktop-1440.png");
  },
};

export const Tablet768: Story = {
  globals: { theme: "dark", viewport: { isRotated: false, value: "tablet" } },
  render: () => <WorkspaceLayout />,
  play: async ({ canvasElement }) => {
    await verifyResponsiveContract(canvasElement, "tablet");
    await matchLayoutScreenshot(canvasElement, "layout-tablet-768.png");
  },
};

export const Mobile390: Story = {
  globals: { theme: "dark", viewport: { isRotated: false, value: "mobile" } },
  render: () => <WorkspaceLayout />,
  play: async ({ canvasElement }) => {
    await verifyResponsiveContract(canvasElement, "mobile");
    await matchLayoutScreenshot(canvasElement, "layout-mobile-390.png");
  },
};

export const Narrow320: Story = {
  globals: { theme: "dark", viewport: { isRotated: false, value: "narrow" } },
  render: () => <WorkspaceLayout />,
  play: async ({ canvasElement }) => {
    await verifyResponsiveContract(canvasElement, "narrow");
    await matchLayoutScreenshot(canvasElement, "layout-narrow-320.png");
  },
};

export const DesktopSidebarKeyboard: Story = {
  globals: { viewport: { isRotated: false, value: "desktop" } },
  render: () => <WorkspaceLayout />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const collapse = canvas.getByRole("button", { name: "탐색 접기" });
    collapse.focus();
    await userEvent.keyboard(" ");
    const expand = canvas.getByRole("button", { name: "탐색 펼치기" });
    await expect(expand).toHaveFocus();
    await expect(expand).toHaveAttribute("aria-expanded", "false");
    await expect(canvas.queryByRole("link", { name: "개요" })).not.toBeInTheDocument();
    await userEvent.keyboard("{Enter}");
    await expect(canvas.getByRole("button", { name: "탐색 접기" })).toHaveAttribute("aria-expanded", "true");
  },
};

export const MobileSidebarKeyboard: Story = {
  globals: { viewport: { isRotated: false, value: "mobile" } },
  render: () => <WorkspaceLayout />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await waitFor(() => expect(canvas.getByRole("button", { name: "탐색 열기" })).toBeInTheDocument());
    const opener = canvas.getByRole("button", { name: "탐색 열기" });
    opener.focus();
    await userEvent.keyboard("{Enter}");
    await expect(canvas.getByRole("dialog", { name: "Pulmu 워크스페이스 탐색" })).toBeVisible();
    await expect(canvas.getByRole("button", { name: "탐색 닫기" })).toHaveFocus();
    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(opener).toHaveFocus());
    await expect(canvas.queryByRole("dialog", { name: "Pulmu 워크스페이스 탐색" })).not.toBeInTheDocument();
  },
};

export const MobileSidebarResizeRecovery: Story = {
  globals: { viewport: { isRotated: false, value: "mobile" } },
  render: () => <WorkspaceLayout />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await waitFor(() => expect(canvas.getByRole("button", { name: "탐색 열기" })).toBeInTheDocument());
    const opener = canvas.getByRole("button", { name: "탐색 열기" });
    await userEvent.click(opener);
    await expect(canvas.getByRole("dialog", { name: "Pulmu 워크스페이스 탐색" })).toBeVisible();

    if (!("__vitest_worker__" in window)) return;
    const { page } = await import("vitest/browser");
    await page.viewport(1440, 900);
    await waitFor(() => expect(canvas.getByRole("button", { name: "탐색 접기" })).toHaveFocus());
    await expect(canvas.queryByRole("dialog", { name: "Pulmu 워크스페이스 탐색" })).not.toBeInTheDocument();

    await page.viewport(390, 844);
    await waitFor(() => expect(canvas.getByRole("button", { name: "탐색 열기" })).toBeInTheDocument());
    await expect(canvas.getByRole("button", { name: "탐색 열기" })).toHaveFocus();
    await expect(canvas.queryByRole("dialog", { name: "Pulmu 워크스페이스 탐색" })).not.toBeInTheDocument();
  },
};

export const FeedbackStates: Story = {
  render: () => (
    <div className="layout-demo__states">
      <StateLayout description="현재 변경사항에 대해 검증을 실행하고 있습니다." state="loading" title="검증 중" />
      <StateLayout action={<Button>첫 실행 만들기</Button>} description="아직 실행 기록이 없습니다." state="empty" title="실행 없음" />
      <StateLayout action={<Button variant="secondary">다시 시도</Button>} description="검증 결과를 불러오지 못했습니다." state="failure" title="불러오기 실패" />
      <StateLayout action={<Button variant="secondary">계속 진행</Button>} description="안전하게 중단되었으며 변경사항은 보존되었습니다." state="interrupted" title="작업 중단됨" />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getAllByRole("status")[0]).toHaveAttribute("aria-busy", "true");
    await expect(canvas.getByRole("alert")).toHaveTextContent("불러오기 실패");
    await expect(canvas.getAllByRole("status")[1]).toHaveTextContent("작업 중단됨");
  },
};

export const EmbeddedWorkspace: Story = {
  globals: { viewport: { isRotated: false, value: "narrow" } },
  render: () => (
    <EmbeddedView description="호스트 애플리케이션 안에서도 독립적인 건너뛰기 링크와 본문 제목을 유지합니다." mainId="embedded-workspace-main" skipLinkLabel="임베드 본문으로 건너뛰기" title="임베드된 Pulmu 실행">
      <div className="layout-demo__embedded-card layout-demo__reading-order">
        <strong>pulmu/feat/extremely-long-unbroken-embedded-workspace-branch-name</strong>
        <p>주요 콘텐츠가 먼저 읽히고, 긴 한국어 설명도 320px에서 페이지 가로 스크롤을 만들지 않습니다.</p>
      </div>
    </EmbeddedView>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvasElement.firstElementChild?.firstElementChild).toHaveClass("pulmu-skip-link");
    await expect(canvas.getByRole("main")).toHaveAttribute("id", "embedded-workspace-main");
    await expect(canvas.getAllByRole("heading", { level: 1 })).toHaveLength(1);
    await expect(document.documentElement.scrollWidth).toBeLessThanOrEqual(document.documentElement.clientWidth);
  },
};
