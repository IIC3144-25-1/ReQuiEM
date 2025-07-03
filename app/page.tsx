import { getRole } from "@/actions/user/getRole";

export default async function Home() {
  const role = await getRole();

  return (
    <main className="flex min-h-screen flex-col items-center px-6 py-50 text-center">
      <h1 className="text-4xl md:text-5xl font-extrabold  mb-4">
        Bienvenido a <span className="text-blue-600">SurgiSkills</span>
      </h1>

      <p className=" text-lg md:text-xl max-w-xl">
        Una plataforma para registrar procedimientos quirúrgicos y facilitar la 
        retroalimentación entre doctores y residentes de especialidades quirúrgicas.
      </p>
    
      {role && role.role === null && (
        <div className="flex flex-col items-center justify-center mt-6">
          <p className="text-lg sm:text-2xl max-w-xl text-red-500">No estas registrado en ninguna área</p>
          <p className="text-lg sm:text-lg max-w-xl text-red-500">Contacta al administrador para que te asignen un área.</p>
        </div>
      )}
    </main>
  )
}