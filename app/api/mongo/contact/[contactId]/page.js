"use client";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import axios from "axios";
import Header from "../../../../dashboard/components/Header";
import { FaTrash } from "react-icons/fa";
import { toast } from "react-hot-toast";
import Modal from "../../../../../components/Modal";

export default function ContactDetails() {
  const pathname = usePathname();
  const contactId = pathname.split("/").pop(); // Extract `contactId` from the URL
  const [contact, setContact] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [summary, setSummary] = useState({ lent: 0, borrowed: 0 });
  const [isModalOpen, setIsModalOpen] = useState(false); // State for modal visibility

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
    </div>
  );
}
