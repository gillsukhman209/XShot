import React from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { FaTrash } from "react-icons/fa";
import { useRouter } from "next/navigation";
function Contact({ contact }) {
  let balance = contact.totalLent - contact.totalBorrowed;

  const router = useRouter();
  // Check if balance is a number
  if (isNaN(balance)) {
    return null; // Hide the component if balance is NaN
  }

  let textBalance = Math.abs(balance);
  const owesMessage =
    balance > 0 ? `You owe $${textBalance}` : `Owes you $${textBalance}`;

  const buttonText = balance > 0 ? "Pay" : "Remind";

  return (
    <div className="flex h-[100px] w-full items-center justify-between rounded-lg bg-gray-50 p-4 shadow-xl">
      <div className="flex items-center gap-3">
        <div>
          <h3 className="font-bold text-gray-800">{contact.name}</h3>
          {balance !== 0 && (
            <p
              className={`text-sm ${
                balance > 0 ? "text-red-600" : "text-green-600"
              }`}
            >
              {owesMessage}
            </p>
          )}
        </div>
      </div>
      <button
        onClick={() => router.push(`/api/mongo/contact/${contact.uniqueCode}`)}
        className="w-full max-w-[140px] rounded bg-indigo-600 px-4 py-2 text-sm text-white"
      >
        Contact Details
      </button>
    </div>
  );
}

export default Contact;
