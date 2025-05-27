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

      updateWallet(wallet.balance - price, [...wallet.transactions, newTransaction]);
      enrollCourse(id, user.id);

      toast({
        title: "خرید موفق",
        description: `دوره ${title} با موفقیت خریداری شد`,
      });

      // Simulate processing delay
      setTimeout(() => {
        setIsProcessing(false);
        navigate(`/learn/${id}`);
      }, 1000);
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
    <div className="trader-card h-full flex flex-col">
      <Link to={is_enrolled ? `/learn/${id}` : `/courses/${id}`} className="block">
        <div className="relative h-28 w-full">
          <img
            src={thumbnail || "/placeholder-course.jpg"}
            alt={title}
            className="w-full h-full object-cover rounded-t-xl"
          />
          {progress !== undefined && (
            <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 py-0.5 px-1">
              <div className="progress-bar">
                <div className="progress-value" style={{ width: `${progress}%` }}></div>
              </div>
              <p className="text-white text-[10px] mt-0.5 text-center">
                {progress}% تکمیل شده
              </p>
            </div>
          )}
        </div>
      </Link>
      <div className="p-2 flex-1 flex flex-col">
        <Link to={is_enrolled ? `/learn/${id}` : `/courses/${id}`} className="block">
          <h3 className="font-bold text-xs line-clamp-1 mb-0.5">{title}</h3>
          <p className="text-gray-600 text-[10px] mb-1">مدرس: {instructor}</p>
        </Link>
        <div className="mt-auto">
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center">
              <Star className="h-3 w-3 text-yellow-500 ml-0.5" />
              <span className="text-[10px] font-medium">{rating}</span>
            </div>
            {!is_enrolled && (
              <p className={`font-bold ${isFree ? "text-green-600" : "text-trader-500"} text-xs`}>
                {isFree ? "رایگان" : `${price.toLocaleString()} تومان`}
              </p>
            )}
            {is_enrolled && (
              <p className="font-bold text-green-600 text-xs">
                ادامه یادگیری
              </p>
            )}
          </div>
          <Button 
            variant={is_enrolled ? "outline" : "default"}
            className="w-full text-[10px] py-0 h-6"
            onClick={handleQuickBuy}
            disabled={isProcessing}
          >
            {isProcessing ? (
              <Loader className="h-3 w-3 animate-spin mx-auto" />
            ) : (
              <>
                {!is_enrolled && <ShoppingCart className="h-3 w-3 ml-0.5" />}
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
