

export default function RecordCard({surgery, date, time, counterpartRole, counterpart, status}: {
    surgery: string, date: string, time: string, counterpartRole: "Profesor" | "Residente", counterpart: string, status: string}) {

    const handleClick = () => {
        console.log(`Click en registro: ${surgery}`);
    };

    return (
        <div onClick={handleClick} className="bg-gray-200 border border-black shadow-md rounded-xl p-4 relative transition-transform duration-150 ease-in-out active:scale-95 cursor-pointer">
            <div className="flex justify-between items-start">
                <h2 className="text-lg font-semibold">{surgery}</h2>
                <div className="text-sm text-gray-500 text-right">
                    <div>{date}</div>
                    <div>{time}</div>
                </div>
            </div>
            <div className="mb-1 text-sm text-gray-700">
                <p><strong>{counterpartRole}:</strong> {counterpart}</p>
                <p><strong>Estado:</strong> {status}</p>
            </div>
            <div className="absolute bottom-0 left-0 w-full h-[14px] bg-sky-800 rounded-b-xl"
            />
        </div>
  );
}


// ${reg.estado === 'Revisado'
//     ? 'bg-green-600'
//     : reg.estado === 'Pendiente'
//     ? 'bg-yellow-500'
//     : 'bg-purple-800'
// } 