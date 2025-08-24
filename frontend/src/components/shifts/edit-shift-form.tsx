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
import { useUpdateShift } from '@/hooks/use-shifts';
import { Shift, ShiftType, ShiftStatus } from '@/types';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Checkbox } from '@/components/ui/checkbox';
import { FormSection } from '@/components/ui/form-section';
import { updateShiftSchema, type UpdateShiftFormData } from '@/lib/validations/shift';

interface EditShiftFormProps {
  shift: Shift;
  onSuccess: () => void;
}

export function EditShiftForm({ shift, onSuccess }: EditShiftFormProps) {
  const [newRequirement, setNewRequirement] = useState({
    role: '',
    skills: [''],
    quantity: 1,
    description: '',
    isCritical: false,
  });
  const [newTag, setNewTag] = useState('');

  const updateShiftMutation = useUpdateShift();

  const form = useForm<UpdateShiftFormData>({
    resolver: zodResolver(updateShiftSchema),
    defaultValues: {
      shiftId: shift.shiftId,
      date: shift.date,
      startTime: shift.startTime,
      endTime: shift.endTime,
      type: shift.type,
      status: shift.status,
      title: shift.title,
      description: shift.description || '',
      location: shift.location,
      department: shift.department,
      team: shift.team,
      requirements: shift.requirements || [],
      assignedEmployees: shift.assignedEmployees || [],
      backupEmployees: shift.backupEmployees || [],
      totalHours: shift.totalHours,
      breakMinutes: shift.breakMinutes || 0,
      isRecurring: shift.isRecurring || false,
      recurringPattern: shift.recurringPattern || '',
      recurringEndDate: shift.recurringEndDate || '',

      priority: shift.priority || 0,
      tags: shift.tags || [],
      notes: shift.notes || '',

    },
  });

  const { setValue, watch, control } = form;

  const watchedRequirements = watch('requirements') || [];
  const watchedTags = watch('tags') || [];
  const isRecurring = watch('isRecurring');

  const addRequirement = () => {
    if (newRequirement.role.trim() && newRequirement.skills[0].trim()) {
      const currentRequirements = watch('requirements') || [];
      setValue('requirements', [...currentRequirements, { ...newRequirement }]);
      setNewRequirement({
        role: '',
        skills: [''],
        quantity: 1,
        description: '',
        isCritical: false,
      });
    }
  };

  const removeRequirement = (index: number) => {
    const currentRequirements = watch('requirements') || [];
    setValue('requirements', currentRequirements.filter((_, i) => i !== index));
  };

  const addTag = () => {
    if (newTag.trim()) {
      const currentTags = watch('tags') || [];
      setValue('tags', [...currentTags, newTag.trim()]);
      setNewTag('');
    }
  };

  const removeTag = (index: number) => {
    const currentTags = watch('tags') || [];
    setValue('tags', currentTags.filter((_, i) => i !== index));
  };

  const onSubmit = async (data: UpdateShiftFormData) => {
    try {
      await updateShiftMutation.mutateAsync({ id: shift._id, data });
      onSuccess();
    } catch (error) {
      console.error('Failed to update shift:', error);
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
              name="shiftId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Shift ID *</FormLabel>
                  <FormControl>
                    <Input placeholder="SHIFT001" {...field} disabled />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title *</FormLabel>
                  <FormControl>
                    <Input placeholder="Morning Shift" {...field} />
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
                      {Object.values(ShiftType).map((type) => (
                        <SelectItem key={type} value={type}>
                          {type.charAt(0).toUpperCase() + type.slice(1)}
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
                      max="24"
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
              name="breakMinutes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Break Minutes</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="0"
                      placeholder="30"
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
              name="priority"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Priority</FormLabel>
                  <Select onValueChange={(value) => field.onChange(parseInt(value))} value={field.value?.toString()}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="1">1 - Lowest</SelectItem>
                      <SelectItem value="2">2 - Low</SelectItem>
                      <SelectItem value="3">3 - Medium</SelectItem>
                      <SelectItem value="4">4 - High</SelectItem>
                      <SelectItem value="5">5 - Highest</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name="isRecurring"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Recurring Shift</FormLabel>
                  </div>
                </FormItem>
              )}
            />

            {isRecurring && (
              <>
                <FormField
                  control={control}
                  name="recurringPattern"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Recurring Pattern</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select pattern" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="daily">Daily</SelectItem>
                          <SelectItem value="weekly">Weekly</SelectItem>
                          <SelectItem value="monthly">Monthly</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={control}
                  name="recurringEndDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Recurring End Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}

            <FormField
              control={control}
              name="description"
              render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Shift description and details"
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
              name="scheduledBy"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Scheduled By</FormLabel>
                  <FormControl>
                    <Input placeholder="Manager ID or name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name="notes"
              render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Additional notes about the shift"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </FormSection>

        {/* Location Information */}
        <FormSection title="Location Information">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField
              control={control}
              name="location.name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location Name *</FormLabel>
                  <FormControl>
                    <Input placeholder="Main Office" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name="location.address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Address *</FormLabel>
                  <FormControl>
                    <Input placeholder="123 Main St, City, State" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name="location.building"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Building</FormLabel>
                  <FormControl>
                    <Input placeholder="Building A" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name="location.floor"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Floor</FormLabel>
                  <FormControl>
                    <Input placeholder="2nd Floor" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name="location.room"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Room</FormLabel>
                  <FormControl>
                    <Input placeholder="Room 201" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name="location.coordinates"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Coordinates [longitude, latitude]</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="-73.935242, 40.730610" 
                      value={Array.isArray(field.value) ? field.value.join(', ') : ''}
                      onChange={(e) => {
                        const coords = e.target.value.split(',').map(s => s.trim()).filter(Boolean);
                        if (coords.length === 2) {
                          const [lng, lat] = coords.map(Number);
                          if (!isNaN(lng) && !isNaN(lat)) {
                            field.onChange([lng, lat]);
                          }
                        }
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </FormSection>

        {/* Department and Team */}
        <FormSection title="Department and Team">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              name="team"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Team *</FormLabel>
                  <FormControl>
                    <Input placeholder="Frontend Team" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </FormSection>

        {/* Requirements */}
        <FormSection title="Requirements" description="Manage the requirements for this shift">
          <div className="space-y-4">
            {/* Add Requirement Form */}
            <div className="grid grid-cols-1 md:grid-cols-6 gap-4 p-4 border rounded-lg">
              <div>
                <label className="block text-sm font-medium mb-1">Role</label>
                <Input
                  value={newRequirement.role}
                  onChange={(e) => setNewRequirement(prev => ({ ...prev, role: e.target.value }))}
                  placeholder="e.g., Developer"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Skills</label>
                <Input
                  value={newRequirement.skills[0]}
                  onChange={(e) => setNewRequirement(prev => ({ 
                    ...prev, 
                    skills: [e.target.value] 
                  }))}
                  placeholder="e.g., JavaScript"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Quantity</label>
                <Input
                  type="number"
                  min="1"
                  value={newRequirement.quantity}
                  onChange={(e) => setNewRequirement(prev => ({ 
                    ...prev, 
                    quantity: Number(e.target.value) 
                  }))}
                  placeholder="1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <Input
                  value={newRequirement.description}
                  onChange={(e) => setNewRequirement(prev => ({ 
                    ...prev, 
                    description: e.target.value 
                  }))}
                  placeholder="e.g., Senior developer needed"
                />
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isCritical"
                  checked={newRequirement.isCritical}
                  onCheckedChange={(checked) => setNewRequirement(prev => ({ 
                    ...prev, 
                    isCritical: checked as boolean 
                  }))}
                />
                <label htmlFor="isCritical" className="text-sm font-medium">Critical</label>
              </div>
              <div className="flex items-end">
                <Button type="button" onClick={addRequirement} className="w-full">
                  <Plus className="mr-2 h-4 w-4" />
                  Add
                </Button>
              </div>
            </div>

            {/* Requirements List */}
            {watchedRequirements.length > 0 && (
              <div className="space-y-2">
                {watchedRequirements.map((requirement, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span>
                      <strong>{requirement.role}</strong> • Skills: {requirement.skills?.join(', ') || 'None'} • 
                      Quantity: {requirement.quantity}
                      {requirement.description && ` • ${requirement.description}`}
                      {requirement.isCritical && ' • Critical'}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeRequirement(index)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </FormSection>

        {/* Employee Assignments */}
        <FormSection title="Employee Assignments">
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Assigned Employees</label>
                <Textarea
                  placeholder="Enter employee IDs separated by commas"
                  value={watch('assignedEmployees')?.join(', ') || ''}
                  onChange={(e) => {
                    const employees = e.target.value.split(',').map(s => s.trim()).filter(Boolean);
                    setValue('assignedEmployees', employees);
                  }}
                  rows={3}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Backup Employees</label>
                <Textarea
                  placeholder="Enter backup employee IDs separated by commas"
                  value={watch('backupEmployees')?.join(', ') || ''}
                  onChange={(e) => {
                    const employees = e.target.value.split(',').map(s => s.trim()).filter(Boolean);
                    setValue('backupEmployees', employees);
                  }}
                  rows={3}
                />
              </div>
            </div>
          </div>
        </FormSection>

        {/* Tags */}
        <FormSection title="Tags">
          <div className="space-y-4">
            <div className="flex space-x-2">
              <Input
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                placeholder="e.g., morning, weekend, holiday"
              />
              <Button type="button" onClick={addTag}>
                <Plus className="mr-2 h-4 w-4" />
                Add Tag
              </Button>
            </div>
            {watchedTags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {watchedTags.map((tag, index) => (
                  <Badge key={index} variant="outline" className="flex items-center space-x-1">
                    <span>{tag}</span>
                    <button
                      type="button"
                      onClick={() => removeTag(index)}
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

        {/* Submit Button */}
        <div className="flex justify-end space-x-4">
          <Button type="button" variant="outline" onClick={onSuccess}>
            Cancel
          </Button>
          <Button type="submit" disabled={updateShiftMutation.isPending}>
            {updateShiftMutation.isPending ? 'Updating...' : 'Update Shift'}
          </Button>
        </div>
      </form>
    </Form>
  );
} 