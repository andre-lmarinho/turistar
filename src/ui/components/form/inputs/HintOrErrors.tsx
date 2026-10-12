"use client";

import { type AppConfig, useTranslations } from "next-intl";
import type { FieldValues, Path } from "react-hook-form";
import { useFormContext } from "react-hook-form";

import { InputError } from "./InputError";

type HintsOrErrorsProps<T extends FieldValues> = {
  fieldName: Path<T>;
  id?: string;
};

export function HintsOrErrors<T extends FieldValues = FieldValues>({ fieldName, id }: HintsOrErrorsProps<T>) {
  const t = useTranslations();
  const methods = useFormContext<T>();

  if (!methods) return null;

  const { formState } = methods;
  const fieldError = methods.getFieldState(fieldName, formState).error;
  const isFieldError = fieldError && "message" in fieldError && !fieldError.root;
  const message = isFieldError && typeof fieldError.message === "string" ? fieldError.message : null;

  if (message) return <InputError id={id} message={t(message as keyof AppConfig["Messages"])} />;
  return null;
}
