import NextAuth from "next-auth"
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import clientPromise from "@/lib/db"
import Google from "next-auth/providers/google"
import MicrosoftEntraID from "@auth/core/providers/microsoft-entra-id"

export const config ={
  adapter: MongoDBAdapter(clientPromise),
  providers: [
    Google,
    MicrosoftEntraID({
      clientId: process.env.AUTH_MICROSOFT_ENTRA_ID_ID,
      clientSecret: process.env.AUTH_MICROSOFT_ENTRA_ID_SECRET,
      issuer: `https://login.microsoftonline.com/${process.env.AUTH_MICROSOFT_ENTRA_ID_ISSUER}/v2.0`,
      authorization: {
        params: {
          prompt: "select_account", // Force the user to select an account
        },
      },
    }),
  ],
}

export const { signIn, signOut, auth, handlers } = NextAuth(config)