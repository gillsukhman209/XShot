import React from "react";
import { useRouter } from "next/navigation";

function Transactions({ transaction }) {
  const router = useRouter();

  return (
    <div className="flex h-[100px] w-full items-center justify-between rounded-lg p-4 shadow-lg ">
      <div>
        <span className="text-sm text-gray-500">
          {transaction.status &&
            transaction.status.charAt(0).toUpperCase() +
              transaction.status.slice(1)}
        </span>{" "}
        <span className="text-sm text-gray-500">
          {transaction.status === "borrowed" ? "from" : "to"}{" "}
          {transaction.contact && transaction.contact.name}
        </span>
        <p className="font-bold text-md mt-1 ">
          <span
            className={`${
              transaction.status === "borrowed"
                ? "text-red-600"
                : "text-green-600"
            }`}
          >
            ${transaction.amount}
          </span>{" "}
        </p>
        {transaction.note && (
          <p className="text-sm text-black">{transaction.note}</p>
        )}
      </div>
      <div className="flex  justify-between  flex-col md:items-end gap-2">
        <p className="text-xs text-gray-500 md:text-sm ml-4">
          {new Date(transaction.date).toLocaleString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
          })}
        </p>
        <button
          onClick={() =>
            router.push(`/api/mongo/contact/${transaction.contact.uniqueCode}`)
          }
          className="w-full max-w-[120px] text-xs lg:text-sm lg:max-w-[140px] rounded bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700"
        >
          View Details
        </button>
      </div>
    </div>
  );
}

export default Transactions;
