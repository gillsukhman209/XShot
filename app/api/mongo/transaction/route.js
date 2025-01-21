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
    contact: contactUser,
    amount,
    status: type === "borrowed" ? "borrowed" : "lent",
  });

  console.log("type is", type);

  const contact = currentUser.contacts.find(
    (contact) => contact.uniqueCode === contactUniqueCode
  );
  // Update the total amounts for the current user
  if (type === "borrowed") {
    currentUser.totalBorrowed += Number(amount); // Amount the user borrowed
    contact.totalLent += Number(amount);
  } else {
    currentUser.totalLent += Number(amount); // Amount the user lent
    contact.totalBorrowed += Number(amount);
  }

  await currentUser.save();

  // Add the reverse transaction to the contact user's transaction list
  contactUser.transactions.push({
    contact: currentUser,
    amount,
    status: type === "borrowed" ? "lent" : "borrowed",
  });

  const contactUserContact = contactUser.contacts.find(
    (contact) => contact.uniqueCode === currentUser.uniqueCode
  );
  // Update the total amounts for the contact user
  if (type === "borrowed") {
    contactUser.totalLent += Number(amount); // Amount the contact lent
    contactUserContact.totalLent += Number(amount);
  } else {
    contactUser.totalBorrowed += Number(amount); // Amount the contact borrowed
    contactUserContact.totalBorrowed += Number(amount);
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
