import 'dotenv/config'
import app from "./app.ts"
import { connectDatabase } from './db/index.ts'

async function startServer() {
  try {
    await connectDatabase()
    const PORT = Number(process.env.PORT) || 5000
    app.listen(PORT, () => {
      console.log(`Server on http://localhost:${PORT}`)
    })
  } catch (error) {
    console.error('Failed to start server:', error)
    process.exit(1)
  }
}

startServer()