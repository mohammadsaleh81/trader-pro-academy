
import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { PhoneIcon, ArrowRightIcon, AlertCircle } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";

enum AuthStep {
  PHONE_ENTRY,
  OTP_VERIFICATION
}

const LoginPage: React.FC = () => {
  const [step, setStep] = useState<AuthStep>(AuthStep.PHONE_ENTRY);
  const [phone, setPhone] = useState("");
  const [otp, setOTP] = useState("");
  const { requestOTP, verifyOTP, isLoading, error, user, otpCodeForTesting } = useAuth();
  const navigate = useNavigate();

  // If user is already logged in and profile is complete, redirect to profile page
  useEffect(() => {
    if (user) {
      if (user.isProfileComplete) {
        navigate("/profile");
      } else {
        navigate("/complete-profile");
      }
    }
  }, [user, navigate]);

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!phone || phone.length < 10) {
      toast({
        title: "خطا",
        description: "لطفا شماره موبایل معتبر وارد کنید",
        variant: "destructive",
      });
      return;
    }
    
    await requestOTP(phone);
    setStep(AuthStep.OTP_VERIFICATION);
  };

  const handleOTPSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (otp.length !== 5) {
      toast({
        title: "خطا",
        description: "کد تایید باید 5 رقمی باشد",
        variant: "destructive",
      });
      return;
    }
    
    await verifyOTP(otp);
  };

  const handleResendOTP = async () => {
    if (!phone) return;
    await requestOTP(phone);
  };

  if (isLoading && !otpCodeForTesting) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-trader-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg">در حال پردازش...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-md">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-trader-500">
            مستر تریدر آکادمی
          </h2>
          <h3 className="mt-2 text-xl font-medium">
            {step === AuthStep.PHONE_ENTRY ? "ورود / ثبت نام" : "تایید کد"}
          </h3>
        </div>
        
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        {/* Show OTP for testing */}
        {otpCodeForTesting && (
          <div className="bg-blue-50 border border-blue-200 text-blue-800 p-4 rounded-md text-sm">
            <p className="font-semibold mb-1">کد تایید برای تست:</p>
            <div className="text-center text-3xl font-bold tracking-wider">{otpCodeForTesting}</div>
            <p className="text-xs text-blue-600 mt-2">این کد فقط برای تست نمایش داده می‌شود و در نسخه نهایی حذف خواهد شد.</p>
          </div>
        )}
        
        {step === AuthStep.PHONE_ENTRY ? (
          <form className="mt-8 space-y-6" onSubmit={handlePhoneSubmit}>
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                شماره موبایل
              </label>
              <div className="relative">
                <PhoneIcon className="absolute top-3 right-3 h-5 w-5 text-gray-400" />
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  dir="ltr"
                  className="text-left pr-10"
                  placeholder="09123456789"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                />
              </div>
              <p className="mt-1 text-xs text-gray-500">
                کد تایید به این شماره ارسال خواهد شد
              </p>
            </div>
            
            <Button 
              type="submit" 
              className="w-full bg-trader-500 hover:bg-trader-600 py-3"
              disabled={isLoading || phone.length < 10}
            >
              {isLoading ? (
                <span className="inline-flex items-center">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span>
                  در حال ارسال کد...
                </span>
              ) : (
                <span className="inline-flex items-center">
                  ارسال کد تایید
                  <ArrowRightIcon className="ms-2 h-4 w-4" />
                </span>
              )}
            </Button>
          </form>
        ) : (
          <form className="mt-8 space-y-6" onSubmit={handleOTPSubmit}>
            <div className="space-y-2">
              <label htmlFor="otp" className="block text-sm font-medium text-gray-700">
                کد تایید ارسال شده به {phone}
              </label>
              
              <div className="flex justify-center py-4">
                <InputOTP maxLength={5} value={otp} onChange={setOTP}>
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                    <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} />
                  </InputOTPGroup>
                </InputOTP>
              </div>
              
              <p className="text-xs text-gray-500 text-center">
                کد 5 رقمی ارسال شده را وارد کنید
              </p>
            </div>
            
            <div className="flex flex-col space-y-2">
              <Button 
                type="submit" 
                className="w-full bg-trader-500 hover:bg-trader-600 py-3"
                disabled={isLoading || otp.length !== 5}
              >
                {isLoading ? (
                  <span className="inline-flex items-center">
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span>
                    در حال تایید...
                  </span>
                ) : "تایید کد"}
              </Button>
              
              <div className="flex justify-between items-center mt-4">
                <Button 
                  type="button" 
                  variant="ghost" 
                  className="text-sm"
                  onClick={handleResendOTP}
                  disabled={isLoading}
                >
                  ارسال مجدد کد
                </Button>
                
                <Button 
                  type="button" 
                  variant="ghost" 
                  className="text-sm"
                  onClick={() => setStep(AuthStep.PHONE_ENTRY)}
                  disabled={isLoading}
                >
                  تغییر شماره موبایل
                </Button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default LoginPage;
