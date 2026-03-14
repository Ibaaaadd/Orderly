import api from './api.js'

const authService = {
  login: ({ username, password }) =>
    api.post('/auth/login', {
      username: (username || '').trim(),
      password: password || '',
    }),

  me: () => api.get('/auth/me'),
}

export default authService
