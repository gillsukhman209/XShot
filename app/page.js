"use client";
import { Suspense, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Problem from "@/components/Problem";
import Pricing from "@/components/Pricing";
import FAQ from "@/components/FAQ";
import { renderSchemaTags } from "@/libs/seo";
import Footer from "@/components/Footer";
import Testimonials3 from "@/components/Testimonials3";
export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    const checkSession = async () => {
      if (status === "loading") return; // Wait for session status to load

      const res = await fetch("/api/auth/user/getCurrentUser");
      const user = await res.json();

      try {
        if (user) {
          if (user.user.hasAccess) {
            router.push("/dashboard");
          }
        }
      } catch (error) {
        console.error("Error checking user access:", error);
      }
    };
    checkSession();
  }, [session, status, router]);

  // Render landing page if not logged in
  return (
    <>
      {renderSchemaTags()}
      <Suspense>
        <Header />
      </Suspense>
      <main>
        <Hero />
        <Problem />
        <Pricing />
        <Testimonials3 />

        <FAQ />
      </main>
      <Footer />
    </>
  );
}
