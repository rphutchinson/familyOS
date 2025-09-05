"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus } from "lucide-react";
import { providerSchema, ProviderFormData } from "@/lib/validations/provider-validation";
import { useFamilyStore } from "@/lib/stores/family-store";
import { PORTAL_PLATFORMS, HEALTHCARE_SPECIALTIES } from "@/types";

interface AddProviderFormProps {
  trigger?: React.ReactNode;
}

export function AddProviderForm({ trigger }: AddProviderFormProps) {
  const [open, setOpen] = useState(false);
  const { addProvider, familyMembers, getDefaultFamilyMember } = useFamilyStore();

  const form = useForm<ProviderFormData>({
    resolver: zodResolver(providerSchema),
    defaultValues: {
      providerName: "",
      portalName: "",
      portalUrl: "",
      portalPlatform: "Other",
      specialty: "Other",
      familyMemberIds: [],
      loginUsername: "",
      notes: "",
      autoDetected: false,
    },
  });

  // Set default family member when form opens
  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (newOpen) {
      const defaultMember = getDefaultFamilyMember();
      if (defaultMember) {
        form.setValue("familyMemberIds", [defaultMember.id]);
      }
    } else {
      form.reset();
    }
  };

  const onSubmit = (data: ProviderFormData) => {
    try {
      addProvider({
        ...data,
        loginUsername: data.loginUsername || undefined,
        notes: data.notes || undefined,
      });
      setOpen(false);
      form.reset();
    } catch (error) {
      console.error("Failed to add provider:", error);
    }
  };

  const defaultTrigger = (
    <Button>
      <Plus className="h-4 w-4 mr-2" />
      Add Provider
    </Button>
  );

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {trigger || defaultTrigger}
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Healthcare Provider</DialogTitle>
          <DialogDescription>
            Add a new healthcare provider and associate it with family members.
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="providerName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Provider Name *</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="e.g., Dr. Sarah Johnson" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="specialty"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Specialty *</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select specialty" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {HEALTHCARE_SPECIALTIES.map((specialty) => (
                          <SelectItem key={specialty} value={specialty}>
                            {specialty}
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
              control={form.control}
              name="portalName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Portal Name *</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="e.g., Johnson Family Practice Patient Portal" 
                      {...field} 
                    />
                  </FormControl>
                  <FormDescription>
                    The name of the patient portal or website.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="portalUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Portal URL *</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="https://example.mychart.com" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="portalPlatform"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Portal Platform *</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select platform" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {PORTAL_PLATFORMS.map((platform) => (
                          <SelectItem key={platform} value={platform}>
                            {platform}
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
              control={form.control}
              name="familyMemberIds"
              render={() => (
                <FormItem>
                  <FormLabel>Family Members *</FormLabel>
                  <FormDescription>
                    Select which family members use this provider.
                  </FormDescription>
                  <div className="space-y-3">
                    {familyMembers.map((member) => (
                      <FormField
                        key={member.id}
                        control={form.control}
                        name="familyMemberIds"
                        render={({ field }) => {
                          return (
                            <FormItem
                              key={member.id}
                              className="flex flex-row items-center space-x-3 space-y-0"
                            >
                              <FormControl>
                                <Checkbox
                                  checked={field.value?.includes(member.id)}
                                  onCheckedChange={(checked) => {
                                    return checked
                                      ? field.onChange([...field.value, member.id])
                                      : field.onChange(
                                          field.value?.filter(
                                            (value) => value !== member.id
                                          )
                                        );
                                  }}
                                />
                              </FormControl>
                              <div className="flex items-center gap-2">
                                <div 
                                  className="w-3 h-3 rounded-full" 
                                  style={{ backgroundColor: member.color }}
                                />
                                <FormLabel className="text-sm font-normal">
                                  {member.name} ({member.relationship})
                                </FormLabel>
                              </div>
                            </FormItem>
                          );
                        }}
                      />
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="loginUsername"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Login Username (Optional)</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Your username for this portal" 
                      {...field} 
                    />
                  </FormControl>
                  <FormDescription>
                    Optional: Store your username as a reminder (never store passwords).
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes (Optional)</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Any additional notes about this provider" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit">Add Provider</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}