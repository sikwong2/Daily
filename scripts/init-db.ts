// Script to initialize the Turso database schema
import { initializeDatabase } from '../src/lib/db'

async function main() {
  console.log('Initializing Turso database...')

  try {
    await initializeDatabase()
    console.log('✓ Database initialized successfully!')
    console.log('Tables created: users, habits, habit_completions')
    console.log('Indexes created for better performance')
  } catch (error) {
    console.error('✗ Error initializing database:', error)
    process.exit(1)
  }
}

main()
