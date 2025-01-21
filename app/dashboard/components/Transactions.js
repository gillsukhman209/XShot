import React from "react";

function Transactions({ transaction }) {
  const formattedDate = new Date(transaction.date).toLocaleString("default", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="flex h-[100px] w-full items-center justify-between rounded-lg  p-4 shadow-lg ">
      <div>
        <h3 className="text-lg font-bold text-black">
          {transaction.status === "lent" ? "You lent to " : "You borrowed from"}{" "}
          {""}
          {transaction.contact.name}
        </h3>
        <p className="text-sm text-black">
          {formattedDate} -{" "}
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
      <button className="w-full max-w-[140px] rounded-lg bg-white px-4 py-2 text-sm font-semibold text-indigo-600 shadow-md hover:bg-gray-100 transition duration-300">
        View Details
      </button>
    </div>
  );
}

export default Transactions;
