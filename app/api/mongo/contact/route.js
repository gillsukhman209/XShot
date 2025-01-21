import { getServerSession } from "next-auth";
import { authOptions } from "@/libs/next-auth";
import connectMongo from "@/libs/mongoose";
import User from "@/models/User";

import { NextResponse } from "next/server";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  await connectMongo();

  const user = await User.findById(session.user.id).populate("contacts");

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  return NextResponse.json({ contacts: user.contacts });
}
export async function POST(req) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { uniqueCode, name } = await req.json();

  if (!uniqueCode || !name) {
    return NextResponse.json(
      { error: "Unique code and name are required" },
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
    name: name,
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
