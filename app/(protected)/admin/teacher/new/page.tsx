import { TeacherForm } from "../teacherForm";

export default function NewTeacherPage() {
  return (
    <div className="flex flex-col gap-6 min-h-svh w-full justify-center max-w-lg mx-auto md:p-10">
      <h1 className="text-2xl font-bold">Crear nuevo profesor</h1>
      <TeacherForm />
    </div>
  )
}