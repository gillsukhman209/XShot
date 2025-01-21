import mongoose from "mongoose";
import toJSON from "./plugins/toJSON";

const contactSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  uniqueCode: {
    type: String,
    required: true,
  },

  totalLent: {
    type: Number,
    default: 0,
  },
  totalBorrowed: {
    type: Number,
    default: 0,
  },
});

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
    totalLent: {
      type: Number,
      default: 0,
    },
    totalBorrowed: {
      type: Number,
      default: 0,
    },
    net: {
      type: Number,
      default: 0,
    },
    // Additional fields for app functionality
    contacts: [contactSchema],
    transactions: [
      {
        contact: {
          type: contactSchema,
          required: true,
        },
        amount: {
          type: Number,
          required: true,
          min: 0.01, // Ensure the amount is greater than 0
        },
        note: {
          type: String,
          trim: true,
          maxlength: 255, // Prevent excessively long notes
        },
        date: {
          type: Date,
          default: Date.now,
        },
        status: {
          type: String,
          enum: ["borrowed", "lent", "paid"],
          default: "borrowed",
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
