import React from "react";

function Contact({ contact, user }) {
  let balance = contact.totalOwed - contact.totalOwe;
  let textBalance = Math.abs(balance);
  const owesMessage =
    balance < 0 ? `You owe $${textBalance}` : `Owes you $${textBalance}`;

  const buttonText = balance < 0 ? "Pay" : "Remind";

  return (
    <div className="flex h-[100px] w-full items-center justify-between rounded-lg bg-gray-50 p-4 shadow-xl">
      <div className="flex items-center gap-3">
        <span className="text-lg text-red-600">↓</span>
        <div>
          <h3 className="font-bold text-gray-800">{contact.name}</h3>
          <p
            className={`text-sm ${
              balance < 0 ? "text-red-600" : "text-green-600"
            }`}
          >
            {owesMessage}
          </p>
        </div>
      </div>
      <button className="w-full max-w-[140px] rounded bg-indigo-600 px-4 py-2 text-sm text-white">
        {buttonText}
      </button>
    </div>
  );
}

export default Contact;
