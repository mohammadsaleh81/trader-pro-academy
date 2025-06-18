# سیستم ظرفیت محدود در خرید دوره‌ها

این سند نحوه پیاده‌سازی سیستم ظرفیت محدود در خرید دوره‌ها را توضیح می‌دهد.

## تغییرات اعمال شده

### 1. به‌روزرسانی Types

#### `src/types/course.ts`
فیلدهای جدید به انواع `Course` و `CourseDetails` اضافه شده:

```typescript
// New capacity fields
has_capacity_limit?: boolean;
capacity?: number;
available_spots?: number;
is_full?: boolean;
student_count?: number;
```

#### `src/lib/api.ts`
فیلدهای جدید به interface `Course` و mapping در `coursesApi` اضافه شده.

### 2. Utility Functions

#### `src/lib/utils.ts`
توابع جدید برای مدیریت ظرفیت:

```typescript
/**
 * Get capacity status for a course
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
```

### 3. به‌روزرسانی کامپوننت‌ها

#### `src/components/course/CourseCard.tsx`
- نمایش وضعیت ظرفیت با badge رنگی
- نمایش اطلاعات ظرفیت در کارت دوره
- غیرفعال کردن دکمه خرید در صورت تکمیل بودن ظرفیت
- چک کردن ظرفیت قبل از خرید
- نمایش progress bar برای درصد پر شدن دوره

#### `src/components/course/CourseInfoCard.tsx`
- نمایش وضعیت ظرفیت در کارت اطلاعات دوره
- غیرفعال کردن دکمه خرید در صورت تکمیل بودن ظرفیت
- نمایش اطلاعات تفصیلی ظرفیت

#### `src/pages/CourseDetailPage.tsx`
- چک کردن ظرفیت قبل از خرید
- چک کردن ظرفیت قبل از ثبت‌نام در دوره‌های رایگان
- مدیریت خطاهای مربوط به ظرفیت

#### `src/pages/WalletPage.tsx`
- چک کردن ظرفیت قبل از تکمیل خرید معلق
- مدیریت خطاهای مربوط به ظرفیت

#### `src/pages/PaymentVerifyPage.tsx`
- چک کردن ظرفیت قبل از تکمیل خرید بعد از شارژ کیف پول
- مدیریت خطاهای مربوط به ظرفیت

### 4. صفحه تست

#### `src/pages/CapacityTestPage.tsx`
صفحه تست برای نمایش قابلیت‌های سیستم ظرفیت محدود با سناریوهای مختلف.

## ویژگی‌های پیاده‌سازی شده

### 1. نمایش وضعیت ظرفیت
- **سبز**: بدون محدودیت ظرفیت یا ظرفیت خالی
- **آبی**: ظرفیت محدود با جای خالی
- **نارنجی**: ظرفیت تقریباً پر (بیش از 80%)
- **قرمز**: ظرفیت تکمیل شده

### 2. چک کردن قبل از خرید
سیستم قبل از هر عملیات خرید، ظرفیت دوره را بررسی می‌کند:
1. چک کردن ظرفیت دوره
2. چک کردن احراز هویت (اگر نیاز باشد)
3. چک کردن موجودی کیف پول
4. پردازش خرید

### 3. مدیریت خطاها
خطاهای مربوط به ظرفیت از سرور دریافت شده و با پیام‌های مناسب فارسی نمایش داده می‌شود:

```json
{
  "non_field_errors": [
    "ظرفیت این دوره تکمیل شده است. لطفاً دوره‌های دیگر را بررسی کنید."
  ]
}
```

### 4. UI/UX بهبود یافته
- نمایش درصد پر شدن دوره با progress bar
- رنگ‌بندی مناسب برای وضعیت‌های مختلف
- غیرفعال کردن دکمه‌ها در صورت عدم امکان خرید
- نمایش اطلاعات تفصیلی ظرفیت

## نحوه استفاده

### 1. در کامپوننت‌ها
```typescript
import { getCapacityStatus, canPurchaseCourse } from "@/lib/utils";

const capacityStatus = getCapacityStatus(course);
const canPurchase = canPurchaseCourse(course);

// نمایش وضعیت
<Badge className={`${capacityStatus.color === 'red' ? 'bg-red-100' : 'bg-green-100'}`}>
  {capacityStatus.text}
</Badge>

// چک کردن قبل از خرید
if (!canPurchase) {
  toast({
    title: "ظرفیت تکمیل شده",
    description: "ظرفیت این دوره تکمیل شده است.",
    variant: "destructive",
  });
  return;
}
```

### 2. در API Calls
```typescript
// خطاهای مربوط به ظرفیت از سرور دریافت می‌شود
if (error.response?.status === 400) {
  const errorData = error.response.data;
  if (errorData?.non_field_errors?.[0]) {
    // نمایش پیام خطای ظرفیت
    toast({
      title: "خطا",
      description: errorData.non_field_errors[0],
      variant: "destructive",
    });
  }
}
```

## تست کردن

برای تست کردن سیستم، می‌توانید از صفحه تست استفاده کنید:

```
/capacity-test
```

این صفحه سناریوهای مختلف ظرفیت را نمایش می‌دهد:
- دوره بدون محدودیت
- دوره با ظرفیت خالی
- دوره با ظرفیت تقریباً پر
- دوره با ظرفیت تکمیل شده

## نکات مهم

1. **Backward Compatibility**: سیستم با دوره‌های موجود که فیلدهای ظرفیت ندارند سازگار است
2. **Error Handling**: خطاهای مربوط به ظرفیت به درستی مدیریت می‌شود
3. **User Experience**: پیام‌های مناسب و راهنمایی‌های کاربری ارائه می‌شود
4. **Performance**: چک کردن ظرفیت قبل از ارسال درخواست به سرور انجام می‌شود

## آینده‌نگری

برای بهبود بیشتر سیستم، موارد زیر پیشنهاد می‌شود:

1. **Real-time Updates**: به‌روزرسانی لحظه‌ای وضعیت ظرفیت
2. **Waitlist**: سیستم لیست انتظار برای دوره‌های پر
3. **Notifications**: اطلاع‌رسانی به کاربران در صورت آزاد شدن ظرفیت
4. **Analytics**: گزارش‌گیری از وضعیت ظرفیت دوره‌ها 