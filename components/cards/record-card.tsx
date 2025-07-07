import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle
  } from "@/components/ui/card";

export default function RecordCard({surgery, date, time, counterpartRole, counterpart, dot}: {
    surgery: string, date: string, time: string, counterpartRole: "Profesor" | "Residente", counterpart: string, dot: boolean}) {

    return (
        <Card className="relative py-4 sm:py-6">
            {dot && <span className="flex h-2/3 sm:h-2 w-1 sm:w-2 -translate-y-1/2 rounded-full bg-sky-500 absolute top-1/2 -ml-1 sm:ml-1" />}
            <CardHeader className="relative px-2 sm:px-6">
                    <CardTitle className="w-5/6">{surgery}</CardTitle>
                    <div className="absolute right-0 top-0 text-right pr-2 sm:pr-4 pt-2 sm:pt-0">
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
