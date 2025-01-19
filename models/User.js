import mongoose from "mongoose";
import toJSON from "./plugins/toJSON";

// USER SCHEMA
const userSchema = mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      private: true,
    },
    image: {
      type: String,
    },
    uniqueCode: { type: String, unique: true }, // Unique code for each user
    customerId: {
      type: String,
      validate(value) {
        return value.includes("cus_");
      },
    },
    priceId: {
      type: String,
      validate(value) {
        return value.includes("price_");
      },
    },
    hasAccess: {
      type: Boolean,
      default: false,
    },
    totalOwed: {
      type: Number,
      default: 0,
    },
    totalOwe: {
      type: Number,
      default: 0,
    },
    net: {
      type: Number,
      default: 0,
    },
    // Additional fields for app functionality
    contacts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User", // Reference to other users in the system
      },
    ],
    debts: [
      {
        contact: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        amount: {
          type: Number,
          required: true,
        },
        note: {
          type: String,
          trim: true,
        },
        date: {
          type: Date,
          default: Date.now,
        },
        status: {
          type: String,
          enum: ["owed", "lent", "paid"], // Status of the debt
          default: "owed",
        },
      },
    ],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
  }
);

// add plugin that converts mongoose to json
userSchema.plugin(toJSON);

export default mongoose.models.User || mongoose.model("User", userSchema);
