// Test script to check RUT calculations
function calculateVerifierDigit(rutNumber) {
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

console.log('12345678:', calculateVerifierDigit('12345678'));
console.log('11111111:', calculateVerifierDigit('11111111'));
console.log('1111111:', calculateVerifierDigit('1111111'));
console.log('24965885:', calculateVerifierDigit('24965885'));
console.log('12345:', calculateVerifierDigit('12345'));
console.log('123:', calculateVerifierDigit('123'));
console.log('1234:', calculateVerifierDigit('1234'));
console.log('123456:', calculateVerifierDigit('123456'));
console.log('1234567:', calculateVerifierDigit('1234567'));
console.log('7775777:', calculateVerifierDigit('7775777'));
console.log('8888888:', calculateVerifierDigit('8888888'));
console.log('9999999:', calculateVerifierDigit('9999999'));
console.log('10000000:', calculateVerifierDigit('10000000'));
console.log('15000000:', calculateVerifierDigit('15000000'));
