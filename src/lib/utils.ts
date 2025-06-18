import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('fa-IR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  } catch (error) {
    return dateString;
  }
}

// Helper function to format author field
export function formatAuthor(author: any): string {
  if (typeof author === 'string') {
    return author;
  }
  if (typeof author === 'object' && author !== null) {
    if (author.first_name && author.last_name) {
      return `${author.first_name} ${author.last_name}`;
    }
    if (author.first_name) {
      return author.first_name;
    }
    if (author.username) {
      return author.username;
    }
    if (author.email) {
      return author.email;
    }
  }
  return "نویسنده";
}

// Helper function to format start time for livestreams
export function formatStartTime(startAt: string | null): string {
  if (!startAt) return "زمان شروع مشخص نشده";
  
  try {
    const date = new Date(startAt);
    return date.toLocaleString('fa-IR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (error) {
    return startAt;
  }
}

// Helper function to get time until start for livestreams
export function getTimeUntilStart(startAt: string | null): string | null {
  if (!startAt) return null;
  
  try {
    const startTime = new Date(startAt);
    const now = new Date();
    const diff = startTime.getTime() - now.getTime();
    
    if (diff <= 0) return null;
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (days > 0) {
      return `${days} روز و ${hours} ساعت دیگر`;
    } else if (hours > 0) {
      return `${hours} ساعت و ${minutes} دقیقه دیگر`;
    } else {
      return `${minutes} دقیقه دیگر`;
    }
  } catch (error) {
    return null;
  }
}

/**
 * Check if course requires identity verification and handle user flow
 * @param course - Course object with requires_identity_verification field
 * @param user - User object with identity_verified field
 * @param navigate - Navigation function
 * @param toast - Toast function
 * @returns true if purchase can proceed, false if blocked
 */
export const checkIdentityVerificationForPurchase = (
  course: { requires_identity_verification?: boolean; title?: string },
  user: { identity_verified?: boolean } | null,
  navigate: (path: string) => void,
  toast: (options: { title: string; description: string; variant?: "default" | "destructive" | "success" | "info" | "warning" }) => void
): boolean => {
  // If course doesn't require identity verification, proceed
  if (!course.requires_identity_verification) {
    return true;
  }

  // If user is not authenticated, redirect to login
  if (!user) {
    toast({
      title: "نیاز به ورود",
      description: "برای خرید این دوره ابتدا وارد شوید",
      variant: "destructive",
    });
    navigate("/login");
    return false;
  }

  // If user is not identity verified, show error and redirect to verification
  if (!user.identity_verified) {
    toast({
      title: "نیاز به احراز هویت",
      description: "برای خرید این دوره نیاز به احراز هویت دارید. لطفاً ابتدا احراز هویت خود را تکمیل کنید.",
      variant: "destructive",
    });
    navigate("/identity-verification");
    return false;
  }

  // User is verified, proceed with purchase
  return true;
};

/**
 * Get capacity status for a course
 * @param course - Course object with capacity fields
 * @returns Object with text and color for capacity status
 */
export const getCapacityStatus = (course: {
  has_capacity_limit?: boolean;
  capacity?: number;
  available_spots?: number;
  is_full?: boolean;
}) => {
  if (!course.has_capacity_limit) {
    return { text: "بدون محدودیت", color: "green" as const };
  }
  
  if (course.is_full) {
    return { text: "ظرفیت تکمیل شده", color: "red" as const };
  }
  
  if (course.available_spots !== undefined && course.capacity !== undefined) {
    const percentage = ((course.capacity - course.available_spots) / course.capacity) * 100;
    if (percentage > 80) {
      return { text: `${course.available_spots} جای خالی`, color: "orange" as const };
    }
    
    return { text: `${course.available_spots} جای خالی`, color: "blue" as const };
  }
  
  return { text: "ظرفیت محدود", color: "blue" as const };
};

/**
 * Check if course can be purchased based on capacity
 * @param course - Course object with capacity fields
 * @returns true if course can be purchased, false if blocked
 */
export const canPurchaseCourse = (course: {
  has_capacity_limit?: boolean;
  is_full?: boolean;
}): boolean => {
  if (!course.has_capacity_limit) {
    return true;
  }
  
  return !course.is_full;
};
