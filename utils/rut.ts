export function formatRut(value: string): string {
    // Elimina puntos y guiones
    const cleanValue = value.replace(/[^\dkK]/g, ""); // Solo deja números y 'k' o 'K'
  
    // Divide el número y el dígito verificador
    const rutBody = cleanValue.slice(0, -1); // Todo menos el último carácter
    const verifier = cleanValue.slice(-1); // Último carácter como dígito verificador
  
    // Formatea el cuerpo del RUT con puntos cada tres dígitos
    const formattedBody = rutBody.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  
    // Retorna el RUT formateado con el guión antes del dígito verificador
    return `${formattedBody}-${verifier}`;
}

export function validateRut(rut: string): boolean {
    // Limpia el RUT
    const cleanRut = rut.replace(/[^\dkK]/g, "");
    const rutBody = cleanRut.slice(0, -1);
    const verifier = cleanRut.slice(-1).toUpperCase();
  
    // Cálculo del dígito verificador
    let sum = 0;
    let multiplier = 2;
  
    for (let i = rutBody.length - 1; i >= 0; i--) {
      sum += parseInt(rutBody[i], 10) * multiplier;
      multiplier = multiplier === 7 ? 2 : multiplier + 1;
    }
  
    const calculatedVerifier = 11 - (sum % 11);
    const expectedVerifier = calculatedVerifier === 11 ? "0" : calculatedVerifier === 10 ? "K" : String(calculatedVerifier);
  
    return verifier === expectedVerifier;
}