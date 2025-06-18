import React, { useState, useEffect, useCallback, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { PhoneIcon, Clock, ArrowRight } from "lucide-react";
import { persianToEnglishDigits, formatPhoneNumber, validateIranianPhoneNumber } from "@/utils/persianToEnglish";

enum AuthStep {
  PHONE_ENTRY,
  OTP_VERIFICATION
}

const LoginPage: React.FC = () => {
  // Initialize step from sessionStorage or default to PHONE_ENTRY
  const [step, setStep] = useState<AuthStep>(() => {
    const savedStep = sessionStorage.getItem('loginStep');
    const parsedStep = savedStep ? parseInt(savedStep) : AuthStep.PHONE_ENTRY;
    console.log("Initializing step from sessionStorage:", parsedStep);
    return parsedStep;
  });
  
  const [phone, setPhone] = useState(() => {
    const savedPhone = sessionStorage.getItem('loginPhone');
    console.log("Initializing phone from sessionStorage:", savedPhone || "");
    return savedPhone || "";
  });
  const [otp, setOTP] = useState("");
  const [timeRemaining, setTimeRemaining] = useState(() => {
    const savedTimer = sessionStorage.getItem('loginTimer');
    const parsedTimer = savedTimer ? parseInt(savedTimer) : 120;
    console.log("Initializing timer from sessionStorage:", parsedTimer);
    return parsedTimer;
  });
  const [timerActive, setTimerActive] = useState(() => {
    const savedTimerActive = sessionStorage.getItem('loginTimerActive');
    const isTimerActive = savedTimerActive === 'true';
    console.log("Initializing timerActive from sessionStorage:", isTimerActive);
    return isTimerActive;
  });
  const { requestOTP, verifyOTP, isLoading, error, user, phoneNumber, setPhoneNumber } = useAuth();
  const navigate = useNavigate();
  
  // Use ref to track step value for debugging
  const stepRef = useRef(step);
  stepRef.current = step;
  
  // Wrapped setStep with debugging and persistence
  const setStepWithDebug = useCallback((newStep: AuthStep) => {
    console.log("=== SET STEP CALLED ===");
    console.log("Current step:", stepRef.current);
    console.log("New step:", newStep);
    console.log("Stack trace:", new Error().stack);
    
    // Save to sessionStorage
    sessionStorage.setItem('loginStep', newStep.toString());
    console.log("Saved step to sessionStorage:", newStep);
    
    setStep(newStep);
  }, []);
  
  // Wrapped setPhone with persistence
  const setPhoneWithPersist = useCallback((newPhone: string) => {
    console.log("Setting phone to:", newPhone);
    sessionStorage.setItem('loginPhone', newPhone);
    setPhone(newPhone);
  }, []);
  
  // Wrapped setTimerActive with persistence
  const setTimerActiveWithPersist = useCallback((active: boolean) => {
    console.log("Setting timerActive to:", active);
    sessionStorage.setItem('loginTimerActive', active.toString());
    setTimerActive(active);
  }, []);
  
  // Wrapped setTimeRemaining with persistence
  const setTimeRemainingWithPersist = useCallback((time: number) => {
    sessionStorage.setItem('loginTimer', time.toString());
    setTimeRemaining(time);
  }, []);
  
  // Component mount/unmount tracking
  useEffect(() => {
    console.log("LoginPage component mounted");
    return () => {
      console.log("LoginPage component unmounting");
      // Clear step from sessionStorage on unmount (optional)
      // sessionStorage.removeItem('loginStep');
    };
  }, []);

  // Debug effect for step changes
  useEffect(() => {
    console.log("Step changed to:", step, step === AuthStep.PHONE_ENTRY ? "PHONE_ENTRY" : "OTP_VERIFICATION");
    console.log("Stack trace for step change:", new Error().stack);
  }, [step]);

  // Debug effect for phone changes
  useEffect(() => {
    console.log("Phone state changed to:", phone);
  }, [phone]);

  // Debug effect for phoneNumber context changes
  useEffect(() => {
    console.log("PhoneNumber context changed to:", phoneNumber);
  }, [phoneNumber]);

  // If user is already logged in, redirect appropriately
  useEffect(() => {
    if (user) {
      console.log("=== USER LOGIN DETECTED ===");
      console.log("User is logged in, redirecting...", user);
      console.log("User ID:", user.id);
      console.log("User profile complete:", user.isProfileComplete);
      console.log("User first_name:", user.first_name);
      console.log("User last_name:", user.last_name);
      
      // Clear login session storage since user is now logged in
      console.log("Clearing login sessionStorage");
      sessionStorage.removeItem('loginStep');
      sessionStorage.removeItem('loginPhone');
      sessionStorage.removeItem('loginTimer');
      sessionStorage.removeItem('loginTimerActive');
      
      // Add a small delay to ensure user state is fully set
      const redirectTimer = setTimeout(() => {
        if (user.isProfileComplete) {
          console.log("=== REDIRECTING TO PROFILE ===");
          console.log("Profile is complete, redirecting to profile");
          navigate("/profile");
        } else {
          console.log("=== REDIRECTING TO COMPLETE PROFILE ===");
          console.log("Profile is incomplete, redirecting to complete-profile");
          navigate("/complete-profile");
        }
      }, 500);
      
      return () => clearTimeout(redirectTimer);
    }
  }, [user, navigate]);

  // Auto-submit OTP when 5 digits are entered
  useEffect(() => {
    const englishOTP = persianToEnglishDigits(otp);
    if (englishOTP.length === 5 && !isLoading && step === AuthStep.OTP_VERIFICATION) {
      console.log("Auto-submitting OTP:", englishOTP);
      // Inline the verification logic to avoid dependency issues
      const verify = async () => {
        try {
          console.log("Verifying OTP:", englishOTP);
          await verifyOTP(englishOTP);
          console.log("OTP verified successfully");
        } catch (error) {
          console.error("Error verifying OTP:", error);
        }
      };
      verify();
    }
  }, [otp, isLoading, step, verifyOTP]);

  // Timer countdown effect
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    
    if (timerActive && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining(prev => {
          const newTime = prev <= 1 ? 0 : prev - 1;
          if (newTime === 0) {
            setTimerActiveWithPersist(false);
          }
          // Update sessionStorage
          sessionStorage.setItem('loginTimer', newTime.toString());
          return newTime;
        });
      }, 1000);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [timerActive, timeRemaining, setTimerActiveWithPersist]);

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleOTPVerification = useCallback(async (otpCode: string) => {
    console.log("=== OTP VERIFICATION START ===");
    console.log("Verifying OTP:", otpCode);
    console.log("Phone number from context:", phoneNumber);
    console.log("Current step:", step);
    console.log("Is loading:", isLoading);
    
    try {
      console.log("=== CALLING VERIFY OTP API ===");
      console.log("Verifying OTP:", otpCode);
      await verifyOTP(otpCode);
      console.log("=== OTP VERIFICATION SUCCESS ===");
      console.log("OTP verified successfully");
    } catch (error) {
      console.log("=== OTP VERIFICATION FAILED ===");
      console.error("Error verifying OTP:", error);
    }
    
    console.log("=== OTP VERIFICATION END ===");
  }, [verifyOTP, phoneNumber, step, isLoading]);

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("=== PHONE SUBMIT START ===");
    console.log("Submitting phone:", phone);
    console.log("Current step:", step);
    console.log("Is loading:", isLoading);
    
    // Format and validate phone number
    const formattedPhone = formatPhoneNumber(phone);
    console.log("Formatted phone:", formattedPhone);
    
    if (!validateIranianPhoneNumber(formattedPhone)) {
      console.log("Phone validation failed - invalid format");
      return;
    }
    
    try {
      console.log("=== REQUESTING OTP ===");
      console.log("Requesting OTP for phone:", formattedPhone);
      
      console.log("Calling requestOTP API...");
      const response = await requestOTP(formattedPhone);
      console.log("=== OTP REQUEST SUCCESS ===");
      console.log("OTP response:", response);
      
      console.log("=== MOVING TO OTP STEP ===");
      console.log("Before setStep - Current step:", step);
      
      // Move to OTP step and update all related states
      setStepWithDebug(AuthStep.OTP_VERIFICATION);
      setPhoneWithPersist(formattedPhone); // Keep phone in local state as well
      setTimerActiveWithPersist(true);
      setTimeRemainingWithPersist(120);
      
      console.log("After setStep - Step should now be OTP_VERIFICATION");
      
      // In development, auto-fill OTP if provided in response
      if (process.env.NODE_ENV === 'development' && response.code) {
        console.log("Development mode: Auto-filling OTP:", response.code);
        setTimeout(() => {
          console.log("Setting OTP to:", response.code);
          setOTP(response.code);
        }, 1000);
      }
      
    } catch (error) {
      console.log("=== OTP REQUEST FAILED ===");
      console.error("Error requesting OTP:", error);
      console.log("Not moving to OTP step due to error");
    }
    
    console.log("=== PHONE SUBMIT END ===");
  };

  const handleResendOTP = async () => {
    console.log("Resending OTP for phone:", phoneNumber);
    try {
      await requestOTP(phoneNumber);
      setTimerActiveWithPersist(true);
      setTimeRemainingWithPersist(120);
      setOTP("");
    } catch (error) {
      console.error("Error resending OTP:", error);
    }
  };

  const handleOTPSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Manual submitting OTP:", otp);
    
    // Convert Persian/Arabic digits to English in OTP
    const englishOTP = persianToEnglishDigits(otp);
    console.log("English OTP:", englishOTP);
    
    if (!englishOTP || englishOTP.length !== 5) {
      console.log("OTP validation failed - invalid length");
      return;
    }
    
    await handleOTPVerification(englishOTP);
  };

  const handleBackToPhone = () => {
    console.log("=== HANDLE BACK TO PHONE CALLED ===");
    console.log("Going back to phone entry");
    console.log("Stack trace:", new Error().stack);
    
    // Clear session storage and reset to initial state
    sessionStorage.removeItem('loginStep');
    sessionStorage.removeItem('loginPhone');
    sessionStorage.removeItem('loginTimer');
    sessionStorage.removeItem('loginTimerActive');
    
    setStepWithDebug(AuthStep.PHONE_ENTRY);
    setOTP("");
    setTimerActiveWithPersist(false);
    setTimeRemainingWithPersist(120);
    // Reset phone number in context as well
    setPhoneNumber("");
  };

  const handleBackToWebsite = () => {
    // Clear session storage when leaving login page
    sessionStorage.removeItem('loginStep');
    sessionStorage.removeItem('loginPhone');
    sessionStorage.removeItem('loginTimer');
    sessionStorage.removeItem('loginTimerActive');
    
    navigate("/");
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
    setPhoneWithPersist(englishValue);
  };

  console.log("LoginPage render - Step:", step, "Step name:", step === AuthStep.PHONE_ENTRY ? "PHONE_ENTRY" : "OTP_VERIFICATION", "Phone:", phone, "PhoneNumber from context:", phoneNumber);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-md">
        <div className="text-center">
          {/* Back to website button */}
          <div className="flex justify-start mb-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBackToWebsite}
              className="flex items-center text-gray-600 hover:text-gray-800"
            >
              <ArrowRight className="h-4 w-4 ml-1" />
              بازگشت به سایت
            </Button>
           
          </div>
          
          <h2 className="text-3xl font-bold text-trader-500">
            مستر تریدر آکادمی
          </h2>
          <h3 className="mt-2 text-xl font-medium">
            {step === AuthStep.PHONE_ENTRY ? "ورود / ثبت نام" : "تایید کد"}
          </h3>
          
          {/* Debug info in development */}
         
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
                کد تایید به این شماره ارسال خواهد شد 
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
              
              {/* Timer Display */}
              {timerActive && timeRemaining > 0 && (
                <div className="flex items-center justify-center bg-blue-50 border border-blue-200 rounded-md p-3 mb-4">
                  <Clock className="h-4 w-4 text-blue-600 ml-2" />
                  <span className="text-blue-800 text-sm font-medium">
                    زمان باقی‌مانده: {formatTime(timeRemaining)}
                  </span>
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
                کد 5 رقمی ارسال شده را وارد کنید (خودکار تایید می‌شود)
              </p>
            </div>
            
            <div className="flex flex-col space-y-2">
              {/* Manual submit button - now optional since auto-submit is active */}
              <Button 
                type="submit" 
                className="w-full bg-trader-500 hover:bg-trader-600 py-3"
                disabled={isLoading || persianToEnglishDigits(otp).length !== 5}
              >
                {isLoading ? "در حال تایید..." : "تایید کد"}
              </Button>
              
              {/* Resend OTP Button - shows when timer expires */}
              {!timerActive && timeRemaining === 0 && (
                <Button 
                  type="button" 
                  variant="outline" 
                  className="w-full py-3 border-trader-500 text-trader-500 hover:bg-trader-50"
                  onClick={handleResendOTP}
                  disabled={isLoading}
                >
                  {isLoading ? "در حال ارسال..." : "ارسال دوباره کد تایید"}
                </Button>
              )}
              
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
