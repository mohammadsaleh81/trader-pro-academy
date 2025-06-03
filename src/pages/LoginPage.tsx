
import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { PhoneIcon } from "lucide-react";
import { persianToEnglishDigits, formatPhoneNumber, validateIranianPhoneNumber } from "@/utils/persianToEnglish";

enum AuthStep {
  PHONE_ENTRY,
  OTP_VERIFICATION
}

const LoginPage: React.FC = () => {
  const [step, setStep] = useState<AuthStep>(AuthStep.PHONE_ENTRY);
  const [phone, setPhone] = useState("");
  const [otp, setOTP] = useState("");
  const { requestOTP, verifyOTP, isLoading, error, user, devOTP, phoneNumber } = useAuth();
  const navigate = useNavigate();

  // If user is already logged in, redirect appropriately
  useEffect(() => {
    if (user) {
      console.log("User is logged in, redirecting...", user);
      if (user.isProfileComplete) {
        navigate("/profile");
      } else {
        navigate("/complete-profile");
      }
    }
  }, [user, navigate]);

  // Auto advance to OTP step when devOTP is available
  useEffect(() => {
    if (devOTP && phoneNumber && step === AuthStep.PHONE_ENTRY) {
      console.log("DevOTP available, advancing to OTP step");
      setStep(AuthStep.OTP_VERIFICATION);
    }
  }, [devOTP, phoneNumber, step]);

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Submitting phone:", phone);
    
    // Format and validate phone number
    const formattedPhone = formatPhoneNumber(phone);
    console.log("Formatted phone:", formattedPhone);
    
    if (!validateIranianPhoneNumber(formattedPhone)) {
      console.log("Phone validation failed - invalid format");
      return;
    }
    
    try {
      console.log("Requesting OTP for phone:", formattedPhone);
      await requestOTP(formattedPhone);
      console.log("OTP requested successfully");
    } catch (error) {
      console.error("Error requesting OTP:", error);
    }
  };

  const handleOTPSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Submitting OTP:", otp);
    
    // Convert Persian/Arabic digits to English in OTP
    const englishOTP = persianToEnglishDigits(otp);
    console.log("English OTP:", englishOTP);
    
    if (!englishOTP || englishOTP.length !== 5) {
      console.log("OTP validation failed - invalid length");
      return;
    }
    
    try {
      console.log("Verifying OTP:", englishOTP);
      await verifyOTP(englishOTP);
      console.log("OTP verified successfully");
    } catch (error) {
      console.error("Error verifying OTP:", error);
    }
  };

  const handleBackToPhone = () => {
    console.log("Going back to phone entry");
    setStep(AuthStep.PHONE_ENTRY);
    setOTP("");
  };

  const handleOTPChange = (value: string) => {
    console.log("OTP changed:", value);
    // Convert Persian/Arabic digits to English automatically
    const englishValue = persianToEnglishDigits(value);
    console.log("English OTP value:", englishValue);
    setOTP(englishValue);
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    console.log("Phone changed:", value);
    // Convert Persian/Arabic digits to English automatically
    const englishValue = persianToEnglishDigits(value);
    console.log("English phone value:", englishValue);
    setPhone(englishValue);
  };

  console.log("LoginPage render - Step:", step, "Phone:", phone, "PhoneNumber from context:", phoneNumber, "DevOTP:", devOTP);

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
          <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm text-center">
            {error}
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
                  onChange={handlePhoneChange}
                  required
                  disabled={isLoading}
                />
              </div>
              <p className="mt-1 text-xs text-gray-500">
                کد تایید به این شماره ارسال خواهد شد (می‌توانید از کیبورد فارسی استفاده کنید)
              </p>
            </div>
            
            <Button 
              type="submit" 
              className="w-full bg-trader-500 hover:bg-trader-600 py-3"
              disabled={isLoading || !validateIranianPhoneNumber(formatPhoneNumber(phone))}
            >
              {isLoading ? "در حال ارسال کد..." : "ارسال کد تایید"}
            </Button>
          </form>
        ) : (
          <form className="mt-8 space-y-6" onSubmit={handleOTPSubmit}>
            <div className="space-y-2">
              <label htmlFor="otp" className="block text-sm font-medium text-gray-700">
                کد تایید ارسال شده به {phoneNumber}
              </label>
              
              {devOTP && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3 mb-4">
                  <p className="text-yellow-800 text-sm font-medium">کد تایید (فقط در محیط توسعه):</p>
                  <p className="text-yellow-900 text-lg font-bold text-center mt-1 font-mono">{devOTP}</p>
                </div>
              )}
              
              <div className="flex justify-center py-4" dir="ltr">
                <InputOTP 
                  maxLength={5} 
                  value={otp} 
                  onChange={handleOTPChange}
                  disabled={isLoading}
                  dir="ltr"
                >
                  <InputOTPGroup dir="ltr">
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                    <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} />
                  </InputOTPGroup>
                </InputOTP>
              </div>
              
              <p className="text-xs text-gray-500 text-center">
                کد 5 رقمی ارسال شده را وارد کنید (می‌توانید از کیبورد فارسی استفاده کنید)
              </p>
            </div>
            
            <div className="flex flex-col space-y-2">
              <Button 
                type="submit" 
                className="w-full bg-trader-500 hover:bg-trader-600 py-3"
                disabled={isLoading || persianToEnglishDigits(otp).length !== 5}
              >
                {isLoading ? "در حال تایید..." : "تایید کد"}
              </Button>
              
              <Button 
                type="button" 
                variant="outline" 
                className="w-full py-3"
                onClick={handleBackToPhone}
                disabled={isLoading}
              >
                تغییر شماره موبایل
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default LoginPage;
