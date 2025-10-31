import 'dotenv/config'
import app from "./app.ts"
import { connectDatabase } from './db/index.ts'

async function startServer() {
  // Try to connect to the database but do not prevent the HTTP server
  // from starting if the database is temporarily unavailable. This
  // prevents platforms (like Railway) from failing health checks
  // during startup while env vars or networking are still being
  // provisioned.
  connectDatabase()
    .then(() => console.log('Database connected'))
    .catch((err) => {
      console.error('Database connection failed (continuing without DB):', err?.message || err)
    })

  const PORT = Number(process.env.PORT) || 5000
  app.listen(PORT, () => {
    console.log(`Server on http://0.0.0.0:${PORT}`)
  })
}

startServer()