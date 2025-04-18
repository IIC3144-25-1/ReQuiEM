'use server'

import { createResident } from "./create";


const dummyResidents = [
  {
    user: "661f8308e1234abc456def11",
    teachers: ["661fabcde1234abc456def11"],
  },
  {
    user: "661f8308e1234abc456def21",
    teachers: [
      "661fabcde1234abc456def11",
      "661fabcde1234abc456def12",
    ],
  },
  {
    user: "661f8308e1234abc456def31",
    teachers: ["661fabcde1234abc456def12"],
  },
  {
    user: "661f8308e1234abc456def41",
    teachers: ["661fabcde1234abc456def13"],
  },
  {
    user: "661f8308e1234abc456def51",
    teachers: ["661fabcde1234abc456def13"],
  },
];

export async function seedDummyResident() {
  for (const data of dummyResidents) {
    const formData = new FormData();
    formData.append("user", data.user);

    data.teachers.forEach((teacherId, index) => {
      formData.append(`teachers.${index}`, teacherId);
    });

    await createResident(formData);
  }
}
