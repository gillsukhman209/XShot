import { getServerSession } from "next-auth";
import { authOptions } from "@/libs/next-auth";
import connectMongo from "@/libs/mongoose";
import User from "@/models/User";

import { NextResponse } from "next/server";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const uniqueCode = searchParams.get("uniqueCode");

  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  await connectMongo();

  if (!uniqueCode) {
    return NextResponse.json(
      { error: "Unique code is required" },
      { status: 400 }
    );
  }

  const contactUser = await User.findOne({ uniqueCode });

  if (!contactUser) {
    return NextResponse.json(
      { error: "Contact with the provided unique code does not exist" },
      { status: 404 }
    );
  }

  return NextResponse.json({
    contact: contactUser,
  });
}
export async function POST(req) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    console.log("User not authenticated");
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { name, uniqueCode } = await req.json();
  console.log("Received data:", { name, uniqueCode });

  if (!name && !uniqueCode) {
    console.log("Validation error: Either name or unique code is required");
    return NextResponse.json(
      { error: "Either name or unique code is required" },
      { status: 400 }
    );
  }

  await connectMongo();

  const currentUser = await User.findById(session.user.id);

  if (!currentUser) {
    console.log("User not found");
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  let codeToUse = uniqueCode;

  let contactUser = await User.findOne({ uniqueCode: codeToUse });
  console.log("Contact user found:", contactUser);

  if (!contactUser) {
    // Create a new user if the contact doesn't exist
    contactUser = new User({
      name: name || "Unnamed User",
      uniqueCode: codeToUse,
      net: 0,
      totalBorrowed: 0,
      totalLent: 0,
      transactions: [],
      contacts: [],
    });
    await contactUser.save();
    console.log("New contact user created:", contactUser);
  }

  const alreadyInContacts = currentUser.contacts.some(
    (contact) => contact.uniqueCode === codeToUse
  );
  console.log("Already in contacts:", alreadyInContacts);

  if (alreadyInContacts) {
    console.log("Contact already in user's contacts list");
    return NextResponse.json(
      { error: "This contact is already in your contacts list" },
      { status: 400 }
    );
  }

  currentUser.contacts.push({
    name: contactUser.name,
    uniqueCode: contactUser.uniqueCode,
  });

  const alreadyInTheirContacts = contactUser.contacts.some(
    (contact) => contact.uniqueCode === currentUser.uniqueCode
  );
  console.log("Already in their contacts:", alreadyInTheirContacts);

  if (!alreadyInTheirContacts) {
    contactUser.contacts.push({
      name: currentUser.name,
      uniqueCode: currentUser.uniqueCode,
    });
    await contactUser.save();
    console.log("Updated contact user with new contact");
  }

  await currentUser.save();
  console.log("Current user updated with new contact");

  return NextResponse.json({
    success: true,
    message: "Contact added successfully",
    contact: {
      name: contactUser.name,
      uniqueCode: contactUser.uniqueCode,
    },
  });
}

export async function DELETE(req) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const uniqueCode = searchParams.get("uniqueCode");

  if (!uniqueCode) {
    return NextResponse.json(
      { error: "Unique code is required" },
      { status: 400 }
    );
  }

  await connectMongo();

  const currentUser = await User.findById(session.user.id);
  if (!currentUser) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const contactUser = await User.findOne({ uniqueCode });
  if (!contactUser) {
    return NextResponse.json(
      { error: "Contact with the provided unique code does not exist" },
      { status: 404 }
    );
  }

  const contactIndex = currentUser.contacts.findIndex(
    (contact) => contact.uniqueCode === uniqueCode
  );

  if (contactIndex === -1) {
    return NextResponse.json(
      { error: "Contact not found in your contacts list" },
      { status: 404 }
    );
  }

  currentUser.contacts.splice(contactIndex, 1);

  const relatedTransactions = currentUser.transactions.filter(
    (transaction) => transaction.contact.uniqueCode === uniqueCode
  );

  let totalLentToRemove = 0;
  let totalBorrowedToRemove = 0;

  relatedTransactions.forEach((transaction) => {
    if (transaction.status === "lent") {
      totalLentToRemove += transaction.amount;
    } else if (transaction.status === "borrowed") {
      totalBorrowedToRemove += transaction.amount;
    }
  });

  currentUser.totalLent -= totalLentToRemove;
  currentUser.totalBorrowed -= totalBorrowedToRemove;

  currentUser.transactions = currentUser.transactions.filter(
    (transaction) => transaction.contact.uniqueCode !== uniqueCode
  );

  await currentUser.save();

  const userIndex = contactUser.contacts.findIndex(
    (contact) => contact.uniqueCode === currentUser.uniqueCode
  );

  if (userIndex !== -1) {
    contactUser.contacts.splice(userIndex, 1);

    let totalLentToContact = 0;
    let totalBorrowedFromContact = 0;

    const reverseTransactions = contactUser.transactions.filter(
      (transaction) => transaction.contact.uniqueCode === currentUser.uniqueCode
    );

    reverseTransactions.forEach((transaction) => {
      if (transaction.status === "borrowed") {
        totalBorrowedFromContact += transaction.amount;
      } else if (transaction.status === "lent") {
        totalLentToContact += transaction.amount;
      }
    });

    contactUser.totalLent -= totalLentToContact;
    contactUser.totalBorrowed -= totalBorrowedFromContact;

    contactUser.transactions = contactUser.transactions.filter(
      (transaction) => transaction.contact.uniqueCode !== currentUser.uniqueCode
    );

    await contactUser.save();
  }

  return NextResponse.json({
    success: true,
    message: "Contact and associated transactions deleted successfully",
  });
}
