import {
  forwardRef,
  type ForwardedRef,
  type InputHTMLAttributes,
  type ReactNode,
  type SelectHTMLAttributes,
} from "react";
import { PulmuIcon, UI_ICONS } from "@pulmu/icons";

import { classes, FieldFrame, useFieldIds } from "./internal";

type FieldText = {
  /** Supporting guidance connected to the control with `aria-describedby`. */
  readonly description?: ReactNode;
  /** Validation feedback that marks the control invalid and is announced as an alert. */
  readonly error?: ReactNode;
  /** Visible control label; required to preserve an accessible name. */
  readonly label: ReactNode;
};

export type InputProps = Omit<InputHTMLAttributes<HTMLInputElement>, "size"> & FieldText;

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { className, description, error, id, label, ...props }, ref,
) {
  const ids = useFieldIds(id);
  const describedBy = [description && ids.descriptionId, error && ids.errorId, props["aria-describedby"]]
    .filter(Boolean).join(" ") || undefined;
  return (
    <FieldFrame {...ids} description={description} error={error} label={label}>
      <input
        {...props}
        aria-describedby={describedBy}
        aria-invalid={Boolean(error) || props["aria-invalid"] || undefined}
        className={classes("pulmu-input", className)}
        id={ids.controlId}
        ref={ref}
      />
    </FieldFrame>
  );
});

export type SearchFieldProps = Omit<InputProps, "type"> & {
  /** Called with the current value when Enter is pressed and not prevented. */
  readonly onSearch?: (value: string) => void;
};

export const SearchField = forwardRef<HTMLInputElement, SearchFieldProps>(function SearchField(
  { onKeyDown, onSearch, ...props }, ref,
) {
  return (
    <div className="pulmu-search-field">
      <PulmuIcon className="pulmu-search-field__icon" decorative icon={UI_ICONS.search} />
      <Input
        {...props}
        onKeyDown={(event) => {
          onKeyDown?.(event);
          if (event.key === "Enter" && !event.defaultPrevented) onSearch?.(event.currentTarget.value);
        }}
        ref={ref}
        type="search"
      />
    </div>
  );
});

export type SelectOption = {
  /** Prevents this native option from being selected. */
  readonly disabled?: boolean;
  /** Visible option text. */
  readonly label: string;
  /** Stable submitted value. */
  readonly value: string;
};
export type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & FieldText & {
  /** Native select options rendered in order. */
  readonly options: readonly SelectOption[];
  /** Optional first option used as an unselected prompt. */
  readonly placeholder?: string;
};

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { className, description, error, id, label, options, placeholder, ...props }, ref,
) {
  const ids = useFieldIds(id);
  const describedBy = [description && ids.descriptionId, error && ids.errorId, props["aria-describedby"]]
    .filter(Boolean).join(" ") || undefined;
  return (
    <FieldFrame {...ids} description={description} error={error} label={label}>
      <span className="pulmu-select-wrap">
        <select
          {...props}
          aria-describedby={describedBy}
          aria-invalid={Boolean(error) || props["aria-invalid"] || undefined}
          className={classes("pulmu-select", className)}
          id={ids.controlId}
          ref={ref}
        >
          {placeholder ? <option value="">{placeholder}</option> : null}
          {options.map((option) => <option disabled={option.disabled} key={option.value} value={option.value}>{option.label}</option>)}
        </select>
        <PulmuIcon decorative icon={UI_ICONS.chevronDown} />
      </span>
    </FieldFrame>
  );
});

type CheckProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type"> & FieldText;

function CheckControl({ forwardedRef, kind, ...props }: CheckProps & { readonly forwardedRef: ForwardedRef<HTMLInputElement>; readonly kind: "checkbox" | "switch" }) {
  const { className, description, error, id, label, ...inputProps } = props;
  const ids = useFieldIds(id);
  const describedBy = [description && ids.descriptionId, error && ids.errorId, inputProps["aria-describedby"]]
    .filter(Boolean).join(" ") || undefined;
  return (
    <div className={classes("pulmu-check-field", Boolean(error) && "pulmu-field--invalid")}>
      <label className="pulmu-check-field__label" htmlFor={ids.controlId}>
        <input
          {...inputProps}
          aria-describedby={describedBy}
          aria-invalid={Boolean(error) || inputProps["aria-invalid"] || undefined}
          className={classes("pulmu-check", `pulmu-check--${kind}`, className)}
          id={ids.controlId}
          ref={forwardedRef}
          role={kind === "switch" ? "switch" : undefined}
          type="checkbox"
        />
        <span aria-hidden="true" className="pulmu-check__visual" />
        <span>{label}</span>
      </label>
      {description ? <div className="pulmu-field__description" id={ids.descriptionId}>{description}</div> : null}
      {error ? <div className="pulmu-field__error" id={ids.errorId} role="alert">{error}</div> : null}
    </div>
  );
}

export const Checkbox = forwardRef<HTMLInputElement, CheckProps>(function Checkbox(props, ref) {
  return <CheckControl {...props} forwardedRef={ref} kind="checkbox" />;
});

export const Switch = forwardRef<HTMLInputElement, CheckProps>(function Switch(props, ref) {
  return <CheckControl {...props} forwardedRef={ref} kind="switch" />;
});
