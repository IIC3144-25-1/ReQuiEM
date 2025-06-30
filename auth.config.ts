// auth.config.ts
import GoogleProvider from "next-auth/providers/google";
import MicrosoftEntraID from "@auth/core/providers/microsoft-entra-id";
import type { NextAuthConfig } from "next-auth";

const authConfig: NextAuthConfig = {
  providers: [
    GoogleProvider({
      clientId:     process.env.AUTH_GOOGLE_ID!,       // tu ENV para Google
      clientSecret: process.env.AUTH_GOOGLE_SECRET!,   // tu ENV para Google
      // ⚠️ aquí habilitas el linking automático si ya existe el email
      allowDangerousEmailAccountLinking: true,
    }),
    MicrosoftEntraID({
      clientId:     process.env.AUTH_MICROSOFT_ENTRA_ID_ID!,
      clientSecret: process.env.AUTH_MICROSOFT_ENTRA_ID_SECRET!,
      issuer:       `https://login.microsoftonline.com/${process.env.AUTH_MICROSOFT_ENTRA_ID_ISSUER}/v2.0`,
      authorization: {
        params: { prompt: "select_account" },
      },
      // ⚠️ y aquí también
      allowDangerousEmailAccountLinking: true,
    }),
  ],

  // cualquier otra opción global que necesites…
};

export default authConfig;
