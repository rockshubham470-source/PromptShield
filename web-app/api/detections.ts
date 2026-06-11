import type { NextApiRequest, NextApiResponse } from 'next'
import { supabase } from './supabase'
import { getUserFromToken } from './supabase'

// GET /api/detections - List detections with filtering
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

      // Parse query parameters
      const { page = 1, limit = 50, risk_level, search } = req.query

      // Build query
      let query = supabase
        .from('detections')
        .select(`
          *,
          detection_rules!inner (
            id,
            name,
            pattern
          )
        `)
        .eq('user_id', user.id)
        .order('detected_at', { ascending: false })

      // Apply filters
      if (risk_level) {
        query = query.eq('risk_level', risk_level as string)
      }

      if (search) {
        query = query.ilike('content', `%${search}%`)
      }

      // Apply pagination
      const from = (parseInt(page as string) - 1) * parseInt(limit as string)
      const to = from + parseInt(limit as string) - 1

      query = query.range(from, to)

      const { data, error, count } = await query

      if (error) throw error

      res.status(200).json({
        detections: data || [],
        pagination: {
          page: parseInt(page as string),
          limit: parseInt(limit as string),
          total: count || 0,
          pages: Math.ceil((count || 0) / parseInt(limit as string))
        }
      })
    } catch (error) {
      console.error('Detections error:', error)
      return res.status(500).json({ error: 'Internal server error' })
    }
  } else {
    res.setHeader('Allow', ['GET'])
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` })
  }
}