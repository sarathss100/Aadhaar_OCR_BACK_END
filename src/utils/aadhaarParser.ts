/* eslint-disable no-useless-escape */
import IAadhaar from "./interfaces/IAadhaar";

const extractAadhaarNumber = function (data: string): string | undefined {
    const regex = /\b(\d{4})\s*(\d{4})\s*(\d{4})\b|\b(\d{12})\b/g;

    let match;
    while ((match = regex.exec(data)) !== null) {
        // If groups 1–3 matched (spaced format), join them, else take group 4
        const number = match[1] ? match[1] + match[2] + match[3] : match[4];

        // Validate Aadhaar number (basic check: 12 digits)
        if (/^\d{12}$/.test(number)) {
            return number;
        }
    }

    return undefined;
};

const sanitizeDob = function (dob: string | undefined): string | undefined {
  if (!dob) return undefined;

  const regex = /(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})/;

  const match = regex.exec(dob);
  if (!match) return dob; // return original if no match

  let [, day, month, year] = match;

  // Convert 2-digit year to 4-digit
  if (year.length === 2) {
    const yearNum = parseInt(year, 10);
    year = yearNum > 50 ? `19${year}` : `20${year}`;
  }

  // Validate year range
  const yearNum = parseInt(year, 10);
  const currentYear = new Date().getFullYear();
  if (yearNum < 1900 || yearNum > currentYear) return dob;

  // Normalize output: DD/MM/YYYY
  return `${day.padStart(2, "0")}/${month.padStart(2, "0")}/${year}`;
};

const extractGender = function (text: string): string | undefined {
  const regex = /\b(?:gender|sex)?\s*[:\-]?\s*(male|female|m|f)\b/i;

  const match = regex.exec(text);
  if (!match) return undefined;

  const gender = match[1].toLowerCase();
  if (gender === "male" || gender === "m") return "Male";
  if (gender === "female" || gender === "f") return "Female";

  return undefined;
};

const cleanText = function (text: string): string {
  return text
    .replace(/[^A-Za-z\s\.]/g, '')
    .replace(/\s+/g, ' ')          
    .trim();
};

const extractName = function (text: string, isBackSide: boolean = false): string | undefined {
  const lines = text.split("\n").map(l => l.trim()).filter(Boolean);

  const isValidName = (line: string): boolean => {
    return (
      line.length > 2 &&
      /^[A-Za-z\s.]+$/.test(line) &&
      !/(government|unique|authority|india|aadhaar|govt|dob|male|female)/i.test(line) &&
      !/(S\/O|D\/O|W\/O|son of|daughter of|wife of)/i.test(line)
    );
  };

  if (!isBackSide) {
    // Try to find the name directly above DOB
    const dobIdx = lines.findIndex(l => /dob|date of birth/i.test(l));
    if (dobIdx > 0) {
      const candidate = cleanText(lines[dobIdx - 1]);
      if (isValidName(candidate)) {
        return candidate;
      }
    }

    // Fallback: first line that looks like a name
    const candidate = lines.map(cleanText).find(isValidName);
    if (candidate) return candidate;
  } else {
    // For back side, look for relationship markers and extract name
    for (let i = 0; i < lines.length; i++) {
      const relMatch = lines[i].match(
        /(?:S\/O|D\/O|W\/O|son of|daughter of|wife of)[:\s]*([A-Za-z\s.]+)?/i
      );

      if (relMatch) {
        if (relMatch[1]) {
          const fatherName = cleanText(relMatch[1]);
          if (isValidName(fatherName)) return fatherName;
        }
        // If nothing captured, check next line
        if (i + 1 < lines.length) {
          const nextLineName = cleanText(lines[i + 1]);
          if (isValidName(nextLineName)) return nextLineName;
        }
      }
    }
  }

  return undefined;
};

