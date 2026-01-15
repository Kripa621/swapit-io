export const getEstimatedValue = (category, condition) => {
  const baseValues = {
    Electronics: 5000,
    Books: 1000,
    "Educational Materials": 1200,
    Hardware: 3000,
    Fashion: 2000,
    Toys: 1500,
    Others: 1000
  };

  const conditionMultiplier = {
    New: 1.0,
    "Like New": 0.9,
    "Gently Used": 0.8,
    Functional: 0.6
  };

  const base = baseValues[category] || 1000;
  const multiplier = conditionMultiplier[condition] || 0.7;

  return Math.round(base * multiplier);
};
