"use client";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import axios from "axios";
import Header from "../../../../dashboard/components/Header";
import { FaTrash } from "react-icons/fa";
import { toast } from "react-hot-toast";
import Modal from "../../../../../components/Modal";
import Transactions from "../../../../dashboard/components/Transactions";
export default function ContactDetails() {
  const pathname = usePathname();
  const contactId = pathname.split("/").pop(); // Extract `contactId` from the URL
  const [contact, setContact] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [summary, setSummary] = useState({ lent: 0, borrowed: 0 });
  const [isModalOpen, setIsModalOpen] = useState(false); // State for modal visibility
  const [showTransactionPopup, setShowTransactionPopup] = useState(false);

  const [user, setUser] = useState(null);
  const [transactionType, setTransactionType] = useState("borrowed");
  const [transactionAmount, setTransactionAmount] = useState(0);
  const [transactionNote, setTransactionNote] = useState("");

  useEffect(() => {
    const fetchContactDetails = async () => {
      const currentUser = await axios
        .get("/api/auth/user/getCurrentUser")
        .then((res) => {
          return res.data.user;
        });

      const currentUserUniqueCode = currentUser.uniqueCode;

      try {
        const res = await axios.get(
          `/api/mongo/contact?uniqueCode=${contactId}`
        );

        const { contact } = res.data;

        const user = currentUser.contacts.find(
          (user) => user.uniqueCode === contact.uniqueCode
        );

        console.log("user is ", user);

        const totalLent = user.totalBorrowed;
        const totalBorrowed = user.totalLent;

        setSummary({ lent: totalLent, borrowed: totalBorrowed });
        setTransactions(
          currentUser.transactions.filter(
            (transaction) =>
              transaction.contact.uniqueCode === contact.uniqueCode
          )
        );
        setContact(contact);
      } catch (error) {
        console.error("Error fetching contact details:", error);
      }
    };

    fetchContactDetails();
  }, [contactId]);

  if (!contact) {
    return <div>Loading...</div>;
  }

  const netBalance = summary.lent - summary.borrowed;

  const handleDeleteContact = async () => {
    try {
      const res = await axios.delete(
        `/api/mongo/contact?uniqueCode=${contact.uniqueCode}`
      );
      if (res.status === 200) {
        toast.success("Contact deleted successfully");
        window.location.href = "/dashboard";
        setIsModalOpen(false);
        // Optionally, you can add a callback to refresh the contact list or update the state
      }
    } catch (error) {
      toast.error("An error occurred while deleting the contact");
    }
  };

  const confirmDeleteContact = () => {
    setIsModalOpen(true); // Open the modal to confirm deletion
  };

  const handleDeleteTransaction = async (transactionId) => {
    console.log("Sending Transaction ID:", transactionId);
    try {
      const res = await axios.delete(`/api/mongo/transaction`, {
        data: { transactionId },
      });
      if (res.status === 200) {
        toast.success("Transaction deleted successfully");
        // Refresh transactions after deletion
        setTransactions((prev) =>
          prev.filter((transaction) => transaction._id !== transactionId)
        );
      }
    } catch (error) {
      toast.error("An error occurred while deleting the transaction");
    }
  };

  const handleTransactionSubmit = async () => {
    if (!transactionAmount) {
      toast.error("Please fill all fields");
      return;
    }

    try {
      const res = await axios.post("/api/mongo/transaction", {
        contactUniqueCode: contact.uniqueCode,
        amount: transactionAmount,
        type: transactionType,
        note: transactionNote,
      });

      if (res.status === 200) {
        toast.success("Transaction added successfully");
      } else {
        throw new Error(res.data.error || "Failed to add transaction");
      }

      setShowTransactionPopup(false);
      setTransactionAmount("");
    } catch (error) {
      toast.error(error.message || "An unexpected error occurred");
    }
  };

  return (
    <div className="container mx-auto py-8 min-h-screen shadow-lg p-6 ">
      <Header />

      <div className="flex items-center justify-center ">
        <h2 className="mt-6 text-2xl font-bold  flex items-center justify-center  flex-1">
          {contact.name}
        </h2>
        <button
          onClick={confirmDeleteContact}
          className="w-full max-w-[80px] rounded bg-indigo-600 px-4 py-2 text-sm text-white hover:bg-indigo-70 mt-6"
        >
          Delete
        </button>
      </div>

      {/* Summary Section */}
      <section className="grid grid-cols-3 mt-4 gap-4 rounded-lg bg-white p-6 text-center shadow">
        <div>
          <h2 className="text-xl font-semibold text-gray-800">Lent</h2>
          <p className="text-3xl font-bold text-green-600">
            ${summary.lent.toLocaleString()}
          </p>
        </div>
        <div>
          <h2 className="text-xl font-semibold text-gray-800">Borrowed</h2>
          <p className="text-3xl font-bold text-red-600">
            ${summary.borrowed.toLocaleString()}
          </p>
        </div>
        <div>
          <h2 className="text-xl font-semibold text-gray-800">Net</h2>
          <p
            className={`text-3xl font-bold ${
              netBalance < 0 ? "text-red-600" : "text-green-600"
            }`}
          >
            ${Math.abs(netBalance).toLocaleString()}
          </p>
        </div>
      </section>

      {/* Transactions Section */}
      <div className="grid grid-cols-1 gap-4 rounded-2xl p-6 shadow-2xl bg-white">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-800">Transactions</h2>
          <button
            onClick={() => setShowTransactionPopup(true)}
            className="flex items-center gap-2 rounded-full bg-gray-800 px-4 py-2 text-lg font-medium text-white shadow hover:bg-indigo-700"
          >
            +
          </button>
        </div>
      </div>

      <ul className="mt-4 space-y-4 shadow-lg rounded-lg p-6">
        {transactions.map((transaction) => (
          <li
            key={transaction._id}
            className="flex h-[120px] w-full items-center justify-between rounded-lg p-4 shadow-lg" // Increased height from 100px to 120px
          >
            <div>
              <h3 className="text-lg font-bold text-black">
                {transaction.status === "lent"
                  ? "You lent to "
                  : "You borrowed from"}{" "}
                {transaction.contact.name}
              </h3>
              <p className="text-md text-black">
                {new Date(transaction.date).toLocaleString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}{" "}
                -{" "}
                <span
                  className={`font-medium text-md ${
                    transaction.status === "borrowed"
                      ? "text-red-600"
                      : "text-green-600"
                  }`}
                >
                  ${transaction.amount}
                </span>
              </p>
            </div>
            <button
              onClick={() => handleDeleteTransaction(transaction._id)}
              className="text-red-600 hover:text-red-800 text-xl"
            >
              <FaTrash />
            </button>
          </li>
        ))}
      </ul>

      <Modal isModalOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <p>
          This action is irreversible. Are you sure you want to reset your
          progress?
        </p>
        <div className="flex justify-end space-x-4 mt-4">
          <button
            className="px-4 py-2 bg-gray-300 rounded-md"
            onClick={() => setIsModalOpen(false)}
          >
            Cancel
          </button>
          <button
            className="px-4 py-2 bg-red-500 rounded-md"
            onClick={handleDeleteContact}
          >
            Confirm
          </button>
        </div>
      </Modal>

      {/* Popup for adding transaction */}
      {showTransactionPopup && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-10 rounded-lg shadow-lg w-96">
            <h2 className="text-2xl font-semibold">Add Transaction</h2>

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
  );
}
