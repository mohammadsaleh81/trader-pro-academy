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

const depositSchema = z.object({
  amount: z
    .number()
    .min(10000, "حداقل مبلغ شارژ ۱۰,۰۰۰ تومان است")
    .max(100000000, "حداکثر مبلغ شارژ ۱۰۰,۰۰۰,۰۰۰ تومان است"),
});

type DepositFormValues = z.infer<typeof depositSchema>;

const WalletPage: React.FC = () => {
  const navigate = useNavigate();
  const { wallet, updateWallet, courses, enrollCourse, isLoading: dataLoading } = useData();
  const { user } = useAuth();
  const [isDepositDialogOpen, setIsDepositDialogOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [pendingCourse, setPendingCourse] = useState<{id: string, price: number, title: string} | null>(null);
  const [walletError, setWalletError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

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
  }, [courses, wallet]);

  // Handle wallet loading errors
  useEffect(() => {
    if (dataLoading) {
      setWalletError("خطا در بارگذاری اطلاعات کیف پول. لطفاً صفحه را رفرش کنید.");
    } else {
      setWalletError(null);
    }
  }, [dataLoading]);

  const handleDeposit = async (values: DepositFormValues) => {
    if (!wallet || !user) return;
    
    setIsProcessing(true);
    
    try {
      const result = await updateWallet(values.amount);
      
      if (result.success && result.new_balance !== undefined) {
        toast({
          title: "شارژ موفق",
          description: `مبلغ ${values.amount.toLocaleString()} تومان با موفقیت به کیف پول شما اضافه شد`,
        });
        
        // Check if there's a pending course purchase
        if (pendingCourse && result.new_balance >= pendingCourse.price) {
          toast({
            title: "خرید دوره",
            description: "در حال پردازش خرید دوره...",
          });
          
          // Redirect to course page to complete the purchase
          navigate(`/courses/${pendingCourse.id}`);
        }
        
        setIsDepositDialogOpen(false);
        depositForm.reset();
      } else {
        toast({
          title: "خطا در پرداخت",
          description: result.error || "متأسفانه پرداخت با مشکل مواجه شد. لطفاً دوباره تلاش کنید",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Wallet deposit error:", error);
      toast({
        title: "خطا در پرداخت",
        description: "متأسفانه پرداخت با مشکل مواجه شد. لطفاً دوباره تلاش کنید",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRetry = () => {
    window.location.reload();
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

  if (dataLoading) {
    return (
      <Layout>
        <div className="trader-container py-12 text-center">
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-trader-500 mb-4"></div>
            <h2 className="text-xl font-bold mb-2">در حال بارگذاری...</h2>
            <p className="text-gray-600">لطفاً صبر کنید</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (walletError || !wallet) {
    return (
      <Layout>
        <div className="trader-container py-12 text-center">
          <div className="flex flex-col items-center">
            <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
            <h2 className="text-xl font-bold mb-4 text-red-600">
              {walletError || "خطا در بارگذاری اطلاعات کیف پول"}
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
              <div>
                <h3 className="font-bold">خرید در انتظار: {pendingCourse.title}</h3>
                <p className="text-sm mt-1">
                  قیمت دوره: <span className="font-bold">{pendingCourse.price.toLocaleString()} تومان</span> | 
                  موجودی فعلی: <span className="font-bold">{wallet.balance.toLocaleString()} تومان</span>
                </p>
                {wallet.balance < pendingCourse.price && (
                  <p className="text-sm text-red-600 mt-1">
                    نیاز به شارژ: <span className="font-bold">{(pendingCourse.price - wallet.balance).toLocaleString()} تومان</span>
                  </p>
                )}
              </div>
              <div className="mr-auto">
                <Button 
                  onClick={() => navigate(`/courses/${pendingCourse.id}`)}
                  variant="outline"
                  className="ml-2"
                >
                  بازگشت به دوره
                </Button>
                <Button 
                  onClick={() => setIsDepositDialogOpen(true)}
                  className="bg-green-600 hover:bg-green-700"
                >
                  شارژ کیف پول
                </Button>
              </div>
            </div>
          </div>
        )}
        
        {/* Wallet Balance */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <p className="text-gray-500 mb-1">موجودی فعلی</p>
          <h2 className="text-3xl font-bold">{wallet.balance.toLocaleString()} تومان</h2>
          
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
                      {parseFloat(transaction.amount).toLocaleString()} تومان
                    </p>
                    <p className="text-sm text-gray-500">
                      مانده: {parseFloat(transaction.balance_after).toLocaleString()} تومان
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
                        <input
                          type="number"
                          className="flex h-10 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-trader-500"
                          placeholder="مبلغ مورد نظر را وارد کنید"
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                      </FormControl>
                      {pendingCourse && wallet.balance < pendingCourse.price && (
                        <p className="text-sm text-green-600">
                          حداقل مبلغ پیشنهادی: {(pendingCourse.price - wallet.balance).toLocaleString()} تومان
                          جهت خرید دوره
                        </p>
                      )}
                      <p className="text-sm text-gray-500">موجودی فعلی: {wallet.balance.toLocaleString()} تومان</p>
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
