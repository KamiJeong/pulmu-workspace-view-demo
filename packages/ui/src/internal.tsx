import { useId, type ReactNode } from "react";

export function classes(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(" ");
}

export function useFieldIds(id?: string) {
  const generated = useId();
  const controlId = id ?? generated;
  return {
    controlId,
    descriptionId: `${controlId}-description`,
    errorId: `${controlId}-error`,
  };
}

export function FieldFrame({
  children,
  controlId,
  description,
  descriptionId,
  error,
  errorId,
  label,
}: {
  readonly children: ReactNode;
  readonly controlId: string;
  readonly description?: ReactNode;
  readonly descriptionId: string;
  readonly error?: ReactNode;
  readonly errorId: string;
  readonly label: ReactNode;
}) {
  return (
    <div className={classes("pulmu-field", Boolean(error) && "pulmu-field--invalid")}>
      <label className="pulmu-field__label" htmlFor={controlId}>{label}</label>
      {children}
      {description ? <div className="pulmu-field__description" id={descriptionId}>{description}</div> : null}
      {error ? <div className="pulmu-field__error" id={errorId} role="alert">{error}</div> : null}
    </div>
  );
}
