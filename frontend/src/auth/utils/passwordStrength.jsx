export function validatePassword(password) {
  if (!password) return "";

  const missingRules = [];

  if (password.length < 8) missingRules.push("min 8 chars");
  if (!/[A-Z]/.test(password)) missingRules.push("1 uppercase letter");
  if (!/[a-z]/.test(password)) missingRules.push("1 lowercase letter");
  if (!/\d/.test(password)) missingRules.push("1 number");
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) missingRules.push("1 special character");

  if (missingRules.length > 0) {
    return `Password requires: ${missingRules.join(", ")}.`;
  }

  return ""; // Returns empty string if valid
}