import React from "react";
import axios from "axios";
import { toast } from "react-hot-toast";

function Contact({ contact }) {
  console.log("in contact.js", "contact.totalLent", contact.totalLent);
  console.log("in contact.js", "contact.totalBorrowed", contact.totalBorrowed);
  let balance = contact.totalLent - contact.totalBorrowed;
  console.log("in contact.js", "balance", balance);

  // Check if balance is a number
  if (isNaN(balance)) {
    return null; // Hide the component if balance is NaN
  }

  let textBalance = Math.abs(balance);
  const owesMessage =
    balance > 0 ? `You owe $${textBalance}` : `Owes you $${textBalance}`;

  const buttonText = balance > 0 ? "Pay" : "Remind";

  const handleDeleteContact = async () => {
    try {
      const res = await axios.delete(
        `/api/mongo/contact?uniqueCode=${contact.uniqueCode}`
      );
      if (res.status === 200) {
        toast.success("Contact deleted successfully");
        // Optionally, you can add a callback to refresh the contact list or update the state
      } else {
        toast.error(res.data.error);
      }
    } catch (error) {
      toast.error("An error occurred while deleting the contact");
    }
  };

  return (
    <div className="flex h-[100px] w-full items-center justify-between rounded-lg bg-gray-50 p-4 shadow-xl">
      <div className="flex items-center gap-3">
        {balance !== 0 && <span className="text-lg text-red-600">↓</span>}
        <button onClick={handleDeleteContact} className="text-red-600">
          🗑️
        </button>
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
      <button className="w-full max-w-[140px] rounded bg-indigo-600 px-4 py-2 text-sm text-white">
        {buttonText}
      </button>
    </div>
  );
}

export default Contact;
