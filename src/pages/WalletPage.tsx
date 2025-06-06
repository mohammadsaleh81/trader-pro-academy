import React, { useState, useEffect } from "react";
import Layout from "@/components/layout/Layout";
import { useData } from "@/contexts/DataContext";
import { useAuth } from "@/contexts/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import { Plus, Minus, ShoppingCart, ArrowUpCircle, AlertCircle } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { clearPendingCourse } from "@/lib/cache";
import api from "@/lib/axios";

const depositSchema = z.object({
  amount: z
    .number()
    .min(10000, "حداقل مبلغ شارژ ۱۰ هزار تومان است")
    .max(100000000, "حداکثر مبلغ شارژ ۱۰۰ میلیون تومان است"),
});

type DepositFormValues = z.infer<typeof depositSchema>;

// Helper functions for formatting Iranian currency
const formatCurrency = (amount: number | string): string => {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  return new Intl.NumberFormat('fa-IR').format(num);
};

const formatCurrencyWithUnit = (amount: number | string): string => {
  return `${formatCurrency(amount)} تومان`;
};

const formatLargeNumber = (amount: number | string): string => {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  
  if (num >= 1000000000) {
    return `${formatCurrency(Math.round(num / 1000000000))} میلیارد تومان`;
  } else if (num >= 1000000) {
    return `${formatCurrency(Math.round(num / 1000000))} میلیون تومان`;
  } else if (num >= 1000) {
    return `${formatCurrency(Math.round(num / 1000))} هزار تومان`;
  }
  return formatCurrencyWithUnit(num);
};

