import React, { useState, useEffect } from "react";
import Layout from "@/components/layout/Layout";
import { useAuth } from "@/contexts/AuthContext";
import { Link } from "react-router-dom";
import { Wallet, User, Bookmark, Calendar, Shield, CheckCircle2 } from "lucide-react";

const ProfilePage: React.FC = () => {
  const { user, logout } = useAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!user) {
    return (
      <Layout>
        <div className="trader-container py-12 text-center">
          <h2 className="text-xl font-bold mb-4">برای مشاهده پروفایل خود ابتدا وارد شوید</h2>
          <Link to="/login" className="trader-btn-primary">
            ورود به حساب کاربری
          </Link>
        </div>
      </Layout>
    );
  }

  const menuItems = [
    {
      icon: <Calendar className="h-5 w-5" />,
      title: "دوره‌های من",
      description: "مشاهده و ادامه دوره‌های خریداری شده",
      path: "/my-courses"
    },
    {
      icon: <Bookmark className="h-5 w-5" />,
      title: "نشان‌های من",
      description: "محتوای ذخیره شده شما",
      path: "/bookmarks"
    },
    {
      icon: <User className="h-5 w-5" />,
      title: "اطلاعات شخصی",
      description: "ویرایش پروفایل و مشخصات کاربری",
      path: "/edit-profile"
    }
  ];

  return (
    <Layout>
      <div className="trader-container py-6">
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
                {user.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.name || 'تصویر پروفایل'}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <User className="h-8 w-8 text-gray-400" />
                )}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-bold">{user.name || 'کاربر'}</h1>
                  {user.identity_verified && (
                    <div className="flex items-center gap-1 text-sm text-green-600 bg-green-50 px-2 py-1 rounded-full">
                      <CheckCircle2 className="h-4 w-4" />
                      <span>احراز شده</span>
                    </div>
                  )}
                </div>
                <p className="text-gray-500">{user.phone}</p>
              </div>
            </div>
          
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {menuItems.map((item, index) => (
              <Link
                key={index}
                to={item.path}
                className="flex items-center gap-4 p-4 rounded-lg border border-gray-100 hover:border-trader-500 transition-colors duration-200"
              >
                <div className="p-2 rounded-lg bg-gray-50 text-trader-500">
                  {item.icon}
                </div>
                <div>
                  <h3 className="font-medium">{item.title}</h3>
                  <p className="text-sm text-gray-500">{item.description}</p>
                </div>
              </Link>
            ))}
          </div>

          {!user.identity_verified && (
            <div className="mt-6 pt-6 border-t border-gray-100">
              <Link
                to="/identity-verification"
                className="flex items-center gap-2 text-sm text-gray-500 hover:text-trader-500 transition-colors duration-200"
              >
                <Shield className="h-4 w-4" />
                <span>تکمیل احراز هویت</span>
              </Link>
            </div>
          )}

          <button
            onClick={logout}
            className="mt-6 w-full py-3 border border-red-500 text-red-500 rounded-xl font-medium hover:bg-red-50 transition-colors duration-200"
          >
            خروج از حساب کاربری
          </button>
        </div>
      </div>
    </Layout>
  );
};

export default ProfilePage;
