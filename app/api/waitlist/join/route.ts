import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { fid, username, displayName, pfpUrl, verifiedEthAddresses, custodyAddress } = body

    console.log("Join request body:", body)

    if (!fid) {
      return NextResponse.json({ error: "Missing FID" }, { status: 400 })
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !serviceKey) {
      return NextResponse.json({ error: "Server misconfigured" }, { status: 500 })
    }

    const supabase = createClient(supabaseUrl, serviceKey)

    // First check if already joined
    const { data: existing } = await supabase
      .from("waitlist")
      .select("fid, joined_at")
      .eq("fid", fid)
      .single()

    if (existing) {
      return NextResponse.json({ 
        alreadyJoined: true, 
        joined_at: existing.joined_at,
        message: "You've already joined the waitlist!" 
      }, { status: 200 })
    }

    // Collect all wallet addresses (verified ETH addresses + custody address)
    const ethAddresses: string[] = Array.isArray(verifiedEthAddresses) ? verifiedEthAddresses : []
    const allAddresses = Array.from(new Set([...ethAddresses, ...(custodyAddress ? [custodyAddress] : [])]))

    console.log("Storing addresses:", {
      verifiedEthAddresses: ethAddresses,
      custodyAddress,
      allAddresses
    })

    const { data, error } = await supabase
      .from("waitlist")
      .upsert(
        {
          fid,
          username,
          display_name: displayName,
          pfp_url: pfpUrl,
          eth_addresses: allAddresses,
          custody_address: custodyAddress ?? null,
          joined_at: new Date().toISOString(),
          source: "miniapp",
        },
        { onConflict: "fid" }
      )
      .select()

    if (error) {
      console.error("Supabase insert error", error)
      return NextResponse.json({ error: "DB error", details: error.message }, { status: 500 })
    }

    console.log("Successfully stored in DB:", data)
    return NextResponse.json({ success: true, data })
  } catch (e) {
    console.error("Join handler error", e)
    return NextResponse.json({ error: "Unexpected error", details: String(e) }, { status: 500 })
  }
}
