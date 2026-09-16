import { act, render, screen } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import { expect, it } from "vitest";
import { createQueryClient } from "@/app/_trpc/query-client";
import en from "@/i18n/locales/en.json";
import pt from "@/i18n/locales/pt-BR.json";
import { Toaster, toastManager } from "./Toast";

it("retranslates a fallback error without recreating the query client or losing cached data", async () => {
  const client = createQueryClient();
  client.setQueryData(["draft"], "saved draft");
  const { rerender } = render(
    <NextIntlClientProvider locale="en" messages={en}>
      <Toaster />
    </NextIntlClientProvider>
  );
  const mutation = client.getMutationCache().build(client, { mutationFn: () => Promise.reject(null) });
  await act(async () => {
    await mutation.execute(undefined).catch(() => {});
  });
  expect(await screen.findByText(en.unexpectedError)).toBeVisible();
  rerender(
    <NextIntlClientProvider locale="pt-BR" messages={pt}>
      <Toaster />
    </NextIntlClientProvider>
  );
  expect(screen.getByText(pt.unexpectedError)).toBeVisible();
  expect(client.getQueryData(["draft"])).toBe("saved draft");
  act(() => toastManager.close());
  client.clear();
});
