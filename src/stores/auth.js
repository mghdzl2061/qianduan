import { defineStore } from 'pinia'
import http from '../api/http'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: localStorage.getItem('doorplate_token') || '',
    user: JSON.parse(localStorage.getItem('doorplate_user') || 'null'),
    unreadCount: 0
  }),
  getters: {
    role: (state) => state.user?.role || '',
    isAdmin: (state) => state.user?.role === 'ADMIN'
  },
  actions: {
    async login(form) {
      const data = await http.post('/auth/login', form)
      this.token = data.token
      this.user = data.user
      localStorage.setItem('doorplate_token', data.token)
      localStorage.setItem('doorplate_user', JSON.stringify(data.user))
    },
    async loadMe() {
      this.user = await http.get('/auth/me')
      localStorage.setItem('doorplate_user', JSON.stringify(this.user))
    },
    async loadUnread() {
      if (!this.token) return
      const data = await http.get('/messages/unread-count')
      this.unreadCount = data.count
    },
    logout() {
      this.token = ''
      this.user = null
      localStorage.removeItem('doorplate_token')
      localStorage.removeItem('doorplate_user')
    }
  }
})
