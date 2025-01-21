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
  const [foundContact, setFoundContact] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const [showTransactionPopup, setShowTransactionPopup] = useState(false);
  const [selectedContact, setSelectedContact] = useState("");
  const [transactionType, setTransactionType] = useState("borrowed");
  const [transactionAmount, setTransactionAmount] = useState("");

  useEffect(() => {
    axios.get("/api/auth/user/getCurrentUser").then((res) => {
      setUser(res.data.user);
    });
  }, []);

  const handleSearchContact = async () => {
    if (!uniqueCode) {
      toast.error("Please enter a unique code");
      return;
    }

    console.log("uniqueCode", uniqueCode);

    try {
      const res = await axios.get(
        `/api/mongo/contact?uniqueCode=${uniqueCode}`
      );
      if (res.status === 200 && res.data.contact) {
        setFoundContact(res.data.contact);
      } else {
        setFoundContact(null);
        toast.error("No contact found with the provided unique code");
      }
    } catch (error) {
      setFoundContact(null);
      toast.error("An error occurred while searching for the contact");
    }
  };

  const handleAddContact = async () => {
    try {
      console.log("foundContact", foundContact);
      const res = await axios.post("/api/mongo/contact", {
        uniqueCode: foundContact.uniqueCode,
      });

      if (res.status === 200) {
        toast.success("Contact added successfully");
        setUser((prevUser) => ({
          ...prevUser,
          contacts: [...prevUser.contacts, res.data.contact],
        }));
      } else {
        toast.error(res.data.error);
      }

      setFoundContact(null);
      setUniqueCode("");
      setShowPopup(false);
    } catch (error) {
      toast.error("An error occurred while adding the contact");
    }
  };

  const handleTransactionSubmit = async () => {
    if (!selectedContact || !transactionAmount) {
      toast.error("Please fill all fields");
      return;
    }

    try {
      const res = await axios.post("/api/mongo/transaction", {
        contactUniqueCode: selectedContact,
        amount: transactionAmount,
        type: transactionType,
      });

      if (res.status === 200) {
        toast.success("Transaction added successfully");
      } else {
        throw new Error(res.data.error || "Failed to add transaction");
      }

      setShowTransactionPopup(false);
      setSelectedContact("");
      setTransactionAmount("");
    } catch (error) {
      toast.error(error.message || "An unexpected error occurred");
    }
  };

  return (
    <main className="container mx-auto space-y-8 px-4 py-8 min-h-screen">
      <Header />
      <section className="grid grid-cols-3 gap-4 rounded-lg bg-white p-6 text-center shadow">
        <div>
          <h2 className="text-xl font-semibold text-gray-800">Lent</h2>
          <p className="text-3xl font-bold text-green-600">
            ${user?.totalLent}
          </p>
        </div>
        <div>
          <h2 className="text-xl font-semibold text-gray-800">Borrowed</h2>
          <p className="text-3xl font-bold text-red-600">
            ${user?.totalBorrowed}
          </p>
        </div>
        <div>
          <h2 className="text-xl font-semibold text-gray-800">Net</h2>
          <p
            className={`text-3xl font-bold ${
              user?.totalLent - user?.totalBorrowed < 0
                ? "text-red-600"
                : "text-green-600"
            }`}
          >
            ${user?.totalLent - user?.totalBorrowed}
          </p>
        </div>
      </section>

      <div className="flex flex-col gap-10">
        {/* Contacts Section */}
        <section>
          <div className="grid grid-cols-1 gap-4 rounded-2xl p-6 shadow-2xl bg-white">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-800">
                Contacts {user?.uniqueCode}
              </h2>
              <button
                onClick={() => setShowPopup(true)}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-800 text-xl text-white shadow hover:bg-indigo-700"
              >
                +
              </button>
            </div>
            {user?.contacts.map((contact) => (
              <Contact key={contact.id} contact={contact} user={user} />
            ))}
          </div>
        </section>

        {/* Popup for adding contact */}
        {showPopup && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white p-10 rounded-lg shadow-lg w-96">
              <h2 className="text-2xl font-semibold">Add Contact</h2>
              <div className="mt-6">
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
                <button
                  onClick={handleSearchContact}
                  className="mt-4 bg-blue-500 text-white px-4 py-2 rounded shadow hover:bg-blue-600"
                >
                  Search
                </button>
              </div>

              {foundContact && (
                <div className="mt-6 bg-gray-100 p-4 rounded-lg shadow">
                  <h3 className="text-lg font-semibold text-gray-800">
                    {foundContact.name}
                  </h3>
                  <p className="text-sm text-gray-600">
                    Unique Code: {foundContact.uniqueCode}
                  </p>
                  <button
                    onClick={handleAddContact}
                    className="mt-4 bg-green-500 text-white px-4 py-2 rounded shadow hover:bg-green-600"
                  >
                    Add Contact
                  </button>
                </div>
              )}

              <div className="flex justify-end mt-6">
                <button
                  onClick={() => {
                    setShowPopup(false);
                    setUniqueCode("");
                    setFoundContact(null);
                  }}
                  className="bg-gray-300 px-6 py-3 rounded"
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
            <button
              onClick={() => setShowTransactionPopup(true)}
              className="flex items-center gap-2 rounded-full bg-gray-800 px-4 py-2 text-lg font-medium text-white shadow hover:bg-indigo-700"
            >
              +
            </button>
          </div>
          {user?.transactions.map((transaction) => (
            <Transactions key={transaction.id} transaction={transaction} />
          ))}
        </div>

        {/* Popup for adding transaction */}
        {showTransactionPopup && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white p-10 rounded-lg shadow-lg w-96">
              <h2 className="text-2xl font-semibold">Add Transaction</h2>
              <div className="mt-6">
                <label
                  className="block text-lg font-medium text-gray-700"
                  htmlFor="contact"
                >
                  Contact
                </label>
                <select
                  id="contact"
                  value={selectedContact}
                  onChange={(e) => setSelectedContact(e.target.value)}
                  className="border p-3 rounded w-full mt-1"
                >
                  <option value="">Select a contact</option>
                  {user?.contacts.map((contact) => (
                    <option key={contact.id} value={contact.uniqueCode}>
                      {contact.name} ({contact.uniqueCode})
                    </option>
                  ))}
                </select>
              </div>
              <div className="mt-6">
                <label
                  className="block text-lg font-medium text-gray-700"
                  htmlFor="transactionType"
                >
                  Type
                </label>
                <select
                  id="transactionType"
                  value={transactionType}
                  onChange={(e) => setTransactionType(e.target.value)}
                  className="border p-3 rounded w-full mt-1"
                >
                  <option value="borrowed">Borrowed</option>
                  <option value="lent">Lent</option>
                </select>
              </div>
              <div className="mt-6">
                <label
                  className="block text-lg font-medium text-gray-700"
                  htmlFor="amount"
                >
                  Amount
                </label>
                <input
                  id="amount"
                  type="number"
                  value={transactionAmount}
                  onChange={(e) => setTransactionAmount(e.target.value)}
                  placeholder="Enter amount"
                  className="border p-3 rounded w-full mt-1"
                />
              </div>
              <div className="flex justify-end mt-6">
                <button
                  onClick={handleTransactionSubmit}
                  className="bg-blue-500 text-white px-6 py-3 rounded"
                >
                  Submit
                </button>
                <button
                  onClick={() => setShowTransactionPopup(false)}
                  className="ml-2 bg-gray-300 px-6 py-3 rounded"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
