import { NextResponse } from "next/server";
import { headers } from "next/headers";
import Stripe from "stripe";
import connectMongo from "@/libs/mongoose";
import configFile from "@/config";
import User from "@/models/User";
import { findCheckoutSession } from "@/libs/stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(req) {
  await connectMongo();

  const body = await req.text();
  const signature = headers().get("stripe-signature");

  let event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    console.error(`Webhook signature verification failed. ${err.message}`);
    return NextResponse.json({ error: err.message }, { status: 400 });
  }

  const { type: eventType, data } = event;

  try {
    switch (eventType) {
      case "checkout.session.completed": {
        const session = await findCheckoutSession(data.object.id);
        const customerId = session?.customer;
        const priceId = session?.line_items?.data[0]?.price.id;
        const userId = data.object.client_reference_id;
        const plan = configFile.stripe.plans.find((p) => p.priceId === priceId);

        if (!plan) break;

        const customer = await stripe.customers.retrieve(customerId);
        let user;

        if (userId) {
          user = await User.findById(userId);
        } else if (customer.email) {
          user =
            (await User.findOne({ email: customer.email })) ||
            (await User.create({
              email: customer.email,
              name: customer.name || "New User",
            }));
        } else {
          console.error("No user found for checkout session.");
          throw new Error("No user found");
        }

        console.log("plan", plan);

        // ✅ FIX: Convert to lowercase for proper enum match
        user.customerId = customerId;
        user.priceId = priceId;
        user.subscriptionPlan = plan.name.toLowerCase(); // Ensures it matches schema ("monthly", "yearly", "free")
        user.screenshotsLeft =
          plan.name.toLowerCase() === "monthly"
            ? 500
            : plan.name.toLowerCase() === "yearly"
            ? 1500
            : 10; // Free plan default

        await user.save();
        break;
      }

      case "customer.subscription.updated": {
        console.log("customer.subscription.updated");
        const subscription = data.object;
        const customerId = subscription.customer;
        const priceId = subscription.items.data[0].price.id;
        const plan = configFile.stripe.plans.find((p) => p.priceId === priceId);

        if (!plan) break;

        const user = await User.findOne({ customerId });
        if (!user) break;

        // ✅ FIX: Convert to lowercase to match schema
        user.subscriptionPlan = plan.name.toLowerCase();
        user.screenshotsLeft =
          plan.name.toLowerCase() === "monthly"
            ? 500
            : plan.name.toLowerCase() === "yearly"
            ? 1500
            : 10;

        await user.save();
        break;
      }

      case "customer.subscription.deleted": {
        console.log("customer.subscription.deleted");
        const customerId = data.object.customer;
        const user = await User.findOne({ customerId });

        if (user) {
          user.subscriptionPlan = "free";
          user.screenshotsLeft = 10; // Reset to free plan limit
          await user.save();
        }

        break;
      }

      case "invoice.paid": {
        const priceId = data.object.lines.data[0].price.id;
        const customerId = data.object.customer;
        const plan = configFile.stripe.plans.find((p) => p.priceId === priceId);

        if (!plan) break;

        const user = await User.findOne({ customerId });
        if (!user || user.priceId !== priceId) break;

        // ✅ FIX: Ensure correct plan naming

        user.subscriptionPlan = plan.name.toLowerCase();
        user.screenshotsLeft =
          plan.name.toLowerCase() === "monthly"
            ? 500
            : plan.name.toLowerCase() === "yearly"
            ? 1500
            : 10;
        await user.save();

        break;
      }

      case "invoice.payment_failed": {
        const customerId = data.object.customer;
        const user = await User.findOne({ customerId });

        await user.save();
        break;
      }

      default:
        console.log(`Unhandled event type: ${eventType}`);
    }
  } catch (e) {
    console.error(`Stripe webhook error: ${e.message} | Event: ${eventType}`);
  }

  return NextResponse.json({});
}
