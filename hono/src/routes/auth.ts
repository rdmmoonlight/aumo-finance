import { Hono } from 'hono'

const auth = new Hono()

auth.get('/me', (c) => c.json({ user: 'data user' }))
auth.post('/logout', (c) => c.json({ message: 'logout' }))

export default auth
