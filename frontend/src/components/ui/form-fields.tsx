'use client';

import { Control } from 'react-hook-form';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';

interface BaseFormFieldProps {
  control: Control<Record<string, unknown>>;
  name: string;
  label: string;
  required?: boolean;
}

interface TextFormFieldProps extends BaseFormFieldProps {
  type?: 'text' | 'email' | 'password' | 'number' | 'date' | 'time';
  placeholder?: string;
  min?: number;
  max?: number;
  step?: number;
}

interface SelectFormFieldProps extends BaseFormFieldProps {
  options: { value: string; label: string }[];
  placeholder?: string;
}

interface CheckboxFormFieldProps extends BaseFormFieldProps {
  description?: string;
}

interface TextareaFormFieldProps extends BaseFormFieldProps {
  placeholder?: string;
  rows?: number;
}

export function TextFormField({ 
  control, 
  name, 
  label, 
  required = false, 
  type = 'text',
  placeholder,
  min,
  max,
  step
}: TextFormFieldProps) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>
            {label} {required && '*'}
          </FormLabel>
          <FormControl>
            <Input
              type={type}
              placeholder={placeholder}
              min={min}
              max={max}
              step={step}
              value={field.value as string}
              onChange={type === 'number' ? (e) => field.onChange(Number(e.target.value)) : field.onChange}
              onBlur={field.onBlur}
              name={field.name}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

export function SelectFormField({ 
  control, 
  name, 
  label, 
  required = false, 
  options, 
  placeholder 
}: SelectFormFieldProps) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>
            {label} {required && '*'}
          </FormLabel>
          <Select onValueChange={field.onChange} value={field.value}>
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

export function CheckboxFormField({ 
  control, 
  name, 
  label, 
  description 
}: CheckboxFormFieldProps) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
          <FormControl>
            <Checkbox
              checked={field.value}
              onCheckedChange={field.onChange}
            />
          </FormControl>
          <div className="space-y-1 leading-none">
            <FormLabel>{label}</FormLabel>
            {description && (
              <p className="text-sm text-muted-foreground">{description}</p>
            )}
          </div>
        </FormItem>
      )}
    />
  );
}

export function TextareaFormField({ 
  control, 
  name, 
  label, 
  required = false, 
  placeholder, 
  rows = 3 
}: TextareaFormFieldProps) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>
            {label} {required && '*'}
          </FormLabel>
          <FormControl>
            <Textarea
              placeholder={placeholder}
              rows={rows}
              {...field}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
} 