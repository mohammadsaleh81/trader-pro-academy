
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

const CourseCard: React.FC<CourseCardProps> = ({
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

      if (isFree || is_enrolled) {
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

      const updateResult = await updateWallet(wallet.balance - price);
      if (updateResult.success) {
        enrollCourse(id);

        toast({
          title: "خرید موفق",
          description: `دوره ${title} با موفقیت خریداری شد`,
        });

        // Simulate processing delay
        setTimeout(() => {
          setIsProcessing(false);
          navigate(`/learn/${id}`);
        }, 1000);
      } else {
        throw new Error(updateResult.error);
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
  };

  console.log(is_enrolled);

  return (
    <div className="trader-card h-full flex flex-col min-h-[280px]">
      <Link to={is_enrolled ? `/learn/${id}` : `/courses/${id}`} className="block">
        <div className="relative h-40 w-full">
          <img
            src={thumbnail || "/placeholder-course.jpg"}
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
        <Link to={is_enrolled ? `/learn/${id}` : `/courses/${id}`} className="block">
          <h3 className="font-bold text-sm line-clamp-2 mb-1 min-h-[2.5rem]">{title}</h3>
          <p className="text-gray-600 text-xs mb-2">مدرس: {instructor}</p>
        </Link>
        <div className="mt-auto">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center">
              <Star className="h-4 w-4 text-yellow-500 ml-1" />
              <span className="text-xs font-medium">{rating}</span>
            </div>
            {!is_enrolled && (
              <p className={`font-bold ${isFree ? "text-green-600" : "text-trader-500"} text-sm`}>
                {isFree ? "رایگان" : `${price.toLocaleString()} تومان`}
              </p>
            )}
            {is_enrolled && (
              <p className="font-bold text-green-600 text-sm">
                ادامه یادگیری
              </p>
            )}
          </div>
          <Button 
            variant={is_enrolled ? "outline" : "default"}
            className="w-full text-xs py-2 h-8"
            onClick={handleQuickBuy}
            disabled={isProcessing}
          >
            {isProcessing ? (
              <Loader className="h-4 w-4 animate-spin mx-auto" />
            ) : (
              <>
                {!is_enrolled && <ShoppingCart className="h-4 w-4 ml-1" />}
                {is_enrolled ? "ادامه یادگیری" : isFree ? "ثبت‌نام رایگان" : "خرید سریع"}
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CourseCard;
