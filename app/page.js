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
import Link from "next/link";

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkUserAccess = async () => {
      if (status === "loading") return; // Wait until the session is ready

      try {
        const res = await fetch("/api/auth/user/getCurrentUser");
        const user = await res.json();
        console.log("user", user);

        if (
          user?.user?.subscriptionPlan === "monthly" ||
          user?.user?.subscriptionPlan === "yearly" ||
          user?.user?.subscriptionPlan === "free"
        ) {
          router.push("/dashboard");
        } else {
          setIsChecking(false); // User doesn't have access, show the landing page
        }
      } catch (error) {
        console.error("Error checking user access:", error);
        setIsChecking(false); // In case of an error, show the landing page
      }
    };

    checkUserAccess();
  }, [status, router]);

  // Show a loading spinner until the access check is done
  if (isChecking) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  // Render the landing page if the user doesn't have access
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
