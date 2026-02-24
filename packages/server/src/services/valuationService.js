export const getEstimatedValue = (category, condition, originalPrice) => {
  const conditionFactor = {
    "New": 0.9,
    "Like New": 0.8,
    "Gently Used": 0.6,
    "Functional": 0.4
  };

  // Default to 0.4 if condition not found
  const factor = conditionFactor[condition] || 0.4;
  
  // Ensure originalPrice is a valid number; default to 0 if missing
  const price = originalPrice || 0;

  let estimatedValue = price * factor;

  // Apply -10% depreciation for Electronics
  if (category === "Electronics") {
    estimatedValue = estimatedValue * 0.9;
  }

  // Return rounded integer
  return Math.round(estimatedValue);
};