import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/libs/next-auth";
import config from "@/config";
import connectMongo from "@/libs/mongoose";
import User from "@/models/User";

export default async function LayoutPrivate({ children }) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect(config.auth.loginUrl);
  }

  // Check if the user has access
  await connectMongo();
  const user = await User.findById(session.user.id);

  if (!user || !user.subscriptionPlan) {
    redirect("/");
  }
  return <>{children}</>;
}
