import { Database } from 'bun:sqlite'
import path from 'path'

// Create SQLite database connection
const dbPath = path.join(process.cwd(), 'database.sqlite')
export const db = new Database(dbPath, { create: true })

// Enable foreign keys
db.run('PRAGMA foreign_keys = ON')

// Initialize database schema
export function initializeDatabase() {
  // Create users table
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      hashed_password TEXT NOT NULL,
      public_id TEXT UNIQUE NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `)

  // Create habits table
  db.run(`
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
  db.run(`
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
  db.run('CREATE INDEX IF NOT EXISTS idx_habits_user_id ON habits(user_id)')
  db.run('CREATE INDEX IF NOT EXISTS idx_completions_habit_id ON habit_completions(habit_id)')
  db.run('CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)')
}

// Initialize the database when this module is imported
initializeDatabase()

// Helper function to generate UUIDs
function generateUUID(): string {
  return crypto.randomUUID()
}

// Database operations wrapper
export const dbOps = {
  // User operations
  users: {
    create: (email: string, hashedPassword: string) => {
      const publicId = generateUUID()
      const stmt = db.prepare(`
        INSERT INTO users (email, hashed_password, public_id)
        VALUES (?, ?, ?)
      `)
      stmt.run(email, hashedPassword, publicId)
      return { public_id: publicId }
    },

    findByEmail: (email: string) => {
      const stmt = db.prepare(`
        SELECT public_id, email, hashed_password
        FROM users
        WHERE email = ?
      `)
      return stmt.get(email) as { public_id: string; email: string; hashed_password: string } | undefined
    }
  },

  // Habit operations
  habits: {
    findByUserId: (userId: string) => {
      const stmt = db.prepare(`
        SELECT id, user_id, name, description, color, created_at, updated_at
        FROM habits
        WHERE user_id = ?
        ORDER BY created_at ASC
      `)
      return stmt.all(userId) as Array<{
        id: string
        user_id: string
        name: string
        description: string | null
        color: string
        created_at: string
        updated_at: string
      }>
    },

    create: (userId: string, name: string, description: string | null, color: string) => {
      const id = generateUUID()
      const stmt = db.prepare(`
        INSERT INTO habits (id, user_id, name, description, color)
        VALUES (?, ?, ?, ?, ?)
      `)
      stmt.run(id, userId, name, description, color)
      return { id, user_id: userId, name, description, color, created_at: new Date().toISOString(), updated_at: new Date().toISOString() }
    },

    findByNameAndUserId: (name: string, userId: string) => {
      const stmt = db.prepare(`
        SELECT id FROM habits
        WHERE name = ? AND user_id = ?
      `)
      return stmt.get(name, userId) as { id: string } | undefined
    },

    delete: (id: string) => {
      const stmt = db.prepare('DELETE FROM habits WHERE id = ?')
      stmt.run(id)
    }
  },

  // Habit completion operations
  completions: {
    findByHabitIds: (habitIds: string[]) => {
      if (habitIds.length === 0) return []
      const placeholders = habitIds.map(() => '?').join(',')
      const stmt = db.prepare(`
        SELECT habit_id, completed_date
        FROM habit_completions
        WHERE habit_id IN (${placeholders})
      `)
      return stmt.all(...habitIds) as Array<{ habit_id: string; completed_date: string }>
    },

    findOne: (habitId: string, completedDate: string) => {
      const stmt = db.prepare(`
        SELECT id FROM habit_completions
        WHERE habit_id = ? AND completed_date = ?
      `)
      return stmt.get(habitId, completedDate) as { id: string } | undefined
    },

    create: (habitId: string, completedDate: string) => {
      const id = generateUUID()
      const stmt = db.prepare(`
        INSERT INTO habit_completions (id, habit_id, completed_date)
        VALUES (?, ?, ?)
      `)
      stmt.run(id, habitId, completedDate)
    },

    delete: (id: string) => {
      const stmt = db.prepare('DELETE FROM habit_completions WHERE id = ?')
      stmt.run(id)
    },

    deleteByHabitId: (habitId: string) => {
      const stmt = db.prepare('DELETE FROM habit_completions WHERE habit_id = ?')
      stmt.run(habitId)
    }
  }
}
