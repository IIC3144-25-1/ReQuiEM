import { getResidentByID } from '@/actions/resident/getByID';
import { ResidentForm } from '../../residentForm';


export default async function Page(props: {params: Promise<{id: string}>}) {
    const params = await props.params;
    const resident = await getResidentByID(params.id);
  
    if (!resident) {
      return (
        <div className="flex items-center justify-center h-screen">
          <p className="text-lg">Residente no encontrado</p>
        </div>
      );
    }
  
    return (
      <div className="flex flex-col gap-6 min-h-screen w-full justify-center max-w-lg mx-auto p-6">
        <h1 className="text-2xl font-bold">Editar Residente</h1>
        <ResidentForm resident={JSON.parse(JSON.stringify(resident))} />
      </div>
    );
  }