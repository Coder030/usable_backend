import { Router } from 'express'
import prisma from './db'
import { Server } from 'socket.io'
import { server } from './server'

const router = Router()

export default router
