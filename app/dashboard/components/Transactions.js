import React from "react";
import { useRouter } from "next/navigation";

function Transactions({ transaction }) {
  const router = useRouter();
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
        {transaction.note && (
          <p className="text-sm text-black">{transaction.note}</p>
        )}
      </div>
      <button
        onClick={() =>
          router.push(`/api/mongo/contact/${transaction.contact.uniqueCode}`)
        }
        className="w-full max-w-[140px] rounded bg-indigo-600 px-4 py-2 text-sm text-white hover:bg-indigo-700"
      >
        View Details
      </button>
    </div>
  );
}

export default Transactions;
