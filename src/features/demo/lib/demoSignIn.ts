import { signInWithPassword } from "@/features/auth/handlers/signInWithPassword";
import { DEMO_EMAIL, DEMO_PASSWORD } from "@/features/demo/lib/demo";

export async function demoSignIn(resolveProfile: () => Promise<string>): Promise<string> {
  const { slug } = await signInWithPassword({
    email: DEMO_EMAIL,
    password: DEMO_PASSWORD,
    resolveProfile,
  });
  return slug;
}
