import type { NextApiRequest, NextApiResponse } from 'next'
import { supabase } from './supabase'
import { getUserFromToken } from './supabase'

// GET /api/notifications - List notifications
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
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error

      res.status(200).json({
        notifications: data || [],
        count: count || 0
      })
    } catch (error) {
      console.error('Notifications error:', error)
      return res.status(500).json({ error: 'Internal server error' })
    }
  } else if (req.method === 'PUT') {
    // Update notification (mark as read/delete)
    const token = req.headers.authorization?.split(' ')[1]

    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' )
    }

    try {
      const user = await getUserFromToken(token)

      if (!user) {
        return res.status(401).json({ error: 'Invalid token' })
      }

      const { id } = req.query
      const { is_read } = req.body

      if (!id || Array.isArray(id)) {
        return res.status(400).json({ error: 'Notification ID is required' })
      }

      const updateData: any = {}
      if (is_read !== undefined) updateData.is_read = is_read

      if (Object.keys(updateData).length === 0) {
        return res.status(400).json({ error: 'No fields to update' })
      }

      const { data, error } = await supabase
        .from('notifications')
        .update(updateData)
        .eq('id', id as string)
        .eq('user_id', user.id)
        .select()
        .single()

      if (error) throw error

      if (!data) {
        return res.status(404).json({ error: 'Notification not found' })
      }

      res.status(200).json(data)
    } catch (error) {
      console.error('Update notification error:', error)
      return res.status(500).json({ error: 'Internal server error' })
    }
  } else if (req.method === 'DELETE') {
    // Delete notification
    const token = req.headers.authorization?.split(' ')[1]

    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' )
    }

    try {
      const user = await getUserFromToken(token)

      if (!user) {
        return res.status(401).json({ error: 'Invalid token' })
      }

      const { id } = req.query

      if (!id || Array.isArray(id)) {
        return res.status(400).json({ error: 'Notification ID is required' })
      }

      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', id as string)
        .eq('user_id', user.id)

      if (error) throw error

      res.status(200).json({ success: true })
    } catch (error) {
      console.error('Delete notification error:', error)
      return res.status(500).json({ error: 'Internal server error' })
    }
  } else {
    res.setHeader('Allow', ['GET', 'PUT', 'DELETE'])
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` })
  }
}