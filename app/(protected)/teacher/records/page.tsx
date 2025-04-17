"use client";
// import { FaBars, FaCog } from "react-icons/fa";

const registros = [
  {
    titulo: "Ureterorrenoscopía",
    fecha: "04/08/2024",
    alumno: "Ricardo Pérez",
    estado: "Pendiente",
    hora: "15:00",
  },
  {
    titulo: "Cistoscopía",
    fecha: "06/08/2024",
    alumno: "Ricardo Pérez",
    estado: "Pendiente",
    hora: "16:45",
  },
  {
    titulo: "Ureteroscopía Flex",
    fecha: "01/08/2024",
    alumno: "Ricardo Pérez",
    estado: "Revisado",
    hora: "13:30",
  },
  {
    titulo: "Cistoscopía",
    fecha: "10/08/2024",
    alumno: "Nicolás Pérez",
    estado: "Revisado",
    hora: "9:00",
  },
];

export default function Registros() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      {/* <div className="bg-purple-800 text-white px-4 py-5 flex justify-between items-center shadow-md">
        <h1 className="text-xl font-semibold">Registros</h1>
      </div> */}

      {/* Lista de registros */}
      <div className="p-4 flex-1 space-y-4">
        {registros.map((reg, idx) => (
          <div
            key={idx}
            className="bg-gray-200 border border-black shadow-md rounded-xl p-4 relative transition-transform duration-150 ease-in-out active:scale-95 cursor-pointer"
            onClick={() => {
              console.log(`Click en registro: ${reg.titulo}`);
            }}
          >
            <div className="flex justify-between items-start">
              <h2 className="text-lg font-semibold">{reg.titulo}</h2>
              <div className="text-sm text-gray-500 text-right">
                <div>{reg.fecha}</div>
                <div>{reg.hora}</div>
              </div>
            </div>
            <div className="mt-2 text-sm text-gray-700">
              <p><strong>Alumno:</strong> {reg.alumno}</p>
              <p><strong>Estado:</strong> {reg.estado}</p>
            </div>
            <div
              className={`absolute bottom-0 left-0 w-full h-[14px] ${
                reg.estado === 'Revisado'
                  ? 'bg-green-600'
                  : reg.estado === 'Pendiente'
                  ? 'bg-yellow-500'
                  : 'bg-purple-800'
              } rounded-b-xl`}
            />
          </div>
        ))}
      </div>

    </div>
  );
}
