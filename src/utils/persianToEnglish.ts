
// Utility functions for Persian/Farsi number conversion
export const persianToEnglishDigits = (str: string): string => {
  const persianDigits = '۰۱۲۳۴۵۶۷۸۹';
  const arabicDigits = '٠١٢٣٤٥٦٧٨٩';
  const englishDigits = '0123456789';
  
  let result = str;
  
  // Convert Persian digits
  for (let i = 0; i < persianDigits.length; i++) {
    result = result.replace(new RegExp(persianDigits[i], 'g'), englishDigits[i]);
  }
  
  // Convert Arabic digits
  for (let i = 0; i < arabicDigits.length; i++) {
    result = result.replace(new RegExp(arabicDigits[i], 'g'), englishDigits[i]);
  }
  
  return result;
};

export const formatPhoneNumber = (phone: string): string => {
  // Convert Persian/Arabic digits to English
  const englishPhone = persianToEnglishDigits(phone);
  
  // Remove any non-digit characters except for leading +
  const cleanPhone = englishPhone.replace(/[^\d+]/g, '');
  
  // If it starts with +98, convert to 0
  if (cleanPhone.startsWith('+98')) {
    return '0' + cleanPhone.substring(3);
  }
  
  // If it starts with 98 and is 12 digits, convert to 0
  if (cleanPhone.startsWith('98') && cleanPhone.length === 12) {
    return '0' + cleanPhone.substring(2);
  }
  
  return cleanPhone;
};

export const validateIranianPhoneNumber = (phone: string): boolean => {
  const formattedPhone = formatPhoneNumber(phone);
  // Iranian mobile numbers: 09XXXXXXXXX (11 digits)
  return /^09\d{9}$/.test(formattedPhone);
};
