interface HabitCardProps {
  name: string
  description: string
  completedDatesCount: number
}

function HabitCard({ name, description, completedDatesCount }: HabitCardProps) {
  return (
    <div className="border border-gray-200 rounded-lg p-4 mb-3 hover:shadow-md transition-shadow">
      <h3 className="font-semibold text-lg mb-2">{name}</h3>
      <p className="text-gray-600 text-sm mb-3">{description}</p>
      <div className="text-sm text-gray-700">
        <span className="font-medium">{completedDatesCount}</span> days completed
      </div>
    </div>
  )
}

export default HabitCard
