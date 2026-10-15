import React from "react";
import { PublicNavbar } from "@/components/layout/public-navbar";
import { PublicFooter } from "@/components/layout/public-footer";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen">
      <PublicNavbar />
      <main className="flex-1 flex items-center justify-center p-6 bg-slate-50">{children}</main>
      <PublicFooter />
    </div>
  );
}
