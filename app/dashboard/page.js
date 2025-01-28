"use client";
import { useState } from "react";
import Header from "./components/Header";
import axios from "axios";
import { useEffect } from "react";
import Contact from "./components/Contact";
import Transactions from "./components/Transactions";
import { toast } from "react-hot-toast";
import { PiArrowFatLinesDown, PiArrowFatLinesUp } from "react-icons/pi";

export const dynamic = "force-dynamic";

export default function Dashboard() {
  const [user, setUser] = useState({ contacts: [], transactions: [] });
  const [uniqueCode, setUniqueCode] = useState("");
  const [name, setName] = useState("");
  const [showPopup, setShowPopup] = useState(false);
  const [showTransactionPopup, setShowTransactionPopup] = useState(false);
  const [selectedContact, setSelectedContact] = useState("");
  const [transactionType, setTransactionType] = useState("borrowed");
  const [transactionAmount, setTransactionAmount] = useState("");
  const [transactionNote, setTransactionNote] = useState("");
  const [loading, setLoading] = useState(true);
  const [visibleTransactions, setVisibleTransactions] = useState(5); // State to track visible transactions

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

  const handleAddContact = async () => {
    try {
      if (!name && !uniqueCode) {
        toast.error("Please fill either the name or unique code field");
        return;
      }

      let codeToSend =
        uniqueCode || Math.random().toString(36).substring(2, 10);

      const newContact = {
        id: Math.random().toString(36).substring(2, 10), // Temporary local ID
        name: name || "Unnamed Contact",
        uniqueCode: codeToSend,
      };

      const res = await axios.post("/api/mongo/contact", {
        name: name || undefined,
        uniqueCode: codeToSend,
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

      // Update locally in case of delayed API response
      setUser((prevUser) => ({
        ...prevUser,
        contacts: [...prevUser.contacts, newContact],
      }));

      setName("");
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

    const newTransaction = {
      id: Math.random().toString(36).substring(2, 10), // Temporary local ID
      contactUniqueCode: selectedContact,
      amount: parseFloat(transactionAmount),
      type: transactionType,
      note: transactionNote,
    };

    try {
      const res = await axios.post("/api/mongo/transaction", newTransaction);

      if (res.status === 200) {
        toast.success("Transaction added successfully");
        setUser((prevUser) => ({
          ...prevUser,
          transactions: [...prevUser.transactions, res.data.transaction],
        }));
      } else {
        throw new Error(res.data.error || "Failed to add transaction");
      }

      // Update locally in case of delayed API response
      setUser((prevUser) => ({
        ...prevUser,
        transactions: [...prevUser.transactions, newTransaction],
      }));

      setShowTransactionPopup(false);
      setSelectedContact("");
      setTransactionAmount("");
      setTransactionNote("");
    } catch (error) {
      toast.error(error.message || "An unexpected error occurred");
    }
  };

  const handleShowMore = () => {
    setVisibleTransactions(user?.transactions.length || 0); // Show all transactions
  };

  const handleShowLess = () => {
    setVisibleTransactions(5);
  };

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
      <section className="grid grid-cols-3 gap-4 rounded-lg bg-white p-6 text-center shadow">
        <div>
          <h2 className="text-xl font-semibold text-gray-800">Lent</h2>
          <p className="text-3xl font-bold text-green-600">
            ${user?.totalLent?.toLocaleString()}
          </p>
        </div>
        <div>
          <h2 className="text-xl font-semibold text-gray-800">Borrowed</h2>
          <p className="text-3xl font-bold text-red-600">
            ${user?.totalBorrowed?.toLocaleString()}
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
            ${(user?.totalLent - user?.totalBorrowed)?.toLocaleString()}
          </p>
        </div>
      </section>

      <div className="flex flex-col gap-10">
        <section>
          <div className="grid grid-cols-1 gap-4 rounded-2xl p-6 shadow-2xl bg-white">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-800">Contacts</h2>
              <button
                onClick={() => setShowPopup(true)}
                className="flex h-10 w-10 items-center justify-center rounded-full text-xl bg-white border-[1px] border-gray-300 shadow-2xl "
              >
                +
              </button>
            </div>
            {user?.contacts.map((contact) => (
              <Contact key={contact.id} contact={contact} user={user} />
            ))}
          </div>
        </section>

        {showPopup && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white p-10 rounded-lg shadow-lg w-96">
              <h2 className="text-2xl font-semibold text-center">
                Add Contact
              </h2>
              <div className="mt-6">
                <label
                  className="block text-lg font-medium text-gray-700"
                  htmlFor="contactName"
                >
                  Name
                </label>
                <input
                  id="contactName"
                  type="text"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (e.target.value) setUniqueCode("");
                  }}
                  placeholder="Enter name"
                  className="border p-3 rounded w-full mt-1"
                  disabled={!!uniqueCode}
                />
              </div>
              <div className="mt-4 text-center text-lg font-medium">OR</div>
              <div className="mt-4">
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
                  onChange={(e) => {
                    setUniqueCode(e.target.value);
                    if (e.target.value) setName("");
                  }}
                  placeholder="Enter unique code"
                  className="border p-3 rounded w-full mt-1"
                  disabled={!!name}
                />
              </div>
              <div className="flex justify-between items-center mt-6">
                <button
                  onClick={handleAddContact}
                  className="bg-blue-500 text-white px-6 py-2 rounded shadow hover:bg-blue-600"
                >
                  Add Contact
                </button>
                <button
                  onClick={() => {
                    setShowPopup(false);
                    setName("");
                    setUniqueCode("");
                  }}
                  className="bg-gray-300 px-6 py-2 rounded"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 gap-4 rounded-2xl p-6 shadow-2xl bg-white">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-800">
              Transactions
            </h2>
            <button
              onClick={() => setShowTransactionPopup(true)}
              className="flex h-10 w-10 items-center justify-center rounded-full text-xl bg-white border-[1px] border-gray-300 shadow-2xl "
            >
              +
            </button>
          </div>
          {user?.transactions
            .slice(0, visibleTransactions)
            .map((transaction) => (
              <Transactions key={transaction.id} transaction={transaction} />
            ))}
          {user?.transactions.length > 5 &&
            visibleTransactions < user?.transactions.length && (
              <button
                onClick={handleShowMore}
                className="mt-4 px-4 py-2 rounded-full mx-auto text-2xl border-[1px] border-gray-300 shadow-2xl "
              >
                <PiArrowFatLinesDown />
              </button>
            )}
          {visibleTransactions > 5 && (
            <button
              onClick={handleShowLess}
              className="mt-4 px-4 py-2 rounded-full mx-auto text-2xl border-[1px] border-gray-300 shadow-2xl "
            >
              <PiArrowFatLinesUp />
            </button>
          )}
        </div>

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
                      {contact.name}
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
              <div className="mt-6">
                <label
                  className="block text-lg font-medium text-gray-700"
                  htmlFor="note"
                >
                  Note
                </label>
                <input
                  id="note"
                  type="text"
                  value={transactionNote}
                  onChange={(e) => setTransactionNote(e.target.value)}
                  placeholder="Add a note (optional)"
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
