'use client';

import { SignupForm } from './components/SignupForm';
import { SignupFooter } from './components/SignupFooter';
import { SignupShowcase } from './components/SignupShowcase';

export function SignupPage() {
  return (
    <div className="bg-card flex min-h-screen w-full flex-col items-center justify-center">
      <div className="2xl:border-border bg-background grid w-full max-w-[1440px] grid-cols-1 grid-rows-1 overflow-hidden lg:grid-cols-2 2xl:rounded-[20px] 2xl:border 2xl:py-6">
        {/* Left */}
        <div className="mt-0 mr-auto ml-auto flex w-full max-w-xl flex-col px-4 pt-6 sm:px-16 md:px-20 lg:mt-24 2xl:px-28">
          <div className="flex flex-col gap-2">
            <h1 className="text-3xl font-semibold tracking-tight">Start your planning</h1>
            <p className="text-muted-foreground text-base font-medium">
              Create your free plan, invite friends, and keep every detail organized in one place.
            </p>
          </div>
          <SignupForm />
          <SignupFooter />
        </div>
        {/* Right */}
        <SignupShowcase />
      </div>
    </div>
  );
}
