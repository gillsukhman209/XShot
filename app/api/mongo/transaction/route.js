import { getServerSession } from "next-auth";
import { authOptions } from "@/libs/next-auth";
import connectMongo from "@/libs/mongoose";
import User from "@/models/User";
import mongoose from "mongoose";
import { NextResponse } from "next/server";

export async function POST(req) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { contactUniqueCode, amount, type, note } = await req.json();

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
  const transactionId = new mongoose.Types.ObjectId(); // Create a new ObjectId for the transaction

  currentUser.transactions.push({
    _id: transactionId, // Assign the same _id to both transactions
    contact: contactUser,
    amount,
    status: type === "borrowed" ? "borrowed" : "lent",
    note,
  });

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
    _id: transactionId, // Use the same _id for the reverse transaction
    contact: currentUser,
    amount,
    status: type === "borrowed" ? "lent" : "borrowed",
    note,
  });

  const contactUserContact = contactUser.contacts.find(
    (contact) => contact.uniqueCode === currentUser.uniqueCode
  );
  // Update the total amounts for the contact user
  if (type === "borrowed") {
    contactUser.totalLent += Number(amount); // Amount the contact lent
    contactUserContact.totalBorrowed += Number(amount);
  } else {
    contactUser.totalBorrowed += Number(amount); // Amount the contact borrowed
    contactUserContact.totalLent += Number(amount);
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
export async function DELETE(req) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { transactionId } = await req.json();

  if (!transactionId) {
    return NextResponse.json(
      { error: "Transaction ID is required" },
      { status: 400 }
    );
  }

  await connectMongo();

  const currentUser = await User.findById(session.user.id);

  if (!currentUser) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  // Find the transaction to delete
  const transactionIndex = currentUser.transactions.findIndex(
    (transaction) => transaction._id.toString() === transactionId
  );

  if (transactionIndex === -1) {
    return NextResponse.json(
      { error: "Transaction not found" },
      { status: 404 }
    );
  }

  const transaction = currentUser.transactions[transactionIndex];

  // Update totals based on the transaction type
  if (transaction.status === "borrowed") {
    currentUser.totalBorrowed -= Number(transaction.amount);
    const contact = currentUser.contacts.find(
      (contact) => contact.uniqueCode === transaction.contact.uniqueCode
    );
    contact.totalLent -= Number(transaction.amount);

    // Remove the transaction from the contact's transactions
    const contactUser = await User.findOne({
      uniqueCode: transaction.contact.uniqueCode,
    });
    const contactTransactionIndex = contactUser.transactions.findIndex(
      (t) => t._id.toString() === transactionId
    );
    if (contactTransactionIndex !== -1) {
      contactUser.transactions.splice(contactTransactionIndex, 1);
      await contactUser.save();
    }
  } else {
    currentUser.totalLent -= Number(transaction.amount);
    const contact = currentUser.contacts.find(
      (contact) => contact.uniqueCode === transaction.contact.uniqueCode
    );
    contact.totalBorrowed -= Number(transaction.amount);

    // Remove the transaction from the contact's transactions
    const contactUser = await User.findOne({
      uniqueCode: transaction.contact.uniqueCode,
    });
    const contactTransactionIndex = contactUser.transactions.findIndex(
      (t) => t._id.toString() === transactionId
    );
    if (contactTransactionIndex !== -1) {
      contactUser.transactions.splice(contactTransactionIndex, 1);
      await contactUser.save();
    }
  }

  // Remove the transaction
  currentUser.transactions.splice(transactionIndex, 1);

  await currentUser.save();

  return NextResponse.json({
    success: true,
    message: "Transaction deleted successfully",
  });
}