const isOCRArtifact = function (text: string): boolean {
  const lowerText = text.toLowerCase().trim();

  // Don't flag legitimate postal abbreviations
  if (['p', 'o', 'po', 'p o'].includes(lowerText)) {
    return false;
  }

  const artifacts = [
    /^[A-HJ-NQ-Z]{1,2}$/,  // Single/double letters (excluding I, O, P)
    /^[a-hj-nq-z]{1,2}$/,  // Single/double lowercase letters
    /^\d+$/,               // Pure numbers (standalone)
    /^[A-HJ-NQ-Z][a-z]{1,2}$/,  // Mixed case short combinations
    
    // Common OCR artifacts from your example
    /^(sey|clt|linh|ne\s*s|ee\s*\d+|tria\s*\d+|nell\s*\d+|ree|ooh|ot|ii|ll|ae|ms|pe|ir|er|by|te|berr|et|tn|neds|tr|as|atty)$/i,
    
    // Patterns with numbers that are likely artifacts
    /^[A-Z]{2,}\s*\d+$/,   // CAPS followed by numbers
    /^[a-z]{1,3}\s*\d+$/,  // Short lowercase with numbers
    
    // Web/email artifacts
    /www\.|@|\.com|\.in$/i, 
    
    // Specific problematic patterns
    /^(alt|tak|ear|amen)$/i,
    /^[A-Z]{3,}$/,         // Long all-caps sequences (like SEY, CLT)
  ];

  return artifacts.some(pattern => pattern.test(text.trim()));
};

const removeOCRArtifacts = function (text: string): string {
  return text
    // Remove specific OCR artifact patterns from your example
    .replace(/\bSEY\s+CLT\b/gi, '') 
    .replace(/\bLinh\s*\*?\s*\d*\b/gi, '')
    .replace(/\bNe\s+S\b/gi, '')
    .replace(/\bee\s*\d+\s*Tria\s*\d+\s*nell\s*\d+\b/gi, '')
    
    // Remove common OCR artifact patterns
    .replace(/\b[A-Z]{2,}\s+[A-Za-z]{1,3}\s+[a-z]{2,}\b/g, '') 
    .replace(/\b[A-Z]{1,3}\s+[a-z]{1,3}\s+\d+\b/g, '') 
    .replace(/\b[A-Z][a-z]\s+[a-z]{2,4}\s+[a-z]\b/g, '') 
    
    // Remove other common OCR artifacts
    .replace(/\bALT\s+Tak\s+ooh\b/gi, '')
    .replace(/\bEAR\s+ot\s+\d+\b/gi, '')
    .replace(/\bTr\s+amen\s+a\b/gi, '')
    .replace(/\bpe\s+ae\b/gi, '') 
    .replace(/\bms\b/gi, '')
    
    // Remove isolated single letters (preserve P and O for postal)
    .replace(/\b[A-NQ-Z]\s+[A-NQ-Z]\s+[A-NQ-Z]/g, '') 
    .replace(/\b[a-nq-z]\s+[a-nq-z]\b/g, '') 
    
    // Remove common OCR noise words
    .replace(/\b(ree|ooh|ot|ae|ms|ii|ll|berr|et|tn|neds|tr|as|atty)\b/gi, '')
    
    // Clean up extra spaces and punctuation
    .replace(/\s*\*\s*/g, ' ')  // Remove asterisks
    .replace(/\s+/g, ' ')       // Multiple spaces to single
    .replace(/,\s*,/g, ',')     // Double commas
    .trim();
};

