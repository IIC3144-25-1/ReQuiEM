// Clean RUT by removing dots, hyphens and converting to uppercase
export function cleanRut(rut: string): string {
  if (!rut || typeof rut !== "string") {
    return "";
  }
  return rut.replace(/[^\dkK]/g, "").toUpperCase();
}

// Calculate the verifier digit for a RUT number
export function calculateVerifierDigit(rutNumber: string): string {
  if (!rutNumber || typeof rutNumber !== "string") {
    return "";
  }

  let sum = 0;
  let multiplier = 2;

  // Process digits from right to left
  for (let i = rutNumber.length - 1; i >= 0; i--) {
    sum += parseInt(rutNumber[i], 10) * multiplier;
    // Increment multiplier, reset to 2 when it reaches 8
    multiplier = multiplier === 7 ? 2 : multiplier + 1;
  }

  const remainder = sum % 11;
  const calculatedVerifier = 11 - remainder;

  if (calculatedVerifier === 11) {
    return "0";
  } else if (calculatedVerifier === 10) {
    return "K";
  } else {
    return String(calculatedVerifier);
  }
}

export function formatRut(value: string): string {
  if (!value || typeof value !== "string") {
    return "";
  }

  // Handle very short RUTs
  if (value.length <= 1) {
    return value;
  }

  // Elimina puntos y guiones
  const cleanValue = cleanRut(value);

  if (cleanValue.length <= 1) {
    return cleanValue;
  }

  // Divide el número y el dígito verificador
  const rutBody = cleanValue.slice(0, -1); // Todo menos el último carácter
  const verifier = cleanValue.slice(-1); // Último carácter como dígito verificador

  // Formatea el cuerpo del RUT con puntos cada tres dígitos
  const formattedBody = rutBody.replace(/\B(?=(\d{3})+(?!\d))/g, ".");

  // Retorna el RUT formateado con el guión antes del dígito verificador
  return `${formattedBody}-${verifier}`;
}

export function validateRut(rut: string): boolean {
  // Handle edge cases
  if (!rut || typeof rut !== "string") {
    return false;
  }

  // Clean the RUT and trim whitespace
  const cleanedRut = cleanRut(rut.trim());

  // Must have at least 2 characters (number + verifier)
  if (cleanedRut.length < 2) {
    return false;
  }

  // Must not be too long (max 9 digits + 1 verifier = 10 chars)
  if (cleanedRut.length > 10) {
    return false;
  }

  const rutBody = cleanedRut.slice(0, -1);
  const verifier = cleanedRut.slice(-1);

  // Validate that rutBody contains only numbers
  if (!/^\d+$/.test(rutBody)) {
    return false;
  }

  // Calculate expected verifier
  const expectedVerifier = calculateVerifierDigit(rutBody);

  return verifier === expectedVerifier;
}
