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
import { useCreateSchedule } from '@/hooks/use-schedules';
import { ScheduleStatus } from '@/types';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { FormSection } from '@/components/ui/form-section';
import { createScheduleSchema, type CreateScheduleFormData } from '@/lib/validations/schedule';

interface CreateScheduleFormProps {
  onSuccess: () => void;
}

export function CreateScheduleForm({ onSuccess }: CreateScheduleFormProps) {
  const [newShift, setNewShift] = useState('');

  const createScheduleMutation = useCreateSchedule();

  const form = useForm({
    resolver: zodResolver(createScheduleSchema),
    defaultValues: {
      status: ScheduleStatus.DRAFT,
      shifts: [],
      employees: [],
    },
  });

  const { setValue, watch, control } = form;

  const watchedShifts = watch('shifts') || [];

  const addShift = () => {
    if (newShift.trim()) {
      const currentShifts = watch('shifts') || [];
      setValue('shifts', [...currentShifts, newShift.trim()]);
      setNewShift('');
    }
  };

  const removeShift = (index: number) => {
    const currentShifts = watch('shifts') || [];
    setValue('shifts', currentShifts.filter((_, i) => i !== index));
  };

  const onSubmit = async (data: CreateScheduleFormData) => {
    try {
      await createScheduleMutation.mutateAsync(data);
      form.reset();
      onSuccess();
    } catch (error) {
      console.error('Failed to create schedule:', error);
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
              name="scheduleId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Schedule ID *</FormLabel>
                  <FormControl>
                    <Input placeholder="SCHED001" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name="date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date *</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location *</FormLabel>
                  <FormControl>
                    <Input placeholder="Main Office" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name="team"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Team *</FormLabel>
                  <FormControl>
                    <Input placeholder="Engineering Team" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name="department"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Department *</FormLabel>
                  <FormControl>
                    <Input placeholder="Engineering" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.values(ScheduleStatus).map((status) => (
                        <SelectItem key={status} value={status}>
                          {status.charAt(0).toUpperCase() + status.slice(1)}
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

        {/* Shifts */}
        <FormSection title="Shifts" description="Add shifts to this schedule">
          <div className="space-y-4">
            <div className="flex space-x-2">
              <Input
                value={newShift}
                onChange={(e) => setNewShift(e.target.value)}
                placeholder="Shift ID (e.g., SHIFT001)"
              />
              <Button type="button" onClick={addShift}>
                <Plus className="mr-2 h-4 w-4" />
                Add Shift
              </Button>
            </div>
            {watchedShifts.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {watchedShifts.map((shift, index) => (
                  <Badge key={index} variant="outline" className="flex items-center space-x-1">
                    <span>{shift}</span>
                    <button
                      type="button"
                      onClick={() => removeShift(index)}
                      className="ml-1 hover:text-red-600"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </FormSection>

        {/* Notes */}
        <FormSection title="Notes">
          <FormField
            control={control}
            name="notes"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Textarea
                    placeholder="Additional notes about this schedule"
                    rows={3}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </FormSection>

        {/* Submit Button */}
        <div className="flex justify-end space-x-4">
          <Button type="button" variant="outline" onClick={onSuccess}>
            Cancel
          </Button>
          <Button type="submit" disabled={createScheduleMutation.isPending}>
            {createScheduleMutation.isPending ? 'Creating...' : 'Create Schedule'}
          </Button>
        </div>
      </form>
    </Form>
  );
} 