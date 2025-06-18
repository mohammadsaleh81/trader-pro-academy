import React from "react";
import Layout from "@/components/layout/Layout";
import { useAuth } from "@/contexts/AuthContext";
import { IdentityVerificationForm } from "@/components/IdentityVerificationForm";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

const IdentityVerificationPage: React.FC = () => {
  const { user } = useAuth();

  if (!user) {
    return (
      <Layout>
        <div className="trader-container py-12 text-center">
          <h2 className="text-xl font-bold mb-4">برای احراز هویت ابتدا وارد شوید</h2>
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
        <div className="mb-6">
          <Link
            to="/profile"
            className="flex items-center text-trader-500 hover:text-trader-600 transition-colors duration-200"
          >
            <ArrowRight className="h-5 w-5 ml-2" />
            بازگشت به پروفایل
          </Link>
        </div>
        
        <div className="bg-white rounded-xl shadow-md p-6">
          <h1 className="text-2xl font-bold mb-6 text-center">احراز هویت</h1>
          <p className="text-gray-600 text-center mb-8">
            برای استفاده از تمامی امکانات سایت، لطفاً اطلاعات هویتی خود را وارد کنید
          </p>
          <IdentityVerificationForm />
        </div>
      </div>
    </Layout>
  );
};

export default IdentityVerificationPage; 