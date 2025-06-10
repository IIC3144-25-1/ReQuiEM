import { getCurrentUser } from "@/actions/user/getUser"
import { HomeClient } from "./HomeClient"

export default async function Home() {
  const user = await getCurrentUser()

  return (
    <HomeClient user={user && user.name ? { name: user.name } : null} />
  )
}