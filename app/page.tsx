
export default async function Home() {

  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6 py-8 text-center">
      <h1 className="text-4xl md:text-5xl font-extrabold  mb-4">
        Bienvenido a <span className="text-blue-600">SurgerySkills</span>
      </h1>

      <p className=" text-lg md:text-xl max-w-xl">
        Una plataforma para registrar procedimientos quirúrgicos y facilitar la retroalimentación entre doctores y residentes de especialidades quirúrgicas.
      </p>
    </main>
  )
}