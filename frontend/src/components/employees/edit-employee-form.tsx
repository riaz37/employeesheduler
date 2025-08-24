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
import { useUpdateEmployee } from '@/hooks/use-employees';
import { Employee, EmployeeRole, EmployeeStatus } from '@/types';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Checkbox } from '@/components/ui/checkbox';
import { FormSection } from '@/components/ui/form-section';
import { updateEmployeeSchema, type UpdateEmployeeFormData } from '@/lib/validations/employee';

interface EditEmployeeFormProps {
  employee: Employee;
  onSuccess: () => void;
}

export function EditEmployeeForm({ employee, onSuccess }: EditEmployeeFormProps) {
  const [newSkill, setNewSkill] = useState({ 
    name: '', 
    level: 'beginner' as 'beginner' | 'intermediate' | 'advanced' | 'expert', 
    certified: false 
  });
  const [newAvailability, setNewAvailability] = useState({ 
    dayOfWeek: 0, 
    startTime: '09:00', 
    endTime: '17:00', 
    timezone: 'UTC', 
    isAvailable: true 
  });
  const [newPreferredShift, setNewPreferredShift] = useState('');
  const [newPreferredLocation, setNewPreferredLocation] = useState('');

  const updateEmployeeMutation = useUpdateEmployee();

  const form = useForm({
    resolver: zodResolver(updateEmployeeSchema),
    defaultValues: {
      employeeId: employee.employeeId,
      firstName: employee.firstName,
      lastName: employee.lastName,
      email: employee.email,
      role: employee.role,
      status: employee.status || EmployeeStatus.ACTIVE,
      department: employee.department,
      location: employee.location,
      team: employee.team,
      hireDate: employee.hireDate,
      phone: employee.phone || '',
      emergencyContact: employee.emergencyContact || '',
      notes: employee.notes || '',
      isPartTime: employee.isPartTime,
      skills: employee.skills || [],
      availabilityWindows: employee.availabilityWindows || [],
      workPreference: employee.workPreference || {
        maxHoursPerWeek: 40,
        preferredShifts: [],
        preferredLocations: [],
        maxConsecutiveDays: 5,
      },
    },
  });

  const { setValue, watch, control } = form;

  const watchedSkills = watch('skills') || [];
  const watchedAvailability = watch('availabilityWindows') || [];
  const watchedPreferredShifts = watch('workPreference.preferredShifts') || [];
  const watchedPreferredLocations = watch('workPreference.preferredLocations') || [];

  const addSkill = () => {
    if (newSkill.name.trim()) {
      const currentSkills = watch('skills') || [];
      setValue('skills', [...currentSkills, { ...newSkill, validUntil: undefined }]);
      setNewSkill({ name: '', level: 'beginner', certified: false });
    }
  };

  const removeSkill = (index: number) => {
    const currentSkills = watch('skills') || [];
    const updatedSkills = currentSkills.filter((_, i) => i !== index);
    setValue('skills', updatedSkills);
  };

  const addAvailability = () => {
    const currentAvailability = watch('availabilityWindows') || [];
    setValue('availabilityWindows', [...currentAvailability, newAvailability]);
    setNewAvailability({ 
      dayOfWeek: 0, 
      startTime: '09:00', 
      endTime: '17:00', 
      timezone: 'UTC', 
      isAvailable: true 
    });
  };

  const removeAvailability = (index: number) => {
    const currentAvailability = watch('availabilityWindows') || [];
    const updatedAvailability = currentAvailability.filter((_, i) => i !== index);
    setValue('availabilityWindows', updatedAvailability);
  };

  const addPreferredShift = () => {
    if (newPreferredShift.trim()) {
      const currentShifts = watch('workPreference.preferredShifts') || [];
      setValue('workPreference.preferredShifts', [...currentShifts, newPreferredShift]);
      setNewPreferredShift('');
    }
  };

  const removePreferredShift = (index: number) => {
    const currentShifts = watch('workPreference.preferredShifts') || [];
    setValue('workPreference.preferredShifts', currentShifts.filter((_, i) => i !== index));
  };

  const addPreferredLocation = () => {
    if (newPreferredLocation.trim()) {
      const currentLocations = watch('workPreference.preferredLocations') || [];
      setValue('workPreference.preferredLocations', [...currentLocations, newPreferredLocation]);
      setNewPreferredLocation('');
    }
  };

  const removePreferredLocation = (index: number) => {
    const currentLocations = watch('workPreference.preferredLocations') || [];
    setValue('workPreference.preferredLocations', currentLocations.filter((_, i) => i !== index));
  };

  const onSubmit = async (data: UpdateEmployeeFormData) => {
    try {
      await updateEmployeeMutation.mutateAsync({ id: employee._id, data });
      onSuccess();
    } catch (error) {
      console.error('Failed to update employee:', error);
    }
  };

  const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic Information */}
        <FormSection title="Basic Information">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={control}
              name="employeeId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Employee ID *</FormLabel>
                  <FormControl>
                    <Input placeholder="EMP001" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name="firstName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>First Name *</FormLabel>
                  <FormControl>
                    <Input placeholder="John" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name="lastName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Last Name *</FormLabel>
                  <FormControl>
                    <Input placeholder="Doe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email *</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="john.doe@company.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Role *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.values(EmployeeRole).map((role) => (
                        <SelectItem key={role} value={role}>
                          {role.charAt(0).toUpperCase() + role.slice(1)}
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
                  <FormLabel>Status *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.values(EmployeeStatus).map((status) => (
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
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location *</FormLabel>
                  <FormControl>
                    <Input placeholder="Location A" {...field} />
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
                    <Input placeholder="Team Alpha" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name="hireDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Hire Date *</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Number</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="+1-555-123-4567"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name="emergencyContact"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Emergency Contact</FormLabel>
                  <FormControl>
                    <Input placeholder="Emergency contact name and phone" {...field} />
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
                      placeholder="Additional notes about the employee"
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
              name="isPartTime"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Part-time Employee</FormLabel>
                  </div>
                </FormItem>
              )}
            />
          </div>
        </FormSection>

        {/* Skills Section */}
        <FormSection title="Skills" description="Manage employee skills and certifications">
          <div className="space-y-4">
            {/* Skills Validation Message */}
            {watchedSkills.length === 0 && (
              <div className="text-sm text-red-600 bg-red-50 p-2 rounded border">
                At least one skill is required
              </div>
            )}
            {/* Add Skill Form */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 border rounded-lg">
              <div>
                <label className="block text-sm font-medium mb-1">Skill Name</label>
                <Input
                  value={newSkill.name}
                  onChange={(e) => setNewSkill(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., JavaScript"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Level</label>
                <Select
                  value={newSkill.level}
                  onValueChange={(value) => setNewSkill(prev => ({ 
                    ...prev, 
                    level: value as 'beginner' | 'intermediate' | 'advanced' | 'expert'
                  }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">Beginner</SelectItem>
                    <SelectItem value="intermediate">Intermediate</SelectItem>
                    <SelectItem value="advanced">Advanced</SelectItem>
                    <SelectItem value="expert">Expert</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  checked={newSkill.certified}
                  onCheckedChange={(checked) => setNewSkill(prev => ({ 
                    ...prev, 
                    certified: checked as boolean
                  }))}
                />
                <label className="text-sm font-medium">Certified</label>
              </div>
              <div className="flex items-end">
                <Button type="button" onClick={addSkill} className="w-full">
                  <Plus className="mr-2 h-4 w-4" />
                  Add
                </Button>
              </div>
            </div>

            {/* Skills List */}
            {watchedSkills.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {watchedSkills.map((skill, index) => (
                  <Badge key={index} variant="outline" className="flex items-center space-x-1">
                    <span>{skill.name} ({skill.level}){skill.certified ? ' ✓' : ''}</span>
                    <button
                      type="button"
                      onClick={() => removeSkill(index)}
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

        {/* Availability Section */}
        <FormSection title="Weekly Availability" description="Set employee availability for each day of the week">
          <div className="space-y-4">
            {/* Availability Validation Message */}
            {watchedAvailability.length === 0 && (
              <div className="text-sm text-red-600 bg-red-50 p-2 rounded border">
                At least one availability window is required
              </div>
            )}
            {/* Add Availability Form */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 p-4 border rounded-lg">
              <div>
                <label className="block text-sm font-medium mb-1">Day</label>
                <Select
                  value={newAvailability.dayOfWeek.toString()}
                  onValueChange={(value) => setNewAvailability(prev => ({ 
                    ...prev, 
                    dayOfWeek: parseInt(value)
                  }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {daysOfWeek.map((day, index) => (
                      <SelectItem key={index} value={index.toString()}>
                        {day}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Start Time</label>
                <Input
                  type="time"
                  value={newAvailability.startTime}
                  onChange={(e) => setNewAvailability(prev => ({ ...prev, startTime: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">End Time</label>
                <Input
                  type="time"
                  value={newAvailability.endTime}
                  onChange={(e) => setNewAvailability(prev => ({ ...prev, endTime: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Timezone</label>
                <Input
                  value={newAvailability.timezone}
                  onChange={(e) => setNewAvailability(prev => ({ ...prev, timezone: e.target.value }))}
                  placeholder="UTC"
                />
              </div>
              <div className="flex items-end">
                <Button type="button" onClick={addAvailability} className="w-full">
                  <Plus className="mr-2 h-4 w-4" />
                  Add
                </Button>
              </div>
            </div>

            {/* Availability List */}
            {watchedAvailability.length > 0 && (
              <div className="space-y-2">
                {watchedAvailability.map((availability, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <span className="font-medium">{daysOfWeek[availability.dayOfWeek]}</span>
                      <span>{availability.startTime} - {availability.endTime}</span>
                      <span className="text-sm text-gray-500">{availability.timezone}</span>
                      <Badge variant={availability.isAvailable ? "default" : "secondary"}>
                        {availability.isAvailable ? "Available" : "Unavailable"}
                      </Badge>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeAvailability(index)}
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

        {/* Work Preferences Section */}
        <FormSection title="Work Preferences" description="Set employee work constraints and preferences">
          <div className="space-y-6">
            {/* Max Hours Per Week */}
            <FormField
              control={control}
              name="workPreference.maxHoursPerWeek"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Maximum Hours Per Week *</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      min="1" 
                      max="168" 
                      placeholder="40"
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Max Consecutive Days */}
            <FormField
              control={control}
              name="workPreference.maxConsecutiveDays"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Maximum Consecutive Work Days *</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      min="1" 
                      max="7" 
                      placeholder="5"
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Preferred Shifts */}
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <Input
                  value={newPreferredShift}
                  onChange={(e) => setNewPreferredShift(e.target.value)}
                  placeholder="e.g., morning, afternoon, night"
                  className="flex-1"
                />
                <Button type="button" onClick={addPreferredShift}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Shift
                </Button>
              </div>
              {watchedPreferredShifts.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {watchedPreferredShifts.map((shift, index) => (
                    <Badge key={index} variant="outline" className="flex items-center space-x-1">
                      <span>{shift}</span>
                      <button
                        type="button"
                        onClick={() => removePreferredShift(index)}
                        className="ml-1 hover:text-red-600"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Preferred Locations */}
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <Input
                  value={newPreferredLocation}
                  onChange={(e) => setNewPreferredLocation(e.target.value)}
                  placeholder="e.g., Main Office, Downtown Branch"
                  className="flex-1"
                />
                <Button type="button" onClick={addPreferredLocation}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Location
                </Button>
              </div>
              {watchedPreferredLocations.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {watchedPreferredLocations.map((location, index) => (
                    <Badge key={index} variant="outline" className="flex items-center space-x-1">
                      <span>{location}</span>
                      <button
                        type="button"
                        onClick={() => removePreferredLocation(index)}
                        className="ml-1 hover:text-red-600"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>
        </FormSection>

        {/* Submit Button */}
        <div className="flex justify-end space-x-4">
          <Button type="button" variant="outline" onClick={onSuccess}>
            Cancel
          </Button>
          <Button type="submit" disabled={updateEmployeeMutation.isPending}>
            {updateEmployeeMutation.isPending ? 'Updating...' : 'Update Employee'}
          </Button>
        </div>
      </form>
    </Form>
  );
} 