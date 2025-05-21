
import React from "react";
import { 
  FormItem, 
  FormLabel, 
  FormControl, 
  FormDescription, 
  FormMessage 
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface FormFieldProps {
  id: string;
  label: string;
  type?: "text" | "email" | "password" | "tel" | "number" | "textarea";
  description?: string;
  placeholder?: string;
  required?: boolean;
  className?: string;
  error?: string;
  formItemProps?: React.ComponentProps<typeof FormItem>;
  formLabelProps?: React.ComponentProps<typeof FormLabel>;
  formControlProps?: React.ComponentProps<typeof FormControl>;
  [key: string]: any;
}

export const FormField = React.forwardRef<HTMLInputElement | HTMLTextAreaElement, FormFieldProps>(
  ({ 
    id, 
    label, 
    type = "text", 
    description, 
    placeholder,
    required = false,
    className = "",
    error,
    formItemProps,
    formLabelProps,
    formControlProps,
    ...props 
  }, ref) => {
    return (
      <FormItem className={className} {...formItemProps}>
        <FormLabel htmlFor={id} {...formLabelProps} className={`${error ? 'text-red-500' : ''} ${formLabelProps?.className || ''}`}>
          {label} {required && <span className="text-red-500">*</span>}
        </FormLabel>
        <FormControl {...formControlProps}>
          {type === "textarea" ? (
            <Textarea
              id={id}
              placeholder={placeholder}
              className={`${error ? 'border-red-300 focus:ring-red-500' : ''}`}
              aria-invalid={error ? "true" : "false"}
              ref={ref as React.ForwardedRef<HTMLTextAreaElement>}
              {...props}
            />
          ) : (
            <Input
              id={id}
              type={type}
              placeholder={placeholder}
              className={`${error ? 'border-red-300 focus:ring-red-500' : ''}`}
              aria-invalid={error ? "true" : "false"}
              ref={ref as React.ForwardedRef<HTMLInputElement>}
              {...props}
            />
          )}
        </FormControl>
        {description && <FormDescription>{description}</FormDescription>}
        {error && <FormMessage className="text-red-500">{error}</FormMessage>}
      </FormItem>
    );
  }
);

FormField.displayName = "FormField";
