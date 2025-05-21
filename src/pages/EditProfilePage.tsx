
import React, { useState } from "react";
import Layout from "@/components/layout/Layout";
import { useAuth } from "@/contexts/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, User, Mail, Phone as PhoneIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const EditProfilePage: React.FC = () => {
  const { user, updateProfile } = useAuth();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    avatar: user?.avatar || ""
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccess(false);
    
    try {
      // In a real application, this would call your API to update the profile
      // For now, we'll simulate the update
      setTimeout(() => {
        if (updateProfile) {
          updateProfile(formData);
        }
        setSuccess(true);
        setIsLoading(false);
      }, 1000);
    } catch (err) {
      setError("خطایی در بروزرسانی پروفایل رخ داد. لطفاً دوباره تلاش کنید.");
      setIsLoading(false);
    }
  };

  if (!user) {
    return (
      <Layout>
        <div className="trader-container py-12 text-center">
          <h2 className="text-xl font-bold mb-4">برای ویرایش پروفایل خود ابتدا وارد شوید</h2>
          <Link to="/login" className="trader-btn-primary">
            ورود به حساب کاربری
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="trader-container py-6">
        <div className="flex items-center mb-6">
          <Link to="/profile" className="flex items-center text-gray-600 hover:text-trader-500">
            <ArrowRight className="h-5 w-5 ml-1" />
            <span>بازگشت به پروفایل</span>
          </Link>
          <h1 className="text-2xl font-bold mr-auto">ویرایش اطلاعات شخصی</h1>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6">
              {error}
            </div>
          )}
          
          {success && (
            <div className="bg-green-50 text-green-600 p-4 rounded-lg mb-6">
              اطلاعات شخصی شما با موفقیت بروزرسانی شد.
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex items-center mb-6">
              <div className="w-20 h-20 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center ml-4">
                {user.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="h-10 w-10 text-gray-400" />
                )}
              </div>
              <div>
                <h3 className="font-bold mb-1">تصویر پروفایل</h3>
                <button type="button" className="text-trader-500 text-sm font-medium">
                  تغییر تصویر
                </button>
              </div>
            </div>
            
            <div className="grid gap-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  نام و نام خانوادگی
                </label>
                <div className="relative">
                  <User className="absolute top-3 right-3 h-5 w-5 text-gray-400" />
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    className="pr-10"
                    placeholder="نام و نام خانوادگی"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  ایمیل
                </label>
                <div className="relative">
                  <Mail className="absolute top-3 right-3 h-5 w-5 text-gray-400" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    dir="ltr"
                    className="text-left pr-10"
                    placeholder="email@example.com"
                    value={formData.email}
                    onChange={handleChange}
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                  شماره تلفن
                </label>
                <div className="relative">
                  <PhoneIcon className="absolute top-3 right-3 h-5 w-5 text-gray-400" />
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    dir="ltr"
                    className="text-left pr-10"
                    placeholder="09xxxxxxxxx"
                    value={formData.phone}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>
            
            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                className="border-trader-500 text-trader-500"
                onClick={() => navigate("/profile")}
              >
                انصراف
              </Button>
              <Button 
                type="submit" 
                className="bg-trader-500 hover:bg-trader-600 py-3"
                disabled={isLoading}
              >
                {isLoading ? "در حال ذخیره..." : "ذخیره تغییرات"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
};

export default EditProfilePage;
