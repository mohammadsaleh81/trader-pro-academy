
import React, { useState } from "react";
import Layout from "@/components/layout/Layout";
import { useData } from "@/contexts/DataContext";
import { useAuth } from "@/contexts/AuthContext";
import { Link } from "react-router-dom";
import { Plus, Minus, ShoppingCart } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const withdrawalSchema = z.object({
  amount: z
    .number()
    .min(10000, "حداقل مبلغ برداشت ۱۰,۰۰۰ تومان است")
    .max(100000000, "حداکثر مبلغ برداشت ۱۰۰,۰۰۰,۰۰۰ تومان است"),
});

type WithdrawalFormValues = z.infer<typeof withdrawalSchema>;

const WalletPage: React.FC = () => {
  const { wallet } = useData();
  const { user } = useAuth();
  const [isWithdrawalDialogOpen, setIsWithdrawalDialogOpen] = useState(false);

  const form = useForm<WithdrawalFormValues>({
    resolver: zodResolver(withdrawalSchema),
    defaultValues: {
      amount: 0,
    },
  });

  const handleWithdrawal = (values: WithdrawalFormValues) => {
    if (values.amount > wallet?.balance) {
      toast({
        title: "خطا در برداشت",
        description: "مبلغ درخواستی بیشتر از موجودی شما است",
        variant: "destructive",
      });
      return;
    }

    // In a real app, this would be an API call to process the withdrawal
    console.log("Processing withdrawal:", values);
    
    toast({
      title: "برداشت موفق",
      description: `مبلغ ${values.amount.toLocaleString()} تومان با موفقیت برداشت شد`,
    });
    
    setIsWithdrawalDialogOpen(false);
    form.reset();
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
        
        {/* Wallet Balance */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <p className="text-gray-500 mb-1">موجودی فعلی</p>
          <h2 className="text-3xl font-bold">{wallet.balance.toLocaleString()} تومان</h2>
          
          <div className="flex mt-6 gap-3">
            <button className="flex-1 trader-btn-primary flex items-center justify-center">
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
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleWithdrawal)} className="space-y-4 py-4">
                <FormField
                  control={form.control}
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
                    disabled={!form.formState.isValid || form.getValues().amount > wallet.balance}
                  >
                    تایید برداشت
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
