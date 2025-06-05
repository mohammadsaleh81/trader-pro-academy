
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Star, ShoppingCart, Loader } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useData } from "@/contexts/DataContext";
import { toast } from "@/hooks/use-toast";

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
  is_enrolled = false
}) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { myCourses, wallet, updateWallet, enrollCourse } = useData();
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Check if user is enrolled by checking both props and myCourses
  const isEnrolled = is_enrolled || myCourses.some(c => c.id === id);

  const handleQuickBuy = React.useCallback(async (e: React.MouseEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    
    try {
      if (!user) {
        navigate("/login");
        return;
      }

      if (isFree || isEnrolled) {
        navigate(`/learn/${id}`);
        return;
      }

      if (!wallet || wallet.balance < price) {
        const shortfall = price - (wallet?.balance || 0);
        
        toast({
          title: "موجودی ناکافی",
          description: `برای خرید این دوره نیاز به ${shortfall.toLocaleString()} تومان شارژ اضافی دارید`,
          variant: "destructive",
        });
        
        localStorage.setItem("pendingCourseId", id);
        navigate("/wallet");
        return;
      }

      // Process purchase
      const updateResult = await updateWallet(wallet.balance - price);
      if (updateResult.success) {
        enrollCourse(id);

        toast({
          title: "خرید موفق",
          description: `دوره ${title} با موفقیت خریداری شد`,
        });

        setTimeout(() => {
          setIsProcessing(false);
          navigate(`/learn/${id}`);
        }, 1000);
      } else {
        throw new Error(updateResult.error || "خطا در پردازش خرید");
      }
    } catch (error) {
      console.error('Error processing purchase:', error);
      setIsProcessing(false);
      
      toast({
        title: "خطا",
        description: "خطا در پردازش خرید. لطفاً دوباره تلاش کنید.",
        variant: "destructive",
      });
    }
  }, [user, isFree, isEnrolled, wallet, price, id, title, navigate, updateWallet, enrollCourse]);

  const handleImageError = React.useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    const target = e.target as HTMLImageElement;
    target.src = "/placeholder-course.jpg";
  }, []);

  return (
    <div className="trader-card h-full flex flex-col min-h-[280px]">
      <Link to={isEnrolled ? `/learn/${id}` : `/courses/${id}`} className="block">
        <div className="relative h-40 w-full">
          <img
            src={thumbnail || "/placeholder-course.jpg"}
            alt={title}
            className="w-full h-full object-cover rounded-t-xl"
            onError={handleImageError}
            loading="lazy"
          />
          {progress !== undefined && (
            <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 py-1 px-2">
              <div className="progress-bar">
                <div className="progress-value" style={{ width: `${progress}%` }}></div>
              </div>
              <p className="text-white text-xs mt-1 text-center">
                {progress}% تکمیل شده
              </p>
            </div>
          )}
        </div>
      </Link>
      <div className="p-3 flex-1 flex flex-col">
        <Link to={isEnrolled ? `/learn/${id}` : `/courses/${id}`} className="block">
          <h3 className="font-bold text-sm line-clamp-2 mb-1 min-h-[2.5rem]">{title}</h3>
          <p className="text-gray-600 text-xs mb-2">مدرس: {instructor}</p>
        </Link>
        <div className="mt-auto">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center">
              <Star className="h-4 w-4 text-yellow-500 ml-1" />
              <span className="text-xs font-medium">{rating}</span>
            </div>
            {!isEnrolled && (
              <p className={`font-bold ${isFree ? "text-green-600" : "text-trader-500"} text-sm`}>
                {isFree ? "رایگان" : `${price.toLocaleString()} تومان`}
              </p>
            )}
            {isEnrolled && (
              <p className="font-bold text-green-600 text-sm">
                ثبت‌نام شده
              </p>
            )}
          </div>
          <Button 
            variant={isEnrolled ? "outline" : "default"}
            className="w-full text-xs py-2 h-8"
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
