import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { getNeynarClient } from "@/lib/farcaster-api"

export async function POST(req: NextRequest) {
  try {
    const { fid } = await req.json()
    if (!fid) {
      return NextResponse.json(
        { error: "FID is required" },
        { status: 400 }
      )
    }

    const client = getNeynarClient()

    // ✅ Fetch Farcaster user data
    const userRes = await client.lookupUserByFid(fid)

    if (!userRes?.result?.user) {
      return NextResponse.json(
        { error: "User not found on Farcaster" },
        { status: 404 }
      )
    }

    const user = userRes.result.user

    const walletAddress =
      user.verifications?.eth_addresses?.[0] ?? null
    const username = user.username ?? null
    const displayName = user.display_name ?? null
    const pfp = user.pfp_url ?? null
    const custodyAddress = user.custody_address ?? null

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !serviceKey) {
      return NextResponse.json({ error: "Server misconfigured" }, { status: 500 })
    }

    const supabase = createClient(supabaseUrl, serviceKey)

    // ✅ Check if already on waitlist
    const existing = await supabase
      .from("waitlist")
      .select("id")
      .eq("fid", fid)
      .single()

    if (existing.data) {
      return NextResponse.json({
        alreadyRegistered: true,
        message: "User is already on the waitlist",
        wallet: walletAddress,
      })
    }

    // ✅ Insert new entry
    const insertRes = await supabase.from("waitlist").insert({
      fid,
      wallet: walletAddress,
      username,
      display_name: displayName,
      pfp,
      custody_address: custodyAddress,
    })

    if (insertRes.error) {
      return NextResponse.json(
        { error: insertRes.error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      alreadyRegistered: false,
      wallet: walletAddress,
    })
  } catch (err) {
    console.error("Waitlist POST error:", err)
    return NextResponse.json(
      { error: "Unexpected server error" },
      { status: 500 }
    )
  }
}
