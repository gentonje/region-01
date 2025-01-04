export const PRODUCT_CONSTANTS = {
  SELECT_CATEGORY: "Select a category",
  CHOOSE_IMAGE: "Choose Image",
  UPLOADING: "Uploading...",
  MAIN_IMAGE: "Main Product Image",
  ADDITIONAL_IMAGE: "Additional Image",
  MAX_ADDITIONAL_IMAGES: 4,
  STOCK_STATUS: {
    IN_STOCK: "In Stock",
    OUT_OF_STOCK: "Out of Stock"
  }
} as const;

export const PRODUCT_COLORS = {
  starActive: "text-yellow-400 fill-yellow-400",
  starInactive: "text-gray-300",
  title: "text-gray-800",
  description: "text-gray-600",
  inStock: {
    bg: "bg-green-100",
    text: "text-green-800"
  },
  outOfStock: {
    bg: "bg-red-100",
    text: "text-red-800"
  }
} as const;