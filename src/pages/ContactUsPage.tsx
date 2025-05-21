
import React from "react";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Mail, Phone, MapPin } from "lucide-react";

const ContactUsPage = () => {
  return (
    <Layout>
      <div className="py-8 px-4">
        <h1 className="text-2xl font-bold mb-6 text-center">تماس با ما</h1>
        
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="grid grid-cols-1 gap-6">
            <div className="flex flex-col space-y-4">
              <h2 className="text-xl font-semibold text-trader-600">راه‌های ارتباطی</h2>
              
              <div className="flex items-center gap-3">
                <div className="bg-trader-100 p-3 rounded-full">
                  <Phone className="h-5 w-5 text-trader-600" />
                </div>
                <div>
                  <p className="font-semibold">شماره تماس</p>
                  <p className="text-gray-600">۰۲۱-۸۸۷۷۶۶۵۵</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="bg-trader-100 p-3 rounded-full">
                  <Mail className="h-5 w-5 text-trader-600" />
                </div>
                <div>
                  <p className="font-semibold">پست الکترونیکی</p>
                  <p className="text-gray-600">info@mrtrader.com</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="bg-trader-100 p-3 rounded-full">
                  <MapPin className="h-5 w-5 text-trader-600" />
                </div>
                <div>
                  <p className="font-semibold">آدرس</p>
                  <p className="text-gray-600">تهران، خیابان ولیعصر، مرکز آموزش مستر تریدر</p>
                </div>
              </div>
            </div>
            
            <div className="border-t pt-6 mt-4">
              <h2 className="text-xl font-semibold mb-4 text-trader-600">فرم تماس</h2>
              <form className="space-y-4">
                <div>
                  <label htmlFor="name" className="block mb-1 font-medium">نام و نام خانوادگی</label>
                  <input 
                    type="text" 
                    id="name" 
                    className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-trader-500"
                  />
                </div>
                
                <div>
                  <label htmlFor="email" className="block mb-1 font-medium">ایمیل</label>
                  <input 
                    type="email" 
                    id="email" 
                    className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-trader-500"
                  />
                </div>
                
                <div>
                  <label htmlFor="message" className="block mb-1 font-medium">پیام</label>
                  <textarea 
                    id="message" 
                    rows={4} 
                    className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-trader-500"
                  ></textarea>
                </div>
                
                <Button type="submit" className="bg-trader-500 hover:bg-trader-600 w-full">
                  ارسال پیام
                </Button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ContactUsPage;
