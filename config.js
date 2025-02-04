import themes from "daisyui/src/theming/themes";

const config = {
  // REQUIRED
  appName: "XShot",
  // REQUIRED: a short description of your app for SEO tags (can be overwritten)
  appDescription:
    "XShot is a sleek tool that lets users capture and customize high-quality screenshots of Instagram and Twitter posts. With flexible pricing plans, watermark-free options, and future video integration, XShot is perfect for content creators and social media enthusiasts.",
  // REQUIRED (no https://, not trialing slash at the end, just the naked domain)
  domainName: "xshot",
  crisp: {
    // Crisp website ID. IF YOU DON'T USE CRISP: just remove this => Then add a support email in this config file (mailgun.supportEmail) otherwise customer support won't work.
    id: "",
    // Hide Crisp by default, except on route "/". Crisp is toggled with <ButtonSupport/>. If you want to show Crisp on every routes, just remove this below
    onlyShowOnRoutes: ["/"],
  },
  stripe: {
    // Create multiple plans in your Stripe dashboard, then add them here.
    plans: [
      {
        // REQUIRED — Plan identifier for Stripe webhook
        priceId: "price_1QooCORS6Dh7OtvxL1EcfDHi",
        // Plan name displayed on the pricing page
        name: "Free",
        // Friendly description for the plan
        description:
          "Capture up to 10 screenshots per month with a small watermark. Perfect for casual users who need quick social media snapshots.",
        // Price displayed (Free Plan)
        price: 0,
        // Anchor price (not applicable for Free Plan)
        priceAnchor: null,
        features: [
          { name: "10 screenshots per month" },
          { name: "Includes a watermark" },
        ],
      },
      {
        // Highlighted plan
        isFeatured: true,
        priceId: "price_1QooCmRS6Dh7OtvxaOX7Oh8B",
        name: "Monthly",
        // Friendly description for the plan
        description:
          "Get 500 screenshots per month, completely watermark-free. Ideal for content creators and marketers. Cancel anytime!",
        // Price displayed
        price: 9.99, // Monthly price
        // Anchor price for discount (if applicable)
        priceAnchor: 19.99,
        features: [
          { name: "500 screenshots per month" },
          { name: "No watermark" },
        ],
      },
      {
        // Highlighted plan
        isFeatured: false,
        priceId: "price_1QooDTRS6Dh7OtvxCIvyBN6B",
        name: "Yearly",
        // Friendly description for the plan
        description:
          "Get 1500 screenshots per month, completely watermark-free. Ideal for content creators and marketers. Cancel anytime!",
        // Price displayed
        price: 89.99, // Monthly price
        // Anchor price for discount (if applicable)
        priceAnchor: 199.99,
        features: [
          { name: "1500 screenshots per month" },
          { name: "No watermark" },
        ],
      },
    ],
  },
  aws: {
    // If you use AWS S3/Cloudfront, put values in here
    bucket: "bucket-name",
    bucketUrl: `https://bucket-name.s3.amazonaws.com/`,
    cdn: "https://cdn-id.cloudfront.net/",
  },
  mailgun: {
    // subdomain to use when sending emails, if you don't have a subdomain, just remove it. Highly recommended to have one (i.e. mg.yourdomain.com or mail.yourdomain.com)
    subdomain: "mg",
    // REQUIRED — Email 'From' field to be used when sending magic login links
    fromNoReply: `ShipFast <noreply@mg.shipfa.st>`,
    // REQUIRED — Email 'From' field to be used when sending other emails, like abandoned carts, updates etc..
    fromAdmin: `Marc at ShipFast <marc@mg.shipfa.st>`,
    // Email shown to customer if need support. Leave empty if not needed => if empty, set up Crisp above, otherwise you won't be able to offer customer support."
    supportEmail: "marc@mg.shipfa.st",
    // When someone replies to supportEmail sent by the app, forward it to the email below (otherwise it's lost). If you set supportEmail to empty, this will be ignored.
    forwardRepliesTo: "marc.louvion@gmail.com",
  },
  colors: {
    // REQUIRED — The DaisyUI theme to use (added to the main layout.js). Leave blank for default (light & dark mode). If you any other theme than light/dark, you need to add it in config.tailwind.js in daisyui.themes.
    theme: "light",
    // REQUIRED — This color will be reflected on the whole app outside of the document (loading bar, Chrome tabs, etc..). By default it takes the primary color from your DaisyUI theme (make sure to update your the theme name after "data-theme=")
    // OR you can just do this to use a custom color: main: "#f37055". HEX only.
    main: themes["light"]["primary"],
  },
  auth: {
    // REQUIRED — the path to log in users. It's use to protect private routes (like /dashboard). It's used in apiClient (/libs/api.js) upon 401 errors from our API
    loginUrl: "/api/auth/signin",
    // REQUIRED — the path you want to redirect users after successfull login (i.e. /dashboard, /private). This is normally a private page for users to manage their accounts. It's used in apiClient (/libs/api.js) upon 401 errors from our API & in ButtonSignin.js
    callbackUrl: "/dashboard",
  },
};

export default config;
