import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";

// Simple in-memory user store for demonstration
// In production, replace this with a proper database
const users = [
  {
    id: "1",
    email: "demo@example.com",
    password: "password123", // In production, use hashed passwords (bcrypt, argon2, etc.)
    name: "Demo User",
  },
];

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        // Validate credentials
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        // Find user by email
        const user = users.find((u) => u.email === credentials.email);

        // Check if user exists and password matches
        // In production, use proper password hashing comparison
        if (user && user.password === credentials.password) {
          // Return user object without password
          return {
            id: user.id,
            email: user.email,
            name: user.name,
          };
        }

        // Return null if authentication fails
        return null;
      },
    }),
  ],
  pages: {
    signIn: "/auth/signin",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
});