import mongoose from "mongoose";
import toJSON from "./plugins/toJSON";

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

    // New fields for the screenshot service
    subscriptionPlan: {
      type: String,
      enum: ["free", "monthly", "yearly"],
      default: "free",
    },
    screenshotsLeft: {
      type: Number,
      default: 10, // Default for free plan
    },
  },
  {
    timestamps: true, // Automatically adds createdAt & updatedAt fields
    toJSON: { virtuals: true },
  }
);

// Add plugin that converts mongoose to JSON
userSchema.plugin(toJSON);

export default mongoose.models.User || mongoose.model("User", userSchema);
