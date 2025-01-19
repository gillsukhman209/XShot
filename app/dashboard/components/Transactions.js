import React from "react";

function Transactions({ transaction }) {
  return (
    <div className="flex h-[100px] w-full items-center justify-between rounded-lg bg-gray-50 p-4 shadow-xl">
      <div>
        <h3 className="font-bold text-gray-800">{transaction.note}</h3>
        <p className="text-sm text-gray-600">
          {transaction.date} - {transaction.amount}
        </p>
      </div>
      <button className="w-full max-w-[140px] rounded bg-indigo-600 px-4 py-2 text-sm text-white hover:bg-indigo-700">
        View Details
      </button>
    </div>
  );
}

export default Transactions;
