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
    console.log("User not authenticated");
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { transactionId } = await req.json();
  if (!transactionId) {
    console.log("Transaction ID is required");
    return NextResponse.json(
      { error: "Transaction ID is required" },
      { status: 400 }
    );
  }

  await connectMongo();

  // Find the current user
  const currentUser = await User.findById(session.user.id);

  if (!currentUser) {
    console.log("User not found");
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  // Find the transaction in the current user's transaction list
  const transactionIndex = currentUser.transactions.findIndex(
    (transaction) => transaction._id.toString() === transactionId
  );

  if (transactionIndex === -1) {
    console.log("Transaction not found");
    return NextResponse.json(
      { error: "Transaction not found" },
      { status: 404 }
    );
  }

  // Extract the transaction details
  const transaction = currentUser.transactions[transactionIndex];
  const contactUniqueCode = transaction.contact.uniqueCode;

  // Update currentUser's totals
  if (transaction.status === "lent") {
    currentUser.totalLent = Math.max(
      0,
      currentUser.totalLent - transaction.amount
    );
    const contact = currentUser.contacts.find(
      (contact) => contact.uniqueCode === contactUniqueCode
    );
    if (contact) {
      contact.totalBorrowed = Math.max(
        0,
        contact.totalBorrowed - transaction.amount
      );
    }
  } else if (transaction.status === "borrowed") {
    currentUser.totalBorrowed = Math.max(
      0,
      currentUser.totalBorrowed - transaction.amount
    );
    const contact = currentUser.contacts.find(
      (contact) => contact.uniqueCode === contactUniqueCode
    );
    if (contact) {
      contact.totalLent = Math.max(0, contact.totalLent - transaction.amount);
    }
  }

  // Remove the transaction from currentUser
  currentUser.transactions.splice(transactionIndex, 1);
  await currentUser.save();

  // Update the contact user's transactions and totals
  const contactUser = await User.findOne({ uniqueCode: contactUniqueCode });

  if (contactUser) {
    const contactTransactionIndex = contactUser.transactions.findIndex(
      (t) => t._id.toString() === transactionId
    );

    if (contactTransactionIndex !== -1) {
      const contactTransaction =
        contactUser.transactions[contactTransactionIndex];

      if (contactTransaction.status === "borrowed") {
        contactUser.totalBorrowed = Math.max(
          0,
          contactUser.totalBorrowed - contactTransaction.amount
        );
      } else if (contactTransaction.status === "lent") {
        contactUser.totalLent = Math.max(
          0,
          contactUser.totalLent - contactTransaction.amount
        );
      }

      // Remove the transaction from contactUser
      contactUser.transactions.splice(contactTransactionIndex, 1);

      // Update the corresponding contact in contactUser's contacts array
      const userContact = contactUser.contacts.find(
        (contact) => contact.uniqueCode === currentUser.uniqueCode
      );
      if (userContact) {
        if (contactTransaction.status === "lent") {
          userContact.totalBorrowed = Math.max(
            0,
            userContact.totalBorrowed - contactTransaction.amount
          );
        } else if (contactTransaction.status === "borrowed") {
          userContact.totalLent = Math.max(
            0,
            userContact.totalLent - contactTransaction.amount
          );
        }
      }

      await contactUser.save();
    }
  }

  return NextResponse.json({
    success: true,
    message: "Transaction and associated balances updated successfully",
  });
}
