
import Google from "next-auth/providers/google"
import MicrosoftEntraID from "@auth/core/providers/microsoft-entra-id"
import type { NextAuthConfig } from "next-auth"

export default {
  providers: [
    Google,
    MicrosoftEntraID({
      clientId: process.env.AUTH_MICROSOFT_ENTRA_ID_ID,
      clientSecret: process.env.AUTH_MICROSOFT_ENTRA_ID_SECRET,
      issuer: `https://login.microsoftonline.com/${process.env.AUTH_MICROSOFT_ENTRA_ID_ISSUER}/v2.0`,
      authorization: {
        params: {
          prompt: "select_account",
        },
      },
    }),
  ],
} satisfies NextAuthConfig;