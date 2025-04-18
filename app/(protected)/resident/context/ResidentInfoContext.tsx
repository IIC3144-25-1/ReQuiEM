'use client'

import React, {
  createContext,
  useState,
  useContext,
  ReactNode,
  FC,
} from "react";
import { ResidentInfoContextProps, TeacherOption } from "./ResidentContextProps";
import { IResident } from "@/models/Resident";


const ResidentInfoContext = createContext<ResidentInfoContextProps | undefined>( undefined );

export const ResidentInfoProvider: FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [residents, setResidents] = useState<IResident[]>([]);
  const [displayResidents, setDisplayResidents] = useState<IResident[]>([]);
  const [name, setName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [rut, setRut] = useState<string>("");
  const [phone, setPhone] = useState<string>("");
  const [birthdate, setBirthdate] = useState<Date | null>(null);
  const [area, setArea] = useState<string>("");

  const [selectedResident, setSelectedResident] = useState<IResident | null>(null);
  
  const [teacherOptions, setTeacherOptions] = useState<TeacherOption[]>([]);

  const contextValue: ResidentInfoContextProps = {
    residents, setResidents,
    displayResidents, setDisplayResidents,
    name, setName,
    email, setEmail,
    rut, setRut,
    phone, setPhone,
    birthdate, setBirthdate,
    area, setArea,
    teacherOptions, setTeacherOptions,
    selectedResident, setSelectedResident,
  };

  return (
    <ResidentInfoContext.Provider value={contextValue}>
      {children}
    </ResidentInfoContext.Provider>
  );
};

export const useResidentInfoContext = (): ResidentInfoContextProps => {
  const context = useContext(ResidentInfoContext);
  if (!context) {
    throw new Error(
      "useResidentInfoContext debe usarse dentro de un ResidentInfoProvider"
    );
  }
  return context;
};
