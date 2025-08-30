// Curated set of emoji icons that render consistently across all devices
// These icons are carefully selected to work well on both iOS and Android

import { TransactionType } from "@/types";

export const CATEGORY_ICONS = {
  EXPENSE: [
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
  ],

  INCOME: [
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
    '🎨', // Artist palette (can be used for both)
    '📚', // Books
    '🎵', // Musical note
    '🌱', // Seedling
    '🎯', // Direct hit
  ],

  // Universal icons (can be used for both types)
  UNIVERSAL: [
    '📊', // Bar chart
    '🎯', // Target
    '🔧', // Wrench
    '📱', // Mobile phone
    '💻', // Laptop computer
    '📝', // Memo
  ]
} as const;

// Flatten all icons into a single array for easy selection
export const ALL_ICONS = [
  ...CATEGORY_ICONS.EXPENSE,
  ...CATEGORY_ICONS.INCOME,
  ...CATEGORY_ICONS.UNIVERSAL
];

// Get icons by transaction type
export const getIconsByType = (type: TransactionType) => {
  if (type === TransactionType.INCOME) {
    return [...CATEGORY_ICONS.INCOME, ...CATEGORY_ICONS.UNIVERSAL];
  } else {
    return [...CATEGORY_ICONS.EXPENSE, ...CATEGORY_ICONS.UNIVERSAL];
  }
};

// Get a random icon for a given type (useful for defaults)
export const getRandomIcon = (type: TransactionType) => {
  const icons = getIconsByType(type);
  const randomIndex = Math.floor(Math.random() * icons.length);
  return icons[randomIndex];
};
