import { ResidentForm } from '../../residentForm';
import { getAllAreas } from '@/actions/area/getAll';


export default async function Page(props: {params: Promise<{id: string}>}) {
    const params = await props.params;
    const areas = await getAllAreas();
    return (
      <div className="flex flex-col gap-6 min-h-screen w-full justify-center max-w-lg mx-auto p-6">
        <h1 className="text-2xl font-bold">Editar Residente</h1>
        <ResidentForm id={params.id} areas={JSON.parse(JSON.stringify(areas))}/>
      </div>
    );
  }