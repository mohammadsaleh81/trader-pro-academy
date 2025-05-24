
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(dateString: string): string {
  if (!dateString) return "";
  
  try {
    // Handle possible ISO date strings or plain date strings
    let date: Date;
    if (dateString.includes('T')) {
      // ISO format
      date = new Date(dateString);
    } else {
      // Simple date format (YYYY-MM-DD)
      const [year, month, day] = dateString.split('-').map(Number);
      date = new Date(year, month - 1, day); // month is 0-indexed in JS Date
    }
    
    // Convert to Persian date format
    return new Intl.DateTimeFormat('fa-IR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(date);
  } catch (error) {
    console.error("Error formatting date:", error);
    return dateString;
  }
}

// Function to extract date from various formats
export function extractDate(item: any): string {
  if (!item) return "";
  
  if (item.date) return item.date;
  if (item.published_at) return formatDate(item.published_at.split('T')[0]);
  if (item.created_at) return formatDate(item.created_at.split('T')[0]);
  
  return "";
}

// Function to extract author information
export function extractAuthor(item: any): string {
  if (!item || !item.author) return "نویسنده ناشناس";
  
  if (typeof item.author === 'string') return item.author;
  
  if (typeof item.author === 'object') {
    if (item.author.first_name || item.author.last_name) {
      return `${item.author.first_name || ''} ${item.author.last_name || ''}`.trim();
    }
    if (item.author.name) return item.author.name;
  }
  
  return "نویسنده ناشناس";
}

