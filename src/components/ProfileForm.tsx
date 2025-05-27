import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import type { User } from '../lib/api';

export function ProfileForm() {
    const { user, updateProfile } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [formData, setFormData] = useState<Partial<User>>({
        first_name: user?.first_name || '',
        last_name: user?.last_name || '',
        email: user?.email || '',
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);

        try {
            await updateProfile(formData);
        } catch (err) {
            setError('خطا در بروزرسانی پروفایل');
        } finally {
            setIsLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    if (!user) {
        return null;
    }

    return (
        <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg">
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="first_name" className="block text-sm font-medium text-gray-700">
                        نام
                    </label>
                    <input
                        type="text"
                        id="first_name"
                        name="first_name"
                        value={formData.first_name}
                        onChange={handleChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                        required
                    />
                </div>

                <div>
                    <label htmlFor="last_name" className="block text-sm font-medium text-gray-700">
                        نام خانوادگی
                    </label>
                    <input
                        type="text"
                        id="last_name"
                        name="last_name"
                        value={formData.last_name}
                        onChange={handleChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                        required
                    />
                </div>

                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                        ایمیل
                    </label>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                        required
                        dir="ltr"
                    />
                </div>

                <div className="text-sm text-gray-500">
                    شماره موبایل: {user.phone_number}
                </div>

                {error && <p className="text-red-500 text-sm">{error}</p>}

                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                >
                    {isLoading ? 'در حال بروزرسانی...' : 'بروزرسانی پروفایل'}
                </button>
            </form>
        </div>
    );
} 