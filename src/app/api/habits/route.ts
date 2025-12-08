import { NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'

export async function POST(request: Request) {
  try {
    const newHabit = await request.json()

    // Read the current habits.json file
    const filePath = path.join(process.cwd(), 'src/data/habits.json')
    const fileContents = await fs.readFile(filePath, 'utf8')
    const data = JSON.parse(fileContents)

    // Add the new habit
    data.habits.push(newHabit)

    // Write back to the file
    await fs.writeFile(filePath, JSON.stringify(data, null, 2))

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    console.error('Error adding habit:', error)
    return NextResponse.json({ success: false, error: 'Failed to add habit' }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    const { habitName, date } = await request.json()

    // Read the current habits.json file
    const filePath = path.join(process.cwd(), 'src/data/habits.json')
    const fileContents = await fs.readFile(filePath, 'utf8')
    const data = JSON.parse(fileContents)

    // Find the habit by name
    const habit = data.habits.find((h: any) => h.name === habitName)
    if (!habit) {
      return NextResponse.json({ success: false, error: 'Habit not found' }, { status: 404 })
    }

    // Check if the date is already in completedDates
    const dateIndex = habit.completedDates.indexOf(date)
    if (dateIndex > -1) {
      // Remove the date
      habit.completedDates.splice(dateIndex, 1)
    } else {
      // Add the date
      habit.completedDates.push(date)
      // Sort the dates
      habit.completedDates.sort((a: number, b: number) => a - b)
    }

    // Write back to the file
    await fs.writeFile(filePath, JSON.stringify(data, null, 2))

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    console.error('Error updating habit:', error)
    return NextResponse.json({ success: false, error: 'Failed to update habit' }, { status: 500 })
  }
}
