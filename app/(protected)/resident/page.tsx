import ResidentList from "./residentList";
import { ResidentInfoProvider } from "./context/ResidentInfoContext";
import { seedDummyResident } from "@/actions/resident/seed";
import { seedDummyTeachers } from "@/actions/teacher/seed";

export default async function Page() {

  const handleCreateDummyResident = async () => {
    "use server"
    console.log("Creating dummy residents...");
    await seedDummyTeachers();
    await seedDummyResident();
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-gray-300 to-gray-100 dark:from-[#111827] dark:to-[#1E293B] overflow-hidden">
      <div className="flex flex-col flex-grow">
        <ResidentInfoProvider>
          <h1 className="py-4 text-3xl font-bold text-slate-800 dark:text-white mb-6 mt-20 mb:mt-28 text-center border-b-2 border-gray-400 dark:border-slate-600 pb-2 transition-colors duration-300 hover:text-slate-600 dark:hover:text-gray-300">
            Residentes
          </h1>

          <form
            action={handleCreateDummyResident}
            className="flex justify-center mb-4"
          >
            <button
              type="submit"
              className="bg-blue-600 text-white font-semibold py-2 px-4 rounded-md hover:bg-blue-700 transition"
            >
              Crear Residente Dummy
            </button>
          </form>

          <div className="flex-grow">
            <ResidentList />
          </div>
        </ResidentInfoProvider>
      </div>
    </div>
  );
}
