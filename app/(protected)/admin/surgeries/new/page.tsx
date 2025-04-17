
import { SurgeryForm } from "./surgeryForm";

export default function NewSurgeryPage() {
    return (
        <div className="flex flex-col gap-6 min-h-svh w-full justify-center max-w-lg mx-auto md:p-10">
            <h1 className="text-2xl font-bold">Crear nueva cirugia</h1>
            <SurgeryForm />
        </div>
    )
}