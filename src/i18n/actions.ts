"use server";

import { cookies } from "next/headers";
import { isLocale, localeCookie } from "./config";

export async function setLocale(locale: string) {
  if (!isLocale(locale)) throw new Error("Unable to set interface language: unsupported locale");
  // browser preference for every account, including shared accounts.
  (await cookies()).set(localeCookie, locale, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });
}
