import type { NextApiRequest, NextApiResponse } from 'next'
import { supabase } from '../supabase'
import { getUserFromToken } from '../supabase'

// GET /api/auth/me - Get current user
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET'])
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` })
  }

  const token = req.headers.authorization?.split(' ')[1]

  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  try {
    const user = await getUserFromToken(token)

    if (!user) {
      return res.status(401).json({ error: 'Invalid token' })
    }

    // Get user profile from our users table
    const { data: profile, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single()

    if (error) throw error

    if (!profile) {
      // Create profile if it doesn't exist (first login)
      const { data: newProfile, error: profileError } = await supabase
        .from('users')
        .insert([
          {
            id: user.id,
            email: user.email!,
            name: user.user_metadata?.full_name || user.email!.split('@')[0],
            tier: 'free'
          }
        ])
        .select()
        .single()

      if (profileError) throw profileError

      return res.status(200).json(newProfile)
    }

    return res.status(200).json(profile)
  } catch (error) {
    console.error('Auth me error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}