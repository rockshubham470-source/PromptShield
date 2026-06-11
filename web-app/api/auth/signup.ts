import type { NextApiRequest, NextApiResponse } from 'next'
import { supabase } from '../supabase'

// POST /api/auth/signup - Signup endpoint
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST'])
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` })
  }

  const { email, password, name } = req.body

  if (!email || !password || !name) {
    return res.status(400).json({ error: 'Email, password, and name required' })
  }

  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: name
        }
      }
    })

    if (error) throw error

    // Create user profile
    if (data.user) {
      await supabase
        .from('users')
        .insert([
          {
            id: data.user.id,
            email: data.user.email!,
            name,
            tier: 'free'
          }
        ])
    }

    res.status(200).json({
      access_token: data.session?.access_token,
      user: data.user
    })
  } catch (error) {
    console.error('Signup error:', error)
    res.status(400).json({ error: 'Signup failed' })
  }
}