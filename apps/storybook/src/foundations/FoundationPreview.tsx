import { useState } from "react";

import { PULMU_ICONS_PACKAGE } from "@pulmu/icons";
import { PULMU_MODEL_PACKAGE } from "@pulmu/model";
import { PULMU_TOKENS_PACKAGE } from "@pulmu/tokens";
import { PULMU_UI_PACKAGE } from "@pulmu/ui";

import "./FoundationPreview.css";

type FoundationPreviewProps = {
  headingOverride?: string;
  locale: "en" | "ko";
  motion: "reduced" | "system";
  summaryOverride?: string;
  theme: "dark" | "light";
};

const localizedCopy = {
  en: {
    active: "active",
    inactive: "inactive",
    interactionHeading: "Keyboard interaction check",
    language: "Language",
    motion: "Motion",
    motionReduced: "reduced",
    motionSystem: "system",
    previewState: "Preview state",
    settingsHeading: "Current global settings",
    summary:
      "An executable proof that shared workspace styles, preview globals, accessibility checks, and interactions are wired together.",
    theme: "Theme",
    themeDark: "dark",
    themeLight: "light",
    title: "Storybook foundation",
    workspacePackages: "Workspace packages",
  },
  ko: {
    active: "활성",
    inactive: "비활성",
    interactionHeading: "키보드 상호작용 확인",
    language: "언어",
    motion: "움직임",
    motionReduced: "움직임 줄이기",
    motionSystem: "시스템 설정",
    previewState: "미리보기 상태",
    settingsHeading: "현재 전역 설정",
    summary:
      "공유 워크스페이스 스타일, 미리보기 전역 설정, 접근성 검사와 상호작용 테스트가 함께 연결되었음을 확인하는 실행 가능한 예시입니다.",
    theme: "테마",
    themeDark: "다크",
    themeLight: "라이트",
    title: "Storybook 기반",
    workspacePackages: "워크스페이스 패키지",
  },
} as const;

const workspacePackages = [
  PULMU_MODEL_PACKAGE,
  PULMU_TOKENS_PACKAGE,
  PULMU_ICONS_PACKAGE,
  PULMU_UI_PACKAGE,
].join(", ");

export function FoundationPreview({
  headingOverride,
  locale,
  motion,
  summaryOverride,
  theme,
}: FoundationPreviewProps) {
  const [pressed, setPressed] = useState(false);
  const copy = localizedCopy[locale];

  return (
    <main className="foundation-preview">
      <header>
        <p className="foundation-preview__eyebrow">Pulmu Design System v0.1</p>
        <h1>{headingOverride || copy.title}</h1>
        <p className="foundation-preview__summary">{summaryOverride || copy.summary}</p>
      </header>

      <section className="foundation-preview__panel" aria-labelledby="settings-heading">
        <h2 id="settings-heading">{copy.settingsHeading}</h2>
        <dl className="foundation-preview__settings">
          <div>
            <dt>{copy.theme}</dt>
            <dd>{theme === "light" ? copy.themeLight : copy.themeDark}</dd>
          </div>
          <div>
            <dt>{copy.language}</dt>
            <dd>{locale === "ko" ? "한국어" : "English"}</dd>
          </div>
          <div>
            <dt>{copy.motion}</dt>
            <dd>{motion === "reduced" ? copy.motionReduced : copy.motionSystem}</dd>
          </div>
          <div>
            <dt>{copy.workspacePackages}</dt>
            <dd>{workspacePackages}</dd>
          </div>
        </dl>
      </section>

      <section className="foundation-preview__panel" aria-labelledby="interaction-heading">
        <h2 id="interaction-heading">{copy.interactionHeading}</h2>
        <button
          aria-pressed={pressed}
          className="foundation-preview__button"
          onClick={() => setPressed((current) => !current)}
          type="button"
        >
          {copy.previewState}: {pressed ? copy.active : copy.inactive}
        </button>
      </section>
    </main>
  );
}
