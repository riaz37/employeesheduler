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
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={control}
                name="shiftId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-gray-700">Shift ID *</FormLabel>
                    <FormControl>
                      <Input placeholder="SHIFT001" {...field} className="mt-2" />
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
                    <FormLabel className="text-sm font-medium text-gray-700">Date *</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} className="mt-2" />
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
                    <FormLabel className="text-sm font-medium text-gray-700">Title *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Morning Development Team Shift"
                        {...field}
                        className="mt-2"
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
                    <FormLabel className="text-sm font-medium text-gray-700">Shift Type *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="mt-2">
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
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-gray-700">Status</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="mt-2">
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
                    <FormLabel className="text-sm font-medium text-gray-700">Start Time *</FormLabel>
                    <FormControl>
                      <Input
                        type="time"
                        {...field}
                        className="mt-2"
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
                    <FormLabel className="text-sm font-medium text-gray-700">End Time *</FormLabel>
                    <FormControl>
                      <Input
                        type="time"
                        {...field}
                        className="mt-2"
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
                    <FormLabel className="text-sm font-medium text-gray-700">Total Hours *</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.5"
                        min="0.5"
                        max="24"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                        className="mt-2"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={control}
                name="breakMinutes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-gray-700">Break Minutes</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="0"
                        max="120"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                        placeholder="60"
                        className="mt-2"
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
                    <FormLabel className="text-sm font-medium text-gray-700">Priority</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="0"
                        max="10"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                        placeholder="5"
                        className="mt-2"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={control}
                name="assignedEmployees"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-gray-700">Assigned Employees</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Employee IDs (comma separated)"
                        {...field}
                        onChange={(e) => {
                          const employeeIds = e.target.value.split(',').map(id => id.trim()).filter(id => id);
                          field.onChange(employeeIds);
                        }}
                        className="mt-2"
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
                    <FormLabel className="text-sm font-medium text-gray-700">Backup Employees</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Employee IDs (comma separated)"
                        {...field}
                        onChange={(e) => {
                          const employeeIds = e.target.value.split(',').map(id => id.trim()).filter(id => id);
                          field.onChange(employeeIds);
                        }}
                        className="mt-2"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

      {/* Location Information */}
      <Card>
        <CardHeader>
          <CardTitle>Location Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={control}
              name="location.name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-gray-700">Location Name *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Main Office - Floor 3"
                      {...field}
                      className="mt-2"
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
                  <FormLabel className="text-sm font-medium text-gray-700">Coordinates *</FormLabel>
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
                      className="mt-2"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={control}
            name="location.address"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium text-gray-700">Address *</FormLabel>
                <FormControl>
                  <Input
                    placeholder="123 Business St, Suite 100, City, State 12345"
                    {...field}
                    className="mt-2"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <FormField
              control={control}
              name="location.building"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-gray-700">Building</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Tower A"
                      {...field}
                      className="mt-2"
                    />
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
                  <FormLabel className="text-sm font-medium text-gray-700">Floor</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="3rd Floor"
                      {...field}
                      className="mt-2"
                    />
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
                  <FormLabel className="text-sm font-medium text-gray-700">Room</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Conference Room 301"
                      {...field}
                      className="mt-2"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </CardContent>
      </Card>

      {/* Department & Team */}
      <Card>
        <CardHeader>
          <CardTitle>Department & Team</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={control}
              name="department"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-gray-700">Department *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Engineering"
                      {...field}
                      className="mt-2"
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
                  <FormLabel className="text-sm font-medium text-gray-700">Team *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Frontend Development Team"
                      {...field}
                      className="mt-2"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium text-gray-700">Description</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Detailed description of the shift responsibilities and requirements"
                    rows={4}
                    {...field}
                    className="mt-2"
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
        <CardContent className="space-y-6">
          {/* Add New Requirement Form */}
          <div className="p-6 bg-gray-50 rounded-lg border">
            <h4 className="font-medium text-gray-900 mb-4">Add New Requirement</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div>
                <Label htmlFor="reqRole" className="text-sm font-medium text-gray-700">Role *</Label>
                <Input
                  id="reqRole"
                  value={newRequirement.role}
                  onChange={(e) => setNewRequirement(prev => ({ ...prev, role: e.target.value }))}
                  placeholder="e.g., Frontend Developer"
                  className="mt-2"
                />
              </div>
              <div>
                <Label htmlFor="reqSkills" className="text-sm font-medium text-gray-700">Skills *</Label>
                <Input
                  id="reqSkills"
                  value={newRequirement.skills[0]}
                  onChange={(e) => setNewRequirement(prev => ({ 
                    ...prev, 
                    skills: [e.target.value] 
                  }))}
                  placeholder="e.g., React, TypeScript"
                  className="mt-2"
                />
              </div>
              <div>
                <Label htmlFor="reqQuantity" className="text-sm font-medium text-gray-700">Quantity *</Label>
                <Input
                  id="reqQuantity"
                  type="number"
                  value={newRequirement.quantity}
                  onChange={(e) => setNewRequirement(prev => ({ 
                    ...prev, 
                    quantity: parseInt(e.target.value) || 1 
                  }))}
                  min="1"
                  placeholder="1"
                  className="mt-2"
                />
              </div>
              <div className="flex items-end">
                <Button 
                  type="button" 
                  onClick={addRequirement} 
                  className="w-full h-10"
                  disabled={!newRequirement.role.trim() || !newRequirement.skills[0].trim()}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Requirement
                </Button>
              </div>
            </div>
            
            {/* Additional fields in a second row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
              <div>
                <Label htmlFor="reqDescription" className="text-sm font-medium text-gray-700">Description</Label>
                <Input
                  id="reqDescription"
                  value={newRequirement.description}
                  onChange={(e) => setNewRequirement(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="e.g., Must have experience with modern React patterns"
                  className="mt-2"
                />
              </div>
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="reqCritical"
                    checked={newRequirement.isCritical}
                    onChange={(e) => setNewRequirement(prev => ({ 
                      ...prev, 
                      isCritical: e.target.checked 
                    }))}
                    className="rounded border-gray-300 h-4 w-4"
                  />
                  <Label htmlFor="reqCritical" className="text-sm font-medium text-gray-700">Critical Requirement</Label>
                </div>
              </div>
            </div>
          </div>

          {/* Existing Requirements List */}
          {watchedRequirements.length > 0 && (
            <div className="space-y-4">
              <h4 className="font-medium text-gray-900">Current Requirements</h4>
              {watchedRequirements.map((requirement, reqIndex) => (
                <div key={reqIndex} className="p-6 bg-white rounded-lg border border-gray-200 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <h5 className="font-semibold text-lg text-gray-900">{requirement.role}</h5>
                    <button
                      type="button"
                      onClick={() => removeRequirement(reqIndex)}
                      className="text-red-600 hover:text-red-800 p-2 rounded-full hover:bg-red-50"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <Label className="text-sm font-medium text-gray-600 mb-2 block">Skills</Label>
                      <div className="space-y-2">
                        {requirement.skills.map((skill, skillIndex) => (
                          <div key={skillIndex} className="flex items-center space-x-2">
                            <Input
                              value={skill}
                              onChange={(e) => updateSkillRequirement(reqIndex, skillIndex, e.target.value)}
                              className="flex-1 text-sm"
                              placeholder="Skill"
                            />
                            <button
                              type="button"
                              onClick={() => removeSkillRequirement(reqIndex, skillIndex)}
                              className="text-red-600 hover:text-red-800 p-1 rounded"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        ))}
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => addSkillRequirement(reqIndex)}
                          className="mt-2"
                        >
                          <Plus className="mr-1 h-3 w-3" />
                          Add Skill
                        </Button>
                      </div>
                    </div>
                    
                    <div>
                      <Label className="text-sm font-medium text-gray-600 mb-2 block">Quantity</Label>
                      <Input
                        type="number"
                        value={requirement.quantity}
                        onChange={(e) => {
                          const currentRequirements = watch('requirements') || [];
                          const updatedRequirements = [...currentRequirements];
                          updatedRequirements[reqIndex].quantity = parseInt(e.target.value) || 1;
                          setValue('requirements', updatedRequirements);
                        }}
                        min="1"
                        className="w-20"
                      />
                    </div>
                    
                    <div>
                      <Label className="text-sm font-medium text-gray-600 mb-2 block">Description</Label>
                      <Input
                        value={requirement.description || ''}
                        onChange={(e) => {
                          const currentRequirements = watch('requirements') || [];
                          const updatedRequirements = [...currentRequirements];
                          updatedRequirements[reqIndex].description = e.target.value;
                          setValue('requirements', updatedRequirements);
                        }}
                        placeholder="Optional description"
                        className="text-sm"
                      />
                    </div>
                  </div>
                  
                  {requirement.isCritical && (
                    <div className="mt-4">
                      <Badge variant="destructive" className="text-xs">
                        Critical Requirement
                      </Badge>
                    </div>
                  )}
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
        <CardContent className="space-y-6">
          <div className="flex space-x-3">
            <Input
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              placeholder="e.g., morning, weekend, holiday"
              className="flex-1"
            />
            <Button type="button" onClick={addTag} className="px-6">
              <Plus className="mr-2 h-4 w-4" />
              Add Tag
            </Button>
          </div>
          {watchedTags.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-gray-700">Current Tags</h4>
              <div className="flex flex-wrap gap-3">
                {watchedTags.map((tag, index) => (
                  <Badge key={index} variant="outline" className="flex items-center space-x-2 px-3 py-2">
                    <span className="text-sm">{tag}</span>
                    <button
                      type="button"
                      onClick={() => removeTag(index)}
                      className="ml-1 hover:text-red-600 p-1 rounded-full hover:bg-red-50"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Notes */}
      <Card>
        <CardHeader>
          <CardTitle>Additional Notes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <FormField
            control={control}
            name="notes"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium text-gray-700">Additional Notes</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Any additional notes or special instructions for this shift"
                    rows={4}
                    {...field}
                    className="mt-2"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </CardContent>
      </Card>



              {/* Submit Button */}
        <div className="flex justify-end space-x-4 pt-6 border-t">
          <Button type="button" variant="outline" onClick={onSuccess} className="px-6">
            Cancel
          </Button>
          <Button type="submit" disabled={createShiftMutation.isPending} className="px-8">
            {createShiftMutation.isPending ? 'Creating...' : 'Create Shift'}
          </Button>
        </div>
    </form>
      </Form>
  );
} 