import { Loader2Icon } from "lucide-react";
import React, { FC, useEffect } from "react";

const LoadingState: FC = () => {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  return (
    <div className="flex justify-center h-screen">
      <Loader2Icon className="h-6 w-6 mr-2 animate-spin text-blue-500" />
      <p className="text-lg font-medium text-gray-700">Cargando...</p>
    </div>
  );
};

export default LoadingState;
