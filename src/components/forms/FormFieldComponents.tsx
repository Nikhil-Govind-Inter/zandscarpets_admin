import React from "react";
import { UseFormReturn, FieldPath, FieldValues } from "react-hook-form";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { FileUpload } from "@/components/common/FileUpload";
import { RichTextEditor } from "@/components/common/RichTextEditor";

// Base props for all form field components
interface BaseFormFieldProps<T extends FieldValues> {
  form: UseFormReturn<T>;
  name: FieldPath<T>;
  label: string;
  placeholder?: string;
  description?: string;
  required?: boolean;
}

// Text Input Field Component
interface FormTextFieldProps<T extends FieldValues> extends BaseFormFieldProps<T> {
  type?: "text" | "email" | "url" | "password";
}

export function FormTextField<T extends FieldValues>({
  form,
  name,
  label,
  placeholder,
  type = "text",
}: FormTextFieldProps<T>) {
  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <Input {...field} type={type} placeholder={placeholder} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

// Number Input Field Component
interface FormNumberFieldProps<T extends FieldValues> extends BaseFormFieldProps<T> {
  min?: number;
  max?: number;
}

export function FormNumberField<T extends FieldValues>({
  form,
  name,
  label,
  placeholder,
  min,
  max,
}: FormNumberFieldProps<T>) {
  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <Input
              {...field}
              type="number"
              placeholder={placeholder}
              min={min}
              max={max}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

// Textarea Field Component
interface FormTextareaFieldProps<T extends FieldValues> extends BaseFormFieldProps<T> {
  rows?: number;
}

export function FormTextareaField<T extends FieldValues>({
  form,
  name,
  label,
  placeholder,
  rows = 3,
}: FormTextareaFieldProps<T>) {
  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <Textarea {...field} placeholder={placeholder} rows={rows} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

// Select Field Component
interface FormSelectFieldProps<T extends FieldValues> extends BaseFormFieldProps<T> {
  options: { value: string; label: string }[];
}

export function FormSelectField<T extends FieldValues>({
  form,
  name,
  label,
  placeholder,
  options,
}: FormSelectFieldProps<T>) {
  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <Select onValueChange={field.onChange} defaultValue={field.value}>
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder={placeholder} />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {options.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

// Switch Field Component
interface FormSwitchFieldProps<T extends FieldValues> extends BaseFormFieldProps<T> {
  description?: string;
}

export function FormSwitchField<T extends FieldValues>({
  form,
  name,
  label,
  description,
}: FormSwitchFieldProps<T>) {
  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
          <div className="space-y-0.5">
            <FormLabel className="text-base">{label}</FormLabel>
            {description && (
              <div className="text-sm text-muted-foreground">{description}</div>
            )}
          </div>
          <FormControl>
            <Switch checked={field.value} onCheckedChange={field.onChange} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

// File Upload Field Component
interface FormFileUploadFieldProps<T extends FieldValues> extends BaseFormFieldProps<T> {
  accept?: string;
  maxImageSize?: number;
  maxVideoSize?: number;
  preview?: boolean;
}

export function FormFileUploadField<T extends FieldValues>({
  form,
  name,
  label,
  placeholder,
  accept = "image/*",
  maxImageSize,
  maxVideoSize,
  preview = true,
}: FormFileUploadFieldProps<T>) {
  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <FileUpload
              label={label}
              value={field.value}
              onChange={field.onChange}
              accept={accept}
              maxImageSize={maxImageSize}
              maxVideoSize={maxVideoSize}
              placeholder={placeholder}
              preview={preview}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

// Rich Text Editor Field Component
interface FormRichTextFieldProps<T extends FieldValues> extends BaseFormFieldProps<T> {
  height?: string;
  maxLength?: number;
}

export function FormRichTextField<T extends FieldValues>({
  form,
  name,
  label,
  placeholder,
  height,
  maxLength,
}: FormRichTextFieldProps<T>) {
  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <RichTextEditor
              value={field.value}
              onChange={field.onChange}
              placeholder={placeholder}
              height={height}
              maxLength={maxLength}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

// Date Input Field Component
export function FormDateField<T extends FieldValues>({
  form,
  name,
  label,
}: BaseFormFieldProps<T>) {
  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <Input {...field} type="datetime-local" />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

// Slug Field Component (with auto-generation)
interface FormSlugFieldProps<T extends FieldValues> extends BaseFormFieldProps<T> {
  sourceField: FieldPath<T>;
  generateSlug: (text: string) => string;
}

export function FormSlugField<T extends FieldValues>({
  form,
  name,
  label,
  placeholder,
  sourceField,
  generateSlug,
}: FormSlugFieldProps<T>) {
  const handleSlugGeneration = () => {
    const sourceValue = form.getValues(sourceField);
    if (sourceValue && typeof sourceValue === 'string') {
      const generatedSlug = generateSlug(sourceValue);
      form.setValue(name, generatedSlug as any);
    }
  };

  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <div className="flex gap-2">
              <Input {...field} placeholder={placeholder} />
              <button
                type="button"
                onClick={handleSlugGeneration}
                className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded"
              >
                Generate
              </button>
            </div>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}