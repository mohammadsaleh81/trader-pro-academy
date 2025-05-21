
import React from "react";
import { Link } from "react-router-dom";
import { Mail, Phone } from "lucide-react";

const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t border-gray-200 pt-8 pb-4">
      <div className="trader-container px-4">
        <div className="grid grid-cols-2 gap-8 mb-8">
          <div>
            <h3 className="font-semibold text-lg mb-4">مستر تریدر آکادمی</h3>
            <p className="text-gray-600 text-sm leading-relaxed mb-4">
              آموزش تخصصی بازارهای مالی با روش‌های کاربردی و به روز برای علاقه‌مندان به سرمایه‌گذاری و معامله‌گری
            </p>
            <div className="flex flex-col space-y-2">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Phone className="h-4 w-4" />
                <span>۰۲۱-۸۸۷۷۶۶۵۵</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Mail className="h-4 w-4" />
                <span>info@mrtrader.com</span>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold mb-3">دسترسی سریع</h3>
              <ul className="space-y-2 text-sm">
                <li><Link to="/" className="text-gray-600 hover:text-trader-500">صفحه اصلی</Link></li>
                <li><Link to="/courses" className="text-gray-600 hover:text-trader-500">دوره‌های آموزشی</Link></li>
                <li><Link to="/content" className="text-gray-600 hover:text-trader-500">محتوای آموزشی</Link></li>
                <li><Link to="/about-us" className="text-gray-600 hover:text-trader-500">درباره ما</Link></li>
                <li><Link to="/contact-us" className="text-gray-600 hover:text-trader-500">تماس با ما</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-3">حساب کاربری</h3>
              <ul className="space-y-2 text-sm">
                <li><Link to="/profile" className="text-gray-600 hover:text-trader-500">پروفایل</Link></li>
                <li><Link to="/my-courses" className="text-gray-600 hover:text-trader-500">دوره‌های من</Link></li>
                <li><Link to="/bookmarks" className="text-gray-600 hover:text-trader-500">نشان‌های من</Link></li>
                <li><Link to="/wallet" className="text-gray-600 hover:text-trader-500">کیف پول</Link></li>
              </ul>
            </div>
          </div>
        </div>
        
        <div className="border-t border-gray-200 pt-4 text-center">
          <p className="text-sm text-gray-500">
            © {new Date().getFullYear()} مستر تریدر آکادمی. تمامی حقوق محفوظ است.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
