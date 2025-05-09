import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle
  } from "@/components/ui/card";

export default function RecordCard({surgery, date, time, counterpartRole, counterpart, dot}: {
    surgery: string, date: string, time: string, counterpartRole: "Profesor" | "Residente", counterpart: string, dot: boolean}) {

    const handleClick = () => {
        console.log(`Click en registro: ${surgery}`);
    };

    return (
        <Card className="relative" onClick={handleClick}>
            {dot && <span className="flex h-2 w-2 -translate-y-1/2 rounded-full bg-sky-500 absolute top-1/2 ml-1" />}
            <CardHeader className="relative">
                    <CardTitle>{surgery}</CardTitle>
                    <div className="absolute right-0 top-0 text-right px-6">
                        <CardDescription>{date}</CardDescription>
                        <CardDescription>{time}</CardDescription>
                    </div>
            </CardHeader>
            <CardContent>
                <span className="font-medium">{counterpartRole}</span>: {counterpart}
            </CardContent>
        </Card>
  );
}


// ${reg.estado === 'Revisado'
//     ? 'bg-green-600'
//     : reg.estado === 'Pendiente'
//     ? 'bg-yellow-500'
//     : 'bg-purple-800'
// } 