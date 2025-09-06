import IAadhaar from "./interfaces/IAadhaar";

/* eslint-disable no-console */
const validateAadhaarDetails = function (result: IAadhaar): void {
    const errors: string[] = [];

    // Validate Aadhaar number
    if (!result.aadhaarNumber) {
      errors.push('Aadhaar number not found');
    } else if (!/^\d{12}$/.test(result.aadhaarNumber)) {
      errors.push('Invalid Aadhaar number format');
    }

    // Validate date of birth
    if (result.dateOfBirth && !/^\d{2}\/\d{2}\/\d{4}$/.test(result.dateOfBirth)) {
      errors.push('Invalid date of birth format');
    }

    // Validate gender
    if (result.gender && !['Male', 'Female'].includes(result.gender)) {
      errors.push('Invalid gender value');
    }

    // Basic address validation
    if (result.address && !/kerala\s*-\s*\d{6}/i.test(result.address)) {
      console.warn('Address may be incomplete: Missing Kerala PIN format');
    } else if (!result.address) {
      console.warn('Address not extracted');
    }

    if (errors.length > 0) {
      console.error('Validation errors:', errors);
    }
};

export default validateAadhaarDetails;