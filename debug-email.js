// Debug script to test email validation
const { validateEmail } = require('./utils/validation.ts');

const validEmails = [
  "test@example.com",
  "user.name@domain.co.uk",
  "user+tag@example.org",
  "firstname.lastname@company.com",
  "email@subdomain.example.com",
  "firstname-lastname@example.com",
  "user123@example123.com",
  "test.email.with+symbol@example.com",
  "user@example-one.com",
  "x@example.com",
  "example@s.example",
];

console.log('Testing email validation:');
validEmails.forEach((email) => {
  try {
    const result = validateEmail(email);
    console.log(`${email}: ${result ? 'PASS' : 'FAIL'}`);
  } catch (error) {
    console.log(`${email}: ERROR - ${error.message}`);
  }
});
