import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function GET() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !serviceKey) {
      return NextResponse.json({ error: "Server misconfigured" }, { status: 500 })
    }

    const supabase = createClient(supabaseUrl, serviceKey)

    const { count, error } = await supabase
      .from("waitlist")
      .select("*", { count: "exact", head: true })

    if (error) {
      console.error("Count error", error)
      return NextResponse.json({ error: "DB error" }, { status: 500 })
    }

    return NextResponse.json({ count: count ?? 0 })
  } catch (e) {
    console.error("Count handler error", e)
    return NextResponse.json({ error: "Unexpected error" }, { status: 500 })
  }
}
