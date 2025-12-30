import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { z } from 'zod'
import bcrypt from 'bcryptjs'
import { dbOps } from '@/lib/db'

const createUserSchema = z.object({
  email: z.email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

export async function POST(request: Request) {
  try {
    const body = await request.json()

    // Validate input with Zod
    const result = createUserSchema.safeParse(body)

    if (!result.success) {
      const errors = result.error.issues.map((issue) => issue.message).join(', ')
      return NextResponse.json(
        { success: false, error: errors },
        { status: 400 }
      )
    }

    const { email, password } = result.data

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Insert user into SQLite database
    try {
      const user = dbOps.users.create(email, hashedPassword)

      // Set cookie with public_id
      const cookieStore = await cookies()
      cookieStore.set('userId', user.public_id, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 7 days
      })
    } catch (error: any) {
      console.error('Database error:', error)

      // Check for unique constraint violation (duplicate email)
      if (error.message?.includes('UNIQUE constraint failed')) {
        return NextResponse.json(
          { success: false, error: 'Email already exists' },
          { status: 400 }
        )
      }

      return NextResponse.json(
        { success: false, error: 'Failed to create user' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { success: true, message: 'User created successfully' },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error creating user:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create user' },
      { status: 500 }
    )
  }
}
