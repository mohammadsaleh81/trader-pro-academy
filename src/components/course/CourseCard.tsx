
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Star, ShoppingCart } from "lucide-react";
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
  
  const isEnrolled = myCourses.some(c => c.id === id);

  const handleQuickBuy = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent navigating to course detail
    
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

    navigate("/my-courses");
  };

  return (
    <div className="trader-card flex h-full overflow-hidden">
      <div className="w-1/3 h-full min-h-[160px]">
        <img
          src={thumbnail}
          alt={title}
          className="w-full h-full object-cover"
        />
      </div>
      <div className="w-2/3 p-3 flex flex-col relative">
        <h3 className="font-bold text-sm mb-1">{title}</h3>
        <p className="text-gray-600 text-xs mb-2">مدرس: {instructor}</p>
        
        {progress !== undefined && (
          <div className="mb-2">
            <div className="progress-bar">
              <div className="progress-value" style={{ width: `${progress}%` }}></div>
            </div>
            <p className="text-gray-500 text-xs mt-1">
              {progress}% تکمیل شده
            </p>
          </div>
        )}
        
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
          >
            <ShoppingCart className="h-4 w-4 ml-1" />
            {isEnrolled ? "مشاهده دوره" : isFree ? "ثبت‌نام رایگان" : "خرید سریع"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CourseCard;
