import { Button } from "@/shared/ui/button";
import { AccessShell } from "@/shared/ui/layout";

interface ShareTokenViewProps {
  token: string;
}

export function ShareTokenView({ token }: ShareTokenViewProps) {
  const nextPath = `/p/share/${token}`;

  return (
    <AccessShell title="Join this planner" footer="Sign in or create an account to accept this invite.">
      <div className="grid gap-4">
        <Button href={`/signup?next=${encodeURIComponent(nextPath)}`}>Create account</Button>
        <Button
          href={`/login?next=${encodeURIComponent(nextPath)}`}
          variant="ghost"
          className="border-border border">
          Sign in
        </Button>
      </div>
    </AccessShell>
  );
}

interface ShareTokenErrorViewProps {
  message: string;
}

export function ShareTokenErrorView({ message }: ShareTokenErrorViewProps) {
  return (
    <AccessShell title="Unable to join planner" footer={message}>
      <div className="grid gap-4">
        <Button href="/">Back to home</Button>
        <Button href="/login" variant="ghost" className="border-border border">
          Try signing in again
        </Button>
      </div>
    </AccessShell>
  );
}
