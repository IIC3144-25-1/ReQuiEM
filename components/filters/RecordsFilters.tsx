import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectContent, SelectItem } from "@/components/ui/select";


export function RecordsFilterInput({ search, setSearch, searchPlaceholder } : 
  { search: string; setSearch: (v: string) => void; searchPlaceholder: string; }) {

  return (
    <Input
      placeholder={searchPlaceholder}
      value={search}
      onChange={(e) => setSearch(e.target.value)}
      className="w-full "
    />
  );
}


export function RecordsFilterSelect({ statusFilter, setStatusFilter, statusLabels, statusOptions } : 
  { statusFilter: string; setStatusFilter: (v: string) => void; statusLabels: { [key: string]: string }; statusOptions: string[]; }) {
  
  return (
    <Select onValueChange={setStatusFilter} value={statusFilter}>
      <SelectTrigger className="w-full min-w-40">
        <span>{statusLabels[statusFilter] || "Filtrar por estado"}</span>
      </SelectTrigger>
      <SelectContent>
        {statusOptions.map((opt) => (
          <SelectItem key={opt} value={opt}>
            {statusLabels[opt]}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}