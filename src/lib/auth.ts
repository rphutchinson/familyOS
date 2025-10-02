import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { db, client } from "@/lib/mongodb";

export const auth = betterAuth({
  database: mongodbAdapter(db, {
    client, // Enable database transactions
  }),
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
    maxPasswordLength: 128,
  },
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.BETTER_AUTH_URL,
  user: {
    additionalFields: {
      familyId: {
        type: "string",
        required: false,
        input: false, // Not set during registration
      },
    },
  },
});
