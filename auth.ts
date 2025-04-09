import NextAuth from "next-auth"
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import clientPromise from "@/lib/db"
import Google from "next-auth/providers/google"

export const config ={
  adapter: MongoDBAdapter(clientPromise),
  providers: [Google],
}

export const { signIn, signOut, auth, handlers } = NextAuth(config)