const extractAddressGeneric = function (text: string): string | undefined {
  const lines = text.split("\n").map(l => l.trim()).filter(Boolean);

  // Find the S/O line
  let startIdx = lines.findIndex(l =>
    /(S\/O|D\/O|W\/O|son of|daughter of|wife of)[:\s]/i.test(l)
  );
  if (startIdx === -1) return undefined;

  // Extract father's name
  const soLine = lines[startIdx];
  const fatherNameMatch = soLine.match(/(S\/O|D\/O|W\/O)[:\s]*([A-Za-z\s]+?)(?:,|Address|$)/i);
  const fatherName = fatherNameMatch ? fatherNameMatch[2].trim() : "";

  let addressText = "";
  let pinCode = "";

  // Collect lines after S/O until PIN
  for (let i = startIdx; i < lines.length; i++) {
    const line = lines[i];
    const pinMatch = line.match(/\b(\d{6})\b/);
    if (pinMatch) {
      pinCode = pinMatch[1];
      // Remove PIN and everything after it from the line
      addressText += " " + line.replace(/\d{6}.*$/, "").trim();
      break;
    }
    addressText += " " + line;
  }

  if (!addressText.trim()) return undefined;

  // Clean the address text
  let cleanedAddress = addressText
    .replace(/Address\s+S\s*\/?\s*O\s+[A-Za-z\s]+?,?\s*/i, '') // Remove "Address S/O Name" pattern
    .replace(/,\s*Address\s+S\s*\/?\s*O\s+[A-Za-z\s]+?(?=,|$)/i, '') // Remove mid-string "Address S/O Name"
    .replace(/[^\w\s,.-]/g, " ") // Keep only alphanumeric, space, punctuation
    .replace(/\s+/g, " ")
    .trim();

  cleanedAddress = removeOCRArtifacts(cleanedAddress);

  // Split on commas and filter valid components
  const rawComponents = cleanedAddress
    .split(/[,]+/)
    .map(c => c.trim())
    .filter(Boolean);

  // Improved validation for address components
  const isValidAddressComponent = (component: string): boolean => {
    if (!component || component.length < 2) return false;
    if (/^\d+$/.test(component)) return false; // Pure numbers
    if (!/[aeiou]/i.test(component) && component.length < 4) return false; // Must have vowel or be longer
    if (/^[A-Z]{3,}$/.test(component)) return false; // All caps sequences
    if (component.toLowerCase() === 'address') return false; // Remove "Address" word
    return true;
  };

  const components: string[] = [];
  for (let comp of rawComponents) {
    comp = comp.trim();
    if (isValidAddressComponent(comp) && !isOCRArtifact(comp)) {
      components.push(comp);
    }
  }

  // Remove duplicates while preserving case
  const uniqueComponents = [...new Set(components.map(c => c.toLowerCase()))]
    .map(lower => components.find(c => c.toLowerCase() === lower)!)
    .filter(Boolean);

  if (uniqueComponents.length === 0 && !pinCode) return undefined;

  let finalAddress = uniqueComponents.join(", ");
  if (pinCode) {
    finalAddress = finalAddress ? `${finalAddress} - ${pinCode}` : pinCode;
  }

  return fatherName ? `S/O: ${fatherName}, ${finalAddress}` : finalAddress;
};

export function extractAadhaarDetails (parsedData: string, isBackSide: boolean = false): IAadhaar {
    const aadhaarNumber = extractAadhaarNumber(parsedData);
    const dateOfBirth = sanitizeDob(parsedData.match(/\b\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}\b/)?.[0]);
    const gender = extractGender(parsedData);
    const name = extractName(parsedData, isBackSide);
    const address = extractAddressGeneric(parsedData);

    return {
        aadhaarNumber,
        dateOfBirth,
        gender,
        name,
        address,
    };
};

export function mergeAadhaarDetails(frontResult: IAadhaar, backResult: IAadhaar): IAadhaar {
  return {
    aadhaarNumber: frontResult.aadhaarNumber || backResult.aadhaarNumber,

    // DOB is typically on front side
    dateOfBirth: frontResult.dateOfBirth || backResult.dateOfBirth,

    // Gender is typically on front side
    gender: frontResult.gender || backResult.gender,

    // Name: prefer front side, but use back side if front is unclear
    name: (frontResult.name && frontResult.name.length > 2 && !/^[A-Z]{1,3}$/.test(frontResult.name))
      ? frontResult.name
      : backResult.name,

    // Address: prefer back side, but merge if both have partial info
    address: backResult.address || frontResult.address,
  };
};

export function isAadhaarCard(text: string): boolean {
  const aadhaarNumberRegex = /\b\d{4}\s?\d{4}\s?\d{4}\b/;

  const aadhaarIndicators = [
    'government of india',
    'govt of india',
    'uidai',
    'unique identification authority of india',
    'aadhaar',
    'भारत सरकार',
  ];

  const lowerText = text.toLowerCase();

  return aadhaarNumberRegex.test(text) || aadhaarIndicators.some(ind => lowerText.includes(ind));
}