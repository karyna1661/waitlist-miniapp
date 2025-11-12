import { NeynarAPIClient } from "@neynar/nodejs-sdk"

export function getNeynarClient() {
  const apiKey = process.env.NEYNAR_API_KEY
  if (!apiKey) {
    throw new Error("NEYNAR_API_KEY not set")
  }
  return new NeynarAPIClient(apiKey)
}

export async function fetchFarcasterProfile(username: string) {
  try {
    const client = getNeynarClient()
    const resp = await client.lookupUserByUsername(username)
    return resp.result.user
  } catch (e) {
    console.error("Failed to fetch Farcaster profile", e)
    return null
  }
}
