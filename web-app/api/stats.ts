import type { NextApiRequest, NextApiResponse } from 'next'
import { supabase } from './supabase'
import { getUserFromToken } from './supabase'

// GET /api/stats - Get dashboard statistics
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

    // Get statistics in parallel
    const [
      detectionsCount,
      todayDetections,
      rulesCount,
      apiKeysCount
    ] = await Promise.all([
      // Total detections
      supabase
        .from('detections')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id),

      // Today's detections
      supabase
        .from('detections')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .gte('detected_at', new Date().toISOString().split('T')[0]),

      // Active rules
      supabase
        .from('detection_rules')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('is_active', true),

      // Active API keys
      supabase
        .from('api_keys')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('is_active', true)
    ])

    // Calculate risk distribution
    const { data: riskDistribution, error: riskError } = await supabase
      .from('detections')
      .select('risk_level')
      .eq('user_id', user.id)

    if (riskError) throw riskError

    const riskCounts = {
      low: 0,
      medium: 0,
      high: 0,
      critical: 0
    }

    riskDistribution?.forEach((item: any) => {
      if (item.risk_level in riskCounts) {
        riskCounts[item.risk_level]++
      }
    })

    res.status(200).json({
      totalDetections: detectionsCount.count || 0,
      todayDetections: todayDetections.count || 0,
      activeRules: rulesCount.count || 0,
      activeApiKeys: apiKeysCount.count || 0,
      riskDistribution: riskCounts
    })
  } catch (error) {
    console.error('Stats error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}