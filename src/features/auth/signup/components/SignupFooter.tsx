import Link from 'next/link';

type SignupFooterProps = {
  loginHref?: string;
};

export const SignupFooter = ({ loginHref = '/login' }: SignupFooterProps) => (
  <div className="text-muted-foreground mt-10 flex h-full flex-col justify-end pb-6 text-sm">
    <p>
      {'Already have an account? '}
      <Link href={loginHref} className="text-foreground hover:underline">
        Log in
      </Link>
    </p>
    <p>
      {'By continuing, you agree to our '}
      <Link href="/terms" className="text-foreground hover:underline">
        Terms
      </Link>
      {' and '}
      <Link href="/privacy" className="text-foreground hover:underline">
        Privacy Policy
      </Link>
      {'.'}
    </p>
  </div>
);
