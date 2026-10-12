import React from "react";
import { PublicNavbar } from "@/components/layout/public-navbar";
import { PublicFooter } from "@/components/layout/public-footer";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen bg-slate-50 text-slate-900">
      <PublicNavbar />
      <main className="flex-1 w-full">{children}</main>
      <PublicFooter />
    </div>
  );
}
