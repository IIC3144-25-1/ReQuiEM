import { IResident } from '@/models/Resident';
import React from 'react';

export interface TeacherOption {
  id: string;
  name: string;
}

export interface ResidentInfoContextProps {
  residents: IResident[];
  setResidents: React.Dispatch<React.SetStateAction<IResident[]>>;

  displayResidents: IResident[];
  setDisplayResidents: React.Dispatch<React.SetStateAction<IResident[]>>;
  
  name: string;
  setName: React.Dispatch<React.SetStateAction<string>>;
  email: string;
  setEmail: React.Dispatch<React.SetStateAction<string>>;
  rut: string;
  setRut: React.Dispatch<React.SetStateAction<string>>;
  phone: string;
  setPhone: React.Dispatch<React.SetStateAction<string>>;
  birthdate: Date | null;
  setBirthdate: React.Dispatch<React.SetStateAction<Date | null>>;
  area: string;
  setArea: React.Dispatch<React.SetStateAction<string>>;

  teacherOptions: TeacherOption[];
  setTeacherOptions: React.Dispatch<React.SetStateAction<TeacherOption[]>>;

  selectedResident: IResident | null;
  setSelectedResident: React.Dispatch<React.SetStateAction<IResident | null>>;
}