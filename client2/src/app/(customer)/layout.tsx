import React from "react";
import { CustomerNavbar } from "@/components/layout/customer-navbar";
import { PublicFooter } from "@/components/layout/public-footer";

export default function CustomerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen bg-brand-light dark:bg-brand-dark transition-colors">
      <CustomerNavbar />
      <main className="flex-1 py-4 sm:py-8 px-3 sm:px-6 max-w-6xl mx-auto w-full">
        {children}
      </main>
      <PublicFooter />
    </div>
  );
}
