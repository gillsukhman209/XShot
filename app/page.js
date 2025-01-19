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
  const [isLoadingSession, setIsLoadingSession] = useState(true); // Prevent flicker

  useEffect(() => {
    const checkSession = async () => {
      if (status === "loading") return; // Wait for session status to load
      if (session && session.user) {
        // If user is logged in, redirect to the dashboard
        router.push("/dashboard");
      } else {
        // If not logged in, stop loading
        setIsLoadingSession(false);
      }
    };
    checkSession();
  }, [session, status, router]);

  if (isLoadingSession) {
    // Display loading screen while determining session state
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <p className="text-lg text-gray-600">Checking session...</p>
      </div>
    );
  }

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
