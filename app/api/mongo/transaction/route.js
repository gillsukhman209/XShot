import { getServerSession } from "next-auth";
import { authOptions } from "@/libs/next-auth";
import connectMongo from "@/libs/mongoose";
import User from "@/models/User";

import { NextResponse } from "next/server";

export async function POST(req) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { contactUniqueCode, amount, type } = await req.json();

  if (!contactUniqueCode || !amount || !type) {
    return NextResponse.json(
      { error: "Contact ID, amount, and transaction type are required" },
      { status: 400 }
    );
  }

  if (!["borrowed", "lent"].includes(type)) {
    return NextResponse.json(
      { error: "Invalid transaction type. Must be 'borrowed' or 'lent'." },
      { status: 400 }
    );
  }

  await connectMongo();

  // Find the current user
  const currentUser = await User.findById(session.user.id);

  if (!currentUser) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  // Find the contact user
  const contactUser = await User.findOne({ uniqueCode: contactUniqueCode });

  if (!contactUser) {
    return NextResponse.json(
      { error: "Contact with the provided ID does not exist" },
      { status: 404 }
    );
  }

  // Add the transaction to the current user's transaction list
  currentUser.transactions.push({
    contact: contactUser._id,
    amount,
    status: type === "borrowed" ? "borrowed" : "lent",
  });

  console.log("type is", type);
  // Update the total amounts for the current user
  if (type === "borrowed") {
    currentUser.totalBorrowed += Number(amount); // Amount the user borrowed
  } else {
    currentUser.totalLent += Number(amount); // Amount the user lent
  }

  await currentUser.save();

  // Add the reverse transaction to the contact user's transaction list
  contactUser.transactions.push({
    contact: currentUser._id,
    amount,
    status: type === "borrowed" ? "lent" : "borrowed",
  });

  // Update the total amounts for the contact user
  if (type === "borrowed") {
    contactUser.totalLent += Number(amount); // Amount the contact lent
  } else {
    contactUser.totalBorrowed += Number(amount); // Amount the contact borrowed
  }

  await contactUser.save();

  return NextResponse.json({
    success: true,
    message: "Transaction added successfully",
    transaction: {
      contact: {
        name: contactUser.name,
        uniqueCode: contactUser.uniqueCode,
      },
      amount,
      type,
    },
  });
}
