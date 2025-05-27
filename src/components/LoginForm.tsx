import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

export function LoginForm() {
    const { requestOTP, login } = useAuth();
    const [phoneNumber, setPhoneNumber] = useState('');
    const [otpCode, setOtpCode] = useState('');
    const [isOTPRequested, setIsOTPRequested] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleRequestOTP = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);

        try {
            await requestOTP(phoneNumber);
            setIsOTPRequested(true);
        } catch (err) {
            setError('خطا در ارسال کد تایید');
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerifyOTP = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);

        try {
            await login(phoneNumber, otpCode);
        } catch (err) {
            setError('کد تایید نامعتبر است');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg">
            {!isOTPRequested ? (
                <form onSubmit={handleRequestOTP} className="space-y-4">
                    <div>
                        <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700">
                            شماره موبایل
                        </label>
                        <input
                            type="tel"
                            id="phoneNumber"
                            value={phoneNumber}
                            onChange={(e) => setPhoneNumber(e.target.value)}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                            placeholder="09123456789"
                            required
                            dir="ltr"
                        />
                    </div>
                    {error && <p className="text-red-500 text-sm">{error}</p>}
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                    >
                        {isLoading ? 'در حال ارسال...' : 'دریافت کد تایید'}
                    </button>
                </form>
            ) : (
                <form onSubmit={handleVerifyOTP} className="space-y-4">
                    <div>
                        <label htmlFor="otpCode" className="block text-sm font-medium text-gray-700">
                            کد تایید
                        </label>
                        <input
                            type="text"
                            id="otpCode"
                            value={otpCode}
                            onChange={(e) => setOtpCode(e.target.value)}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                            placeholder="کد 5 رقمی"
                            required
                            dir="ltr"
                        />
                    </div>
                    {error && <p className="text-red-500 text-sm">{error}</p>}
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                    >
                        {isLoading ? 'در حال بررسی...' : 'ورود'}
                    </button>
                    <button
                        type="button"
                        onClick={() => setIsOTPRequested(false)}
                        className="w-full text-center text-sm text-gray-600 hover:text-gray-900"
                    >
                        تغییر شماره موبایل
                    </button>
                </form>
            )}
        </div>
    );
} 