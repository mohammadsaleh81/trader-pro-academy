import React, { useState, useRef, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Loader, Upload, AlertCircle, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { api } from '../lib/api';
import { useAuth } from '@/contexts/AuthContext';

interface IdentityVerificationFormProps {
  onSuccess?: () => void;
}

interface VerificationStatus {
  id: number;
  user: number;
  national_cart: string;
  national_cart_back: string | null;
  national_code: string;
  other_data: any;
  status: 'pending' | 'approved' | 'rejected' | 'verified';
  is_verify: boolean;
  rejected_detail: string | null;
  created_at: string;
  updated_at: string;
  submitted_at: string;
  rejected_at: string | null;
  review_by: string | null;
  status_message: string;
  status_code: string;
}

export function IdentityVerificationForm({ onSuccess }: IdentityVerificationFormProps) {
  const { user, refreshUser } = useAuth();
  const [nationalCode, setNationalCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [verificationStatus, setVerificationStatus] = useState<VerificationStatus | null>(null);
  const [isLoadingStatus, setIsLoadingStatus] = useState(true);

  useEffect(() => {
    fetchVerificationStatus();
  }, []);

  const fetchVerificationStatus = async () => {
    try {
      const response = await fetch('http://127.0.0.1:8000/user/profile/identity-verification/', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_tokens')?.split('"')[3]}`,
        },
      });

      if (!response.ok) {
        throw new Error('خطا در دریافت وضعیت احراز هویت');
      }

      const data = await response.json();
      setVerificationStatus(data);
      
      // If verification exists, populate the form
      if (data.national_code) {
        setNationalCode(data.national_code);
      }

      // If verification is verified, refresh user data
      if (data.status === 'verified' || data.is_verify) {
        refreshUser();
      }
    } catch (err: any) {
      console.error('Error fetching verification status:', err);
      setError(err.message || 'خطا در دریافت وضعیت احراز هویت');
    } finally {
      setIsLoadingStatus(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setIsLoading(true);

    if (!selectedFile) {
      setError('لطفاً تصویر کارت ملی خود را آپلود کنید');
      setIsLoading(false);
      return;
    }

    if (!nationalCode || nationalCode.length !== 10) {
      setError('کد ملی باید 10 رقم باشد');
      setIsLoading(false);
      return;
    }

    try {
      const formData = new FormData();
      formData.append('national_code', nationalCode);
      formData.append('national_cart', selectedFile);

      // Use PUT method if verification was previously rejected
      const method = verificationStatus?.status === 'rejected' ? 'PUT' : 'POST';

      const response = await fetch('http://127.0.0.1:8000/user/profile/identity-verification/', {
        method,
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_tokens')?.split('"')[3]}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error('خطا در ارسال اطلاعات');
      }

      const responseData = await response.json();
      
      // Handle nested data structure for PUT response
      const verificationData = responseData.data || responseData;
      
      setSuccess(true);
      setVerificationStatus(verificationData);

      // If verification is verified, refresh user data
      if (verificationData.status === 'verified' || verificationData.is_verify) {
        refreshUser();
      }

      if (onSuccess) {
        onSuccess();
      }
    } catch (err: any) {
      setError(err.message || 'خطا در ارسال اطلاعات');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('لطفاً یک فایل تصویری انتخاب کنید');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('حجم فایل نباید بیشتر از 5 مگابایت باشد');
      return;
    }

    setError(null);
    setSelectedFile(file);
  };

  const renderStatus = () => {
    if (!verificationStatus) return null;

    // If user is already verified, show approved status
    if (user?.identity_verified) {
      return (
        <div className="bg-green-50 text-green-700 p-4 rounded-lg mb-6 flex items-center gap-2">
          <CheckCircle2 className="h-5 w-5 text-green-500" />
          <div>
            <p className="font-medium">احراز هویت تایید شده</p>
          </div>
        </div>
      );
    }

    const statusConfig = {
      pending: {
        icon: <Clock className="h-5 w-5 text-yellow-500" />,
        bgColor: 'bg-yellow-50',
        textColor: 'text-yellow-700',
        message: 'در انتظار بررسی'
      },
      approved: {
        icon: <CheckCircle2 className="h-5 w-5 text-green-500" />,
        bgColor: 'bg-green-50',
        textColor: 'text-green-700',
        message: 'احراز هویت تایید شده'
      },
      rejected: {
        icon: <XCircle className="h-5 w-5 text-red-500" />,
        bgColor: 'bg-red-50',
        textColor: 'text-red-700',
        message: verificationStatus.rejected_detail || 'احراز هویت رد شده'
      }
    };

    // Get the status configuration, defaulting to pending if status is not recognized
    const config = statusConfig[verificationStatus.status as keyof typeof statusConfig] || statusConfig.pending;

    return (
      <div className={`${config.bgColor} ${config.textColor} p-4 rounded-lg mb-6 flex items-center gap-2`}>
        {config.icon}
        <div>
          <p className="font-medium">{config.message}</p>
          {verificationStatus.status === 'rejected' && verificationStatus.rejected_detail && (
            <p className="text-sm mt-1">{verificationStatus.rejected_detail}</p>
          )}
        </div>
      </div>
    );
  };

  if (isLoadingStatus) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader className="h-8 w-8 animate-spin text-trader-500" />
      </div>
    );
  }

  // If user is already verified, show only the status
  if (user?.identity_verified) {
    return (
      <div className="max-w-md mx-auto">
        {renderStatus()}
        <div className="bg-gray-50 p-4 rounded-lg">
          <p className="text-gray-600 text-sm">
            کد ملی: {verificationStatus?.national_code}
          </p>
          <p className="text-gray-600 text-sm mt-2">
            تاریخ ثبت: {verificationStatus?.created_at ? new Date(verificationStatus.created_at).toLocaleDateString('fa-IR') : ''}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto">
      {renderStatus()}
      
      {verificationStatus?.status === 'rejected' && (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="national_code" className="block text-sm font-medium text-gray-700 mb-1">
              کد ملی
            </label>
            <Input
              type="text"
              id="national_code"
              value={nationalCode}
              onChange={(e) => setNationalCode(e.target.value)}
              className="text-left"
              placeholder="کد ملی خود را وارد کنید"
              required
              maxLength={10}
              dir="ltr"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              تصویر کارت ملی
            </label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
              <div className="space-y-1 text-center">
                <Upload className="mx-auto h-12 w-12 text-gray-400" />
                <div className="flex text-sm text-gray-600">
                  <label
                    htmlFor="file-upload"
                    className="relative cursor-pointer bg-white rounded-md font-medium text-trader-500 hover:text-trader-600 focus-within:outline-none"
                  >
                    <span>آپلود فایل</span>
                    <input
                      id="file-upload"
                      name="file-upload"
                      type="file"
                      className="sr-only"
                      accept="image/*"
                      onChange={handleFileChange}
                      ref={fileInputRef}
                    />
                  </label>
                  <p className="pr-1">یا فایل را اینجا رها کنید</p>
                </div>
                <p className="text-xs text-gray-500">
                  PNG, JPG, GIF تا 5MB
                </p>
                {selectedFile && (
                  <p className="text-sm text-gray-500">
                    فایل انتخاب شده: {selectedFile.name}
                  </p>
                )}
              </div>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm flex items-center">
              <AlertCircle className="h-4 w-4 ml-2" />
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-50 text-green-600 p-3 rounded-md text-sm">
              اطلاعات هویتی شما با موفقیت ثبت شد و در انتظار بررسی است
            </div>
          )}

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full bg-trader-500 hover:bg-trader-600 py-3"
          >
            {isLoading ? (
              <span className="flex items-center justify-center">
                <Loader className="h-4 w-4 animate-spin ml-2" />
                در حال ارسال...
              </span>
            ) : (
              "ارسال مجدد اطلاعات هویتی"
            )}
          </Button>
        </form>
      )}

      {!verificationStatus && (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="national_code" className="block text-sm font-medium text-gray-700 mb-1">
              کد ملی
            </label>
            <Input
              type="text"
              id="national_code"
              value={nationalCode}
              onChange={(e) => setNationalCode(e.target.value)}
              className="text-left"
              placeholder="کد ملی خود را وارد کنید"
              required
              maxLength={10}
              dir="ltr"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              تصویر کارت ملی
            </label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
              <div className="space-y-1 text-center">
                <Upload className="mx-auto h-12 w-12 text-gray-400" />
                <div className="flex text-sm text-gray-600">
                  <label
                    htmlFor="file-upload"
                    className="relative cursor-pointer bg-white rounded-md font-medium text-trader-500 hover:text-trader-600 focus-within:outline-none"
                  >
                    <span>آپلود فایل</span>
                    <input
                      id="file-upload"
                      name="file-upload"
                      type="file"
                      className="sr-only"
                      accept="image/*"
                      onChange={handleFileChange}
                      ref={fileInputRef}
                    />
                  </label>
                  <p className="pr-1">یا فایل را اینجا رها کنید</p>
                </div>
                <p className="text-xs text-gray-500">
                  PNG, JPG, GIF تا 5MB
                </p>
                {selectedFile && (
                  <p className="text-sm text-gray-500">
                    فایل انتخاب شده: {selectedFile.name}
                  </p>
                )}
              </div>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm flex items-center">
              <AlertCircle className="h-4 w-4 ml-2" />
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-50 text-green-600 p-3 rounded-md text-sm">
              اطلاعات هویتی شما با موفقیت ثبت شد و در انتظار بررسی است
            </div>
          )}

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full bg-trader-500 hover:bg-trader-600 py-3"
          >
            {isLoading ? (
              <span className="flex items-center justify-center">
                <Loader className="h-4 w-4 animate-spin ml-2" />
                در حال ارسال...
              </span>
            ) : (
              "ارسال اطلاعات هویتی"
            )}
          </Button>
        </form>
      )}
    </div>
  );
} 