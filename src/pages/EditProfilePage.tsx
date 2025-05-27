import React, { useState, useEffect, useRef } from "react";
import Layout from "@/components/layout/Layout";
import { useAuth } from "@/contexts/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, User, Mail, Phone as PhoneIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { api } from "@/lib/api";

const EditProfilePage: React.FC = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user, updateProfile, updateAvatar } = useAuth();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    avatar: ""
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (user) {
      const [firstName, ...lastNameParts] = (user.name || "").split(" ");
      setFormData({
        first_name: firstName || "",
        last_name: lastNameParts.join(" ") || "",
        email: user.email || "",
        phone: user.phone || "",
        avatar: user.avatar || ""
      });
    }
  }, [user]);

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingAvatar(true);
    setError("");

    try {
      const response = await api.uploadAvatar(file);
      setFormData(prev => ({ ...prev, avatar: response.avatar }));
      toast({
        title: "موفقیت",
        description: "تصویر پروفایل با موفقیت بروزرسانی شد.",
      });
    } catch (err) {
      setError("خطا در آپلود تصویر پروفایل");
      toast({
        title: "خطا",
        description: "خطا در آپلود تصویر پروفایل",
        variant: "destructive",
      });
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleDeleteAvatar = async () => {
    setIsUploadingAvatar(true);
    setError("");

    try {
      const response = await api.deleteAvatar();
      setFormData(prev => ({ ...prev, avatar: response.avatar }));
      toast({
        title: "موفقیت",
        description: "تصویر پروفایل با موفقیت حذف شد.",
      });
    } catch (err) {
      setError("خطا در حذف تصویر پروفایل");
      toast({
        title: "خطا",
        description: "خطا در حذف تصویر پروفایل",
        variant: "destructive",
      });
    } finally {
      setIsUploadingAvatar(false);
    }
  };

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
      // Update profile with the form data
      updateProfile({
        name: `${formData.first_name} ${formData.last_name}`.trim(),
        email: formData.email,
      });
      setSuccess(true);
      toast({
        title: "موفقیت",
        description: "اطلاعات شخصی با موفقیت بروزرسانی شد.",
      });
    } catch (err) {
      setError("خطایی در بروزرسانی پروفایل رخ داد. لطفاً دوباره تلاش کنید.");
    } finally {
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
                {formData.avatar ? (
                  <img
                    src={formData.avatar}
                    alt={formData.first_name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="h-10 w-10 text-gray-400" />
                )}
              </div>
              <div>
                <h3 className="font-bold mb-1">تصویر پروفایل</h3>
                <div className="flex gap-2">
                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept="image/*"
                    onChange={handleAvatarChange}
                  />
                  <button
                    type="button"
                    onClick={handleAvatarClick}
                    className="text-trader-500 text-sm font-medium disabled:opacity-50"
                    disabled={isUploadingAvatar}
                  >
                    {isUploadingAvatar ? "در حال آپلود..." : "تغییر تصویر"}
                  </button>
                  <button
                    type="button"
                    onClick={handleDeleteAvatar}
                    className="text-red-500 text-sm font-medium disabled:opacity-50"
                    disabled={isUploadingAvatar}
                  >
                    حذف
                  </button>
                </div>
              </div>
            </div>
            
            <div className="grid gap-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="first_name" className="block text-sm font-medium text-gray-700 mb-1">
                    نام
                  </label>
                  <div className="relative">
                    <User className="absolute top-3 right-3 h-5 w-5 text-gray-400" />
                    <Input
                      id="first_name"
                      name="first_name"
                      type="text"
                      className="pr-10"
                      placeholder="نام"
                      value={formData.first_name}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="last_name" className="block text-sm font-medium text-gray-700 mb-1">
                    نام خانوادگی
                  </label>
                  <div className="relative">
                    <User className="absolute top-3 right-3 h-5 w-5 text-gray-400" />
                    <Input
                      id="last_name"
                      name="last_name"
                      type="text"
                      className="pr-10"
                      placeholder="نام خانوادگی"
                      value={formData.last_name}
                      onChange={handleChange}
                      required
                    />
                  </div>
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
                    disabled
                  />
                </div>
                <p className="mt-1 text-xs text-gray-500">شماره موبایل قابل ویرایش نیست</p>
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
