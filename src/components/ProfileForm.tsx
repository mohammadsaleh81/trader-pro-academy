import React, { useState, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { UserIcon, MailIcon, Loader, Camera, Upload } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from './ui/avatar';
import { api } from '../lib/api';
import type { User } from '../lib/api';

export function ProfileForm() {
    const { user, updateProfile, updateAvatar } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [formData, setFormData] = useState({
        first_name: user?.first_name || '',
        last_name: user?.last_name || '',
        email: user?.email || '',
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccess(false);
        setIsLoading(true);

        console.log('ProfileForm: handleSubmit called with formData:', formData);

        try {
            await updateProfile(formData);
            setSuccess(true);
        } catch (err: any) {
            console.error('ProfileForm: Error updating profile:', err);
            setError(err?.message || 'خطا در بروزرسانی پروفایل');
        } finally {
            setIsLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleAvatarClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
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
        setIsUploadingAvatar(true);

        try {
            const response = await api.uploadAvatar(file);
            updateAvatar(response.avatar);
            setSuccess(true);
        } catch (err) {
            setError('خطا در آپلود عکس پروفایل');
        } finally {
            setIsUploadingAvatar(false);
        }
    };

    if (!user) {
        return null;
    }

    return (
        <div className="max-w-md mx-auto">
            {/* Avatar Section */}
            <div className="flex flex-col items-center mb-8">
                <div className="relative group">
                    <Avatar className="w-24 h-24 border-4 border-gray-200">
                        <AvatarImage src={user.avatar} alt={`${user.first_name} ${user.last_name}`} />
                        <AvatarFallback className="text-xl">
                            {user.first_name?.[0]}{user.last_name?.[0]}
                        </AvatarFallback>
                    </Avatar>
                    
                    <button
                        type="button"
                        onClick={handleAvatarClick}
                        disabled={isUploadingAvatar}
                        className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 disabled:cursor-not-allowed"
                    >
                        {isUploadingAvatar ? (
                            <Loader className="h-6 w-6 animate-spin" />
                        ) : (
                            <Camera className="h-6 w-6" />
                        )}
                    </button>
                </div>
                
                <button
                    type="button"
                    onClick={handleAvatarClick}
                    disabled={isUploadingAvatar}
                    className="mt-3 text-sm text-trader-500 hover:text-trader-600 transition-colors duration-200 flex items-center gap-1 disabled:opacity-50"
                >
                    <Upload className="h-4 w-4" />
                    {isUploadingAvatar ? 'در حال آپلود...' : 'تغییر عکس پروفایل'}
                </button>
                
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                />
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label htmlFor="first_name" className="block text-sm font-medium text-gray-700 mb-1">
                        نام
                    </label>
                    <div className="relative">
                        <UserIcon className="absolute top-3 right-3 h-5 w-5 text-gray-400" />
                        <Input
                            type="text"
                            id="first_name"
                            name="first_name"
                            value={formData.first_name}
                            onChange={handleChange}
                            className="pr-10"
                            placeholder="نام خود را وارد کنید"
                            required
                        />
                    </div>
                </div>

                <div>
                    <label htmlFor="last_name" className="block text-sm font-medium text-gray-700 mb-1">
                        نام خانوادگی
                    </label>
                    <div className="relative">
                        <UserIcon className="absolute top-3 right-3 h-5 w-5 text-gray-400" />
                        <Input
                            type="text"
                            id="last_name"
                            name="last_name"
                            value={formData.last_name}
                            onChange={handleChange}
                            className="pr-10"
                            placeholder="نام خانوادگی خود را وارد کنید"
                            required
                        />
                    </div>
                </div>

                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                        ایمیل
                    </label>
                    <div className="relative">
                        <MailIcon className="absolute top-3 right-3 h-5 w-5 text-gray-400" />
                        <Input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            className="text-left pr-10"
                            placeholder="email@example.com"
                            required
                            dir="ltr"
                        />
                    </div>
                </div>

                <div className="bg-gray-50 p-3 rounded-md">
                    <p className="text-sm text-gray-600">
                        شماره موبایل: <span className="font-medium">{user.phone_number}</span>
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                        برای تغییر شماره موبایل با پشتیبانی تماس بگیرید
                    </p>
                </div>

                {error && (
                    <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm">
                        {error}
                    </div>
                )}

                {success && (
                    <div className="bg-green-50 text-green-600 p-3 rounded-md text-sm">
                        اطلاعات شما با موفقیت بروزرسانی شد
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
                            در حال بروزرسانی...
                        </span>
                    ) : (
                        "بروزرسانی پروفایل"
                    )}
                </Button>
            </form>
        </div>
    );
}
