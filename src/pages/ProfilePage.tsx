
import React from "react";
import Layout from "@/components/layout/Layout";
import { useAuth } from "@/contexts/AuthContext";
import { Link } from "react-router-dom";
import { Wallet, File, User, Bookmark, Calendar } from "lucide-react";

const ProfilePage: React.FC = () => {
  const { user, logout } = useAuth();

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
      icon: <Wallet className="h-5 w-5" />,
      title: "کیف پول",
      description: "مدیریت تراکنش‌ها و موجودی کیف پول",
      path: "/wallet"
    },
    {
      icon: <Bookmark className="h-5 w-5" />,
      title: "نشان‌های من",
      description: "محتوای ذخیره شده شما",
      path: "/bookmarks"
    },
    {
      icon: <File className="h-5 w-5" />,
      title: "سفارش‌های من",
      description: "تاریخچه خریدها و سفارش‌ها",
      path: "/orders"
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
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <div className="flex items-center">
            <div className="w-20 h-20 rounded-full overflow-hidden ml-4">
              <img
                src={user.avatar}
                alt={user.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h1 className="text-xl font-bold mb-1">{user.name}</h1>
              <p className="text-gray-500 text-sm">{user.email}</p>
            </div>
          </div>
        </div>

        <div className="grid gap-4">
          {menuItems.map((item, index) => (
            <Link
              key={index}
              to={item.path}
              className="bg-white rounded-xl shadow-md p-4 flex items-center hover:shadow-lg transition-shadow"
            >
              <div className="w-10 h-10 rounded-full bg-trader-50 text-trader-500 flex items-center justify-center ml-4">
                {item.icon}
              </div>
              <div>
                <h3 className="font-bold text-base">{item.title}</h3>
                <p className="text-gray-500 text-sm">{item.description}</p>
              </div>
            </Link>
          ))}
          
          <button
            onClick={() => logout()}
            className="mt-4 w-full py-3 border border-red-500 text-red-500 rounded-xl font-medium hover:bg-red-50 transition-colors"
          >
            خروج از حساب کاربری
          </button>
        </div>
      </div>
    </Layout>
  );
};

export default ProfilePage;
