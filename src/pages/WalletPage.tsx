import React, { useState, useEffect } from "react";
import Layout from "@/components/layout/Layout";
import { useData } from "@/contexts/DataContext";
import { useAuth } from "@/contexts/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import { Plus, Minus, ShoppingCart } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { idToString } from "@/utils/idConverter";

// Define a mock payment function (in a real app, this would be an API call)
const mockPayment = (amount: number): Promise<{success: boolean}> => {
  return new Promise((resolve) => {
    // Simulate API delay
    setTimeout(() => {
      // Always succeed in this mock version
      resolve({success: true});
    }, 1500);
  });
};

const withdrawalSchema = z.object({
  amount: z
    .number()
    .min(10000, "حداقل مبلغ برداشت ۱۰,۰۰۰ تومان است")
    .max(100000000, "حداکثر مبلغ برداشت ۱۰۰,۰۰۰,۰۰۰ تومان است"),
});

const depositSchema = z.object({
  amount: z
    .number()
    .min(10000, "حداقل مبلغ شارژ ۱۰,۰۰۰ تومان است")
    .max(100000000, "حداکثر مبلغ شارژ ۱۰۰,۰۰۰,۰۰۰ تومان است"),
});

type WithdrawalFormValues = z.infer<typeof withdrawalSchema>;
type DepositFormValues = z.infer<typeof depositSchema>;

