"use client";

import { useState } from "react";
import RecordCard from "@/components/cards/record-card";
import { RecordsFilterInput, RecordsFilterSelect } from "@/components/filters/RecordsFilters";
import { Head } from "../head/Head";
import { format } from "date-fns";
import { isISurgery, isITeacher, isIUser } from "@/utils/validation";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";
import Link from "next/link";

import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis,
} from "@/components/ui/pagination";

interface RecordType {
  _id: string;
  surgery: { name: string };
  teacher: { user: { name: string } };
  date: string | Date;
  status: string;
}

const PAGE_SIZE = 12;

export default function ResidentRecordsClient({ records }: { records: RecordType[] }) {
  const [searchSurgery, setSearchSurgery] = useState("");
  const [searchTeacher, setSearchTeacher] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  if (!records || records.length === 0) {
    return (
      <div className="min-h-screen flex flex-col relative">
        <div className="leading-none text-center pt-10">No tienes registros todavía</div>
        <Link href="/resident/new-record">
          <Button className="fixed bottom-20 right-20" >
            <PlusIcon className="mr-2" />
            Crear Registro
          </Button>
        </Link>
      </div>
    )
  }

  const statusLabels = {
    all: "Todos",
    pending: "Pendiente",
    corrected: "Corregido",
  };
  const statusOptions = ["all", "pending", "corrected"];

  const filteredRecords = records.filter((r) => {
    const validSurgery = isISurgery(r.surgery) && typeof r.surgery.name === "string";
    const validTeacher = isITeacher(r.teacher) && isIUser(r.teacher.user) && typeof r.teacher.user.name === "string";

    if (validSurgery && validTeacher) {
      const matchesSearch = r.surgery.name.toLowerCase().includes(searchSurgery.toLowerCase());
      const matchesTeacher = r.teacher.user.name.toLowerCase().includes(searchTeacher.toLowerCase());
      const matchesStatus = statusFilter === "all" || r.status === statusFilter
        || (r.status === "reviewed" && statusFilter === "corrected") || !statusFilter;
      return matchesSearch && matchesStatus && matchesTeacher;
    }
    return true;
  });

  const totalPages = Math.ceil(filteredRecords.length / PAGE_SIZE);
  const pageRecords = filteredRecords.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  function getPages(current: number, total: number) {
    if (total <= 5) return Array.from({ length: total }, (_, i) => i + 1);
    if (current <= 3) return [1, 2, 3, 4, "...", total];
    if (current >= total - 2) return [1, "...", total - 3, total - 2, total - 1, total];
    return [1, "...", current - 1, current, current + 1, "...", total];
  }

  const pages = getPages(currentPage, totalPages);

  return (
    <div className="min-h-screen bg-background flex flex-col relative">
      <Head
        title="Tus Registros"
        description="Aquí puedes ver y crear nuevos registros"
        components={[
          <div key="1" className="flex flex-row gap-2 sm:gap-4">
            <RecordsFilterInput
              search={searchSurgery}
              setSearch={setSearchSurgery}
              searchPlaceholder="Buscar por cirugía..."
            />
            <RecordsFilterInput
              search={searchTeacher}
              setSearch={setSearchTeacher}
              searchPlaceholder="Buscar por profesor..."
            />
          </div>,
          <div key="2" className="w-1/2 sm:w-full">
            <RecordsFilterSelect
              statusFilter={statusFilter}
              setStatusFilter={setStatusFilter}
              statusLabels={statusLabels}
              statusOptions={statusOptions}
            />
          </div>,
          <Link href="/resident/new-record" key="3">
            <Button className="hidden sm:flex" >
              <PlusIcon/>
              Crear Registro
            </Button>
          </Link>
        ]}
      />
      <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {pageRecords.map((r) => (
          <Link key={r._id.toString()} href={`/resident/records/${r._id}`}>
            <RecordCard
              surgery={isISurgery(r.surgery) ? r.surgery.name : r.surgery.toString()}
              date={format(new Date(r.date), "dd/MM/yy")}
              time={format(new Date(r.date), "HH:mm")}
              counterpartRole="Profesor"
              counterpart={isITeacher(r.teacher) && isIUser(r.teacher.user) ? (r.teacher.user.name || "") : r.teacher.toString()}
              dot={r.status === "corrected"}
            />
          </Link>
        ))}
      </div>

      {/* PAGINACIÓN */}
      {totalPages > 1 && (
        <Pagination className="mt-8 mb-4">
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
      )}

      <Link href="/resident/new-record" className="">
        <Button className="fixed bottom-10 right-10 sm:hidden" >
          <PlusIcon className=""/>
          Crear Registro
        </Button>
      </Link>
    </div>
  );
}
