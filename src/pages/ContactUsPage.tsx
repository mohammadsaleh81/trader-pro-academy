
import React, { useState } from "react";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Mail, Phone, MapPin } from "lucide-react";
import { FormField } from "@/components/ui/form-field";
import { toast } from "@/hooks/use-toast";
import { 
  Form,
  FormField as ShadcnFormField,
  FormItem,
  FormControl,
  FormMessage
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

// Define the form validation schema
const contactFormSchema = z.object({
  name: z.string().min(3, { message: "نام باید حداقل ۳ کاراکتر باشد" }),
  email: z.string().email({ message: "لطفاً یک ایمیل معتبر وارد کنید" }),
  message: z.string().min(10, { message: "پیام باید حداقل ۱۰ کاراکتر باشد" })
});

type ContactFormValues = z.infer<typeof contactFormSchema>;

const ContactUsPage = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Initialize the form with react-hook-form
  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      name: "",
      email: "",
      message: ""
    },
    mode: "onBlur" // Show validation errors when field loses focus
  });

  const onSubmit = async (data: ContactFormValues) => {
    setIsSubmitting(true);
    
    try {
      // In a real application, this would be an API call
      console.log("Form submitted:", data);
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Show success toast
      toast({
        title: "پیام شما با موفقیت ارسال شد",
        description: "با تشکر از تماس شما. به زودی با شما تماس خواهیم گرفت.",
      });
      
      // Reset form
      form.reset();
    } catch (error) {
      toast({
        title: "خطا در ارسال پیام",
        description: "متأسفانه مشکلی در ارسال پیام شما پیش آمد. لطفاً دوباره تلاش کنید.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Layout>
      <div className="py-8 px-4 max-w-5xl mx-auto">
        <h1 className="text-2xl font-bold mb-6 text-center">تماس با ما</h1>
        
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
            
            <div className="border-t pt-6 mt-4 md:border-t-0 md:pt-0 md:mt-0 md:border-r md:pr-6">
              <h2 className="text-xl font-semibold mb-4 text-trader-600">فرم تماس</h2>
              
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <ShadcnFormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormField
                        id="name"
                        label="نام و نام خانوادگی"
                        placeholder="نام و نام خانوادگی خود را وارد کنید"
                        required
                        error={form.formState.errors.name?.message}
                        {...field}
                      />
                    )}
                  />
                  
                  <ShadcnFormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormField
                        id="email"
                        type="email"
                        label="ایمیل"
                        placeholder="example@email.com" 
                        required
                        error={form.formState.errors.email?.message}
                        dir="ltr"
                        className="text-left"
                        {...field}
                      />
                    )}
                  />
                  
                  <ShadcnFormField
                    control={form.control}
                    name="message"
                    render={({ field }) => (
                      <FormField
                        id="message"
                        type="textarea"
                        label="پیام"
                        placeholder="پیام خود را بنویسید..."
                        required
                        error={form.formState.errors.message?.message}
                        {...field}
                      />
                    )}
                  />
                  
                  <Button 
                    type="submit" 
                    className="bg-trader-500 hover:bg-trader-600 w-full"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'در حال ارسال...' : 'ارسال پیام'}
                  </Button>
                </form>
              </Form>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ContactUsPage;
