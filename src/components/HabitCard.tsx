import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface HabitCardProps {
  name: string
  description: string
  completedDatesCount: number
  onClick?: () => void
}

function HabitCard({ name, description, completedDatesCount, onClick }: HabitCardProps) {
  return (
    <Card
      className="mb-3 hover:shadow-md transition-shadow cursor-pointer"
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
