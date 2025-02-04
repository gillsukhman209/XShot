import Link from "next/link";
import { getSEOTags } from "@/libs/seo";
import config from "@/config";

export const metadata = getSEOTags({
  title: `Privacy Policy | ${config.appName}`,
  canonicalUrlRelative: "/privacy-policy",
});

const PrivacyPolicy = () => {
  return (
    <main className="max-w-xl mx-auto">
      <div className="p-5">
        <Link href="/" className="btn btn-ghost">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="w-5 h-5"
          >
            <path
              fillRule="evenodd"
              d="M15 10a.75.75 0 01-.75.75H7.612l2.158 1.96a.75.75 0 11-1.04 1.08l-3.5-3.25a.75.75 0 010-1.08l3.5-3.25a.75.75 0 111.04 1.08L7.612 9.25h6.638A.75.75 0 0115 10z"
              clipRule="evenodd"
            />
          </svg>{" "}
          Back
        </Link>
        <h1 className="text-3xl font-extrabold pb-6">
          Privacy Policy for {config.appName}
        </h1>

        <pre
          className="leading-relaxed whitespace-pre-wrap"
          style={{ fontFamily: "sans-serif" }}
        >
          {`Last Updated: February 2025

Thank you for using XShot ("we," "us," or "our"). This Privacy Policy explains how we collect, use, and protect your information when you visit our website at https://xshot.com (the "Website").

By using our Website and services, you agree to the terms outlined in this Privacy Policy. If you do not agree, please do not use XShot.

1. Information We Collect

1.1 Personal Data

We may collect the following personal information:

- Name: Used to personalize your experience.
- Email: Used for communication, support, and account-related updates.
- Payment Information: Payments are securely processed by trusted third-party payment providers. We do not store your payment details.

1.2 Non-Personal Data

We use cookies and similar technologies to collect non-personal information, including:

- IP address, browser type, and device information.
- Website usage and interaction patterns.
- Analytics data to improve our services.

2. Purpose of Data Collection

We collect and use your data to:

- Provide screenshot customization and download services.
- Process transactions for premium features.
- Improve the platform and user experience.
- Offer customer support.

3. Data Sharing

We **do not sell or rent** your data. We only share necessary data with third-party providers (such as payment processors) to deliver our services.

4. Children's Privacy

XShot is **not intended for users under the age of 13**. If you believe your child has provided personal information, please contact us.

5. Updates to the Privacy Policy

We may update this Privacy Policy periodically. Any changes will be reflected on this page, and we may notify users via email.

6. Contact Information

For questions or concerns, contact us at:

📧 Email: support@xshot.com

By using XShot, you agree to this Privacy Policy.`}
        </pre>
      </div>
    </main>
  );
};

export default PrivacyPolicy;
