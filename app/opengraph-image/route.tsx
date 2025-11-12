import { ImageResponse } from 'next/og'

export const runtime = 'edge'

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#ffffff',
          backgroundImage: 'linear-gradient(to bottom right, #ffffff, #f3f4f6)',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 40,
          }}
        >
          <img
            src="https://letsconnect-waitlist.vercel.app/icon-192.jpg"
            width={180}
            height={180}
            style={{
              borderRadius: 32,
              border: '3px solid #000',
              boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
            }}
          />
        </div>
        <h1
          style={{
            fontSize: 60,
            fontWeight: 'bold',
            color: '#111827',
            margin: 0,
            marginBottom: 16,
          }}
        >
          Let's Connect Waitlist
        </h1>
        <p
          style={{
            fontSize: 32,
            color: '#6b7280',
            margin: 0,
          }}
        >
          Your social life, one scan away
        </p>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  )
}
