import type { VariantProps } from "class-variance-authority";

import type { Label } from "./Label";
import type { inputStyles } from "./TextField";

export type InputProps = Omit<JSX.IntrinsicElements["input"], "size" | "ref"> &
  VariantProps<typeof inputStyles> & {
    isFullWidth?: boolean;
  };

export type InputFieldProps<Translations extends Record<string, string> = object> = InputProps & {
  translations?: Translations;
  label?: React.ReactNode;
  LockedIcon?: React.ReactNode;
  hint?: string;
  hintErrors?: string[];
  addOnSuffix?: React.ReactNode;
  inputIsFullWidth?: boolean;
  error?: string;
  labelSrOnly?: boolean;
  containerClassName?: string;
  showAsteriskIndicator?: boolean;
  t?: (key: string) => string;
  dataTestid?: string;
  noLabel?: boolean;
  labelProps?: React.ComponentProps<typeof Label>;
  labelClassName?: string;
};
