"use client";
import { useState } from "react";
import Header from "./components/Header";
import axios from "axios";
import { useEffect } from "react";
import Contact from "./components/Contact";
import Transactions from "./components/Transactions";
import { toast } from "react-hot-toast";

export const dynamic = "force-dynamic";
export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [uniqueCode, setUniqueCode] = useState("");
  const [showPopup, setShowPopup] = useState(false);
  const [name, setName] = useState("");

  useEffect(() => {
    axios.get("/api/auth/user/getCurrentUser").then((res) => {
      setUser(res.data.user);
    });
  }, []);

  const handleSubmit = async () => {
    const res = await axios.post("/api/mongo/contact", {
      uniqueCode: uniqueCode,
      name: name,
    });
    if (res.status === 200) {
      toast.success("Contact added successfully");
    } else {
      toast.error("Failed to add contact, check unique code");
    }
    setShowPopup(false);
    setUniqueCode("");
  };

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
              <h2 className="text-xl font-semibold text-gray-800">Contacts</h2>
              <button
                onClick={() => setShowPopup(true)}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-800 text-xl text-white shadow hover:bg-indigo-700"
              >
                +
              </button>
            </div>
            {user?.contacts.map((contact) => (
              <Contact
                key={contact.id}
                contact={contact}
                userTotalOwe={user.totalOwe}
              />
            ))}
          </div>
        </section>

        {/* Popup for adding contact */}
        {showPopup && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 ">
            <div className="bg-white p-10 rounded-lg shadow-lg w-96">
              <h2 className="text-2xl font-semibold">Add Contact</h2>
              <div className="mt-6">
                <label
                  className="block text-lg font-medium text-gray-700"
                  htmlFor="name"
                >
                  Name
                </label>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter name"
                  className="border p-3 rounded w-full mt-1"
                />
              </div>
              <div className="mt-6">
                {" "}
                {/* Increased margin top */}
                <label
                  className="block text-lg font-medium text-gray-700"
                  htmlFor="uniqueCode"
                >
                  Unique Code
                </label>
                <input
                  id="uniqueCode"
                  type="text"
                  value={uniqueCode}
                  onChange={(e) => setUniqueCode(e.target.value)}
                  placeholder="Enter unique code"
                  className="border p-3 rounded w-full mt-1"
                />
              </div>
              <div className="flex justify-end mt-6">
                <button
                  onClick={handleSubmit}
                  className="bg-blue-500 text-white px-6 py-3 rounded"
                >
                  Submit
                </button>
                <button
                  onClick={() => setShowPopup(false)}
                  className="ml-2 bg-gray-300 px-6 py-3 rounded"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

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
          {user?.transactions.map((transaction) => (
            <Transactions key={transaction.id} transaction={transaction} />
          ))}
        </div>
      </div>
    </main>
  );
}
