import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { getNeynarClient, fetchFarcasterProfile } from "@/lib/farcaster-api"

export async function GET(req: NextRequest) {
  try {
    const fidParam = req.nextUrl.searchParams.get("fid")
    const username = req.nextUrl.searchParams.get("username")
    let fid = fidParam ? parseInt(fidParam, 10) : NaN

    // Resolve fid from username if needed (and not already provided)
    if ((!fid || Number.isNaN(fid)) && username) {
      const prof = await fetchFarcasterProfile(username)
      fid = prof?.fid ?? NaN
    }

    if (!fid || Number.isNaN(fid)) {
      return NextResponse.json({ error: "Missing valid FID or username" }, { status: 400 })
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !serviceKey) {
      return NextResponse.json({ error: "Server misconfigured" }, { status: 500 })
    }

    const supabase = createClient(supabaseUrl, serviceKey)

    // Get user's following list
    const client = getNeynarClient()
    const followingResp = await client.fetchUserFollowing(fid, { limit: 150 })
    
    // Extract FIDs from the response - handle both possible response structures
    const followingFids = (followingResp as any).users?.map((u: any) => u.fid) ?? (followingResp as any).fids ?? []

    if (followingFids.length === 0) {
      return NextResponse.json({ friends: [] })
    }

    // Find which of those are in the waitlist
    const { data: waitlistUsers, error } = await supabase
      .from("waitlist")
      .select("fid, joined_at")
      .in("fid", followingFids)

    if (error) {
      console.error("Supabase error", error)
      return NextResponse.json({ error: "DB error" }, { status: 500 })
    }

    // Get profile details for waitlist users
    const waitlistFids = waitlistUsers.map((u) => u.fid)
    if (waitlistFids.length === 0) {
      return NextResponse.json({ friends: [] })
    }

    const profilesResp = await client.fetchBulkUsers({ fids: waitlistFids })
    const profileMap = new Map(
      profilesResp.users.map((u) => [
        u.fid,
        {
          username: u.username,
          displayName: u.display_name,
          pfp: u.pfp,
        },
      ])
    )

    const friends = waitlistUsers.map((u) => ({
      fid: u.fid,
      profile: profileMap.get(u.fid) ?? null,
      joined_at: u.joined_at,
    }))

    // Sort by most recent first
    friends.sort((a, b) => new Date(b.joined_at).getTime() - new Date(a.joined_at).getTime())

    return NextResponse.json({ friends })
  } catch (e) {
    console.error("Friends handler error", e)
    return NextResponse.json({ error: "Unexpected error" }, { status: 500 })
  }
}
