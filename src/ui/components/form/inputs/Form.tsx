"use client";

import { useRef } from "react";
import type { FieldValues, SubmitErrorHandler, SubmitHandler, UseFormReturn } from "react-hook-form";
import { FormProvider } from "react-hook-form";

type FormProps<T extends FieldValues> = {
  form: UseFormReturn<T>;
  onSubmit: SubmitHandler<T>;
  onError?: SubmitErrorHandler<T>;
} & Omit<JSX.IntrinsicElements["form"], "onSubmit">;

export function Form<T extends FieldValues>({ form, onSubmit, onError, children, ...props }: FormProps<T>) {
  const submitting = useRef(false);
  return (
    <FormProvider {...form}>
      <form
        {...props}
        onSubmit={(event) => {
          event.preventDefault();
          event.stopPropagation();
          if (submitting.current) return;
          submitting.current = true;
          const submission = form.handleSubmit(onSubmit, onError)(event);
          void submission.finally(() => {
            submitting.current = false;
          });
        }}>
        {children}
      </form>
    </FormProvider>
  );
}
