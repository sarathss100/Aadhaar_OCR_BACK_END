
const identifySides = function (text1: string, text2: string): { frontSideText: string, backSideText: string} {
  const frontRegex = /\b(government of india|govt of india|dob|date of birth|male|female)\b/i;
  const backRegex = /\b(address|s\/o|d\/o|son of|daughter of|pin ?code|pincode)\b/i;

  // Helper: count matches
  const score = (text: string, regex: RegExp) => {
    const matches = text.match(new RegExp(regex, "gi"));
    return matches ? matches.length : 0;
  };

  const text1FrontScore = score(text1, frontRegex);
  const text1BackScore = score(text1, backRegex);

  const text2FrontScore = score(text2, frontRegex);
  const text2BackScore = score(text2, backRegex);

  // Determine based on scores
  if (text1FrontScore > text1BackScore && text2BackScore > text2FrontScore) {
    return { frontSideText: text1, backSideText: text2 };
  } else if (text2FrontScore > text2BackScore && text1BackScore > text1FrontScore) {
    return { frontSideText: text2, backSideText: text1 };
  } else {
    // eslint-disable-next-line no-console
    console.warn(
      "Could not reliably identify sides, defaulting. Samples:",
      text1.substring(0, 50),
      text2.substring(0, 50)
    );
    return { frontSideText: text1, backSideText: text2 };
  }
};

export default identifySides;

