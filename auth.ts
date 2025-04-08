import NextAuth from "next-auth"
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import clientPromise from "@/lib/db"

export const config ={
  adapter: MongoDBAdapter(clientPromise),
  providers: [],
}

export const { signIn, signOut, auth, handlers } = NextAuth(config)