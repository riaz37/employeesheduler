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
import { useCreateShift } from '@/hooks/use-shifts';
import { ShiftType, ShiftStatus } from '@/types';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Checkbox } from '@/components/ui/checkbox';
import { FormSection } from '@/components/ui/form-section';
import { createShiftSchema, type CreateShiftFormData } from '@/lib/validations/shift';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Label } from '../ui/label';



interface CreateShiftFormProps {
  onSuccess: () => void;
}

export function CreateShiftForm({ onSuccess }: CreateShiftFormProps) {
  const [newRequirement, setNewRequirement] = useState({
    role: '',
    quantity: 1,
    skills: [''],
    description: '',
    isCritical: false,
  });
  const [newTag, setNewTag] = useState('');

  const createShiftMutation = useCreateShift();

  const form = useForm({
    resolver: zodResolver(createShiftSchema),
    defaultValues: {
      status: ShiftStatus.SCHEDULED,
      requirements: [],
      assignedEmployees: [],
      backupEmployees: [],
      tags: [],
      isRecurring: false,
      priority: 0,
      breakMinutes: 0,
    },
  });

  const { setValue, watch, control, reset } = form;

  const watchedRequirements = watch('requirements') || [];
  const watchedTags = watch('tags') || [];
  const isRecurring = watch('isRecurring');

  const addRequirement = () => {
    if (newRequirement.role.trim() && newRequirement.skills[0].trim()) {
      const currentRequirements = watch('requirements') || [];
      setValue('requirements', [...currentRequirements, { ...newRequirement }]);
      setNewRequirement({
        role: '',
        quantity: 1,
        skills: [''],
        description: '',
        isCritical: false,
      });
    }
  };

  const removeRequirement = (index: number) => {
    const currentRequirements = watch('requirements') || [];
    setValue('requirements', currentRequirements.filter((_, i) => i !== index));
  };

  const addSkillRequirement = (reqIndex: number) => {
    const currentRequirements = watch('requirements') || [];
    const updatedRequirements = [...currentRequirements];
    updatedRequirements[reqIndex].skills.push('');
    setValue('requirements', updatedRequirements);
  };

  const removeSkillRequirement = (reqIndex: number, skillIndex: number) => {
    const currentRequirements = watch('requirements') || [];
    const updatedRequirements = [...currentRequirements];
    updatedRequirements[reqIndex].skills.splice(skillIndex, 1);
    if (updatedRequirements[reqIndex].skills.length === 0) {
      updatedRequirements[reqIndex].skills.push('');
    }
    setValue('requirements', updatedRequirements);
  };

  const updateSkillRequirement = (reqIndex: number, skillIndex: number, value: string) => {
    const currentRequirements = watch('requirements') || [];
    const updatedRequirements = [...currentRequirements];
    updatedRequirements[reqIndex].skills[skillIndex] = value;
    setValue('requirements', updatedRequirements);
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

  const onSubmit = async (data: CreateShiftFormData) => {
    try {
      await createShiftMutation.mutateAsync(data);
      reset();
      onSuccess();
    } catch (error) {
      console.error('Failed to create shift:', error);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={control}
              name="shiftId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Shift ID *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="SHIFT001"
                      {...field}
                    />
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
                    <Input
                      placeholder="Morning Shift"
                      {...field}
                    />
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
                    <Input
                      type="date"
                      {...field}
                    />
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
                  <FormLabel>Shift Type *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select shift type" />
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
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.values(ShiftStatus).map((status) => (
                        <SelectItem key={status} value={status}>
                          {status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}
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
                    <Input
                      type="time"
                      {...field}
                    />
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
                    <Input
                      type="time"
                      {...field}
                    />
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

          <div>
            <Label htmlFor="breakMinutes">Break Minutes</Label>
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
                      max="120"
                      placeholder="30"
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div>
            <Label htmlFor="priority">Priority</Label>
            <FormField
              control={control}
              name="priority"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Priority</FormLabel>
                  <Select onValueChange={(value) => field.onChange(Number(value))} value={field.value?.toString()}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((priority) => (
                        <SelectItem key={priority} value={priority.toString()}>
                          {priority} - {priority === 0 ? 'No Priority' : priority <= 3 ? 'Low' : priority <= 7 ? 'Medium' : 'High'}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

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
              name="assignedEmployees"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Assigned Employees</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Employee IDs (comma separated)"
                      {...field}
                      onChange={(e) => {
                        const employeeIds = e.target.value.split(',').map(id => id.trim()).filter(id => id);
                        field.onChange(employeeIds);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name="backupEmployees"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Backup Employees</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Employee IDs (comma separated)"
                      {...field}
                      onChange={(e) => {
                        const employeeIds = e.target.value.split(',').map(id => id.trim()).filter(id => id);
                        field.onChange(employeeIds);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
        </CardContent>
      </Card>

      {/* Location Information */}
      <Card>
        <CardHeader>
          <CardTitle>Location Information</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={control}
            name="location.name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Location Name *</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Main Office"
                    {...field}
                  />
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
                  <FormLabel>Coordinates *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="[-74.006, 40.7128] (longitude, latitude)"
                      value={Array.isArray(field.value) ? JSON.stringify(field.value) : ''}
                      onChange={(e) => {
                        try {
                          const coords = JSON.parse(e.target.value);
                          if (Array.isArray(coords) && coords.length === 2) {
                            field.onChange(coords);
                          }
                        } catch {
                          // Invalid JSON, ignore
                        }
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

          <FormField
            control={control}
            name="location.address"
            render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel>Address *</FormLabel>
                <FormControl>
                  <Input
                    placeholder="123 Main St, City, State, ZIP"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </CardContent>
      </Card>

      {/* Department & Team */}
      <Card>
        <CardHeader>
          <CardTitle>Department & Team</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={control}
            name="department"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Department *</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Engineering"
                    {...field}
                  />
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
                  <Input
                    placeholder="Team Alpha"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </CardContent>
      </Card>

      {/* Requirements */}
      <Card>
        <CardHeader>
          <CardTitle>Staffing Requirements</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <Label htmlFor="reqRole">Role</Label>
              <Input
                id="reqRole"
                value={newRequirement.role}
                onChange={(e) => setNewRequirement(prev => ({ ...prev, role: e.target.value }))}
                placeholder="e.g., Manager"
              />
            </div>
            <div>
              <Label htmlFor="reqSkills">Skills</Label>
              <Input
                id="reqSkills"
                value={newRequirement.skills[0]}
                onChange={(e) => setNewRequirement(prev => ({ 
                  ...prev, 
                  skills: [e.target.value] 
                }))}
                placeholder="e.g., Leadership"
              />
            </div>
            <div>
              <Label htmlFor="reqExperience">Min Experience</Label>
              <Input
                id="reqExperience"
                type="number"
                value={newRequirement.quantity}
                onChange={(e) => setNewRequirement(prev => ({ 
                  ...prev, 
                  quantity: parseInt(e.target.value) || 0 
                }))}
                min="0"
                placeholder="2"
              />
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="reqCertification"
                checked={newRequirement.isCritical}
                onChange={(e) => setNewRequirement(prev => ({ 
                  ...prev, 
                  isCritical: e.target.checked 
                }))}
                className="rounded border-gray-300"
              />
              <Label htmlFor="reqCertification">Critical Requirement</Label>
            </div>
            <div className="flex items-end">
              <Button type="button" onClick={addRequirement} className="w-full">
                <Plus className="mr-2 h-4 w-4" />
                Add Requirement
              </Button>
            </div>
          </div>

          {watchedRequirements.length > 0 && (
            <div className="space-y-3">
              {watchedRequirements.map((requirement, reqIndex) => (
                <div key={reqIndex} className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium">{requirement.role}</h4>
                    <button
                      type="button"
                      onClick={() => removeRequirement(reqIndex)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <Label className="text-sm text-gray-600">Skills</Label>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {requirement.skills.map((skill, skillIndex) => (
                          <div key={skillIndex} className="flex items-center space-x-1">
                            <Input
                              value={skill}
                              onChange={(e) => updateSkillRequirement(reqIndex, skillIndex, e.target.value)}
                              className="w-24 text-sm"
                              placeholder="Skill"
                            />
                            <button
                              type="button"
                              onClick={() => removeSkillRequirement(reqIndex, skillIndex)}
                              className="text-red-600 hover:text-red-800"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                        ))}
                        <Button
                          type="button"
                          onClick={() => addSkillRequirement(reqIndex)}
                          size="sm"
                          variant="outline"
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm text-gray-600">Quantity</Label>
                      <p className="text-sm">{requirement.quantity} staff</p>
                    </div>
                    <div>
                      <Label className="text-sm text-gray-600">Critical</Label>
                      <p className="text-sm">{requirement.isCritical ? 'Yes' : 'No'}</p>
                    </div>
                    <div>
                      <Label className="text-sm text-gray-600">Description</Label>
                      <p className="text-sm">{requirement.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recurring Options */}
      {isRecurring && (
        <Card>
          <CardHeader>
            <CardTitle>Recurring Options</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="recurringPattern">Pattern</Label>
              <Select onValueChange={(value) => setValue('recurringPattern', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select pattern" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="recurringEndDate">End Date</Label>
              <FormField
                control={control}
                name="recurringEndDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>End Date</FormLabel>
                    <FormControl>
                      <Input
                        type="date"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tags */}
      <Card>
        <CardHeader>
          <CardTitle>Tags</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
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
        </CardContent>
      </Card>

      {/* Notes */}
      <Card>
        <CardHeader>
          <CardTitle>Additional Notes</CardTitle>
        </CardHeader>
        <CardContent>
          <FormField
            control={control}
            name="notes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Additional Notes</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Any additional notes or special instructions for this shift"
                    rows={3}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </CardContent>
      </Card>

      {/* Employee Assignment */}
      <FormSection title="Employee Assignment" description="Assign employees to this shift">
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="block text-sm font-medium mb-2">Assigned Employees</Label>
              <div className="flex space-x-2 mb-2">
                <Input
                  placeholder="Employee ID (e.g., EMP001)"
                  className="flex-1"
                />
                <Button type="button" variant="outline">
                  <Plus className="mr-2 h-4 w-4" />
                  Add
                </Button>
              </div>
              <div className="text-sm text-gray-500">
                Currently assigned: {watch('assignedEmployees')?.length || 0}
              </div>
            </div>

            <div>
              <Label className="block text-sm font-medium mb-2">Backup Employees</Label>
              <div className="flex space-x-2 mb-2">
                <Input
                  placeholder="Employee ID (e.g., EMP002)"
                  className="flex-1"
                />
                <Button type="button" variant="outline">
                  <Plus className="mr-2 h-4 w-4" />
                  Add
                </Button>
              </div>
              <div className="text-sm text-gray-500">
                Backup employees: {watch('backupEmployees')?.length || 0}
              </div>
            </div>
          </div>
        </div>
      </FormSection>

      {/* Submit Button */}
      <div className="flex justify-end space-x-4">
        <Button type="button" variant="outline" onClick={onSuccess}>
          Cancel
        </Button>
        <Button type="submit" disabled={createShiftMutation.isPending}>
          {createShiftMutation.isPending ? 'Creating...' : 'Create Shift'}
        </Button>
      </div>
    </form>
      </Form>
  );
} 