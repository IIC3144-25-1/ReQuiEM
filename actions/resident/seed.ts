'use server'

import { createResident } from "./create";

const dummyResidents = [
  {
    user: "661f8308e1234abc456def11",
    teachers: ["661fabcde1234abc456def11"],
    specialty: "Pediatría",
    year: 2,
  },
  {
    user: "661f8308e1234abc456def21",
    teachers: ["661fabcde1234abc456def11", "661fabcde1234abc456def12"],
    specialty: "Medicina Interna",
    year: 3,
  },
  {
    user: "661f8308e1234abc456def31",
    teachers: ["661fabcde1234abc456def12"],
    specialty: "Neurología",
    year: 1,
  },
  {
    user: "661f8308e1234abc456def41",
    teachers: ["661fabcde1234abc456def13"],
    specialty: "Ginecología y Obstetricia",
    year: 4,
  },
  {
    user: "661f8308e1234abc456def51",
    teachers: ["661fabcde1234abc456def13"],
    specialty: "Cirugía General",
    year: 2,
  },
];

export async function seedDummyResident() {
  for (const data of dummyResidents) {
    await createResident(data);
  }
}
