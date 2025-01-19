"use client";
import { useState } from "react";
import Header from "./components/Header";
import axios from "axios";
import { useEffect } from "react";

export const dynamic = "force-dynamic";
export default function Dashboard() {
  const [user, setUser] = useState(null);
  useEffect(() => {
    axios.get("/api/auth/user/getCurrentUser").then((res) => {
      console.log(res.data.user);
      setUser(res.data.user);
    });
  }, []);
  return (
    <main className="container mx-auto space-y-8 px-4 py-8 min-h-screen">
      <Header />
      <section className="grid grid-cols-3 gap-4 rounded-lg bg-white p-6 text-center shadow">
        <div>
          <h2 className="text-xl font-semibold text-gray-800">Owed</h2>
          <p className="text-3xl font-bold text-green-600">
            ${user?.totalOwed}
          </p>
        </div>
        <div>
          <h2 className="text-xl font-semibold text-gray-800">Owe</h2>
          <p className="text-3xl font-bold text-red-600">${user?.totalOwe}</p>
        </div>
        <div>
          <h2 className="text-xl font-semibold text-gray-800">Net</h2>
          <p className="text-3xl font-bold text-green-600">${user?.net}</p>
        </div>
      </section>

      <div className="flex flex-col gap-10">
        {/* Contacts Section */}
        <section>
          <div className="grid grid-cols-1 gap-4 rounded-2xl p-6 shadow-2xl bg-white">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-800">
                Contacts {user && user.name}
              </h2>
              <button className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-800 text-xl text-white shadow hover:bg-indigo-700">
                +
              </button>
            </div>

            <div className="flex h-[100px] w-full items-center justify-between rounded-lg bg-gray-50 p-4 shadow-xl">
              <div className="flex items-center gap-3">
                <span className="text-lg text-green-600">↑</span>
                <div>
                  <h3 className="font-bold text-gray-800">John Doe</h3>
                  <p className="text-sm text-green-600">Owes you $200</p>
                </div>
              </div>
              <button className="w-full max-w-[140px] rounded bg-indigo-600 px-4 py-2 text-sm text-white">
                Remind John
              </button>
            </div>

            <div className="flex h-[100px] w-full items-center justify-between rounded-lg bg-gray-50 p-4 shadow-xl">
              <div className="flex items-center gap-3">
                <span className="text-lg text-red-600">↓</span>
                <div>
                  <h3 className="font-bold text-gray-800">Jane Smith</h3>
                  <p className="text-sm text-red-600">You Owe $300</p>
                </div>
              </div>
              <button className="w-full max-w-[140px] rounded bg-indigo-600 px-4 py-2 text-sm text-white">
                Pay Jane
              </button>
            </div>

            <div className="flex h-[100px] w-full items-center justify-between rounded-lg bg-gray-50 p-4 shadow-xl">
              <div className="flex items-center gap-3">
                <span className="text-lg text-green-600">↑</span>
                <div>
                  <h3 className="font-bold text-gray-800">Melissa</h3>
                  <p className="text-sm text-green-600">Owes you $600</p>
                </div>
              </div>
              <button className="w-full max-w-[140px] rounded bg-indigo-600 px-4 py-2 text-sm text-white">
                Remind Melissa
              </button>
            </div>
          </div>
        </section>

        {/* Transactions Section */}
        <div className="grid grid-cols-1 gap-4 rounded-2xl p-6 shadow-2xl bg-white">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-800">
              Transactions
            </h2>
            <button className="flex items-center gap-2 rounded-full bg-gray-800 px-4 py-2 text-lg font-medium text-white shadow hover:bg-indigo-700">
              +
            </button>
          </div>

          <div className="flex h-[100px] w-full items-center justify-between rounded-lg bg-gray-50 p-4 shadow-xl">
            <div>
              <h3 className="font-bold text-gray-800">Lent $100 to John</h3>
              <p className="text-sm text-gray-600">Dinner - Jan 12</p>
            </div>
            <button className="w-full max-w-[140px] rounded bg-indigo-600 px-4 py-2 text-sm text-white hover:bg-indigo-700">
              View Details
            </button>
          </div>

          <div className="flex h-[100px] w-full items-center justify-between rounded-lg bg-gray-50 p-4 shadow-xl">
            <div>
              <h3 className="font-bold text-gray-800">Owed $50 by Jane</h3>
              <p className="text-sm text-gray-600">Groceries - Jan 10</p>
            </div>
            <button className="w-full max-w-[140px] rounded bg-indigo-600 px-4 py-2 text-sm text-white hover:bg-indigo-700">
              View Details
            </button>
          </div>

          <div className="flex h-[100px] w-full items-center justify-between rounded-lg bg-gray-50 p-4 shadow-xl">
            <div>
              <h3 className="font-bold text-gray-800">
                You paid $200 to Melissa
              </h3>
              <p className="text-sm text-gray-600">Movies - Jan 8</p>
            </div>
            <button className="w-full max-w-[140px] rounded bg-indigo-600 px-4 py-2 text-sm text-white hover:bg-indigo-700">
              View Details
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
