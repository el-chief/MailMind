import "dotenv/config"
import express from "express"
import type { Request, Response } from "express"
import cors from "cors"
import type { CorsOptions } from "cors"
import cookieParser from "cookie-parser"
import morgan from "morgan"
import helmet from "helmet"

// Import routes
import authRoutes from "./routes/auth"
import summariesRoutes from "./routes/summaries"
import gmailRoutes from "./routes/gmail"
import aiRoutes from "./routes/ai"
import healthRoutes from "./routes/health"

const app = express()

// Security middleware
app.use(helmet())

// Logging
app.use(morgan('dev'))

const corsOptions: CorsOptions = {
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    if (!origin) return callback(null, true)

    const allowedOrigins = ["http://localhost:3000", "http://127.0.0.1:3000", "http://localhost:5173", process.env.CORS_ORIGIN].filter(
      (o): o is string => Boolean(o),
    )

    if (allowedOrigins.includes(origin)) {
      callback(null, true)
    } else {
      callback(new Error("Not allowed by CORS"))
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
  allowedHeaders: ["Origin", "Content-Type", "Authorization"],
}

app.use(cors(corsOptions))

app.use(express.json({ limit: "16kb" }))
app.use(express.urlencoded({ extended: true, limit: "16kb" }))
app.use(cookieParser())

// Health check routes
app.use("/health", healthRoutes)

// API routes
app.use("/api/auth", authRoutes)
app.use("/api/summaries", summariesRoutes)
app.use("/api/gmail", gmailRoutes)
app.use("/api/ai", aiRoutes)

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: "Route not found"
  })
})

export default app