const WalletPage: React.FC = () => {
  const navigate = useNavigate();
  const { wallet, updateWallet, courses, enrollCourse, loadingStates, errors, refetchWallet } = useData();
  const { user, isLoading: authLoading } = useAuth();
  const [isDepositDialogOpen, setIsDepositDialogOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [pendingCourse, setPendingCourse] = useState<{id: string, price: number, title: string} | null>(null);

  const depositForm = useForm<DepositFormValues>({
    resolver: zodResolver(depositSchema),
    defaultValues: {
      amount: 0,
    },
  });
  
  // Check for pending course purchase
  useEffect(() => {
    const pendingCourseId = localStorage.getItem("pendingCourseId");
    if (pendingCourseId && courses && courses.length > 0) {
      const course = courses.find(c => c.id === pendingCourseId);
      if (course) {
        setPendingCourse({
          id: course.id,
          price: course.price,
          title: course.title
        });
        
        // If there's a pending course, auto-open deposit dialog with the required amount
        if (wallet && wallet.balance < course.price) {
          const requiredAmount = course.price - wallet.balance;
          depositForm.setValue("amount", requiredAmount);
          setIsDepositDialogOpen(true);
        }
      }
    }
  }, [courses, wallet?.balance, user?.id]); // Only essential dependencies

  const handleDeposit = async (values: DepositFormValues) => {
    if (!wallet || !user) return;
    
    setIsProcessing(true);
    
    try {
      // Call the payment gateway instead of direct deposit
      const response = await api.post('/wallet/deposit-gateway/', {
        amount: values.amount
      });
      
      const result = response.data;
      
      if (result.success && result.payment_url) {
        toast({
          title: "انتقال به درگاه پرداخت",
          description: "در حال انتقال به درگاه پرداخت...",
        });
        
        // Store the deposit amount for later reference
        localStorage.setItem('deposit_amount', values.amount.toString());
        
        // Redirect to payment gateway
        window.location.href = result.payment_url;
      } else {
        toast({
          title: "خطا در ایجاد درگاه پرداخت",
          description: result.error || "متأسفانه اتصال به درگاه پرداخت با مشکل مواجه شد",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error("Payment gateway error:", error);
      const errorMessage = error.response?.data?.error || "متأسفانه اتصال به درگاه پرداخت با مشکل مواجه شد";
      toast({
        title: "خطا در اتصال به درگاه",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRetry = () => {
    refetchWallet();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('fa-IR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case "deposit":
        return <ArrowUpCircle className="h-5 w-5 text-green-500" />;
      case "purchase":
        return <ShoppingCart className="h-5 w-5 text-trader-500" />;
      default:
        return <ArrowUpCircle className="h-5 w-5 text-gray-500" />;
    }
  };

  const getTransactionColor = (type: string) => {
    switch (type) {
      case "deposit":
        return "text-green-500";
      case "purchase":
        return "text-trader-500";
      default:
        return "text-gray-500";
    }
  };

  // Complete pending course purchase
  const handleCompletePurchase = async () => {
    if (!pendingCourse || !wallet) return;
    
    if (wallet.balance < pendingCourse.price) {
      toast({
        title: "موجودی ناکافی",
        description: "موجودی کیف پول شما برای خرید این دوره کافی نیست",
        variant: "destructive",
      });
      return;
    }

    setIsPurchasing(true);

    try {
      const enrollResponse = await api.post(`/crs/courses/${pendingCourse.id}/enroll/`, {
        course_id: parseInt(pendingCourse.id)
      });

      if (enrollResponse.status === 201) {
        clearPendingCourse();
        setPendingCourse(null);
        
        toast({
          title: "خرید موفق",
          description: `دوره "${pendingCourse.title}" با موفقیت خریداری شد`,
        });

        // Refresh wallet and navigate to course
        refetchWallet();
        navigate(`/learn/${pendingCourse.id}`);
      }
    } catch (error: any) {
      console.error('Error completing purchase:', error);
      
      let errorMessage = "خطا در خرید دوره";
      if (error.response?.status === 400) {
        const errorData = error.response.data;
        if (errorData?.course_id?.[0]) {
          errorMessage = errorData.course_id[0];
        } else if (errorData?.non_field_errors?.[0]) {
          errorMessage = errorData.non_field_errors[0];
        } else if (errorData?.detail) {
          errorMessage = errorData.detail;
        }
      } else if (error.response?.status === 409) {
        errorMessage = "شما قبلاً در این دوره ثبت‌نام کرده‌اید";
        clearPendingCourse();
        setPendingCourse(null);
      } else if (error.response?.status === 402) {
        errorMessage = "موجودی کیف پول شما برای خرید این دوره کافی نیست";
      }

      toast({
        title: "خطا در خرید",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsPurchasing(false);
    }
  };

  // Show loading if auth is still loading
  if (authLoading) {
    return (
      <Layout>
        <div className="trader-container py-12 text-center">
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-trader-500 mb-4"></div>
            <h2 className="text-xl font-bold mb-2">در حال بررسی احراز هویت...</h2>
            <p className="text-gray-600">لطفاً صبر کنید</p>
          </div>
        </div>
      </Layout>
    );
  }

  // Check authentication first
  if (!user) {
    return (
      <Layout>
        <div className="trader-container py-12 text-center">
          <h2 className="text-xl font-bold mb-4">برای مشاهده کیف پول خود ابتدا وارد شوید</h2>
          <Link to="/login" className="trader-btn-primary">
            ورود به حساب کاربری
          </Link>
        </div>
      </Layout>
    );
  }

  // Show loading if wallet is loading
  if (loadingStates.wallet) {
    return (
      <Layout>
        <div className="trader-container py-12 text-center">
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-trader-500 mb-4"></div>
            <h2 className="text-xl font-bold mb-2">در حال بارگذاری کیف پول...</h2>
            <p className="text-gray-600">لطفاً صبر کنید</p>
            {errors?.wallet && (
              <p className="text-amber-600 text-sm mt-2">
                در حال تلاش مجدد...
              </p>
            )}
          </div>
        </div>
      </Layout>
    );
  }

  // Show error if there's a wallet error
  if (errors?.wallet) {
    return (
      <Layout>
        <div className="trader-container py-12 text-center">
          <div className="flex flex-col items-center">
            <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
            <h2 className="text-xl font-bold mb-4 text-red-600">
              {errors.wallet}
            </h2>
            <p className="text-gray-600 mb-6">
              در صورت تداوم مشکل، لطفاً با پشتیبانی تماس بگیرید
            </p>
            <Button onClick={handleRetry} className="bg-trader-500 hover:bg-trader-600">
              تلاش مجدد
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  // Show error if wallet is null but no specific error
  if (!wallet) {
    return (
      <Layout>
        <div className="trader-container py-12 text-center">
          <div className="flex flex-col items-center">
            <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
            <h2 className="text-xl font-bold mb-4 text-red-600">
              خطا در بارگذاری اطلاعات کیف پول
            </h2>
            <p className="text-gray-600 mb-6">
              در صورت تداوم مشکل، لطفاً با پشتیبانی تماس بگیرید
            </p>
            <Button onClick={handleRetry} className="bg-trader-500 hover:bg-trader-600">
              تلاش مجدد
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="trader-container py-6">
        <h1 className="text-2xl font-bold mb-6">کیف پول</h1>
        
        {/* Pending Course Purchase Notice */}
        {pendingCourse && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
            <div className="flex items-center">
              <ShoppingCart className="h-6 w-6 text-amber-500 ml-3" />
              <div className="flex-1">
                <h3 className="font-bold">خرید در انتظار: {pendingCourse.title}</h3>
                <p className="text-sm mt-1">
                  قیمت دوره: <span className="font-bold">{formatCurrencyWithUnit(pendingCourse.price)}</span> | 
                  موجودی فعلی: <span className="font-bold">{formatCurrencyWithUnit(wallet.balance)}</span>
                </p>
                {wallet.balance < pendingCourse.price ? (
                  <p className="text-sm text-red-600 mt-1">
                    نیاز به شارژ: <span className="font-bold">{formatCurrencyWithUnit(pendingCourse.price - wallet.balance)}</span>
                  </p>
                ) : (
                  <p className="text-sm text-green-600 mt-1">
                    ✅ موجودی شما برای خرید این دوره کافی است
                  </p>
                )}
              </div>
              <div className="mr-auto flex gap-2">
                <Button 
                  onClick={() => navigate(`/courses/${pendingCourse.id}`)}
                  variant="outline"
                  size="sm"
                >
                  بازگشت به دوره
                </Button>
                {wallet.balance >= pendingCourse.price ? (
                  <Button 
                    onClick={handleCompletePurchase}
                    disabled={isPurchasing}
                    className="bg-green-600 hover:bg-green-700"
                    size="sm"
                  >
                    {isPurchasing ? "در حال خرید..." : "تکمیل خرید"}
                  </Button>
                ) : (
                  <Button 
                    onClick={() => setIsDepositDialogOpen(true)}
                    className="bg-green-600 hover:bg-green-700"
                    size="sm"
                  >
                    شارژ کیف پول
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}
        
        {/* Wallet Balance */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <p className="text-gray-500 mb-1">موجودی فعلی</p>
          <div className="flex flex-col">
            <h2 className="text-3xl font-bold text-trader-600 mb-1">{formatCurrency(wallet.balance)}</h2>
            <p className="text-lg text-gray-600">تومان</p>
            {wallet.balance >= 1000000 && (
              <p className="text-sm text-gray-500 mt-1">
                ({formatLargeNumber(wallet.balance)})
              </p>
            )}
          </div>
          
          <div className="flex mt-6 gap-3">
            <button 
              className="flex-1 trader-btn-primary flex items-center justify-center"
              onClick={() => setIsDepositDialogOpen(true)}
            >
              <Plus className="h-5 w-5 ml-1" />
              افزایش موجودی
            </button>
          </div>
        </div>

        {/* Transactions */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-xl font-bold mb-6">تاریخچه تراکنش‌ها</h3>
          
          <div className="space-y-4">
            {wallet.transactions && wallet.transactions.length > 0 ? (
              wallet.transactions.map((transaction, index) => (
                <div 
                  key={index}
                  className="flex items-center justify-between border-b border-gray-100 pb-4"
                >
                  <div className="flex items-center">
                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center ml-3">
                      {getTransactionIcon(transaction.transaction_type)}
                    </div>
                    <div>
                      <p className="font-medium">{transaction.description}</p>
                      <p className="text-gray-500 text-sm">{formatDate(transaction.created_at)}</p>
                    </div>
                  </div>
                  <div className="text-left">
                    <p className={`font-bold ${getTransactionColor(transaction.transaction_type)}`}>
                      {transaction.transaction_type === "purchase" ? "-" : "+"}
                      {formatCurrencyWithUnit(transaction.amount)}
                    </p>
                    <p className="text-sm text-gray-500">
                      مانده: {formatCurrencyWithUnit(transaction.balance_after)}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                هنوز هیچ تراکنشی انجام نشده است
              </div>
            )}
          </div>
        </div>
        
        {/* Deposit Dialog */}
        <Dialog open={isDepositDialogOpen} onOpenChange={setIsDepositDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>افزایش موجودی کیف پول</DialogTitle>
            </DialogHeader>
            
            <Form {...depositForm}>
              <form onSubmit={depositForm.handleSubmit(handleDeposit)} className="space-y-4 py-4">
                <FormField
                  control={depositForm.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>مبلغ (تومان)</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <input
                            type="number"
                            min="10000"
                            step="10000"
                            className="flex h-10 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-trader-500"
                            placeholder="مبلغ مورد نظر را وارد کنید (حداقل ۱۰ هزار تومان)"
                            {...field}
                            onChange={(e) => field.onChange(Number(e.target.value))}
                          />
                        </div>
                      </FormControl>
                      
                      {/* Quick amount buttons */}
                      <div className="grid grid-cols-3 gap-2 mt-2">
                        <button
                          type="button"
                          onClick={() => field.onChange(50000)}
                          className="px-3 py-1 text-xs border border-gray-300 rounded hover:bg-gray-100 transition-colors"
                        >
                          ۵۰ هزار
                        </button>
                        <button
                          type="button"
                          onClick={() => field.onChange(100000)}
                          className="px-3 py-1 text-xs border border-gray-300 rounded hover:bg-gray-100 transition-colors"
                        >
                          ۱۰۰ هزار
                        </button>
                        <button
                          type="button"
                          onClick={() => field.onChange(500000)}
                          className="px-3 py-1 text-xs border border-gray-300 rounded hover:bg-gray-100 transition-colors"
                        >
                          ۵۰۰ هزار
                        </button>
                      </div>
                      
                      {/* Amount adjustment buttons */}
                      <div className="flex items-center justify-center gap-4 mt-3">
                        <button
                          type="button"
                          onClick={() => {
                            const newAmount = Math.max(10000, (field.value || 0) - 10000);
                            field.onChange(newAmount);
                          }}
                          className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                        <span className="text-sm text-gray-600 px-2">+ / - ۱۰ هزار تومان</span>
                        <button
                          type="button"
                          onClick={() => {
                            const newAmount = (field.value || 0) + 10000;
                            field.onChange(newAmount);
                          }}
                          className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>

                      {field.value > 0 && (
                        <p className="text-sm text-blue-600 mt-2">
                          مبلغ وارد شده: {formatCurrencyWithUnit(field.value)}
                        </p>
                      )}
                      {pendingCourse && wallet.balance < pendingCourse.price && (
                        <p className="text-sm text-green-600">
                          حداقل مبلغ پیشنهادی: {formatCurrencyWithUnit(pendingCourse.price - wallet.balance)}
                          جهت خرید دوره
                        </p>
                      )}
                      <p className="text-sm text-gray-500">موجودی فعلی: {formatCurrencyWithUnit(wallet.balance)}</p>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <DialogFooter className="flex justify-between sm:justify-between gap-2">
                  <Button type="button" variant="outline" onClick={() => setIsDepositDialogOpen(false)}>
                    انصراف
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={!depositForm.formState.isValid || isProcessing}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    {isProcessing ? "در حال پردازش..." : "پرداخت و شارژ کیف پول"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
};

export default WalletPage;
