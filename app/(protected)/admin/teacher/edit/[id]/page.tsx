import { TeacherForm } from '../../teacherForm';

export default async function Page(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;

  return (
    <div className="flex flex-col gap-6 min-h-screen w-full justify-center max-w-lg mx-auto p-6">
      <h1 className="text-2xl font-bold">Editar Profesor</h1>
      <TeacherForm id={params.id}/>
    </div>
  );
}
