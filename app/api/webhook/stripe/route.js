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

  let data;
  let eventType;
  let event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    console.error(`Webhook signature verification failed. ${err.message}`);
    return NextResponse.json({ error: err.message }, { status: 400 });
  }

  data = event.data;
  eventType = event.type;

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
          user = await User.findOne({ email: customer.email });

          if (!user) {
            user = await User.create({
              email: customer.email,
              name: customer.name,
            });

            await user.save();
          }
        } else {
          console.error("No user found");
          throw new Error("No user found");
        }

        user.priceId = priceId;
        user.customerId = customerId;
        user.hasAccess = true;

        // Initialize empty friends and debts arrays if not already present
        user.contacts = user.contacts || [];
        user.debts = user.debts || [];
        user.totalLent = 0;
        user.totalBorrowed = 0;
        user.net = 0;

        await user.save();

        break;
      }

      case "customer.subscription.updated": {
        const subscription = data.object;

        if (subscription.cancel_at_period_end) {
          console.log("Subscription set to cancel at period end.");
        }

        break;
      }

      case "customer.subscription.deleted": {
        const subscription = await stripe.subscriptions.retrieve(
          data.object.id
        );
        const user = await User.findOne({ customerId: subscription.customer });

        user.hasAccess = false;
        await user.save();

        break;
      }

      case "invoice.paid": {
        const priceId = data.object.lines.data[0].price.id;
        const customerId = data.object.customer;

        const user = await User.findOne({ customerId });

        if (user.priceId !== priceId) break;

        user.hasAccess = true;
        await user.save();

        break;
      }

      case "invoice.payment_failed": {
        const customerId = data.object.customer;
        const user = await User.findOne({ customerId });

        user.hasAccess = false;
        await user.save();

        break;
      }

      default:
        console.log(`Unhandled event type: ${eventType}`);
    }
  } catch (e) {
    console.error("Stripe error: " + e.message + " | EVENT TYPE: " + eventType);
  }

  return NextResponse.json({});
}
