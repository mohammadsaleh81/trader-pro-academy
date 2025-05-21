
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
};

const CourseCard: React.FC<CourseCardProps> = ({
  id,
  title,
  instructor,
  thumbnail,
  price,
  rating,
  progress,
  isFree = false
}) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { myCourses, wallet, updateWallet, enrollCourse } = useData();
  const [isProcessing, setIsProcessing] = useState(false);
  
  const isEnrolled = myCourses.some(c => c.id === id);

  const handleQuickBuy = async (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent navigating to course detail
    setIsProcessing(true);
    
    try {
      if (!user) {
        navigate("/login");
        return;
      }

      if (isFree || isEnrolled) {
        navigate(`/courses/${id}`);
        return;
      }

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

      // Process purchase
      const newTransaction = {
        id: Date.now().toString(),
        amount: price,
        type: "purchase" as const,
        description: `خرید دوره ${title}`,
        date: new Date().toLocaleDateString("fa-IR"),
      };

      updateWallet(wallet.balance - price, [...wallet.transactions, newTransaction]);
      enrollCourse(id, user.id);

      toast({
        title: "خرید موفق",
        description: `دوره ${title} با موفقیت خریداری شد`,
      });

      // Simulate processing delay
      setTimeout(() => {
        setIsProcessing(false);
        navigate("/my-courses");
      }, 1000);
    } catch (error) {
      toast({
        title: "خطا در پردازش",
        description: "مشکلی در خرید دوره پیش آمده است. لطفا دوباره تلاش کنید.",
        variant: "destructive",
      });
      setIsProcessing(false);
    }
  };

  return (
    <div className="trader-card h-full flex flex-col">
      <Link to={`/courses/${id}`} className="block">
        <div className="relative h-44 w-full">
          <img
            src={thumbnail}
            alt={title}
            className="w-full h-full object-cover rounded-t-xl"
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
        <Link to={`/courses/${id}`} className="block">
          <h3 className="font-bold text-sm line-clamp-2 mb-1">{title}</h3>
          <p className="text-gray-600 text-xs mb-2">مدرس: {instructor}</p>
        </Link>
        <div className="mt-auto">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center">
              <Star className="h-3.5 w-3.5 text-yellow-500 ml-1" />
              <span className="text-xs font-medium">{rating}</span>
            </div>
            <p className={`font-bold ${isFree ? "text-green-600" : "text-trader-500"} text-sm`}>
              {isFree ? "رایگان" : `${price.toLocaleString()} تومان`}
            </p>
          </div>
          <Button 
            variant={isEnrolled ? "outline" : "default"}
            className="w-full text-xs py-1 h-8"
            onClick={handleQuickBuy}
            disabled={isProcessing}
          >
            {isProcessing ? (
              <Loader className="h-4 w-4 animate-spin mx-auto" />
            ) : (
              <>
                <ShoppingCart className="h-4 w-4 ml-1" />
                {isEnrolled ? "مشاهده دوره" : isFree ? "ثبت‌نام رایگان" : "خرید سریع"}
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CourseCard;
