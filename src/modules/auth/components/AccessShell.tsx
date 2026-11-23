import { useTranslations } from "next-intl";
import type { ReactNode } from "react";

import { Map as MapIcon } from "@/ui/components/icon/lucide-icons";

type AccessShellProps = {
  title: string;
  footer: ReactNode;
  children: ReactNode;
};

export function AccessShell({ title, footer, children }: AccessShellProps) {
  const t = useTranslations();

  return (
    <main
      id="main-content"
      className="mx-auto my-auto grid w-full max-w-384 grid-cols-[minmax(17rem,0.58fr)_minmax(0,1.42fr)] items-center gap-[clamp(2rem,4vw,4.5rem)] py-[clamp(1.75rem,4vw,3.5rem)] max-folio-wide:grid-cols-[minmax(15rem,0.62fr)_minmax(0,1.38fr)] max-folio-wide:gap-6 max-folio-tablet:max-w-100 max-folio-tablet:grid-cols-1 max-folio-tablet:gap-0 max-folio-tablet:pt-4 max-folio-tablet:pb-0 max-folio-phone:pt-3 max-folio-short:min-[34.01rem]:pt-[0.8rem] max-folio-short:min-[34.01rem]:pb-0">
      <section className="w-full min-w-0 max-w-100 max-folio-tablet:mx-auto">
        <h1 className="m-0 max-w-[12ch] font-folio-display text-[clamp(2.6rem,4.8vw,4.2rem)] font-medium leading-[0.98] tracking-[-0.04em] text-folio-ink text-balance max-folio-tablet:text-[clamp(2.6rem,8vw,3.4rem)] max-folio-phone:text-[clamp(2.35rem,10vw,3rem)]">
          {title}
        </h1>
        <div className="mt-7 grid gap-[0.85rem] max-folio-phone:mt-5">{children}</div>
        <p className="mt-[0.9rem] text-[0.82rem] leading-[1.45] text-folio-ink-soft [&_p]:m-0 [&_a]:font-[650] [&_a]:text-folio-ink [&_a]:underline [&_a]:decoration-folio-link [&_a]:underline-offset-[0.18em] [&_a:hover]:decoration-folio-coral">
          {footer}
        </p>
      </section>
      <figure className="w-[min(100%,calc(58vh*1.3333))] min-w-0 justify-self-end border border-folio-ink/15 bg-folio-paper p-[clamp(0.75rem,1.5vw,1.15rem)] text-folio-ink shadow-[0_1.5rem_4rem_rgb(5_25_22/25%)] max-folio-tablet:hidden">
        <div className="flex items-center justify-between gap-4 px-1 pb-[0.85rem] pt-[0.2rem]">
          <span className="text-[0.72rem] font-bold uppercase tracking-widest text-folio-ink">
            {t("signupPreviewLabel")}
          </span>
        </div>
        <div
          className="grid aspect-4/3 w-full place-items-center border border-dashed border-folio-preview-line bg-folio-preview-surface bg-[radial-gradient(var(--folio-preview-dot)_0.8px,transparent_0.8px)] bg-center bg-size-[18px_18px]"
          role="img"
          aria-label={t("signupPreviewAlt")}>
          <div className="grid justify-items-center gap-[0.8rem] p-6 text-center">
            <span
              className="grid size-13 place-items-center rounded-full border border-folio-preview-dot bg-folio-white text-folio-ink [&_svg]:size-[1.35rem] [&_svg]:stroke-[1.7]"
              aria-hidden="true">
              <MapIcon />
            </span>
            <span className="text-[0.78rem] font-[750] uppercase tracking-[0.12em] text-folio-ink">
              {t("signupPreviewPlaceholder")}
            </span>
            <span className="text-[0.85rem] leading-[1.45] text-folio-ink-soft">
              {t("signupPreviewImageNote")}
            </span>
          </div>
        </div>
      </figure>
    </main>
  );
}
