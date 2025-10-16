import Link from 'next/link';

export function Footer() {
  return (
    <footer className="mx-3 py-16">
      <div className="mx-auto grid h-full w-full max-w-[1200px] grid-cols-1 gap-4 md:grid-cols-[2fr_4fr]">
        <div>
          <p>
            {'Made with '}
            <span aria-label="heart" role="img">
              ❤️
            </span>
            {' by '}
            <a
              href="https://andremarinho.me/"
              className="underline underline-offset-2 hover:opacity-90"
              target="_blank"
              rel="noopener noreferrer"
            >
              André Marinho
            </a>
          </p>
          <a
            href="https://github.com/andre-lmarinho/travel-planner"
            className="underline underline-offset-2 hover:opacity-90"
            target="_blank"
            rel="noopener noreferrer"
          >
            GitHub
          </a>
        </div>
        <div className="grid grid-cols-2 gap-6 lg:grid-cols-4">
          <div className="flex flex-col gap-4">
            <p className="font-semibold">Solutions</p>
            <Link href="/pricing">Pricing</Link>
            <Link href="/agency">Agency</Link>
          </div>

          <div className="flex flex-col gap-4">
            <p className="font-semibold">Use Cases</p>
            <Link href="planning/adventure">Adventure</Link>
            <Link href="planning/digital-nomad">Digital Nomad</Link>
            <Link href="planning/event-based">Event</Link>
            <Link href="planning/group">Group</Link>
            <Link href="planning/road-trip">Road Trip</Link>
            <Link href="planning/vacations">Vacation</Link>
          </div>

          <div className="flex flex-col gap-4">
            <p className="font-semibold">Resources</p>
            <Link href="/inspiration">Inspirations</Link>
            <Link href="/friends">Friends</Link>
          </div>

          <div className="flex flex-col gap-4">
            <p className="font-semibold">Company</p>
            <Link href="/about">About</Link>
            <Link href="/privacy">Privacy</Link>
            <Link href="/terms">Terms</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
