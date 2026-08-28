import { useEffect, useState, type PropsWithChildren } from "react";

import {
  DocsContainer,
  type DocsContainerProps,
} from "@storybook/addon-docs/blocks";

import {
  applyDocsGlobalsUpdate,
  type GlobalsUpdatedPayload,
} from "./docsGlobals";
import {
  applyPreviewGlobals,
} from "./previewGlobals";
import "./PulmuDocsContainer.css";

const GLOBALS_UPDATED = "globalsUpdated";

type GlobalValues = Record<string, unknown>;
type DocsContextWithStore = DocsContainerProps["context"] & {
  store?: {
    globals?: GlobalValues;
    userGlobals?: {
      globals?: GlobalValues;
    };
  };
};

function readDocsGlobals(context: DocsContainerProps["context"]): GlobalValues {
  const contextWithStore = context as DocsContextWithStore;

  return {
    ...context.projectAnnotations.initialGlobals,
    ...contextWithStore.store?.globals,
    ...contextWithStore.store?.userGlobals?.globals,
  };
}

export function PulmuDocsContainer({
  children,
  context,
  ...props
}: PropsWithChildren<DocsContainerProps>) {
  const [globals, setGlobals] = useState(() => readDocsGlobals(context));

  applyPreviewGlobals(globals, { persistTheme: false });

  useEffect(() => {
    const handleGlobalsUpdated = (update: GlobalsUpdatedPayload) => {
      setGlobals(applyDocsGlobalsUpdate(update, readDocsGlobals(context)));
    };

    context.channel.on(GLOBALS_UPDATED, handleGlobalsUpdated);

    return () => context.channel.off(GLOBALS_UPDATED, handleGlobalsUpdated);
  }, [context]);

  return (
    <DocsContainer context={context} {...props}>
      {children}
    </DocsContainer>
  );
}
