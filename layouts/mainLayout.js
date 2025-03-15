"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BadgeSection from "@/components/BadgeSection";

export default function MainLayout({ children }) {
  return (
    <div className="relative flex flex-col items-center justify-center">
      <Navbar />
      {children}
      <BadgeSection />
      <Footer />
    </div>
  );
}
