
import React from "react";
import Layout from "@/components/layout/Layout";
import { useAuth } from "@/contexts/AuthContext";
import { Link } from "react-router-dom";
import { ArrowRight, FileText, Clock, Check, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

const OrdersPage: React.FC = () => {
  const { user } = useAuth();

  // Sample order data (in a real app, this would come from an API)
  const orders = [
    {
      id: "ORD-1234",
      date: "۱۴۰۴/۰۲/۱۵",
      title: "دوره جامع تحلیل تکنیکال",
      price: "۲,۵۰۰,۰۰۰",
      status: "completed",
    },
    {
      id: "ORD-1235",
      date: "۱۴۰۴/۰۱/۱۸",
      title: "سمینار آموزشی معاملات ارز دیجیتال",
      price: "۹۵۰,۰۰۰",
      status: "completed",
    },
    {
      id: "ORD-1236",
      date: "۱۴۰۳/۱۲/۰۵",
      title: "کتاب الکترونیکی اصول سرمایه‌گذاری",
      price: "۳۵۰,۰۰۰",
      status: "processing",
    },
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <Check className="h-5 w-5 text-green-500" />;
      case "processing":
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case "cancelled":
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
      default:
        return <FileText className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "completed":
        return "تکمیل شده";
      case "processing":
        return "در حال پردازش";
      case "cancelled":
        return "لغو شده";
      default:
        return "نامشخص";
    }
  };

  if (!user) {
    return (
      <Layout>
        <div className="trader-container py-12 text-center">
          <h2 className="text-xl font-bold mb-4">برای مشاهده سفارش‌های خود ابتدا وارد شوید</h2>
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
          <h1 className="text-2xl font-bold mr-auto">سفارش‌های من</h1>
        </div>

        {orders.length > 0 ? (
          <div className="grid gap-4">
            {orders.map((order) => (
              <Card key={order.id} className="overflow-hidden">
                <CardContent className="p-0">
                  <div className="flex flex-col md:flex-row md:items-center justify-between p-6 border-b border-gray-100">
                    <div className="mb-3 md:mb-0">
                      <h3 className="font-bold text-lg mb-1">{order.title}</h3>
                      <div className="flex items-center text-sm text-gray-500">
                        <span className="ml-3">شماره سفارش: {order.id}</span>
                        <span>تاریخ: {order.date}</span>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <div className="flex items-center ml-4">
                        {getStatusIcon(order.status)}
                        <span className="mr-1 text-sm">{getStatusText(order.status)}</span>
                      </div>
                      <div className="font-bold">{order.price} تومان</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-md p-8 text-center">
            <FileText className="h-16 w-16 mx-auto mb-4 text-gray-300" />
            <h2 className="text-xl font-bold mb-2">هنوز سفارشی ثبت نکرده‌اید</h2>
            <p className="text-gray-500 mb-6">تاریخچه سفارش‌های شما در اینجا نمایش داده خواهد شد</p>
            <Link
              to="/courses"
              className="inline-block bg-trader-500 text-white px-6 py-3 rounded-lg hover:bg-trader-600 transition-colors"
            >
              مشاهده دوره‌های آموزشی
            </Link>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default OrdersPage;
