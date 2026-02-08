import { EquipmentFilter } from './components/filter'
import { EquipmentTable } from './components/table'

export default function EquipmentPage() {
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-bold">Equipamentos</h1>

      <EquipmentFilter />
      <EquipmentTable />
    </div>
  )
}
