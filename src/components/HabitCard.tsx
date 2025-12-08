import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface HabitCardProps {
  name: string
  description: string
  color: string
  completedDatesCount: number
  onClick?: () => void
}

const colorClasses: Record<string, string> = {
  red: 'bg-red-100 dark:bg-red-900/30 border-l-4 border-l-red-500',
  blue: 'bg-blue-100 dark:bg-blue-900/30 border-l-4 border-l-blue-500',
  green: 'bg-green-100 dark:bg-green-900/30 border-l-4 border-l-green-500',
  yellow: 'bg-yellow-100 dark:bg-yellow-900/30 border-l-4 border-l-yellow-500',
  purple: 'bg-purple-100 dark:bg-purple-900/30 border-l-4 border-l-purple-500',
  pink: 'bg-pink-100 dark:bg-pink-900/30 border-l-4 border-l-pink-500',
  orange: 'bg-orange-100 dark:bg-orange-900/30 border-l-4 border-l-orange-500',
  cyan: 'bg-cyan-100 dark:bg-cyan-900/30 border-l-4 border-l-cyan-500',
}

function HabitCard({ name, description, color, completedDatesCount, onClick }: HabitCardProps) {
  const colorClass = colorClasses[color] || colorClasses.blue

  return (
    <Card
      className={`mb-3 hover:shadow-md transition-shadow cursor-pointer ${colorClass}`}
      onClick={onClick}
    >
      <CardHeader>
        <CardTitle>{name}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-sm text-muted-foreground">
          <span className="font-medium text-foreground">{completedDatesCount}</span> days completed
        </div>
      </CardContent>
    </Card>
  )
}

export default HabitCard
