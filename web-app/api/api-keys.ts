import type { NextApiRequest, NextApiResponse } from 'next'
import { supabase } from './supabase'
import { getUserFromToken } from './supabase'
import crypto from 'crypto'

// GET /api/api-keys - List API keys
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const token = req.headers.authorization?.split(' ')[1]

    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    try {
      const user = await getUserFromToken(token)

      if (!user) {
        return res.status(401).json({ error: 'Invalid token' })
      }

      const { data, error, count } = await supabase
        .from('api_keys')
        .select('id, name, prefix, last_used_at, expires_at, is_active, created_at, updated_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error

      res.status(200).json({
        api_keys: data || [],
        count: count || 0
      })
    } catch (error) {
      console.error('API keys error:', error)
      return res.status(500).json({ error: 'Internal server error' })
    }
  } else if (req.method === 'POST') {
    // Create new API key
    const token = req.headers.authorization?.split(' ')[1]

    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    try {
      const user = await getUserFromToken(token)

      if (!user) {
        return res.status(401).json({ error: 'Invalid token' })
      }

      const { name } = req.body

      if (!name) {
        return res.status(400).json({ error: 'Name is required' })
      }

      // Generate API key
      const randomBytes = crypto.randomBytes(32)
      const apiKey = `psk_${randomBytes.toString('base64url').substring(0, 32)}`
      const prefix = apiKey.substring(0, 8) // First 8 chars for display
      const keyHash = crypto.createHash('sha256').update(apiKey).digest('hex')

      const { data, error } = await supabase
        .from('api_keys')
        .insert([
          {
            user_id: user.id,
            name,
            key_hash: keyHash,
            prefix,
            is_active: true
          }
        ])
        .select('id, name, prefix, key_hash, created_at, updated_at')
        .single()

      if (error) throw error

      // Return the full key only once
      res.status(200).json({
        api_key: {
          ...data,
          full_key: apiKey // Only returned once
        }
      })
    } catch (error) {
      console.error('Create API key error:', error)
      return res.status(500).json({ error: 'Internal server error' })
    }
  } else if (req.method === 'DELETE') {
    // Delete API key
    const token = req.headers.authorization?.split(' ')[1]

    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    try {
      const user = await getUserFromToken(token)

      if (!user) {
        return res.status(401).json({ error: 'Invalid token' })
      }

      const { id } = req.query

      if (!id || Array.isArray(id)) {
        return res.status(400).json({ error: 'API key ID is required' })
      }

      const { error } = await supabase
        .from('api_keys')
        .delete()
        .eq('id', id as string)
        .eq('user_id', user.id)

      if (error) throw error

      res.status(200).json({ success: true })
    } catch (error) {
      console.error('Delete API key error:', error)
      return res.status(500).json({ error: 'Internal server error' })
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST', 'DELETE'])
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` })
  }
}