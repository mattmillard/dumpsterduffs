"use client";

import { usePathname } from "next/navigation";
import Header from "./Header";
import Footer from "./Footer";
import { StickyCTA } from "./StickyCTA";

export function ConditionalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isBookingPage = pathname?.startsWith("/booking");
  const isAdminPage = pathname?.startsWith("/admin");

  return (
    <>
      {!isBookingPage && <Header />}
      <main>{children}</main>
      {!isBookingPage && <Footer />}
      {!isBookingPage && !isAdminPage && <StickyCTA />}
    </>
  );
}
