"use client";
import { useState } from "react";
import Header from "./components/Header";
import axios from "axios";
import { useEffect } from "react";
import { toast } from "react-hot-toast";
import ScreenshotGenerator from "./components/ScreenshotGenerator";
import ButtonCheckout from "@/components/ButtonCheckout";
import Link from "next/link";
export const dynamic = "force-dynamic";

export default function Dashboard() {
  const [user, setUser] = useState({ contacts: [], transactions: [] });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get("/api/auth/user/getCurrentUser");
        setUser(res.data.user);
      } catch (error) {
        toast.error("Failed to load user data");
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  return (
    <main className="container mx-auto space-y-8 px-4 py-8 min-h-screen">
      <Header />
      <section className=" rounded-lg bg-white p-6 text-center shadow min-h-screen">
        <ScreenshotGenerator user={user} />
      </section>
    </main>
  );
}
