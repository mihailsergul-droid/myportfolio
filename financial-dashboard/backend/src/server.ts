import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import compression from 'compression'
import rateLimit from 'express-rate-limit'
import { createServer } from 'http'
import { Server } from 'socket.io'
import dotenv from 'dotenv'

import { errorHandler } from './middleware/errorHandler'
import { authMiddleware } from './middleware/auth'
import authRoutes from './routes/auth'
import accountRoutes from './routes/accounts'
import transactionRoutes from './routes/transactions'
import budgetRoutes from './routes/budgets'
import investmentRoutes from './routes/investments'
import goalRoutes from './routes/goals'
import alertRoutes from './routes/alerts'
import dashboardRoutes from './routes/dashboard'
import predictionRoutes from './routes/predictions'
import { initializeDatabase } from './utils/database'
import { initializeRedis } from './utils/redis'
import { setupSocketHandlers } from './services/socketService'

dotenv.config()

const app = express()
const server = createServer(app)
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    methods: ["GET", "POST"]
  }
})

const PORT = process.env.PORT || 5000

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
})

// Middleware
app.use(helmet())
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:3000",
  credentials: true
}))
app.use(compression())
app.use(limiter)
app.use(morgan('combined'))
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  })
})

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/accounts', authMiddleware, accountRoutes)
app.use('/api/transactions', authMiddleware, transactionRoutes)
app.use('/api/budgets', authMiddleware, budgetRoutes)
app.use('/api/investments', authMiddleware, investmentRoutes)
app.use('/api/goals', authMiddleware, goalRoutes)
app.use('/api/alerts', authMiddleware, alertRoutes)
app.use('/api/dashboard', authMiddleware, dashboardRoutes)
app.use('/api/predictions', authMiddleware, predictionRoutes)

// Error handling
app.use(errorHandler)

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    success: false, 
    message: 'Route not found' 
  })
})

// Socket.IO setup
setupSocketHandlers(io)

// Initialize services
const initializeServices = async () => {
  try {
    await initializeDatabase()
    await initializeRedis()
    console.log('✅ All services initialized successfully')
  } catch (error) {
    console.error('❌ Failed to initialize services:', error)
    process.exit(1)
  }
}

// Start server
const startServer = async () => {
  await initializeServices()
  
  server.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`)
    console.log(`📊 Dashboard API available at http://localhost:${PORT}/api`)
    console.log(`🔌 Socket.IO server running`)
  })
}

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully')
  server.close(() => {
    console.log('Process terminated')
  })
})

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully')
  server.close(() => {
    console.log('Process terminated')
  })
})

startServer().catch(console.error)

export { app, io }