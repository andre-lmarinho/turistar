"use client";

import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";

import { Button } from "@/ui/components/button/Button";
import { Dialog, DialogContent, DialogHeader } from "@/ui/components/dialog/Dialog";
import { Hourglass, Link2, Map as MapIcon, Upload } from "@/ui/components/icon/lucide-icons";

type DemoGuideDialogProps = {
  isDemo: boolean;
};

function minutesUntilReset(): number {
  const now = new Date();
  const secondsUntilNextHour = 3600 - (now.getMinutes() * 60 + now.getSeconds());
  return Math.ceil(secondsUntilNextHour / 60);
}

// Explains the shared demo account on first visit. Everything a visitor does is
// wiped back to the curated baseline on the next hour. Dismissing it is per page
// visit so it doesn't nag, but still shows up before a stunned visitor guesses
// the wrong thing.
export function DemoGuideDialog({ isDemo }: DemoGuideDialogProps) {
  const t = useTranslations();
  const [dismissed, setDismissed] = useState(false);
  const [minutesLeft, setMinutesLeft] = useState(minutesUntilReset);

  useEffect(() => {
    const interval = setInterval(() => setMinutesLeft(minutesUntilReset()), 10_000);
    return () => clearInterval(interval);
  }, []);

  if (!isDemo || dismissed) {
    return null;
  }

  const handleClose = () => setDismissed(true);

  return (
    <Dialog open onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="bg-background w-[min(92vw,30rem)] max-h-[min(90vh,40rem)] overflow-y-auto p-6 sm:p-7">
        <DialogHeader visuallyHidden title={t("demoTitle")} description={t("demoDescription")} />

        <div className="flex items-center gap-2">
          <MapIcon className="text-folio-coral size-5 shrink-0" aria-hidden="true" />
          <p className="font-serif text-[1.65rem] font-medium leading-tight tracking-tight">
            {t("demoWelcome")} <span>{t("demoTuristar")}</span>
          </p>
        </div>

        <p className="text-folio-ink-soft mt-3 text-sm leading-relaxed">{t("demoExplanation")}</p>

        <div className="bg-folio-paper text-folio-ink mt-4 inline-flex items-center gap-2 self-start rounded-full px-3 py-2 text-xs font-semibold tabular-nums">
          <Hourglass className="text-folio-coral size-4" aria-hidden="true" />
          <span>{t("demoResetsIn", { minutes: Math.max(0, minutesLeft) })}</span>
        </div>

        <section className="mt-5 border-t border-folio-line pt-4">
          <h2 className="text-sm font-semibold">{t("demoWhatIs")}</h2>
          <p className="text-folio-ink-soft mt-1.5 text-sm leading-relaxed">{t("demoWhatIsDescription")}</p>
        </section>

        <section className="mt-5">
          <h2 className="text-folio-ink-soft text-xs font-semibold tracking-wide uppercase">
            {t("demoFreeAccountTitle")}
          </h2>
          <ul className="mt-3 space-y-3">
            <li className="flex items-start gap-3">
              <Upload className="text-folio-coral mt-0.5 size-4 shrink-0" aria-hidden="true" />
              <span className="text-sm leading-relaxed">{t("demoUploadFeature")}</span>
            </li>
            <li className="flex items-start gap-3">
              <Link2 className="text-folio-coral mt-0.5 size-4 shrink-0" aria-hidden="true" />
              <span className="text-sm leading-relaxed">{t("demoShareFeature")}</span>
            </li>
          </ul>
        </section>

        <Button onClick={handleClose} className="mt-6 w-full">
          {t("demoGotIt")}
        </Button>
      </DialogContent>
    </Dialog>
  );
}
