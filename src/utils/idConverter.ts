
/**
 * Utility function to convert ID values to strings
 * This helps solve TypeScript errors with ID types (string | number)
 */
export const idToString = (id: string | number): string => {
  return String(id);
};
