import { expect, userEvent, waitFor, within } from "storybook/test";

export type ScreenViewport = "desktop" | "tablet" | "mobile" | "narrow";
export type ScreenTheme = "light" | "dark";

export const screenGlobals = (theme: ScreenTheme, viewport: ScreenViewport) => ({
  motion: "reduced",
  theme,
  viewport: { isRotated: false, value: viewport },
});

export async function stabilizeScreenVisual(canvasElement: HTMLElement) {
  const document = canvasElement.ownerDocument;
  await document.fonts.ready;
  if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
  const view = document.defaultView;
  if (view) {
    view.history.replaceState(null, "", `${view.location.pathname}${view.location.search}`);
    view.scrollTo(0, 0);
  }
  document.documentElement.scrollTop = 0;
  document.body.scrollTop = 0;
  await new Promise<void>((resolve) => {
    view?.requestAnimationFrame(() => view.requestAnimationFrame(() => resolve()));
  });
}

export async function matchScreenScreenshot(canvasElement: HTMLElement, name: string) {
  if (!("__vitest_worker__" in window)) return;

  const document = canvasElement.ownerDocument;
  await stabilizeScreenVisual(canvasElement);

  const { expect: browserExpect } = await import("vitest");
  await browserExpect.element(document.documentElement).toMatchScreenshot(name);
}

export async function assertScreenShell(canvasElement: HTMLElement, viewport: ScreenViewport) {
  const canvas = within(canvasElement);
  const shell = canvas.getByTestId("pulmu-screen-shell");
  const skipLink = canvas.getByRole("link", { name: /^Skip to / });
  const main = canvas.getByRole("main");

  await expect(shell.firstElementChild).toBe(skipLink);
  await expect(skipLink).toHaveAttribute("href", "#screen-main");
  skipLink.focus();
  await userEvent.keyboard("{Enter}");
  await waitFor(() => expect(main).toHaveFocus());
  await expect(canvas.getAllByRole("heading", { level: 1 })).toHaveLength(1);
  await expect(document.documentElement.scrollWidth).toBeLessThanOrEqual(document.documentElement.clientWidth);
  await expect(document.body.scrollWidth).toBeLessThanOrEqual(document.body.clientWidth);

  const compact = viewport === "mobile" || viewport === "narrow";
  if (compact) {
    const trigger = canvas.getByRole("button", { name: "Open workspace navigation" });
    trigger.focus();
    await userEvent.keyboard("{Enter}");
    const dialog = canvas.getByRole("dialog", { name: "Workspace navigation" });
    const links = within(dialog).getAllByRole("link");
    for (const link of links) {
      const href = link.getAttribute("href")!;
      await expect(canvasElement.ownerDocument.querySelector(href)).toBeInTheDocument();
    }
    await expect(canvas.getByRole("button", { name: "Close workspace navigation" })).toHaveFocus();
    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(trigger).toHaveFocus());
    return;
  }

  const collapse = canvas.getByRole("button", { name: "Collapse workspace navigation" });
  await expect(Math.round(collapse.getBoundingClientRect().width)).toBe(44);
  await expect(Math.round(collapse.getBoundingClientRect().height)).toBe(44);
}

export async function assertForgeContract(canvasElement: HTMLElement, currentStage: string) {
  const canvas = within(canvasElement);
  const stages = [...canvasElement.querySelectorAll<HTMLElement>("[data-stage-id]")];
  await expect(stages.map(({ dataset }) => dataset.stageId)).toEqual([
    "ignite", "inspect", "shape", "hammer", "quench", "hone", "ship",
  ]);
  await expect(stages).toHaveLength(7);
  await expect(canvasElement.querySelectorAll('[aria-current="step"]')).toHaveLength(1);
  await expect(canvasElement.querySelector('[aria-current="step"]')).toHaveAttribute("data-stage-id", currentStage);
  await expect(canvas.getByText("Pattern").closest("[data-stage-id]")).toHaveAttribute("data-stage-id", "shape");

  const forge = canvas.getByRole("region", { name: "Run activity and canonical forge progress" });
  const primary = forge.firstElementChild;
  const supporting = forge.lastElementChild;
  await expect(Boolean(
    primary && supporting && (primary.compareDocumentPosition(supporting) & Node.DOCUMENT_POSITION_FOLLOWING),
  )).toBe(true);

  await expect(canvasElement).not.toHaveTextContent("Synthetic example task");
  await expect(canvasElement).not.toHaveTextContent("pulmu/feat/synthetic-example");
  await expect(canvasElement).not.toHaveTextContent("forge.example.invalid");
}
