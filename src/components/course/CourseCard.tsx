import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ShoppingCart, Loader, Wallet, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import ProgressBar from "@/components/ui/progress-bar";
import { useAuth } from "@/contexts/AuthContext";
import { useData } from "@/contexts/DataContext";
import { useWallet } from "@/contexts/WalletContext";
import { toast } from "@/hooks/use-toast";
import { clearPendingCourse } from "@/lib/cache";
import api from "@/lib/axios";

type CourseCardProps = {
  id: string;
  title: string;
  instructor: string;
  thumbnail: string;
  price: number;
  rating: number;
  progress?: number;
  isFree?: boolean;
  is_enrolled?: boolean;
};

const CourseCard: React.FC<CourseCardProps> = React.memo(({
  id,
  title,
  instructor,
  thumbnail,
  price,
  rating,
  progress,
  isFree = false,
  is_enrolled
}) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { myCourses, wallet, enrollCourse } = useData();
  const { refetchWallet } = useWallet();
  const [isProcessing, setIsProcessing] = useState(false);
  const [showPurchaseConfirm, setShowPurchaseConfirm] = useState(false);
  
  const isEnrolled = is_enrolled || false;

  // Helper function for formatting currency
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('fa-IR').format(amount);
  };

  const formatCurrencyWithUnit = (amount: number): string => {
    return `${formatCurrency(amount)} تومان`;
  };

  const handlePurchaseConfirm = async () => {
    setShowPurchaseConfirm(false);
    setIsProcessing(true);

    try {
      const enrollResponse = await api.post(`/crs/courses/${id}/enroll/`, {
        course_id: parseInt(id)
      });

      if (enrollResponse.status === 201) {
        clearPendingCourse();
        enrollCourse(id);

        toast({
          title: "خرید موفق",
          description: `دوره ${title} با موفقیت خریداری شد`,
        });

        // Refresh wallet to show updated balance
        refetchWallet();

        navigate(`/learn/${id}`);
      }
    } catch (error: any) {
      console.error('Error processing purchase:', error);
      
      if (error.response?.status === 400) {
        const errorData = error.response.data;
        let errorMsg = "خطا در پردازش خرید";
        
        if (errorData?.course_id?.[0]) {
          errorMsg = errorData.course_id[0];
        } else if (errorData?.non_field_errors?.[0]) {
          errorMsg = errorData.non_field_errors[0];
        } else if (errorData?.detail) {
          errorMsg = errorData.detail;
        }
        
        toast({
          title: "خطا در خرید",
          description: errorMsg,
          variant: "destructive",
        });
      } else if (error.response?.status === 402) {
        toast({
          title: "موجودی ناکافی",
          description: "موجودی کیف پول شما برای خرید این دوره کافی نیست",
          variant: "destructive",
        });
        localStorage.setItem("pendingCourseId", id);
        navigate("/wallet");
      } else if (error.response?.status === 409) {
        toast({
          title: "خطا",
          description: "شما قبلاً در این دوره ثبت‌نام کرده‌اید",
          variant: "destructive",
        });
      } else {
        toast({
          title: "خطا",
          description: "خطا در پردازش خرید. لطفاً دوباره تلاش کنید.",
          variant: "destructive",
        });
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleQuickBuy = React.useCallback(async (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent navigating to course detail
    setIsProcessing(true);
    
    try {
      if (!user) {
        navigate("/login");
        return;
      }

      if (isEnrolled) {
        navigate(`/learn/${id}`);
        return;
      }

      // For free courses, just enroll directly
      if (isFree || price === 0) {
        try {
          const enrollResponse = await api.post(`/crs/courses/${id}/enroll/`, {
            course_id: parseInt(id)
          });

          if (enrollResponse.status === 201) {
            clearPendingCourse();
            enrollCourse(id);
            
            toast({
              title: "ثبت‌نام موفق",
              description: `شما با موفقیت در دوره ${title} ثبت‌نام شدید`,
            });

            navigate(`/learn/${id}`);
          }
        } catch (error: any) {
          console.error('Error processing free enrollment:', error);
          
          if (error.response?.status === 400 || error.response?.status === 409) {
            toast({
              title: "خطا",
              description: "شما قبلاً در این دوره ثبت‌نام کرده‌اید",
              variant: "destructive",
            });
          } else {
            toast({
              title: "خطا",
              description: "خطا در پردازش ثبت‌نام. لطفاً دوباره تلاش کنید.",
              variant: "destructive",
            });
          }
        } finally {
          setIsProcessing(false);
        }
        return;
      }

      // For paid courses, check wallet balance
      if (!wallet || wallet.balance < price) {
        const shortfall = price - (wallet?.balance || 0);
        
        toast({
          title: "موجودی ناکافی",
          description: `برای خرید این دوره نیاز به ${shortfall.toLocaleString()} تومان شارژ اضافی دارید`,
          variant: "destructive",
        });
        
        // Store course ID in localStorage to complete purchase after recharge
        localStorage.setItem("pendingCourseId", id);
        navigate("/wallet");
        return;
      }

      // Show confirmation dialog
      setIsProcessing(false);
      setShowPurchaseConfirm(true);

    } catch (error) {
      console.error('Error in handleQuickBuy:', error);
      
      toast({
        title: "خطا",
        description: "خطا در پردازش درخواست. لطفاً دوباره تلاش کنید.",
        variant: "destructive",
      });
      setIsProcessing(false);
    }
  }, [user, isFree, isEnrolled, wallet, price, id, title, navigate, enrollCourse]);

  const handleImageError = React.useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    const target = e.target as HTMLImageElement;
    target.src = "/placeholder-course.jpg";
  }, []);

  console.log(is_enrolled);

  return (
    <div className="bg-card text-card-foreground rounded-lg shadow-sm hover:shadow-lg transition-all duration-300 h-full flex flex-col min-h-[280px] group hover:scale-[1.02] hover:-translate-y-1 border border-border">
      <Link to={isEnrolled ? `/learn/${id}` : `/courses/${id}`} className="block">
        <div className="relative h-40 w-full overflow-hidden rounded-t-lg">
          <img
            src={thumbnail || "/placeholder-course.jpg"}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            onError={handleImageError}
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          {isEnrolled && progress !== undefined && (
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent py-2 px-3">
              <ProgressBar 
                percentage={progress}
                height="sm"
                color="bg-orange-500"
                backgroundColor="bg-white/30"
                className="mb-1"
              />
              <p className="text-white text-xs text-center font-medium">
                {progress}% تکمیل شده
              </p>
            </div>
          )}
        </div>
      </Link>
      <div className="p-3 flex-1 flex flex-col">
        <Link to={isEnrolled ? `/learn/${id}` : `/courses/${id}`} className="block">
          <h3 className="font-bold text-sm line-clamp-2 mb-1 min-h-[2.5rem] group-hover:text-primary transition-colors duration-300">{title}</h3>
          <p className="text-muted-foreground text-xs mb-2 group-hover:text-foreground/80 transition-colors duration-300">مدرس: {instructor}</p>
        </Link>
        <div className="mt-auto">
          <div className="flex items-center justify-between mb-3">
            <div></div>
            {!isEnrolled && (
              <p className={`font-bold ${isFree ? "text-green-600" : "text-trader-500"} text-sm transition-colors duration-300`}>
                {isFree ? "رایگان" : `${price.toLocaleString()} تومان`}
              </p>
            )}
            {isEnrolled && (
              <p className="font-bold text-green-600 text-sm">
                ادامه یادگیری
              </p>
            )}
          </div>
          <Button 
            variant={isEnrolled ? "outline" : "default"}
            className={`w-full text-xs py-2 h-8 transition-all duration-300 hover:scale-105 ${isEnrolled ? 'border-green-500 text-green-600 hover:bg-green-50' : ''}`}
            onClick={handleQuickBuy}
            disabled={isProcessing}
          >
            {isProcessing ? (
              <Loader className="h-4 w-4 animate-spin mx-auto" />
            ) : (
              <>
                {!isEnrolled && <ShoppingCart className="h-4 w-4 ml-1" />}
                {isEnrolled ? "ادامه یادگیری" : isFree ? "ثبت‌نام رایگان" : "خرید سریع"}
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Purchase Confirmation Dialog */}
      <Dialog open={showPurchaseConfirm} onOpenChange={setShowPurchaseConfirm}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle className="text-center">تأیید خرید دوره</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            {/* Course Info */}
            <div className="bg-muted rounded-lg p-4 mb-6">
              <div className="flex items-center">
                <img
                  src={thumbnail || "/placeholder-course.jpg"}
                  alt={title}
                  className="w-16 h-16 object-cover rounded-lg ml-4"
                />
                <div>
                  <h3 className="font-bold text-lg">{title}</h3>
                  <p className="text-muted-foreground text-sm">مدرس: {instructor}</p>
                </div>
              </div>
            </div>

            {/* Purchase Details */}
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg">
                <div className="flex items-center">
                  <ShoppingCart className="h-5 w-5 text-blue-600 ml-2" />
                  <span className="text-blue-800 dark:text-blue-400">مبلغ دوره:</span>
                </div>
                <span className="font-bold text-blue-600">{formatCurrencyWithUnit(price)}</span>
              </div>

              <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-lg">
                <div className="flex items-center">
                  <Wallet className="h-5 w-5 text-green-600 ml-2" />
                  <span className="text-green-800 dark:text-green-400">موجودی فعلی شما:</span>
                </div>
                <span className="font-bold text-green-600">{formatCurrencyWithUnit(wallet?.balance || 0)}</span>
              </div>

              <div className="flex items-center justify-between p-3 bg-orange-50 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-800 rounded-lg">
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-orange-600 ml-2" />
                  <span className="text-orange-800 dark:text-orange-400">موجودی پس از خرید:</span>
                </div>
                <span className="font-bold text-orange-600">
                  {formatCurrencyWithUnit((wallet?.balance || 0) - price)}
                </span>
              </div>
            </div>

            {/* Confirmation Message */}
            <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-950/30 border border-yellow-200 dark:border-yellow-800 rounded-lg">
              <p className="text-yellow-800 dark:text-yellow-400 text-center">
                مبلغ <span className="font-bold">{formatCurrencyWithUnit(price)}</span> از کیف پول شما 
                برای خرید دوره <span className="font-bold">"{title}"</span> کم می‌شود.
              </p>
            </div>
          </div>
          
          <DialogFooter className="flex justify-between sm:justify-between gap-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setShowPurchaseConfirm(false)}
            >
              انصراف
            </Button>
            <Button 
              type="submit" 
              onClick={handlePurchaseConfirm}
              disabled={isProcessing}
              className="bg-green-600 hover:bg-green-700"
            >
              {isProcessing ? "در حال پردازش..." : "تأیید و خرید"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}, (prevProps, nextProps) => {
  return (
    prevProps.id === nextProps.id &&
    prevProps.title === nextProps.title &&
    prevProps.instructor === nextProps.instructor &&
    prevProps.thumbnail === nextProps.thumbnail &&
    prevProps.price === nextProps.price &&
    prevProps.rating === nextProps.rating &&
    prevProps.progress === nextProps.progress &&
    prevProps.isFree === nextProps.isFree &&
    prevProps.is_enrolled === nextProps.is_enrolled
  );
});

CourseCard.displayName = 'CourseCard';

export default CourseCard;
