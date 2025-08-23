'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { X, Plus } from 'lucide-react';
import { useUpdateTimeOffRequest } from '@/hooks/use-time-off';
import { TimeOff, TimeOffType, TimeOffPriority } from '@/types';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Checkbox } from '@/components/ui/checkbox';
import { FormSection } from '@/components/ui/form-section';
import { updateTimeOffSchema, type UpdateTimeOffFormData } from '@/lib/validations/time-off';

interface EditTimeOffFormProps {
  timeOff: TimeOff;
  onSuccess: () => void;
}

export function EditTimeOffForm({ timeOff, onSuccess }: EditTimeOffFormProps) {
  const [newCoverageEmployee, setNewCoverageEmployee] = useState('');

  const updateTimeOffMutation = useUpdateTimeOffRequest();

  const form = useForm<UpdateTimeOffFormData>({
    resolver: zodResolver(updateTimeOffSchema),
    defaultValues: {
      requestId: timeOff.requestId,
      employeeId: timeOff.employeeId,
      type: timeOff.type,
      priority: timeOff.priority,
      startDate: timeOff.startDate,
      endDate: timeOff.endDate,
      startTime: timeOff.startTime,
      endTime: timeOff.endTime,
      totalHours: timeOff.totalHours,
      totalDays: timeOff.totalDays,
      reason: timeOff.reason,
      description: timeOff.description || '',
      isHalfDay: timeOff.isHalfDay,
      isEmergency: timeOff.isEmergency,
      requiresCoverage: timeOff.requiresCoverage,
      coverageEmployees: timeOff.coverageEmployees || [],
      notes: timeOff.notes || '',
    },
  });

  const { setValue, watch, control } = form;

  const watchedCoverageEmployees = watch('coverageEmployees') || [];
  const requiresCoverage = watch('requiresCoverage');
  const startDate = watch('startDate');
  const endDate = watch('endDate');

  const addCoverageEmployee = () => {
    if (newCoverageEmployee.trim()) {
      const currentEmployees = watch('coverageEmployees') || [];
      setValue('coverageEmployees', [...currentEmployees, newCoverageEmployee.trim()]);
      setNewCoverageEmployee('');
    }
  };

  const removeCoverageEmployee = (index: number) => {
    const currentEmployees = watch('coverageEmployees') || [];
    setValue('coverageEmployees', currentEmployees.filter((_, i) => i !== index));
  };

  const calculateHoursAndDays = () => {
    if (startDate && endDate && startDate <= endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const diffTime = Math.abs(end.getTime() - start.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
      
      setValue('totalDays', diffDays);
      setValue('totalHours', diffDays * 8); // Default 8 hours per day
    }
  };

  const onSubmit = async (data: UpdateTimeOffFormData) => {
    try {
      await updateTimeOffMutation.mutateAsync({ id: timeOff._id, data });
      onSuccess();
    } catch (error) {
      console.error('Failed to update time-off request:', error);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic Information */}
        <FormSection title="Basic Information">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={control}
              name="requestId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Request ID *</FormLabel>
                  <FormControl>
                    <Input placeholder="TO001" {...field} disabled />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name="employeeId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Employee ID *</FormLabel>
                  <FormControl>
                    <Input placeholder="EMP001" {...field} disabled />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Type *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.values(TimeOffType).map((type) => (
                        <SelectItem key={type} value={type}>
                          {type.replace('_', ' ').charAt(0).toUpperCase() + type.replace('_', ' ').slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name="priority"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Priority</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.values(TimeOffPriority).map((priority) => (
                        <SelectItem key={priority} value={priority}>
                          {priority.charAt(0).toUpperCase() + priority.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </FormSection>

        {/* Date and Time */}
        <FormSection title="Date and Time">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={control}
              name="startDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Start Date *</FormLabel>
                  <FormControl>
                    <Input
                      type="date"
                      {...field}
                      onChange={(e) => {
                        field.onChange(e.target.value);
                        calculateHoursAndDays();
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name="endDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>End Date *</FormLabel>
                  <FormControl>
                    <Input
                      type="date"
                      {...field}
                      onChange={(e) => {
                        field.onChange(e.target.value);
                        calculateHoursAndDays();
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name="startTime"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Start Time *</FormLabel>
                  <FormControl>
                    <Input type="time" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name="endTime"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>End Time *</FormLabel>
                  <FormControl>
                    <Input type="time" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name="totalHours"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Total Hours *</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.5"
                      min="0.5"
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name="totalDays"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Total Days *</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.5"
                      min="0.5"
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </FormSection>

        {/* Options */}
        <FormSection title="Options">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField
              control={control}
              name="isHalfDay"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Half Day</FormLabel>
                  </div>
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name="isEmergency"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Emergency</FormLabel>
                  </div>
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name="requiresCoverage"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Requires Coverage</FormLabel>
                  </div>
                </FormItem>
              )}
            />
          </div>
        </FormSection>

        {/* Coverage Employees */}
        {requiresCoverage && (
          <FormSection title="Coverage Employees" description="Employees who can cover during this time-off period">
            <div className="space-y-4">
              <div className="flex space-x-2">
                <Input
                  value={newCoverageEmployee}
                  onChange={(e) => setNewCoverageEmployee(e.target.value)}
                  placeholder="Employee ID or name"
                />
                <Button type="button" onClick={addCoverageEmployee}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add
                </Button>
              </div>
              {watchedCoverageEmployees.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {watchedCoverageEmployees.map((employee, index) => (
                    <Badge key={index} variant="outline" className="flex items-center space-x-1">
                      <span>{employee}</span>
                      <button
                        type="button"
                        onClick={() => removeCoverageEmployee(index)}
                        className="ml-1 hover:text-red-600"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </FormSection>
        )}

        {/* Reason and Description */}
        <FormSection title="Reason and Description">
          <div className="space-y-4">
            <FormField
              control={control}
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Reason *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Brief reason for time-off request"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Detailed description of the time-off request"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Additional Notes</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Any additional notes or special considerations"
                      rows={2}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </FormSection>

        {/* Submit Button */}
        <div className="flex justify-end space-x-4">
          <Button type="button" variant="outline" onClick={onSuccess}>
            Cancel
          </Button>
          <Button type="submit" disabled={updateTimeOffMutation.isPending}>
            {updateTimeOffMutation.isPending ? 'Updating...' : 'Update Request'}
          </Button>
        </div>
      </form>
    </Form>
  );
} 