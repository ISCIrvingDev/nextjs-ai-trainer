export default {
  providers: [
    {
      domain: process.env.NEXT_PUBLIC_CLERK_CONVEX_ISSUER || "",
      applicationID: "convex",
    },
  ],
};
