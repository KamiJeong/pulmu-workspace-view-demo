import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent, within } from "storybook/test";
import { UI_ICONS } from "@pulmu/icons";
import {
  Alert, Avatar, Badge, Breadcrumb, Button, Card, Checkbox, CodeReference, CopyButton,
  Dialog, EmptyState, ErrorState, IconButton, Input, Link, Menu, Pagination, Popover,
  Progress, SearchField, Select, Skeleton, SkipLink, Spinner, Switch, Tabs, Tooltip,
  VisuallyHidden, componentMaturity,
} from "@pulmu/ui";
import "@pulmu/ui/global.css";
import "./CoreComponents.css";

const meta = {
  title: "05 Core Components/Components",
  tags: ["autodocs"],
  parameters: { layout: "padded" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;
const options = [{ label: "Quick Forge", value: "quick" }, { label: "Standard Forge", value: "standard" }, { label: "Full Forge", value: "full" }];
const menuSelect = fn();
const tooltipKeyDown = fn();
const loadingAction = fn();
const maturityGroups = Object.entries(componentMaturity).reduce<Record<string, string[]>>((groups, [name, maturity]) => {
  (groups[maturity] ??= []).push(name);
  return groups;
}, {});

const colorChannels = (color: string) => (color.match(/[\d.]+/g) ?? []).slice(0, 3).map(Number);
const relativeLuminance = (color: string) => colorChannels(color)
  .map((channel) => channel / 255)
  .map((channel) => channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4)
  .reduce((total, channel, index) => total + channel * [0.2126, 0.7152, 0.0722][index], 0);
const contrastRatio = (foreground: string, background: string) => {
  const values = [relativeLuminance(foreground), relativeLuminance(background)].sort((a, b) => b - a);
  return (values[0] + 0.05) / (values[1] + 0.05);
};
const verifyLoadingButton = async (canvasElement: HTMLElement) => {
  const canvas = within(canvasElement);
  const loading = canvas.getByRole("button", { name: "Starting forge" });
  const disabled = canvas.getByRole("button", { name: "Unavailable" });
  await expect(loading).toHaveAttribute("aria-busy", "true");
  await expect(loading).toHaveAttribute("data-loading", "true");
  await expect(loading).toBeDisabled();
  await expect(loading).toHaveTextContent("Starting forge");
  await expect(loading).not.toHaveTextContent(/^Start forge$/);
  await expect(getComputedStyle(loading).opacity).toBe("1");
  await expect(Number(getComputedStyle(disabled).opacity)).toBeLessThan(1);
  await expect(contrastRatio(getComputedStyle(loading).color, getComputedStyle(loading).backgroundColor)).toBeGreaterThanOrEqual(4.5);
  loadingAction.mockClear();
  await userEvent.click(loading);
  await expect(loadingAction).not.toHaveBeenCalled();
};

const DemoDialog = () => {
  const [open, setOpen] = useState(false);
  return <><Button onClick={() => setOpen(true)}>Open dialog</Button><Dialog actions={<Button onClick={() => setOpen(false)}>Confirm</Button>} description="Review the selected forge settings before continuing." onOpenChange={setOpen} open={open} title="Start forge?">Keyboard focus remains in this modal until it closes.</Dialog></>;
};

const ManualTabsDemo = () => <Tabs activationMode="manual" label="Manual tabs" items={[
  { id: "one", label: "One", content: "Panel one" },
  { id: "disabled", label: "Disabled", content: "Unavailable", disabled: true },
  { id: "three", label: "Three", content: "Panel three" },
]} />;

const VerticalTabsDemo = () => <Tabs activationMode="manual" label="Vertical tabs" orientation="vertical" items={[
  { id: "overview", label: "Overview", content: "Overview panel" },
  { id: "unavailable", label: "Unavailable", content: "Unavailable panel", disabled: true },
  { id: "verification", label: "Verification", content: "Verification panel" },
]} />;

const ControlledTabsDemo = () => {
  const [value, setValue] = useState("one");
  const [showFirst, setShowFirst] = useState(true);
  const [disableFirst, setDisableFirst] = useState(false);
  const items = [
    ...(showFirst ? [{ id: "one", label: "One", content: "Panel one", disabled: disableFirst }] : []),
    { id: "two", label: "Two", content: "Panel two" },
    { id: "three", label: "Three", content: "Panel three" },
  ];
  return <div className="core-stack"><div className="core-row"><Button onClick={() => setValue("three")}>Select third</Button><Button onClick={() => setShowFirst(false)} variant="secondary">Remove first</Button><Button onClick={() => setDisableFirst(true)} variant="secondary">Disable first</Button></div><Tabs items={items} label="Controlled tabs" onValueChange={setValue} value={value} /></div>;
};

export const ButtonStory: Story = {
  name: "Button",
  globals: { theme: "dark" },
  render: () => <div className="core-row"><Button>Start forge</Button><Button variant="secondary">Cancel</Button><Button variant="danger">Delete run</Button><Button loading loadingLabel="Starting forge" onClick={loadingAction}>Start forge</Button><Button disabled>Unavailable</Button></div>,
  play: async ({ canvasElement }) => verifyLoadingButton(canvasElement),
};
export const ButtonLightStates: Story = {
  globals: { theme: "light" },
  render: () => <div className="core-row"><Button>Start forge</Button><Button loading loadingLabel="Starting forge" onClick={loadingAction}>Start forge</Button><Button disabled>Unavailable</Button></div>,
  play: async ({ canvasElement }) => verifyLoadingButton(canvasElement),
};
export const IconButtonStory: Story = { name: "IconButton", render: () => <IconButton icon={UI_ICONS.settings} label="Open settings" variant="secondary" /> };
export const LinkStory: Story = { name: "Link", render: () => <Link href="https://example.com" target="_blank">Read external documentation</Link> };
export const InputStory: Story = { name: "Input", render: () => <div className="core-stack"><Input description="Use a memorable workspace name." label="Workspace name" defaultValue="Pulmu demo" /><Input error="A repository URL is required." label="Repository URL" aria-required="true" /></div> };
export const SearchFieldStory: Story = { name: "SearchField", render: () => <SearchField description="Press Enter to search." label="Search components" onSearch={fn()} placeholder="Button, Dialog…" /> };
export const SelectStory: Story = { name: "Select", render: () => <Select label="Forge depth" options={options} defaultValue="standard" /> };
export const CheckboxStory: Story = { name: "Checkbox", render: () => <Checkbox defaultChecked description="Includes keyboard and accessibility checks." label="Run full verification" /> };
export const SwitchStory: Story = { name: "Switch", render: () => <Switch defaultChecked description="Stops non-essential interface motion." label="Reduce motion" /> };
export const TabsStory: Story = {
  name: "Tabs",
  render: () => <Tabs label="Run details" items={[{ id: "summary", label: "Summary", content: "Forge is ready." }, { id: "checks", label: "Checks", content: "All checks passed." }, { id: "long", label: "아주 긴 탭 이름과 긴 콘텐츠", content: "좁은 화면에서도 탭 목록만 가로 스크롤되고 페이지는 넘치지 않습니다." }]} />,
  play: async ({ canvasElement }) => { const canvas = within(canvasElement); const summary = canvas.getByRole("tab", { name: "Summary" }); summary.focus(); await userEvent.keyboard("{ArrowRight}"); await expect(canvas.getByRole("tab", { name: "Checks" })).toHaveAttribute("aria-selected", "true"); await expect(canvas.getByRole("tabpanel")).toHaveTextContent("All checks passed"); },
};
export const ManualTabsKeyboard: Story = {
  render: () => <ManualTabsDemo />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const one = canvas.getByRole("tab", { name: "One" });
    const three = canvas.getByRole("tab", { name: "Three" });
    one.focus();
    await userEvent.keyboard("{ArrowRight}");
    await expect(three).toHaveFocus();
    await expect(one).toHaveAttribute("aria-selected", "true");
    await expect(canvas.getByRole("tab", { name: "Disabled" })).toBeDisabled();
    await userEvent.keyboard("{Enter}");
    await expect(three).toHaveAttribute("aria-selected", "true");
    await userEvent.keyboard("{ArrowLeft}");
    await expect(one).toHaveFocus();
    await expect(three).toHaveAttribute("aria-selected", "true");
    await userEvent.keyboard("{End}");
    await userEvent.keyboard("{Home}");
    await expect(one).toHaveFocus();
    await expect(three).toHaveAttribute("aria-selected", "true");
    await userEvent.keyboard(" ");
    await expect(one).toHaveAttribute("aria-selected", "true");
    await userEvent.keyboard("{End}");
    await expect(three).toHaveFocus();
  },
};
export const VerticalTabsKeyboard: Story = {
  render: () => <VerticalTabsDemo />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const overview = canvas.getByRole("tab", { name: "Overview" });
    const verification = canvas.getByRole("tab", { name: "Verification" });
    await expect(canvas.getByRole("tablist")).toHaveAttribute("aria-orientation", "vertical");
    overview.focus();
    await userEvent.keyboard("{ArrowDown}");
    await expect(verification).toHaveFocus();
    await expect(canvas.getByRole("tab", { name: "Unavailable" })).toBeDisabled();
    await expect(overview).toHaveAttribute("aria-selected", "true");
    await userEvent.keyboard("{Enter}");
    await expect(verification).toHaveAttribute("aria-selected", "true");
  },
};
export const ControlledDynamicTabs: Story = {
  render: () => <ControlledTabsDemo />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const tabStops = () => canvas.getAllByRole("tab").filter((tab) => tab.tabIndex === 0);
    await expect(tabStops()).toHaveLength(1);
    await userEvent.click(canvas.getByRole("button", { name: "Select third" }));
    await expect(canvas.getByRole("tab", { name: "Three" })).toHaveAttribute("aria-selected", "true");
    await expect(tabStops()).toEqual([canvas.getByRole("tab", { name: "Three" })]);
    await userEvent.click(canvas.getByRole("tab", { name: "One" }));
    await userEvent.click(canvas.getByRole("button", { name: "Disable first" }));
    await expect(canvas.getByRole("tab", { name: "Two" })).toHaveAttribute("aria-selected", "true");
    await expect(tabStops()).toEqual([canvas.getByRole("tab", { name: "Two" })]);
    await userEvent.click(canvas.getByRole("button", { name: "Remove first" }));
    await expect(canvas.queryByRole("tab", { name: "One" })).not.toBeInTheDocument();
    await expect(tabStops()).toHaveLength(1);
  },
};
export const BadgeStory: Story = { name: "Badge", render: () => <div className="core-row"><Badge>Beta</Badge><Badge tone="success">Passed</Badge><Badge tone="danger">Failed</Badge></div> };
export const AvatarStory: Story = { name: "Avatar", render: () => <Avatar alt="Jin, workspace owner" fallback="JH" /> };
export const CardStory: Story = { name: "Card", render: () => <Card actions={<Button variant="secondary">Review</Button>} heading="Core UI beta">긴 한국어 콘텐츠와 exceptionally-long-unbroken-english-identifiers-wrap-without-overflowing-the-page.</Card> };
export const ProgressStory: Story = { name: "Progress", render: () => <div className="core-stack"><Progress label="Forge progress" value={64} /><Progress label="Preparing repository" /></div> };
export const ProgressBoundaries: Story = {
  render: () => <div className="core-stack"><Progress label="Below zero" value={-10} /><Progress label="Above maximum" value={180} /><Progress label="Invalid maximum" max={0} value={50} /><Progress label="Non-finite maximum" max={Number.POSITIVE_INFINITY} value={25} /></div>,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("progressbar", { name: "Below zero" })).toHaveAttribute("aria-valuenow", "0");
    await expect(canvas.getByRole("progressbar", { name: "Above maximum" })).toHaveAttribute("aria-valuenow", "100");
    await expect(canvas.getByRole("progressbar", { name: "Invalid maximum" })).toHaveAttribute("aria-valuemax", "100");
    await expect(canvas.getByRole("progressbar", { name: "Invalid maximum" })).toHaveAttribute("aria-valuenow", "50");
    await expect(canvas.getByRole("progressbar", { name: "Non-finite maximum" })).toHaveAttribute("aria-valuemax", "100");
    await expect(canvas.getByRole("progressbar", { name: "Below zero" }).querySelector<HTMLElement>(".pulmu-progress__value")?.style.width).toBe("0%");
    await expect(canvas.getByRole("progressbar", { name: "Above maximum" }).querySelector<HTMLElement>(".pulmu-progress__value")?.style.width).toBe("100%");
  },
};
export const SpinnerStory: Story = { name: "Spinner", render: () => <Spinner label="Loading run" /> };
export const SkeletonStory: Story = { name: "Skeleton", render: () => <Skeleton style={{ inlineSize: "min(100%, 24rem)" }} /> };
export const TooltipStory: Story = {
  name: "Tooltip",
  render: () => <Tooltip content="View run details"><IconButton icon={UI_ICONS.info} label="Run information" onKeyDown={tooltipKeyDown} variant="secondary" /></Tooltip>,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole("button", { name: "Run information" });
    await userEvent.tab();
    await expect(trigger).toHaveFocus();
    await expect(canvas.getByRole("tooltip")).toBeVisible();
    await userEvent.keyboard("{Escape}");
    await expect(tooltipKeyDown).toHaveBeenCalled();
    await expect(trigger).toHaveFocus();
    await expect(canvas.queryByRole("tooltip")).not.toBeInTheDocument();
    await userEvent.tab();
    await userEvent.tab({ shift: true });
    await expect(canvas.getByRole("tooltip")).toBeVisible();
  },
};
export const PopoverStory: Story = { name: "Popover", render: () => <Popover content={<p className="core-popover-copy">This non-modal panel dismisses outside or with Escape.</p>} triggerLabel="Show details" /> };
export const MenuStory: Story = {
  name: "Menu",
  render: () => <div className="core-row"><Menu items={[{ id: "open", label: "Open workspace", onSelect: menuSelect }, { id: "delete", label: "Delete", disabled: true }, { id: "copy", label: "Copy branch name", onSelect: menuSelect }, { id: "settings", label: "Settings", onSelect: menuSelect }]} label="Workspace actions" triggerLabel="Actions" /><Button variant="secondary">After menu</Button></div>,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole("button", { name: /Actions/ });
    const open = async () => { await userEvent.click(trigger); await expect(canvas.getByRole("menuitem", { name: "Open workspace" })).toHaveFocus(); };
    await open();
    await userEvent.keyboard("{ArrowDown}");
    await expect(canvas.getByRole("menuitem", { name: "Copy branch name" })).toHaveFocus();
    await userEvent.keyboard("{ArrowDown}{ArrowDown}");
    await expect(canvas.getByRole("menuitem", { name: "Open workspace" })).toHaveFocus();
    await userEvent.keyboard("{End}");
    await expect(canvas.getByRole("menuitem", { name: "Settings" })).toHaveFocus();
    await userEvent.keyboard("{Home}c");
    await expect(canvas.getByRole("menuitem", { name: "Copy branch name" })).toHaveFocus();
    await userEvent.keyboard("{Enter}");
    await expect(menuSelect).toHaveBeenCalled();
    await expect(canvas.queryByRole("menu")).not.toBeInTheDocument();
    await open();
    await userEvent.keyboard("{Tab}");
    await expect(canvas.getByRole("button", { name: "After menu" })).toHaveFocus();
    await expect(canvas.queryByRole("menu")).not.toBeInTheDocument();
    trigger.focus();
    await open();
    await userEvent.keyboard("{Shift>}{Tab}{/Shift}");
    await expect(trigger).toHaveFocus();
    await expect(canvas.queryByRole("menu")).not.toBeInTheDocument();
  },
};
export const DialogStory: Story = {
  name: "Dialog",
  render: () => <DemoDialog />,
  play: async ({ canvasElement }) => { const canvas = within(canvasElement); const trigger = canvas.getByRole("button", { name: "Open dialog" }); await userEvent.click(trigger); const dialog = within(document.body).getByRole("dialog", { name: "Start forge?" }); await expect(dialog).toBeVisible(); await userEvent.keyboard("{Escape}"); await expect(trigger).toHaveFocus(); },
};
export const AlertStory: Story = { name: "Alert", render: () => <div className="core-stack"><Alert title="Verification passed" tone="success">The exact diff is ready for review.</Alert><Alert title="Repository unavailable" tone="danger">Check the remote and try again.</Alert></div> };
export const EmptyStateStory: Story = { name: "EmptyState", render: () => <EmptyState action={<Button>Create run</Button>} description="Start Pulmu to see its forge stages here." title="No runs yet" /> };
export const ErrorStateStory: Story = { name: "ErrorState", render: () => <ErrorState action={<Button variant="secondary">Try again</Button>} description="The run could not be loaded." title="Something went wrong" /> };
export const PaginationStory: Story = { name: "Pagination", render: () => <Pagination currentPage={2} getHref={(page) => `?page=${page}`} totalPages={4} /> };
export const BreadcrumbStory: Story = { name: "Breadcrumb", render: () => <Breadcrumb items={[{ href: "#workspaces", label: "Workspaces" }, { href: "#pulmu", label: "아주 긴 Pulmu 작업 공간 이름" }, { label: "Run #42" }]} /> };
export const CopyButtonStory: Story = {
  name: "CopyButton",
  render: () => <CopyButton errorLabel="복사하지 못했습니다" text="pulmu/feat/core-ui-components" />,
  play: async ({ canvasElement }) => {
    const descriptor = Object.getOwnPropertyDescriptor(navigator, "clipboard");
    Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText: fn().mockRejectedValue(new Error("denied")) } });
    try {
      const button = within(canvasElement).getByRole("button", { name: "Copy" });
      await userEvent.click(button);
      await expect(button).toHaveTextContent("복사하지 못했습니다");
      await expect(within(canvasElement).getByText("복사하지 못했습니다", { selector: "span.pulmu-visually-hidden" })).toHaveAttribute("aria-live", "polite");
    } finally {
      if (descriptor) Object.defineProperty(navigator, "clipboard", descriptor);
      else Reflect.deleteProperty(navigator, "clipboard");
    }
  },
};
export const CodeReferenceStory: Story = { name: "CodeReference", render: () => <CodeReference>pulmu/feat/exceptionally-long-core-ui-component-branch-reference</CodeReference> };
export const VisuallyHiddenStory: Story = { name: "VisuallyHidden", render: () => <Button><VisuallyHidden>Start the</VisuallyHidden> Forge</Button> };
export const SkipLinkStory: Story = { name: "SkipLink", render: () => <><SkipLink href="#storybook-main">Skip to component preview</SkipLink><p>Press Tab to reveal the skip link.</p></> };
export const MaturityOverview: Story = { render: () => <div className="core-maturity"><h2>Component maturity</h2><p>Maturity groups communicate adoption confidence without repeating the same status on every row.</p>{Object.entries(maturityGroups).map(([maturity, names]) => <section className="core-maturity__group" key={maturity}><header><Badge tone="warning">{maturity}</Badge><strong>{names.length} components</strong></header><ul aria-label={`${maturity} components`}>{names.map((name) => <li aria-label={`${name}: ${maturity}`} key={name}><CodeReference>{name}</CodeReference></li>)}</ul></section>)}</div> };
export const NarrowContentCoverage: Story = {
  render: () => <Card heading="매우 긴 한국어와 English content"><p>좁은 화면에서 한국어 설명이 자연스럽게 줄바꿈됩니다.</p><CodeReference>pulmu/feat/an-exceptionally-long-unbroken-english-code-reference-that-must-wrap</CodeReference></Card>,
  parameters: { viewport: { defaultViewport: "narrow" } },
  play: async ({ canvasElement }) => { await expect(canvasElement.scrollWidth).toBeLessThanOrEqual(canvasElement.clientWidth); },
};
export const OverlayEdgeCoverage: Story = {
  render: () => <div className="core-edge-overlays"><Tooltip content="Tooltip stays visible at the right edge"><IconButton icon={UI_ICONS.info} label="Edge tooltip" variant="secondary" /></Tooltip><Popover content={<p className="core-popover-copy">Popover content stays inside the narrow viewport near its bottom edge.</p>} triggerLabel="Edge popover" /><Menu items={[{ id: "first", label: "First action" }, { id: "second", label: "Second action" }]} label="Edge menu" triggerLabel="Edge menu" /></div>,
  parameters: { viewport: { defaultViewport: "narrow" } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const insideViewport = async (element: HTMLElement) => {
      const rect = element.getBoundingClientRect();
      await expect(rect.left).toBeGreaterThanOrEqual(0);
      await expect(rect.right).toBeLessThanOrEqual(window.innerWidth);
      await expect(rect.top).toBeGreaterThanOrEqual(0);
      await expect(rect.bottom).toBeLessThanOrEqual(window.innerHeight);
    };
    const tooltipTrigger = canvas.getByRole("button", { name: "Edge tooltip" });
    await userEvent.tab();
    await expect(tooltipTrigger).toHaveFocus();
    await insideViewport(canvas.getByRole("tooltip"));
    tooltipTrigger.blur();
    await userEvent.click(canvas.getByRole("button", { name: "Edge popover" }));
    await insideViewport(canvas.getByRole("region", { name: "Edge popover" }));
    await userEvent.click(canvas.getByRole("button", { name: /Edge menu/ }));
    await insideViewport(canvas.getByRole("menu"));
    await expect(document.documentElement.scrollWidth).toBeLessThanOrEqual(document.documentElement.clientWidth);
  },
};
