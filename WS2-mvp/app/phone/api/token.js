import { AccessToken } from 'livekit-server-sdk'

export default async function handler(req, res) {
  const apiKey = process.env.LIVEKIT_API_KEY
  const apiSecret = process.env.LIVEKIT_API_SECRET
  const roomPrefix = process.env.LIVEKIT_ROOM || 'jio-test'

  if (!apiKey || !apiSecret) {
    return res.status(500).json({ error: 'LiveKit credentials not configured' })
  }

  // Unique room per call — avoids stale room dispatch bug
  const room = `${roomPrefix}-${Date.now()}`
  const identity = `user-${Date.now()}`
  const at = new AccessToken(apiKey, apiSecret, { identity })
  at.addGrant({ roomJoin: true, room })

  const token = await at.toJwt()
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.status(200).json({ token, room })
}
