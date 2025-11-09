// utils/menuCalculations.ts

import { DetailMenu, Stok } from '@/lib/types';

/**
 * Calculate how many units of a menu can be produced based on available stock
 * @param ingredients - Array of required ingredients with quantities
 * @param stockData - Array of available stock items
 * @returns Maximum number of menu items that can be produced
 */
export function calculateAvailableMenuQuantity(
  ingredients: DetailMenu[],
  stockData: Stok[]
): number {
  if (ingredients.length === 0) {
    return 0;
  }
  
  const quantities = ingredients.map(ingredient => {
    const stock = stockData.find(s => s.ID_Stok === ingredient.ID_Stok);
    
    if (!stock || ingredient.Jumlah_Dibutuhkan === 0) {
      return 0;
    }
    
    // Calculate how many times we can make this menu with this ingredient
    return Math.floor(stock.Jumlah / ingredient.Jumlah_Dibutuhkan);
  });
  
  // The limiting ingredient determines max producible quantity
  return Math.min(...quantities);
}

/**
 * Calculate total cost of ingredients for one unit of menu
 * @param ingredients - Array of required ingredients
 * @param stockData - Array of available stock items
 * @returns Total ingredient cost
 */
export function calculateIngredientCost(
  ingredients: DetailMenu[],
  stockData: Stok[]
): number {
  return ingredients.reduce((total, ingredient) => {
    const stock = stockData.find(s => s.ID_Stok === ingredient.ID_Stok);
    
    if (!stock) return total;
    
    // Cost per unit * quantity needed
    const cost = stock.Harga_Beli * ingredient.Jumlah_Dibutuhkan;
    return total + cost;
  }, 0);
}