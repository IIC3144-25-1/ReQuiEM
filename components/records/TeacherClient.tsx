"use client";

import { useState } from "react";
import RecordCard from "@/components/cards/record-card";
import { RecordsFilterInput, RecordsFilterSelect } from "@/components/filters/RecordsFilters";
import { Head } from "../head/Head";
import { format } from "date-fns";
import { isIResident, isISurgery, isIUser } from "@/utils/validation";
import Link from "next/link";

import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis,
} from "@/components/ui/pagination"


interface RecordType {
  _id: string;
  surgery: { name: string };
  resident: { user: { name: string } };
  date: string | Date;
  status: string;
}

const PAGE_SIZE = 12;

export default function TeacherRecordsClient({ records }: { records: RecordType[] }) {
  const [searchSurgery, setSearchSurgery] = useState("");
  const [searchResident, setSearchResident] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  if (!records || records.length === 0) {
    return <div className="leading-none text-center pt-10">No tienes registros todavía</div>;
  }

  const statusLabels = {
    all: "Todos",
    pending: "Pendiente",
    corrected: "Corregido",
    // reviewed: "Revisado",
    // canceled: "Cancelado",
  };
  const statusOptions = ["all", "pending", "corrected"]; //, "reviewed", "canceled"

  const filteredRecords = records.filter((r) => {
    const validSurgery = isISurgery(r.surgery) && typeof r.surgery.name === "string";
    const validResident = isIResident(r.resident) && isIUser(r.resident.user) && typeof r.resident.user.name === "string";
    if (validSurgery && validResident) {
      const matchesSearch = r.surgery.name.toLowerCase().includes(searchSurgery.toLowerCase());
      const matchesResident = r.resident.user.name.toLowerCase().includes(searchResident.toLowerCase());
      const matchesStatus = statusFilter === "all" || r.status === statusFilter
        || (r.status === "reviewed" && statusFilter === "corrected") || !statusFilter;
      return matchesSearch && matchesStatus && matchesResident;
    }
    return true;
  });

  const totalPages = Math.ceil(filteredRecords.length / PAGE_SIZE);
  const pageRecords = filteredRecords.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  function getPages(current: number, total: number) {
    // Puedes ajustar esto a gusto (este ejemplo muestra máximo 5 números + ... si hay muchas páginas)
    if (total <= 5) return Array.from({ length: total }, (_, i) => i + 1);

    if (current <= 3) return [1, 2, 3, 4, "...", total];
    if (current >= total - 2) return [1, "...", total - 3, total - 2, total - 1, total];
    return [1, "...", current - 1, current, current + 1, "...", total];
  }

  const pages = getPages(currentPage, totalPages);

  if (!records || records.length === 0) {
    return <div className="leading-none text-center pt-10">No tienes registros todavía</div>;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Head
        title="Registros de Residentes"
        description="Aquí puedes ver los registros de los residentes de tu área"
        components={[
          <div key="1" className="flex flex-row gap-2 sm:gap-4">
            <RecordsFilterInput
              search={searchSurgery}
              setSearch={setSearchSurgery}
              searchPlaceholder="Buscar por cirugía..."
            />
            <RecordsFilterInput
              search={searchResident}
              setSearch={setSearchResident}
              searchPlaceholder="Buscar por residente..."
            />
          </div>,
          <div key="2" className="w-1/2 sm:w-full">
            <RecordsFilterSelect
              statusFilter={statusFilter}
              setStatusFilter={setStatusFilter}
              statusLabels={statusLabels}
              statusOptions={statusOptions}
            />
          </div>
        ]}
      />
      
      <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:h-125 content-start">
        {pageRecords.map((r) => (
          <Link key={r._id.toString()} href={`/teacher/records/${r._id}`}>
            <RecordCard
              surgery={isISurgery(r.surgery) ? r.surgery.name : r.surgery.toString()}
              date={format(new Date(r.date), "dd/MM/yy")}
              time={format(new Date(r.date), "HH:mm")}
              counterpartRole="Residente"
              counterpart={isIResident(r.resident) && isIUser(r.resident.user) ? (r.resident.user.name || "") : r.resident.toString()}
              dot={r.status === "pending"}
            />
          </Link>
        ))}
      </div>

      <Pagination className="mt-8">
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              href="#"
              onClick={e => {
                e.preventDefault();
                setCurrentPage(p => Math.max(1, p - 1));
              }}
              aria-disabled={currentPage === 1}
              tabIndex={currentPage === 1 ? -1 : 0}
            />
          </PaginationItem>
          {pages.map((p, i) =>
            p === "..." ? (
              <PaginationItem key={`ellipsis-${i}`}>
                <PaginationEllipsis />
              </PaginationItem>
            ) : (
              <PaginationItem key={p}>
                <PaginationLink
                  href="#"
                  isActive={Number(p) === currentPage}
                  onClick={e => {
                    e.preventDefault();
                    setCurrentPage(Number(p));
                  }}
                >
                  {p}
                </PaginationLink>
              </PaginationItem>
            )
          )}
          <PaginationItem>
            <PaginationNext
              href="#"
              onClick={e => {
                e.preventDefault();
                setCurrentPage(p => Math.min(totalPages, p + 1));
              }}
              aria-disabled={currentPage === totalPages}
              tabIndex={currentPage === totalPages ? -1 : 0}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
}