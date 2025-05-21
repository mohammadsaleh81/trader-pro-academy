
import React, { useState } from "react";
import Layout from "@/components/layout/Layout";
import { useAuth } from "@/contexts/AuthContext";
import { Link } from "react-router-dom";
import { ArrowRight, FileText, Clock, Check, AlertTriangle, Search } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";

const OrdersPage: React.FC = () => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");

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

  // Filter orders based on search query
  const filteredOrders = searchQuery 
    ? orders.filter(order => 
        order.title.includes(searchQuery) || 
        order.id.includes(searchQuery)
      )
    : orders;

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
        
        {/* Search Box */}
        {orders.length > 0 && (
          <div className="mb-6">
            <div className="relative">
              <input
                type="text"
                placeholder="جستجو در سفارش‌ها..."
                className="w-full border border-gray-200 rounded-lg py-2 px-10 focus:outline-none focus:ring-2 focus:ring-trader-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            </div>
          </div>
        )}

        {orders.length > 0 ? (
          filteredOrders.length > 0 ? (
            <div className="grid gap-4">
              {filteredOrders.map((order) => (
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
            <EmptyState 
              icon={<Search className="h-16 w-16" />}
              title="نتیجه‌ای یافت نشد"
              description={`هیچ سفارشی منطبق با عبارت "${searchQuery}" یافت نشد`}
              action={
                <Button 
                  onClick={() => setSearchQuery("")}
                  variant="outline" 
                  className="mt-4"
                >
                  پاک کردن جستجو
                </Button>
              }
            />
          )
        ) : (
          <EmptyState
            icon={<FileText className="h-16 w-16" />}
            title="هنوز سفارشی ثبت نکرده‌اید"
            description="تاریخچه سفارش‌های شما در اینجا نمایش داده خواهد شد"
            action={
              <Button asChild className="mt-4 bg-trader-500 hover:bg-trader-600">
                <Link to="/courses">مشاهده دوره‌های آموزشی</Link>
              </Button>
            }
          />
        )}
      </div>
    </Layout>
  );
};

export default OrdersPage;
