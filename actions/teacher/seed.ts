'use server'

import { createTeacher } from "./create";

const dummyTeacherData = [
  { user: "661fabcde1234abc456def11" },
  { user: "661fabcde1234abc456def12" },
  { user: "661fabcde1234abc456def13" },
];

export async function seedDummyTeachers() {
  const results = [];

  for (const data of dummyTeacherData) {
    const formData = new FormData();
    formData.append('user', data.user);
    const teacher = await createTeacher(formData);
    results.push(teacher);
  }

  return results;
}
