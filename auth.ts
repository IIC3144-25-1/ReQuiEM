import NextAuth from "next-auth"
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import clientPromise from "@/lib/db"
import authConfig from "@/auth.config"
import { emailService } from "@/lib/email/email.service"
import { EmailTypesEnum } from "@/lib/email/types/email-types.enum"


export const { signIn, signOut, auth, handlers } = NextAuth({
  adapter: MongoDBAdapter(clientPromise),
  session: {
    strategy: "jwt",
  },
  events: {
    // Este evento se ejecuta SOLO cuando se crea un usuario por primera vez
    async createUser({ user }: { user: { id?: string; email?: string | null; name?: string | null; image?: string | null } }) {
      console.log(`🎉 New user registered: ${user.email}`)
      
      try {
        await emailService.sendEmail({
          to: user.email!,
          type: EmailTypesEnum.NEW_USER_WELCOME,
          payload: {
            user: {
              id: user.id,
              name: user.name || 'Usuario',
              email: user.email!,
              image: user.image,
            },
            provider: 'oauth',
            
            isFirstLogin: true,
          }
        })
        
        console.log(`✅ Welcome email sent to: ${user.email}`)
      } catch (emailError) {
        console.error('❌ Error sending welcome email:', emailError)
      }
    }
  },
  ...authConfig,
})