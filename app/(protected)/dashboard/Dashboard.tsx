import React, { FC, ReactNode } from "react";
import { format } from "date-fns";
import Link from "next/link";
import { getCurrentUser } from "@/actions/user/getUser";

interface Section {
  name: string;
  icon: ReactNode;
  path: string;
}

const Dashboard: FC = async () => {
  const user = await getCurrentUser();
  const sections: Section[] = [
    { name: "Fichas", icon: <></>, path: "/surgeryForm" },
    { name: "Protocolos", icon: <></>, path: "/" },
    { name: "Residentes", icon: <></>, path: "/resident" },
    { name: "Docentes", icon: <></>, path: "/" },
  ];

  return (
    <section className="bg-gray-50 dark:bg-gray-900 h-screen flex items-center justify-center overflow-hidden">
      <div className="bg-white rounded-lg shadow dark:bg-gray-800 w-full max-w-md">
        <header className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Docente Urología UC
              </p>
              <h1 className="text-xl font-bold text-gray-800 dark:text-white">
                Hola {user?.name} 👋
              </h1>
            </div>
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {format(new Date(), "dd/MM/yyyy")}
          </div>
        </header>

        <div className="grid grid-cols-2 md:grid-cols-2 gap-4 p-4">
          {sections.map((section) => (
            <Link href={section.path} key={section.name} passHref>
              <div
                className="bg-white p-4 rounded-xl shadow-md flex flex-col items-center justify-center 
                hover:scale-105 transition-transform cursor-pointer dark:bg-gray-700 border border-gray-200 dark:border-gray-600"
              >
                {section.icon}
                <span className="mt-2 text-lg font-semibold text-gray-700 dark:text-gray-200">
                  {section.name}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Dashboard;
