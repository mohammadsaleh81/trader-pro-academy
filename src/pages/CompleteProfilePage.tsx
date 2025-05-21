
import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UserIcon, MailIcon } from "lucide-react";

const CompleteProfilePage: React.FC = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const { user, completeProfile, isLoading, error } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // If user is not logged in, redirect to login page
    if (!user) {
      navigate("/login");
      return;
    }
    
    // If user profile is already complete, redirect to profile page
    if (user.isProfileComplete) {
      navigate("/profile");
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name) {
      return; // Could add error state here
    }
    
    await completeProfile(name, email);
    navigate("/profile");
  };

  if (!user || isLoading) {
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
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
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
            disabled={isLoading || !name}
          >
            {isLoading ? "در حال ثبت اطلاعات..." : "ذخیره اطلاعات"}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default CompleteProfilePage;
