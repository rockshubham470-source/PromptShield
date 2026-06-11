import type { NextApiRequest, NextApiResponse } from 'next'
import { supabase } from '../supabase'

// POST /api/auth/logout - Logout endpoint
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST'])
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` })
  }

  const token = req.headers.authorization?.split(' ')[1]

  if (token) {
    try {
      await supabase.auth.signOut()
    } catch (error) {
      console.error('Logout error:', error)
      // Continue anyway - we want to clear the client side
    }
  }

  res.status(200).json({ success: true })
}