import { createClient } from '@libsql/client'

// Create Turso database connection
const tursoUrl = process.env.TURSO_DATABASE_URL
const tursoAuthToken = process.env.TURSO_AUTH_TOKEN

if (!tursoUrl || !tursoAuthToken) {
  throw new Error('Missing Turso environment variables. Please set TURSO_DATABASE_URL and TURSO_AUTH_TOKEN.')
}

export const db = createClient({
  url: tursoUrl,
  authToken: tursoAuthToken,
})

// Initialize database schema
export async function initializeDatabase() {
  // Create users table
  await db.execute(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      hashed_password TEXT NOT NULL,
      public_id TEXT UNIQUE NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `)

  // Create habits table
  await db.execute(`
    CREATE TABLE IF NOT EXISTS habits (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      name TEXT NOT NULL,
      description TEXT,
      color TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(public_id) ON DELETE CASCADE
    )
  `)

  // Create habit_completions table
  await db.execute(`
    CREATE TABLE IF NOT EXISTS habit_completions (
      id TEXT PRIMARY KEY,
      habit_id TEXT NOT NULL,
      completed_date TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (habit_id) REFERENCES habits(id) ON DELETE CASCADE,
      UNIQUE(habit_id, completed_date)
    )
  `)

  // Create indexes for better performance
  await db.execute('CREATE INDEX IF NOT EXISTS idx_habits_user_id ON habits(user_id)')
  await db.execute('CREATE INDEX IF NOT EXISTS idx_completions_habit_id ON habit_completions(habit_id)')
  await db.execute('CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)')
}

// Helper function to generate UUIDs
function generateUUID(): string {
  return crypto.randomUUID()
}

// Database operations wrapper
export const dbOps = {
  // User operations
  users: {
    create: async (email: string, hashedPassword: string) => {
      const publicId = generateUUID()
      await db.execute({
        sql: 'INSERT INTO users (email, hashed_password, public_id) VALUES (?, ?, ?)',
        args: [email, hashedPassword, publicId],
      })
      return { public_id: publicId }
    },

    findByEmail: async (email: string) => {
      const result = await db.execute({
        sql: 'SELECT public_id, email, hashed_password FROM users WHERE email = ?',
        args: [email],
      })
      return result.rows[0] as { public_id: string; email: string; hashed_password: string } | undefined
    }
  },

  // Habit operations
  habits: {
    findByUserId: async (userId: string) => {
      const result = await db.execute({
        sql: 'SELECT id, user_id, name, description, color, created_at, updated_at FROM habits WHERE user_id = ? ORDER BY created_at ASC',
        args: [userId],
      })
      return result.rows as Array<{
        id: string
        user_id: string
        name: string
        description: string | null
        color: string
        created_at: string
        updated_at: string
      }>
    },

    create: async (userId: string, name: string, description: string | null, color: string) => {
      const id = generateUUID()
      await db.execute({
        sql: 'INSERT INTO habits (id, user_id, name, description, color) VALUES (?, ?, ?, ?, ?)',
        args: [id, userId, name, description, color],
      })
      return { id, user_id: userId, name, description, color, created_at: new Date().toISOString(), updated_at: new Date().toISOString() }
    },

    findByNameAndUserId: async (name: string, userId: string) => {
      const result = await db.execute({
        sql: 'SELECT id FROM habits WHERE name = ? AND user_id = ?',
        args: [name, userId],
      })
      return result.rows[0] as { id: string } | undefined
    },

    delete: async (id: string) => {
      await db.execute({
        sql: 'DELETE FROM habits WHERE id = ?',
        args: [id],
      })
    }
  },

  // Habit completion operations
  completions: {
    findByHabitIds: async (habitIds: string[]) => {
      if (habitIds.length === 0) return []
      const placeholders = habitIds.map(() => '?').join(',')
      const result = await db.execute({
        sql: `SELECT habit_id, completed_date FROM habit_completions WHERE habit_id IN (${placeholders})`,
        args: habitIds,
      })
      return result.rows as Array<{ habit_id: string; completed_date: string }>
    },

    findOne: async (habitId: string, completedDate: string) => {
      const result = await db.execute({
        sql: 'SELECT id FROM habit_completions WHERE habit_id = ? AND completed_date = ?',
        args: [habitId, completedDate],
      })
      return result.rows[0] as { id: string } | undefined
    },

    create: async (habitId: string, completedDate: string) => {
      const id = generateUUID()
      await db.execute({
        sql: 'INSERT INTO habit_completions (id, habit_id, completed_date) VALUES (?, ?, ?)',
        args: [id, habitId, completedDate],
      })
    },

    delete: async (id: string) => {
      await db.execute({
        sql: 'DELETE FROM habit_completions WHERE id = ?',
        args: [id],
      })
    },

    deleteByHabitId: async (habitId: string) => {
      await db.execute({
        sql: 'DELETE FROM habit_completions WHERE habit_id = ?',
        args: [habitId],
      })
    }
  }
}
