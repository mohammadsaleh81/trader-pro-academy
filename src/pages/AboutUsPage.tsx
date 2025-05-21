
import React from "react";
import Layout from "@/components/layout/Layout";
import { Award, BookOpen, Users } from "lucide-react";

const AboutUsPage = () => {
  return (
    <Layout>
      <div className="py-8 px-4">
        <h1 className="text-2xl font-bold mb-6 text-center">درباره ما</h1>
        
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold mb-3 text-trader-600">مستر تریدر آکادمی</h2>
              <p className="text-gray-700 leading-relaxed">
                مستر تریدر آکادمی یکی از پیشرو‌ترین مراکز آموزش بازارهای مالی در ایران است. ما با هدف ارتقای سطح دانش مالی و سرمایه‌گذاری در میان علاقه‌مندان به بازارهای مالی، دوره‌های آموزشی متنوعی را ارائه می‌دهیم.
              </p>
            </div>
            
            <div className="grid grid-cols-1 gap-6 pt-4">
              <div className="flex items-start gap-4">
                <div className="bg-trader-100 p-3 rounded-full shrink-0">
                  <BookOpen className="h-5 w-5 text-trader-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">آموزش تخصصی</h3>
                  <p className="text-gray-600">
                    ما با بهره‌گیری از مدرسین متخصص و با تجربه، آموزش‌های کاربردی در زمینه تحلیل تکنیکال، تحلیل بنیادی، مدیریت سرمایه و استراتژی‌های معاملاتی ارائه می‌دهیم.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="bg-trader-100 p-3 rounded-full shrink-0">
                  <Users className="h-5 w-5 text-trader-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">جامعه معامله‌گران</h3>
                  <p className="text-gray-600">
                    با پیوستن به جامعه مستر تریدر، شما به شبکه‌ای از معامله‌گران حرفه‌ای دسترسی خواهید داشت و می‌توانید تجربیات و دانش خود را با دیگر اعضا به اشتراک بگذارید.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="bg-trader-100 p-3 rounded-full shrink-0">
                  <Award className="h-5 w-5 text-trader-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">تعهد به کیفیت</h3>
                  <p className="text-gray-600">
                    ما متعهد هستیم که بهترین و به‌روزترین محتوای آموزشی را در اختیار شما قرار دهیم. تمامی دوره‌های ما مبتنی بر استانداردهای بین‌المللی و تجربیات عملی در بازارهای مالی است.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="pt-6 border-t mt-6">
              <h2 className="text-xl font-semibold mb-4 text-trader-600">تاریخچه ما</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                مستر تریدر آکادمی در سال ۱۳۹۵ با هدف ارتقای سطح دانش مالی در ایران تأسیس شد. از آن زمان تاکنون، بیش از ۱۰,۰۰۰ دانشجو در دوره‌های مختلف ما شرکت کرده‌اند و ما افتخار می‌کنیم که به بسیاری از آنها کمک کرده‌ایم تا به معامله‌گران موفقی تبدیل شوند.
              </p>
              <p className="text-gray-700 leading-relaxed">
                ما همواره در حال توسعه محتوا و خدمات آموزشی خود هستیم تا بتوانیم پاسخگوی نیازهای متغیر بازار و دانشجویان باشیم.
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AboutUsPage;
