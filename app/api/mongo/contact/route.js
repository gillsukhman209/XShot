import { getServerSession } from "next-auth";
import { authOptions } from "@/libs/next-auth";
import connectMongo from "@/libs/mongoose";
import User from "@/models/User";

import { NextResponse } from "next/server";

export async function GET(req) {
  // Parse the uniqueCode from the query parameters
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

  // Find the user with the given unique code
  const contactUser = await User.findOne({ uniqueCode });

  if (!contactUser) {
    return NextResponse.json(
      { error: "Contact with the provided unique code does not exist" },
      { status: 404 }
    );
  }

  return NextResponse.json({
    contact: {
      name: contactUser.name,
      uniqueCode: contactUser.uniqueCode,
    },
  });
}

export async function POST(req) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { uniqueCode } = await req.json();

  if (!uniqueCode) {
    return NextResponse.json(
      { error: "Unique code is required" },
      { status: 400 }
    );
  }

  await connectMongo();

  // Find the current user
  const currentUser = await User.findById(session.user.id);
  if (!currentUser) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  // Find the user with the given unique code
  const contactUser = await User.findOne({ uniqueCode });
  if (!contactUser) {
    return NextResponse.json(
      { error: "Contact with the provided unique code does not exist" },
      { status: 404 }
    );
  }

  // Check if the contact is already in the current user's contacts list
  const alreadyInContacts = currentUser.contacts.some(
    (contact) => contact.uniqueCode === uniqueCode
  );

  if (alreadyInContacts) {
    return NextResponse.json(
      { error: "This contact is already in your contacts list" },
      { status: 400 }
    );
  }

  // Add the contact to the current user's contacts list
  currentUser.contacts.push({
    name: contactUser.name,
    uniqueCode: contactUser.uniqueCode,
    relationship: "lent", // Define the relationship as per your logic
  });
  await currentUser.save();

  // Add the current user to the contact's contacts list
  const alreadyInTheirContacts = contactUser.contacts.some(
    (contact) => contact.uniqueCode === currentUser.uniqueCode
  );

  if (!alreadyInTheirContacts) {
    contactUser.contacts.push({
      name: currentUser.name,
      uniqueCode: currentUser.uniqueCode,
      relationship: "borrowed", // Define the reverse relationship
    });
    await contactUser.save();
  }

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

  // Find the current user
  const currentUser = await User.findById(session.user.id);
  if (!currentUser) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  // Remove the contact from the current user's contacts list
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
  await currentUser.save();

  // Also remove the current user from the contact's contacts list
  const contactUser = await User.findOne({ uniqueCode });
  if (contactUser) {
    const userIndex = contactUser.contacts.findIndex(
      (contact) => contact.uniqueCode === currentUser.uniqueCode
    );

    if (userIndex !== -1) {
      contactUser.contacts.splice(userIndex, 1);
      await contactUser.save();
    }
  }

  return NextResponse.json({
    success: true,
    message: "Contact deleted successfully",
  });
}
