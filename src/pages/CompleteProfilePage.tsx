
import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UserIcon, MailIcon, Loader } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const CompleteProfilePage: React.FC = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [nameError, setNameError] = useState("");
  const { user, completeProfile, isLoading, error } = useAuth();
  const navigate = useNavigate();
  const [pageLoading, setPageLoading] = useState(true);

  useEffect(() => {
    // Simulate initial page loading
    const timer = setTimeout(() => {
      setPageLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    console.log('CompleteProfilePage: useEffect - user:', user, 'pageLoading:', pageLoading);
    
    // If user is not logged in, redirect to login page
    if (!user && !pageLoading) {
      console.log('CompleteProfilePage: No user, redirecting to login');
      navigate("/login");
      return;
    }
    
    // If user profile is already complete, redirect to profile page
    if (user?.isProfileComplete && !pageLoading) {
      console.log('CompleteProfilePage: Profile already complete, redirecting to profile');
      navigate("/profile");
    }
  }, [user, navigate, pageLoading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('CompleteProfilePage: Form submitted with:', { name, email });
    
    const trimmedName = name.trim();
    if (!trimmedName) {
      setNameError("لطفاً نام خود را وارد کنید");
      console.log('CompleteProfilePage: Name is empty, not submitting');
      return;
    }
    if (trimmedName.length < 2) {
      setNameError("نام باید حداقل ۲ کاراکتر باشد");
      console.log('CompleteProfilePage: Name is too short, not submitting:', trimmedName);
      return;
    }
    
    // Validate that the name contains at least one valid character (not just spaces or special chars)
    const nameRegex = /^[\u0600-\u06FFa-zA-Z\s]+$/;
    if (!nameRegex.test(trimmedName)) {
      setNameError("نام فقط می‌تواند شامل حروف فارسی و انگلیسی باشد");
      console.log('CompleteProfilePage: Invalid name format:', trimmedName);
      return;
    }
    
    setNameError(""); // Clear any previous error
    
    try {
      console.log('CompleteProfilePage: Calling completeProfile with name:', trimmedName, 'and email:', email.trim());
      console.log('CompleteProfilePage: Current user:', user);
      console.log('CompleteProfilePage: Auth tokens in localStorage:', localStorage.getItem('auth_tokens') ? 'present' : 'missing');
      
      await completeProfile(trimmedName, email.trim());
      console.log('CompleteProfilePage: Profile completed successfully');
      navigate("/profile");
    } catch (error: any) {
      console.error('CompleteProfilePage: Error completing profile:', error);
      
      // Show specific error message if available
      if (error?.message) {
        setNameError(error.message);
      } else if (typeof error === 'string') {
        setNameError(error);
      } else {
        setNameError("خطا در تکمیل پروفایل. لطفاً دوباره تلاش کنید.");
      }
      
      // Error will also be shown via the error state from AuthContext
    }
  };

  if (pageLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-md">
          <div className="text-center">
            <Skeleton className="h-8 w-3/4 mx-auto mb-4" />
            <Skeleton className="h-6 w-1/2 mx-auto mb-2" />
            <Skeleton className="h-4 w-5/6 mx-auto" />
          </div>
          
          <div className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-12 w-full mt-4" />
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-lg">در حال بارگذاری...</p>
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
            تکمیل پروفایل
          </h3>
          <p className="mt-2 text-sm text-gray-500">
            برای استفاده از امکانات سایت، لطفا اطلاعات خود را تکمیل کنید
          </p>
        </div>
        
        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm">
            {error}
          </div>
        )}
        
        {nameError && (
          <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm">
            {nameError}
          </div>
        )}
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                نام و نام خانوادگی
              </label>
              <div className="relative">
                <UserIcon className="absolute top-3 right-3 h-5 w-5 text-gray-400" />
                <Input
                  id="name"
                  name="name"
                  type="text"
                  className="pr-10"
                  placeholder="نام و نام خانوادگی"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    setNameError(""); // Clear error when user types
                  }}
                  required
                  minLength={2}
                />
              </div>
              {nameError && (
                <p className="text-red-500 text-sm mt-1">{nameError}</p>
              )}
            </div>
            
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                ایمیل (اختیاری)
              </label>
              <div className="relative">
                <MailIcon className="absolute top-3 right-3 h-5 w-5 text-gray-400" />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  dir="ltr"
                  className="text-left pr-10"
                  placeholder="email@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>
          </div>
          
          <Button 
            type="submit" 
            className="w-full bg-trader-500 hover:bg-trader-600 py-3"
            disabled={isLoading || !name.trim() || name.trim().length < 2}
          >
            {isLoading ? (
              <span className="flex items-center justify-center">
                <Loader className="h-4 w-4 animate-spin mr-2" />
                در حال ثبت اطلاعات...
              </span>
            ) : (
              "ذخیره اطلاعات"
            )}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default CompleteProfilePage;
