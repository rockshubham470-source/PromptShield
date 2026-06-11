import api from './api'

export const getAnalytics = () =>
  api.get('/stats/analytics')

export const getDashboardStats = () =>
  api.get('/stats/dashboard')