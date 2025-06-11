"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

interface ErrorPageProps {
  errorCode: number;
  errorMessage?: string;
  errorStack?: string;
}

const ErrorPage: React.FC<ErrorPageProps> = ({
  errorCode,
  errorMessage,
  errorStack,
}) => {
  const handleReload = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <Card className="max-w-md w-full shadow-lg">
        <CardHeader>
          <CardTitle className="text-6xl text-red-600 text-center">
            {errorCode}
          </CardTitle>
          <CardDescription className="text-center">
            Lo sentimos, algo salió mal.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-medium">Mensaje:</h3>
            <p className="text-sm text-gray-700 break-words">{errorMessage}</p>
          </div>
          {errorStack && (
            <div>
              <h4 className="font-medium">Stack trace:</h4>
              <pre className="bg-gray-100 rounded p-2 overflow-auto text-xs text-gray-600 max-h-100">
                {errorStack}
              </pre>
            </div>
          )}
          <div className="flex justify-center">
            <Button onClick={handleReload}>Recargar página</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ErrorPage;
