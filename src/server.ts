import express from 'express'
import cors from 'cors'
import router from './router'
import cookieParser from 'cookie-parser'
import { protect } from './auth'
import prisma from './db'
import http from 'http'
import { createNewUser, signin } from './user'

export const app = express()
const corsOptions = {
  credentials: true,
  origin: [
    'https://quizzify-genius.vercel.app',
    'http://localhost:3000',
    'http://localhost:3001',
  ],
}

app.use(cors(corsOptions))
app.use(express.json())

//don't look at this
app.get('/', (req, res) => {
  console.log('hello from express!')
  res.json({ message: 'this is GET /' })
})

//this is the main things
app.use(cookieParser())

//protected routes for frontend
app.use('/api', protect, router)

//these are for log/sign in
app.post('/make_cookie', createNewUser)
app.post('/get_cookie', signin)
export const server = http.createServer(app)
const port = process.env.PORT || 2000

server.listen(port, () => {
  console.log(`Server for socket listening on ${port}`)
})
import { Server } from 'socket.io'

const io = new Server(server, {
  cors: {
    origin: [
      'https://quizzify-genius.vercel.app',
      'http://localhost:3000',
      'http://localhost:3001',
    ],
  },
})
const chat = io.of('/chat')
const connectedSockets = new Map()
chat.on('connection', async (socket) => {
  const classId = socket.handshake.query.classId
  console.log(classId)
  socket.join(classId)
  console.log('a user connected')

  socket.on('cm', async (text, cn, ci, ci2) => {
    chat.to(classId).emit('mm', text, cn, ci, ci2)
    await prisma.message.create({
      data: {
        text: text,
        madeById: ci,
        made: cn,
        classesId: ci2,
      },
    })
  })
  socket.on('disconnect', () => {
    console.log(`Socket disconnected: ${socket.id}`)
    connectedSockets.delete(socket.id)
  })
  console.log(connectedSockets)
  const allNames = Array.from(connectedSockets.values())

  console.log(allNames)
})
