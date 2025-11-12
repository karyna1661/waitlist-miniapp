"use client"

import { useEffect, useState } from "react"
import { sdk } from "@farcaster/miniapp-sdk"

export default function WaitlistPage() {
  const [context, setContext] = useState<any | null>(null)
  const [count, setCount] = useState<number>(0)
  const [friends, setFriends] = useState<Array<{
    fid: number
    profile: {
      username: string
      displayName: string
      pfp?: { url: string }
    } | null
    joined_at: string
  }>>([])
  const [isJoining, setIsJoining] = useState(false)
  const [hasJoined, setHasJoined] = useState(false)
  const [alreadyJoined, setAlreadyJoined] = useState(false)
  const [joinedDate, setJoinedDate] = useState<string | null>(null)

  useEffect(() => {
    // Get Farcaster context and signal ready
    const init = async () => {
      try {
        const ctx = await sdk.context
        setContext(ctx)
        // Call ready immediately after getting context
        await sdk.actions.ready()
        console.log("SDK ready called successfully")
        
        // Check if user already joined
        if (ctx?.user?.fid) {
          checkIfAlreadyJoined(ctx.user.fid)
        }
      } catch (e) {
        console.error("SDK init error:", e)
        // Still try to call ready even if context fails
        try {
          await sdk.actions.ready()
        } catch (readyError) {
          console.error("SDK ready error:", readyError)
        }
      }
    }
    init()
  }, [])

  const checkIfAlreadyJoined = async (fid: number) => {
    try {
      const res = await fetch(`/api/waitlist/check?fid=${fid}`)
      const data = await res.json()
      if (data.joined) {
        setAlreadyJoined(true)
        setHasJoined(true)
        setJoinedDate(data.joined_at)
      }
    } catch (e) {
      console.error("Failed to check join status", e)
    }
  }

  const handleJoinWaitlist = async () => {
    if (!context?.user) {
      alert("Unable to get user info")
      return
    }

    if (alreadyJoined) {
      return // Already joined, button disabled
    }

    console.log("Full SDK context:", context)
    console.log("User object:", context.user)

    // Extract verified addresses from SDK context
    const verifiedEthAddresses = context.user.verifiedAddresses?.ethAddresses || 
                                  context.user.verified_addresses?.eth_addresses || 
                                  []
    const custodyAddress = context.user.custodyAddress || context.user.custody_address || null

    console.log("Verified ETH addresses:", verifiedEthAddresses)
    console.log("Custody address:", custodyAddress)

    setIsJoining(true)
    try {
      const res = await fetch("/api/waitlist/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fid: context.user.fid,
          username: context.user.username,
          displayName: context.user.displayName,
          pfpUrl: context.user.pfpUrl,
          verifiedEthAddresses: verifiedEthAddresses,
          custodyAddress: custodyAddress,
        }),
      })

      if (res.ok) {
        setHasJoined(true)
        setAlreadyJoined(true)
        setJoinedDate(new Date().toISOString())
        // Refresh count
        const countRes = await fetch("/api/waitlist/count")
        const countData = await countRes.json()
        setCount(countData.count ?? 0)
      } else {
        const errorData = await res.json()
        console.error("Join failed:", errorData)
        
        // Check if already joined error
        if (errorData.alreadyJoined) {
          setAlreadyJoined(true)
          setHasJoined(true)
          setJoinedDate(errorData.joined_at)
        } else {
          alert("Failed to join waitlist")
        }
      }
    } catch (e) {
      console.error("Join error:", e)
      alert("An error occurred")
    } finally {
      setIsJoining(false)
    }
  }

  useEffect(() => {
    // Fetch waitlist count
    fetch("/api/waitlist/count")
      .then((r) => r.json())
      .then((d) => setCount(d.count ?? 0))
      .catch(() => setCount(0))
  }, [])

  useEffect(() => {
    // Fetch friends who joined the waitlist if we have context
    const loadFriends = async () => {
      if (!context?.user?.fid) return
      try {
        const res = await fetch(`/api/waitlist/friends?fid=${context.user.fid}`)
        const data = await res.json()
        setFriends((data.friends ?? []).map((f: any) => ({
          fid: f.fid,
          profile: f.profile ? {
            username: f.profile.username,
            displayName: f.profile.displayName,
            pfp: f.profile.pfp,
          } : null,
          joined_at: f.joined_at,
        })))
      } catch (e) {
        console.error("Failed to load friends", e)
        setFriends([])
      }
    }
    loadFriends()
  }, [context?.user?.fid])

  const front = (
    <div className="relative w-full bg-gradient-to-br from-white via-white to-gray-50 rounded-3xl border-2 border-gray-200 h-full overflow-hidden p-8 flex flex-col items-center justify-center text-center shadow-xl">
      <img src="/icon-192.jpg" alt="Let's Connect" className="w-24 h-24 rounded-2xl border border-black shadow mb-4" />
      <h1 className="text-2xl font-bold text-gray-900">Your social life, one scan away</h1>
      <p className="text-gray-600 mt-1">Be one of the first 100 to unlock the digital handshake.</p>
      <div className="mt-3">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-black text-white shadow">
          <span className="font-semibold">Current waitlist</span>
          <span className="font-bold">{count}</span>
        </div>
      </div>
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
        <div className="bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-md">
          <span className="text-xs font-semibold text-gray-600">Tap to continue →</span>
        </div>
      </div>
    </div>
  )

  const back = (
    <div 
      className="w-full h-full rounded-3xl border-2 border-gray-700 p-6 flex flex-col shadow-xl"
      style={{
        background: "linear-gradient(135deg, #111827 0%, #1f2937 50%, #111827 100%)",
        backgroundColor: "#111827"
      }}
    >
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-white text-xl font-bold mb-2">Friends on the waitlist</h2>
        <p className="text-gray-400 text-sm">See who from your network has joined</p>
      </div>

      {/* Friends Grid or Connect Prompt */}
      <div className="flex-1 overflow-auto mb-6">
        {friends.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-400 text-sm">None of your friends have joined yet. Be the first!</p>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-3">
            {friends.slice(0, 9).map((f) => (
              <div key={f.fid} className="flex flex-col items-center">
                <div className="w-14 h-14 mb-1.5 rounded-full border-2 border-white/10 bg-gray-700 flex items-center justify-center">
                  {f.profile?.pfp?.url ? (
                    <img 
                      src={f.profile.pfp.url} 
                      alt={f.profile.displayName || f.profile.username || String(f.fid)} 
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <span className="text-white text-xs font-bold">
                      {(f.profile?.displayName || f.profile?.username || "?")
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .toUpperCase()
                        .slice(0, 2)}
                    </span>
                  )}
                </div>
                <p className="text-white text-[10px] font-medium line-clamp-1">
                  {f.profile?.displayName || f.profile?.username || f.fid}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* CTA Button */}
      <button
        onClick={(e) => {
          e.stopPropagation()
          handleJoinWaitlist()
        }}
        disabled={isJoining || hasJoined}
        className="w-full py-3 bg-white text-black rounded-2xl font-bold hover:bg-gray-100 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isJoining ? "Joining..." : alreadyJoined ? (
          joinedDate ? `✓ Joined ${new Date(joinedDate).toLocaleDateString()}` : "✓ Already Joined!"
        ) : "Join waitlist"}
      </button>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
      <div className="max-w-md mx-auto" style={{ height: "420px" }}>
        <div className="w-full h-full" style={{ perspective: "1000px" }}>
          <div
            className="relative w-full h-full"
            style={{
              transformStyle: "preserve-3d",
              transition: "transform 600ms ease-in-out",
            }}
          >
            <div className="absolute inset-0" style={{ backfaceVisibility: "hidden" }}>
              {front}
            </div>
            <div className="absolute inset-0" style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}>
              {back}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
