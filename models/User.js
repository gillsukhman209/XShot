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
    // Additional fields for app functionality
    friends: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User", // Reference to other users in the system
      },
    ],
    debts: [
      {
        friend: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User", // Reference to a friend
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
