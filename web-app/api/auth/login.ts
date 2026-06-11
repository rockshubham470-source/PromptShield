import type { NextApiRequest, NextApiResponse } from 'next'
import { supabase } from '../supabase'

// POST /api/auth/login - Login endpoint
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST'])
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` })
  }

  const { email, password } = req.body

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password required' })
  }

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (error) throw error

    // Return session and user data
    res.status(200).json({
      access_token: data.session?.access_token,
      user: data.user
    })
  } catch (error) {
    console.error('Login error:', error)
    res.status(401).json({ error: 'Invalid credentials' })
  }
}