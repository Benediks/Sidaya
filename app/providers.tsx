"use client";

import { SessionProvider } from "next-auth/react";
import React from "react";

// Ini adalah Client Component
export default function NextAuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  // SessionProvider menyediakan konteks session ke semua komponen di dalamnya
  return <SessionProvider>{children}</SessionProvider>;
}
