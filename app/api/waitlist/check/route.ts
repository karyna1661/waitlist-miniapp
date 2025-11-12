import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function GET(req: NextRequest) {
  try {
    const fid = req.nextUrl.searchParams.get("fid")

    if (!fid) {
      return NextResponse.json({ error: "Missing FID" }, { status: 400 })
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !serviceKey) {
      return NextResponse.json({ error: "Server misconfigured" }, { status: 500 })
    }

    const supabase = createClient(supabaseUrl, serviceKey)

    const { data, error } = await supabase
      .from("waitlist")
      .select("fid, joined_at")
      .eq("fid", parseInt(fid, 10))
      .single()

    if (error) {
      // Not found is not an error, just means they haven't joined
      return NextResponse.json({ joined: false })
    }

    return NextResponse.json({ 
      joined: true, 
      joined_at: data.joined_at 
    })
  } catch (e) {
    console.error("Check handler error", e)
    return NextResponse.json({ joined: false })
  }
}
