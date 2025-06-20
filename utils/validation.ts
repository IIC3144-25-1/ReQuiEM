import { ISurgery } from "@/models/Surgery";
import { ITeacher } from "@/models/Teacher";
import { IUser } from "@/models/User";
import { validateRut as validateChileanRut } from "@/utils/rut";

export function isISurgery(surgery: object | ISurgery): surgery is ISurgery {
  return typeof surgery === "object" && surgery !== null && "name" in surgery;
}

export function isITeacher(teacher: object | ITeacher): teacher is ITeacher {
  return typeof teacher === "object" && teacher !== null && "user" in teacher;
}

export function isIUser(user: object | IUser): user is IUser {
  return typeof user === "object" && user !== null && "name" in user;
}

export function isIResident(resident: object | ITeacher): resident is ITeacher {
  return (
    typeof resident === "object" && resident !== null && "user" in resident
  );
}

// Email validation function
export function validateEmail(email: string): boolean {
  if (!email || typeof email !== "string") {
    return false;
  }

  const trimmedEmail = email.trim();
  if (!trimmedEmail) {
    return false;
  }

  // Simple but effective email regex that matches the test cases
  const emailRegex = /^[a-zA-Z0-9._+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  // Basic validation checks
  if (trimmedEmail.includes("..")) return false; // No consecutive dots
  if (trimmedEmail.includes(" ")) return false; // No spaces
  if (trimmedEmail.includes(",")) return false; // No commas
  if (trimmedEmail.includes("@.") || trimmedEmail.includes(".@")) return false; // No dots adjacent to @
  if ((trimmedEmail.match(/@/g) || []).length !== 1) return false; // Exactly one @

  const [localPart, domainPart] = trimmedEmail.split("@");
  if (!localPart || !domainPart) return false;
  if (localPart.startsWith(".") || localPart.endsWith(".")) return false;
  if (domainPart.startsWith(".") || domainPart.endsWith(".")) return false;
  if (domainPart.startsWith("-") || domainPart.endsWith("-")) return false;

  return emailRegex.test(trimmedEmail);
}

// Password validation function
export function validatePassword(password: string): boolean {
  if (!password || typeof password !== "string") {
    return false;
  }

  // Minimum 8 characters
  if (password.length < 8) {
    return false;
  }

  // Must contain at least one uppercase letter
  if (!/[A-Z]/.test(password)) {
    return false;
  }

  // Must contain at least one lowercase letter
  if (!/[a-z]/.test(password)) {
    return false;
  }

  // Must contain at least one number
  if (!/\d/.test(password)) {
    return false;
  }

  // Must contain at least one special character
  if (!/[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/.test(password)) {
    return false;
  }

  return true;
}

// Chilean RUT validation function
export function validateRut(rut: string): boolean {
  if (!rut || typeof rut !== "string") {
    return false;
  }

  // Use the existing RUT validation utility
  return validateChileanRut(rut);
}
