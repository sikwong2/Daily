import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function GET() {
  try {
    const cookieStore = await cookies()
    const userId = cookieStore.get('userId')

    return NextResponse.json({
      authenticated: !!userId,
    })
  } catch (error) {
    console.error('Error checking auth status:', error)
    return NextResponse.json({ authenticated: false })
  }
}
