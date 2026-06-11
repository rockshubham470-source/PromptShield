import type { NextApiRequest, NextApiResponse } from 'next'
import { supabase } from './supabase'
import { getUserFromToken } from './supabase'

// GET /api/rules - List detection rules
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
        .from('detection_rules')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error

      res.status(200).json({
        rules: data || [],
        count: count || 0
      })
    } catch (error) {
      console.error('Rules error:', error)
      return res.status(500).json({ error: 'Internal server error' })
    }
  } else if (req.method === 'POST') {
    // Create new rule
    const token = req.headers.authorization?.split(' ')[1]

    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    try {
      const user = await getUserFromToken(token)

      if (!user) {
        return res.status(401).json({ error: 'Invalid token' })
      }

      const { name, pattern, description, risk_level } = req.body

      if (!name || !pattern || !risk_level) {
        return res.status(400).json({ error: 'Name, pattern, and risk level are required' })
      }

      // Validate risk_level
      const validRiskLevels = ['low', 'medium', 'high', 'critical']
      if (!validRiskLevels.includes(risk_level)) {
        return res.status(400).json({ error: 'Invalid risk level' })
      }

      const { data, error } = await supabase
        .from('detection_rules')
        .insert([
          {
            user_id: user.id,
            name,
            pattern,
            description: description || null,
            risk_level,
            is_active: true
          }
        ])
        .select()
        .single()

      if (error) throw error

      res.status(200).json(data)
    } catch (error) {
      console.error('Create rule error:', error)
      return res.status(500).json({ error: 'Internal server error' })
    }
  } else if (req.method === 'PUT') {
    // Update rule
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
      const { name, pattern, description, risk_level, is_active } = req.body

      if (!id || Array.isArray(id)) {
        return res.status(400).json({ error: 'Rule ID is required' })
      }

      const updateData: any = {}
      if (name !== undefined) updateData.name = name
      if (pattern !== undefined) updateData.pattern = pattern
      if (description !== undefined) updateData.description = description
      if (risk_level !== undefined) {
        const validRiskLevels = ['low', 'medium', 'high', 'critical']
        if (!validRiskLevels.includes(risk_level)) {
          return res.status(400).json({ error: 'Invalid risk level' })
        }
        updateData.risk_level = risk_level
      }
      if (is_active !== undefined) updateData.is_active = is_active

      if (Object.keys(updateData).length === 0) {
        return res.status(400).json({ error: 'No fields to update' })
      }

      updateData.updated_at = new Date().toISOString()

      const { data, error } = await supabase
        .from('detection_rules')
        .update(updateData)
        .eq('id', id as string)
        .eq('user_id', user.id)
        .select()
        .single()

      if (error) throw error

      if (!data) {
        return res.status(404).json({ error: 'Rule not found' })
      }

      res.status(200).json(data)
    } catch (error) {
      console.error('Update rule error:', error)
      return res.status(500).json({ error: 'Internal server error' })
    }
  } else if (req.method === 'DELETE') {
    // Delete rule
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
        return res.status(400).json({ error: 'Rule ID is required' })
      }

      const { error } = await supabase
        .from('detection_rules')
        .delete()
        .eq('id', id as string)
        .eq('user_id', user.id)

      if (error) throw error

      res.status(200).json({ success: true })
    } catch (error) {
      console.error('Delete rule error:', error)
      return res.status(500).json({ error: 'Internal server error' })
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE'])
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` })
  }
}