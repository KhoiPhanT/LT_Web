import { StaffNavbar } from "@/components/layout/staff-navbar";

export default function OwnerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background flex flex-col font-sans">
      <StaffNavbar role="owner" />
      <main className="flex-1 p-3 sm:p-6 md:p-8 max-w-7xl mx-auto w-full">
        {children}
      </main>
    </div>
  );
}
