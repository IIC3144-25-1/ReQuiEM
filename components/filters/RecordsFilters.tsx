import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectContent, SelectItem } from "@/components/ui/select";

interface RecordsFiltersProps {
  search1: string;
  setSearch1: (v: string) => void;
  search1Placeholder: string;
  search2: string;
  setSearch2: (v: string) => void;
  search2Placeholder: string;
  statusFilter: string;
  setStatusFilter: (v: string) => void;
  statusLabels: { [key: string]: string };
  statusOptions: string[];
}

export function RecordsFilters({
  search1,
  setSearch1,
  search1Placeholder,
  search2,
  setSearch2,
  search2Placeholder,
  statusFilter,
  setStatusFilter,
  statusLabels,
  statusOptions,
}: RecordsFiltersProps) {
  return (
    <div className="p-4 flex flex-col md:flex-row gap-4">
      <Input
        placeholder={search1Placeholder}
        value={search1}
        onChange={(e) => setSearch1(e.target.value)}
        className="w-full md:w-1/2"
      />
      <Input
        placeholder={search2Placeholder}
        value={search2}
        onChange={(e) => setSearch2(e.target.value)}
        className="w-full md:w-1/2"
      />
      <Select onValueChange={setStatusFilter} value={statusFilter}>
        <SelectTrigger className="w-full md:w-1/4">
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
    </div>
  );
}