const WalletPage: React.FC = () => {
  const navigate = useNavigate();
  const { wallet, updateWallet, courses, enrollCourse } = useData();
  const { user } = useAuth();
  const [isWithdrawalDialogOpen, setIsWithdrawalDialogOpen] = useState(false);
  const [isDepositDialogOpen, setIsDepositDialogOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [pendingCourse, setPendingCourse] = useState<{id: string, price: number, title: string} | null>(null);

  const withdrawalForm = useForm<WithdrawalFormValues>({
    resolver: zodResolver(withdrawalSchema),
    defaultValues: {
      amount: 0,
    },
  });

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
        const requiredAmount = course.price - (wallet?.balance || 0);
        if (requiredAmount > 0) {
          depositForm.setValue("amount", requiredAmount);
          setIsDepositDialogOpen(true);
        }
      }
    }
  }, [courses, wallet]);

  const handleWithdrawal = (values: WithdrawalFormValues) => {
    if (!wallet) return;
    
    if (values.amount > wallet.balance) {
      toast({
        title: "خطا در برداشت",
        description: "مبلغ درخواستی بیشتر از موجودی شما است",
        variant: "destructive",
      });
      return;
    }

    // In a real app, this would be an API call to process the withdrawal
    console.log("Processing withdrawal:", values);
    
    const newTransaction = {
      id: Date.now().toString(),
      amount: values.amount,
      type: "withdrawal" as const,
      description: "برداشت از کیف پول",
      date: new Date().toLocaleDateString("fa-IR"),
    };
    
    updateWallet(wallet.balance - values.amount, [...wallet.transactions, newTransaction]);
    
    toast({
      title: "برداشت موفق",
      description: `مبلغ ${values.amount.toLocaleString()} تومان با موفقیت برداشت شد`,
    });
    
    setIsWithdrawalDialogOpen(false);
    withdrawalForm.reset();
  };

  const handleDeposit = async (values: DepositFormValues) => {
    if (!wallet || !user) return;
    
    setIsProcessing(true);
    
    try {
      // In a real app, this would redirect to a payment gateway
      const result = await mockPayment(values.amount);
      
      if (result.success) {
        const newTransaction = {
          id: Date.now().toString(),
          amount: values.amount,
          type: "deposit" as const,
          description: "شارژ کیف پول",
          date: new Date().toLocaleDateString("fa-IR"),
        };
        
        updateWallet(wallet.balance + values.amount, [...wallet.transactions, newTransaction]);
        
        toast({
          title: "شارژ موفق",
          description: `مبلغ ${values.amount.toLocaleString()} تومان با موفقیت به کیف پول شما اضافه شد`,
        });
        
        // Check if there's a pending course purchase
        if (pendingCourse && (wallet.balance + values.amount) >= pendingCourse.price) {
          // Process the course purchase
          const purchaseTransaction = {
            id: (Date.now() + 1).toString(), // Ensure unique ID
            amount: pendingCourse.price,
            type: "purchase" as const,
            description: `خرید دوره ${pendingCourse.title}`,
            date: new Date().toLocaleDateString("fa-IR"),
          };
          
          // Update wallet again with the purchase
          const newBalance = wallet.balance + values.amount - pendingCourse.price;
          updateWallet(newBalance, [...wallet.transactions, newTransaction, purchaseTransaction]);
          
          // Enroll in the course
          enrollCourse(pendingCourse.id, user.id);
          
          // Clear the pending course
          localStorage.removeItem("pendingCourseId");
          
          toast({
            title: "خرید موفق",
            description: `دوره ${pendingCourse.title} با موفقیت خریداری شد`,
          });
          
          // Redirect to my courses
          setTimeout(() => {
            navigate("/my-courses");
          }, 1000);
        } else if (pendingCourse) {
          // If balance is still insufficient, return to course page
          toast({
            title: "بازگشت به صفحه دوره",
            description: "موجودی کیف پول شما هنوز برای خرید دوره کافی نیست",
          });
          
          setTimeout(() => {
            navigate(`/courses/${pendingCourse.id}`);
          }, 1000);
        }
        
        setIsDepositDialogOpen(false);
        depositForm.reset();
      } else {
        toast({
          title: "خطا در پرداخت",
          description: "متأسفانه پرداخت با مشکل مواجه شد. لطفاً دوباره تلاش کنید",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "خطا در پرداخت",
        description: "متأسفانه پرداخت با مشکل مواجه شد. لطفاً دوباره تلاش کنید",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
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

  if (!wallet) {
    return (
      <Layout>
        <div className="trader-container py-12 text-center">
          <h2 className="text-xl font-bold mb-4">خطا در بارگذاری اطلاعات کیف پول</h2>
        </div>
      </Layout>
    );
  }

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case "deposit":
        return <Plus className="h-5 w-5 text-green-500" />;
      case "withdrawal":
        return <Minus className="h-5 w-5 text-red-500" />;
      case "purchase":
        return <ShoppingCart className="h-5 w-5 text-trader-500" />;
      default:
        return null;
    }
  };

  const getTransactionColor = (type: string) => {
    switch (type) {
      case "deposit":
        return "text-green-500";
      case "withdrawal":
        return "text-red-500";
      case "purchase":
        return "text-trader-500";
      default:
        return "";
    }
  };

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
            <button 
              className="flex-1 trader-btn-outline flex items-center justify-center"
              onClick={() => setIsWithdrawalDialogOpen(true)}
            >
              <Minus className="h-5 w-5 ml-1" />
              برداشت
            </button>
          </div>
        </div>
        
        {/* Transactions */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-xl font-bold mb-4">تاریخچه تراکنش‌ها</h3>
          
          <div className="space-y-4">
            {wallet.transactions.map((transaction) => (
              <div 
                key={transaction.id}
                className="flex items-center justify-between border-b border-gray-100 pb-4"
              >
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center ml-3">
                    {getTransactionIcon(transaction.type)}
                  </div>
                  <div>
                    <p className="font-medium">{transaction.description}</p>
                    <p className="text-gray-500 text-sm">{transaction.date}</p>
                  </div>
                </div>
                <p className={`font-bold ${getTransactionColor(transaction.type)}`}>
                  {transaction.type === "withdrawal" || transaction.type === "purchase" ? "-" : "+"}
                  {transaction.amount.toLocaleString()} تومان
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Withdrawal Dialog */}
        <Dialog open={isWithdrawalDialogOpen} onOpenChange={setIsWithdrawalDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>برداشت از کیف پول</DialogTitle>
            </DialogHeader>
            
            <Form {...withdrawalForm}>
              <form onSubmit={withdrawalForm.handleSubmit(handleWithdrawal)} className="space-y-4 py-4">
                <FormField
                  control={withdrawalForm.control}
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
                      <p className="text-sm text-gray-500">موجودی فعلی: {wallet.balance.toLocaleString()} تومان</p>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <DialogFooter className="flex justify-between sm:justify-between gap-2">
                  <Button type="button" variant="outline" onClick={() => setIsWithdrawalDialogOpen(false)}>
                    انصراف
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={!withdrawalForm.formState.isValid || withdrawalForm.getValues().amount > wallet.balance}
                  >
                    تایید برداشت
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
        
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
