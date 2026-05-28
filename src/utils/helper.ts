export function formatPhoneNumber(phoneNumber: string) {
  // 1. Remove all non-numeric characters from the input
  const cleaned = ("" + phoneNumber).replace(/\D/g, "");

  // 2. Grab the last 10 digits (in case they passed it with a leading 7 or 8)
  const last10 = cleaned.slice(-10);

  // 3. Check if we have exactly 10 digits to format
  const match = last10.match(/^(\d{3})(\d{3})(\d{2})(\d{2})$/);

  if (match) {
    // 4. Return the formatted string
    // match[1] = first 3 digits
    // match[2] = next 3 digits
    // match[3] = next 2 digits
    // match[4] = last 2 digits
    return `+7 ( ${match[1]} ) ${match[2]} ${match[3]}-${match[4]}`;
  }

  // Return the original input if it doesn't contain enough digits to format
  return phoneNumber;
}
