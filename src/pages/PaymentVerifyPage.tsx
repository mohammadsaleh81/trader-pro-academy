import React, { useEffect, useState, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { useAuth } from "@/contexts/AuthContext";
import { useData } from "@/contexts/DataContext";
import { toast } from "@/hooks/use-toast";
import { CheckCircle, XCircle, Loader2, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { clearPendingCourse } from "@/lib/cache";
import api from "@/lib/axios";

const PaymentVerifyPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, isLoading: authLoading } = useAuth();
  const { refetchWallet, courses, enrollCourse } = useData();
  const [isVerifying, setIsVerifying] = useState(true);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [verificationResult, setVerificationResult] = useState<{
    success: boolean;
    message: string;
    amount?: number;
    new_balance?: number;
  } | null>(null);
  const [verificationStatus, setVerificationStatus] = useState("در حال آماده‌سازی...");
  const [pendingCourseData, setPendingCourseData] = useState<{
    id: string;
    title: string;
    price: number;
  } | null>(null);
  const verificationStarted = useRef(false);

  // Helper function for formatting currency
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('fa-IR').format(amount);
  };

  // Check for pending course after successful payment
  const checkAndPurchasePendingCourse = async (newBalance: number) => {
    const pendingCourseId = localStorage.getItem("pendingCourseId");
    
    if (!pendingCourseId || !courses) {
      return;
    }

    const course = courses.find(c => c.id === pendingCourseId);
    
    if (!course) {
      console.log('Pending course not found in courses list');
      return;
    }

    setPendingCourseData({
      id: course.id,
      title: course.title,
      price: course.price
    });

    // Check if wallet balance is now sufficient
    if (newBalance >= course.price) {
      setIsPurchasing(true);
      setVerificationStatus("در حال تکمیل خرید دوره...");

      try {
        console.log(`Attempting to purchase pending course: ${course.title}`);
        
        const enrollResponse = await api.post(`/crs/courses/${course.id}/enroll/`, {
          course_id: parseInt(course.id)
        });

        if (enrollResponse.status === 201) {
          clearPendingCourse();
          enrollCourse(course.id);
          
          setVerificationResult(prev => prev ? {
            ...prev,
            message: `کیف پول شارژ شد و دوره "${course.title}" با موفقیت خریداری شد`
          } : null);

          toast({
            title: "خرید موفق",
            description: `دوره "${course.title}" با موفقیت خریداری شد`,
          });

          // Navigate to course after a delay
          setTimeout(() => {
            navigate(`/learn/${course.id}`);
          }, 3000);
        }
      } catch (error: any) {
        console.error('Error purchasing pending course:', error);
        
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
        }

        toast({
          title: "خطا در خرید دوره",
          description: errorMessage,
          variant: "destructive",
        });
      } finally {
        setIsPurchasing(false);
      }
    }
  };

  useEffect(() => {
    const verifyPayment = async () => {
      // Prevent multiple executions
      if (verificationStarted.current) return;
      verificationStarted.current = true;
      
      const authority = searchParams.get('Authority');
      const status = searchParams.get('Status');
      
      console.log(`Frontend: Starting verification - Authority: ${authority}, Status: ${status}`);
      
      if (!authority) {
        console.log('Frontend: No authority parameter');
        setVerificationResult({
          success: false,
          message: "پارامترهای پرداخت نامعتبر است"
        });
        setIsVerifying(false);
        return;
      }

      // Check if tokens exist in localStorage
      const tokens = localStorage.getItem('auth_tokens');
      console.log(`Frontend: Auth tokens in localStorage: ${tokens ? 'present' : 'not found'}`);
      
      if (!tokens) {
        console.log('Frontend: No auth tokens found');
        setVerificationResult({
          success: false,
          message: "لطفاً دوباره وارد شوید"
        });
        setIsVerifying(false);
        return;
      }

      // If we have tokens, proceed immediately with verification
      console.log('Frontend: Tokens exist, proceeding with verification...');
      setVerificationStatus("در حال تایید پرداخت...");

      try {
        console.log('Frontend: Sending verification request to backend');
        
        const response = await api.get(`/wallet/deposit-verify/?Authority=${authority}&Status=${status}`);
        const result = response.data;
        
        console.log('Frontend: Backend response:', result);

        if (result.success) {
          console.log('Frontend: Payment successful');
          setVerificationResult({
            success: true,
            message: result.message,
            amount: result.amount,
            new_balance: result.new_balance
          });
          
          // Refresh wallet data
          if (refetchWallet) {
            refetchWallet();
          }
          
          toast({
            title: "پرداخت موفق",
            description: result.message
          });
          
          // Check for pending course purchase
          if (result.new_balance) {
            await checkAndPurchasePendingCourse(result.new_balance);
          }
          
          // Redirect to wallet after a short delay (unless navigating to course)
          if (!isPurchasing) {
            setTimeout(() => {
              navigate('/wallet');
            }, 3000);
          }
        } else {
          console.log('Frontend: Payment failed -', result.error);
          setVerificationResult({
            success: false,
            message: result.error || "پرداخت با مشکل مواجه شد"
          });
          
          toast({
            title: "خطا در پرداخت",
            description: result.error || "پرداخت با مشکل مواجه شد",
            variant: "destructive"
          });
        }
      } catch (error: any) {
        console.error('Frontend: Verification error:', error);
        
        setVerificationResult({
          success: false,
          message: "خطا در تایید پرداخت"
        });
        
        toast({
          title: "خطا در تایید پرداخت",
          description: "متأسفانه در تایید پرداخت مشکلی رخ داد",
          variant: "destructive"
        });
      } finally {
        setIsVerifying(false);
      }
    };

    verifyPayment();
  }, [courses]); // Add courses as dependency

  const handleGoToWallet = () => {
    navigate('/wallet');
  };

  const handleGoHome = () => {
    navigate('/');
  };

  const handleGoToCourse = () => {
    if (pendingCourseData) {
      navigate(`/learn/${pendingCourseData.id}`);
    }
  };

  return (
    <Layout>
      <div className="trader-container py-12">
        <div className="max-w-md mx-auto bg-white rounded-xl shadow-md p-8 text-center">
          {isVerifying || isPurchasing ? (
            <div className="flex flex-col items-center">
              <Loader2 className="h-12 w-12 text-trader-500 animate-spin mb-4" />
              <h2 className="text-xl font-bold mb-2">{verificationStatus}</h2>
              <p className="text-gray-600">لطفاً صبر کنید</p>
              {isPurchasing && pendingCourseData && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-4 w-full">
                  <div className="flex items-center justify-center">
                    <ShoppingCart className="h-5 w-5 text-blue-600 ml-2" />
                    <p className="text-sm text-blue-600">
                      در حال خرید دوره: {pendingCourseData.title}
                    </p>
                  </div>
                </div>
              )}
            </div>
          ) : verificationResult ? (
            <div className="flex flex-col items-center">
              {verificationResult.success ? (
                <>
                  <CheckCircle className="h-12 w-12 text-green-500 mb-4" />
                  <h2 className="text-xl font-bold mb-4 text-green-600">
                    پرداخت موفق
                  </h2>
                  <p className="text-gray-600 mb-4">
                    {verificationResult.message}
                  </p>
                  {verificationResult.amount && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 w-full">
                      <p className="text-sm text-green-600 mb-1">مبلغ پرداخت شده:</p>
                      <p className="text-lg font-bold text-green-700">
                        {formatCurrency(verificationResult.amount)} تومان
                      </p>
                      {verificationResult.new_balance && (
                        <>
                          <p className="text-sm text-green-600 mb-1 mt-2">موجودی جدید:</p>
                          <p className="text-lg font-bold text-green-700">
                            {formatCurrency(verificationResult.new_balance)} تومان
                          </p>
                        </>
                      )}
                    </div>
                  )}
                  
                  {pendingCourseData && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4 w-full">
                      <div className="flex items-center justify-center mb-2">
                        <ShoppingCart className="h-5 w-5 text-blue-600 ml-2" />
                        <p className="text-sm font-medium text-blue-600">
                          دوره خریداری شده
                        </p>
                      </div>
                      <p className="text-lg font-bold text-blue-700">
                        {pendingCourseData.title}
                      </p>
                      <p className="text-sm text-blue-600 mt-1">
                        مبلغ: {formatCurrency(pendingCourseData.price)} تومان
                      </p>
                    </div>
                  )}
                  
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4 w-full">
                    <p className="text-sm text-blue-600">
                      {pendingCourseData 
                        ? "📋 شما در حال انتقال به صفحه دوره هستید..." 
                        : "📋 شما در حال انتقال به صفحه کیف پول هستید..."
                      }
                    </p>
                  </div>
                  <div className="flex gap-3 w-full">
                    {pendingCourseData ? (
                      <>
                        <Button 
                          onClick={handleGoToCourse}
                          className="flex-1 bg-trader-500 hover:bg-trader-600"
                        >
                          شروع دوره
                        </Button>
                        <Button 
                          onClick={handleGoToWallet}
                          variant="outline"
                          className="flex-1"
                        >
                          مشاهده کیف پول
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button 
                          onClick={handleGoToWallet}
                          className="flex-1 bg-trader-500 hover:bg-trader-600"
                        >
                          مشاهده کیف پول
                        </Button>
                        <Button 
                          onClick={handleGoHome}
                          variant="outline"
                          className="flex-1"
                        >
                          بازگشت به خانه
                        </Button>
                      </>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <XCircle className="h-12 w-12 text-red-500 mb-4" />
                  <h2 className="text-xl font-bold mb-4 text-red-600">
                    پرداخت ناموفق
                  </h2>
                  <p className="text-gray-600 mb-6">
                    {verificationResult.message}
                  </p>
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4 w-full">
                    <p className="text-sm text-amber-600">
                      ⚠️ در صورت عدم موفقیت، مبلغ ظرف 24-72 ساعت به حساب شما برگشت داده می‌شود
                    </p>
                  </div>
                  <div className="flex gap-3 w-full">
                    <Button 
                      onClick={() => window.location.reload()}
                      className="flex-1 bg-trader-500 hover:bg-trader-600"
                    >
                      تلاش مجدد
                    </Button>
                    <Button 
                      onClick={handleGoHome}
                      variant="outline"
                      className="flex-1"
                    >
                      بازگشت به خانه
                    </Button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <XCircle className="h-12 w-12 text-red-500 mb-4" />
              <h2 className="text-xl font-bold mb-4 text-red-600">
                خطا در پردازش
              </h2>
              <p className="text-gray-600 mb-6">
                متأسفانه در پردازش پرداخت مشکلی رخ داد
              </p>
              <Button 
                onClick={handleGoHome}
                className="bg-trader-500 hover:bg-trader-600"
              >
                بازگشت به خانه
              </Button>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default PaymentVerifyPage; 