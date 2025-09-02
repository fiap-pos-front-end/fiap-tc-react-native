// Curated set of emoji icons that render consistently across all devices
// These icons are carefully selected to work well on both iOS and Android

export const CATEGORY_ICONS = [
  '🏠', // House
  '🍽️', // Fork and knife with plate
  '🚗', // Automobile
  '🎮', // Video game
  '🛒', // Shopping cart
  '💊', // Pill
  '🎬', // Clapper board
  '✈️', // Airplane
  '🏥', // Hospital
  '🎓', // Graduation cap
  '💇', // Haircut
  '🎨', // Artist palette
  '⚡', // High voltage
  '📱', // Mobile phone
  '🏦', // Bank
  '🚌', // Bus
  '🚇', // Metro
  '🛍️', // Shopping bags
  '🎭', // Performing arts
  '🏊', // Swimmer
  '💰', // Money bag
  '💼', // Briefcase
  '📈', // Chart increasing
  '💵', // Dollar banknote
  '🏆', // Trophy
  '🎯', // Direct hit
  '⭐', // Star
  '💎', // Gem stone
  '🎁', // Wrapped gift
  '🔋', // Battery
  '📊', // Bar chart
  '🎪', // Circus tent
  '🏅', // Sports medal
  '💡', // Light bulb
  '🚀', // Rocket
  '📚', // Books
  '🎵', // Musical note
  '🌱', // Seedling
] as const;

// Get a random icon (useful for defaults)
export const getRandomIcon = () => {
  const randomIndex = Math.floor(Math.random() * CATEGORY_ICONS.length);
  return CATEGORY_ICONS[randomIndex];
};
