import Link from 'next/link';

export default function HomeFooter() {
  return (
    <footer className="bg-[var(--foreground)] text-[var(--background)]">
      <div className="mx-auto flex w-full max-w-screen-lg flex-col items-center justify-between gap-2 px-6 py-6 text-center md:flex-row md:text-left">
        <p>
          Made with{' '}
          <span aria-label="heart" role="img">
            ❤️
          </span>{' '}
          by{' '}
          <Link
            href="https://andremarinho.vercel.app/"
            className="underline underline-offset-2 hover:opacity-90"
            target="_blank"
            rel="noopener noreferrer"
          >
            André Marinho
          </Link>
        </p>

        <p>
          <Link
            href="https://github.com/andre-lmarinho/travel-planner"
            className="underline underline-offset-2 hover:opacity-90"
            target="_blank"
            rel="noopener noreferrer"
          >
            GitHub
          </Link>
        </p>
      </div>
    </footer>
  );
}
