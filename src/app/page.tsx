'use client';
import { SignedIn, SignedOut, SignInButton } from "@clerk/clerk-react";
import { SignOutButton } from "@clerk/nextjs";

export default function HomePage() {
  return (
    <div>
      HomePage

      <SignedOut><SignInButton /></SignedOut>
      <SignedIn><SignOutButton /></SignedIn>
    </div>
  );
}
