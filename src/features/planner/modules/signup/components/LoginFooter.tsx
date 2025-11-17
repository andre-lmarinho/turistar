import Link from 'next/link';

export const LoginFooter = () => (
  <div className="text-muted-foreground mt-10 flex h-full flex-col justify-end pb-6 text-sm">
    <p>
      {"Need an account? "}
      <Link href="/signup" className="text-foreground hover:underline">
        Sign up
      </Link>
    </p>
    <p>
      {"By continuing, you agree to our "}
      <Link href="/terms" className="text-foreground hover:underline">
        Terms
      </Link>
      {" and "}
      <Link href="/privacy" className="text-foreground hover:underline">
        Privacy Policy
      </Link>
      {'.'}
    </p>
  </div>
);
