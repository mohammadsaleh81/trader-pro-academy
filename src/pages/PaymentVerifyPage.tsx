
import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { api } from "@/lib/api";
import { CheckCircle, XCircle, Loader } from "lucide-react";

const PaymentVerifyPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isVerifying, setIsVerifying] = useState(true);
  const [verificationResult, setVerificationResult] = useState<'success' | 'failed' | null>(null);

  useEffect(() => {
    const verifyPayment = async () => {
      const authority = searchParams.get('Authority');
      const status = searchParams.get('Status');
      const orderId = localStorage.getItem('pending_order_id');

      if (!authority || !orderId) {
        setVerificationResult('failed');
        setIsVerifying(false);
        toast({
          title: "خطا",
          description: "اطلاعات پرداخت ناکامل است",
          variant: "destructive",
        });
        return;
      }

      if (status !== 'OK') {
        setVerificationResult('failed');
        setIsVerifying(false);
        toast({
          title: "پرداخت ناموفق",
          description: "پرداخت توسط کاربر لغو شد یا با خطا مواجه شد",
          variant: "destructive",
        });
        return;
      }

      try {
        await api.verifyPayment({
          order_id: parseInt(orderId),
          authority: authority
        });

        setVerificationResult('success');
        localStorage.removeItem('pending_order_id');

        toast({
          title: "پرداخت موفق",
          description: "خرید شما با موفقیت انجام شد",
        });

        // Redirect after a short delay
        setTimeout(() => {
          navigate('/my-courses');
        }, 3000);

      } catch (error) {
        console.error('Payment verification failed:', error);
        setVerificationResult('failed');

        toast({
          title: "خطا در تایید پرداخت",
          description: "پرداخت شما انجام شد اما تایید آن با مشکل مواجه شد. لطفاً با پشتیبانی تماس بگیرید",
          variant: "destructive",
        });
      } finally {
        setIsVerifying(false);
      }
    };

    verifyPayment();
  }, [searchParams, navigate]);

  return (
    <Layout>
      <div className="trader-container py-16">
        <div className="max-w-md mx-auto text-center">
          {isVerifying ? (
            <div className="space-y-6">
              <Loader className="h-16 w-16 animate-spin mx-auto text-orange-600" />
              <h1 className="text-2xl font-bold">در حال تایید پرداخت...</h1>
              <p className="text-gray-600">لطفاً صبر کنید</p>
            </div>
          ) : verificationResult === 'success' ? (
            <div className="space-y-6">
              <CheckCircle className="h-16 w-16 mx-auto text-green-600" />
              <h1 className="text-2xl font-bold text-green-600">پرداخت موفق!</h1>
              <p className="text-gray-600">خرید شما با موفقیت انجام شد. در حال انتقال به دوره‌های من...</p>
              <Button 
                onClick={() => navigate('/my-courses')}
                className="bg-green-600 hover:bg-green-700"
              >
                مشاهده دوره‌های من
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              <XCircle className="h-16 w-16 mx-auto text-red-600" />
              <h1 className="text-2xl font-bold text-red-600">پرداخت ناموفق</h1>
              <p className="text-gray-600">متأسفانه پرداخت شما با مشکل مواجه شد</p>
              <div className="space-y-3">
                <Button 
                  onClick={() => navigate('/courses')}
                  variant="outline"
                >
                  بازگشت به دوره‌ها
                </Button>
                <Button 
                  onClick={() => navigate('/contact-us')}
                  className="bg-orange-600 hover:bg-orange-700"
                >
                  تماس با پشتیبانی
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default PaymentVerifyPage;
