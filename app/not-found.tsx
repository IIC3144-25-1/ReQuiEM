import React from "react";
import ErrorPage from "@/components/error/ErrorPage";

export default function NotFound() {
  return (
    <>
      <ErrorPage errorCode={404} />
    </>
  );
}
