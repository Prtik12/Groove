// import { PrismaAdapter } from "@next-auth/prisma-adapter";
// import { prisma } from "@/lib/prisma";
// import { NextAuthOptions } from "next-auth";
// import CredentialsProvider from "next-auth/providers/credentials";
// import GitHubProvider from "next-auth/providers/github";
// import GoogleProvider from "next-auth/providers/google";
// import { z } from "zod";
// import bcrypt from "bcrypt";

// const loginSchema = z.object({
//   email: z.string().email(),
//   password: z.string().min(6),
// });

// export const authOptions: NextAuthOptions = {
//   adapter: PrismaAdapter(prisma),
//   providers: [
//     GitHubProvider({
//       clientId: process.env.GITHUB_CLIENT_ID!,
//       clientSecret: process.env.GITHUB_CLIENT_SECRET!,
//     }),
//     GoogleProvider({
//       clientId: process.env.GOOGLE_CLIENT_ID!,
//       clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
//     }),
//     CredentialsProvider({
//       name: "Credentials",
//       credentials: {
//         email: { label: "Email", type: "email" },
//         password: { label: "Password", type: "password" },
//       },
//       async authorize(credentials) {
//         const parsed = loginSchema.safeParse(credentials);
//         if (!parsed.success) {
//           throw new Error("Invalid email or password");
//         }

//         const { email, password } = parsed.data;
//         const user = await prisma.user.findUnique({ where: { email } });

//         if (!user || !user.password) {
//           throw new Error("User not found");
//         }

//         const passwordMatch = await bcrypt.compare(password, user.password);
//         if (!passwordMatch) {
//           throw new Error("Incorrect password");
//         }

//         return { id: user.id, name: user.name, email: user.email, image: user.image };
//       },
//     }),
//   ],
//   session: { strategy: "jwt" },
//   callbacks: {
//     async signIn({ user, account }) {
//         if (!account || !user.email) return true; // Ensure account and user email exist

//         if (account.provider !== "credentials") {
//           const existingUser = await prisma.user.findUnique({
//             where: { email: user.email },
//             include: { accounts: true },
//           });

//           if (existingUser) {
//             const accountExists = existingUser.accounts.some(
//               (acc) => acc.provider === account.provider
//             );

//             if (!accountExists) {
//               // Auto-link the OAuth account
//               await prisma.account.create({
//                 data: {
//                   userId: existingUser.id,
//                   provider: account.provider,
//                   providerAccountId: account.providerAccountId,
//                   type: account.type,
//                 },
//               });
//             }
//           }
//         }
//         return true;
//       },
//     async jwt({ token, user }) {
//       if (user) {
//         token.id = user.id;
//       }
//       return token;
//     },
//     async session({ session, token }) {
//       if (session.user && token?.id) {
//         session.user.id = token.id as string;
//       }
//       return session;
//     },
//     async redirect({ baseUrl }) {
//         return baseUrl;
//       },

//   },
//   pages: {
//     signIn: "/signin",
//   },
//   secret: process.env.NEXTAUTH_SECRET,
// };

import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GitHubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";
import { z } from "zod";
import bcrypt from "bcrypt";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) {
          throw new Error("Invalid email or password");
        }

        const { email, password } = parsed.data;
        const user = await prisma.user.findUnique({ where: { email } });

        if (!user || !user.password) {
          throw new Error("User not found");
        }

        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
          throw new Error("Incorrect password");
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
        };
      },
    }),
  ],
  session: { strategy: "jwt" },
  callbacks: {
    async signIn({ user, account, profile }) {
      if (!account || !user.email) return true;

      const existingUser = await prisma.user.findUnique({
        where: { email: user.email },
        include: { accounts: true },
      });

      if (account.provider !== "credentials") {
        if (!existingUser) {
          // Create a new user if they signed up with Google/GitHub first
          await prisma.user.create({
            data: {
              email: user.email,
              name: user.name || profile?.name || "",
              image: user.image || profile?.image || "",
              accounts: {
                create: {
                  provider: account.provider,
                  providerAccountId: account.providerAccountId,
                  type: account.type,
                },
              },
            },
          });
        } else {
          // If user exists, ensure OAuth provider is linked
          const accountExists = existingUser.accounts.some(
            (acc) => acc.provider === account.provider,
          );

          if (!accountExists) {
            await prisma.account.create({
              data: {
                userId: existingUser.id,
                provider: account.provider,
                providerAccountId: account.providerAccountId,
                type: account.type,
              },
            });
          }
        }
      }

      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token?.id) {
        session.user.id = token.id as string;
      }
      return session;
    },
    async redirect({ baseUrl }) {
      return baseUrl; // Redirect all users to "/"
    },
  },
  pages: {
    signIn: "/signin",
  },
  secret: process.env.NEXTAUTH_SECRET,
};
