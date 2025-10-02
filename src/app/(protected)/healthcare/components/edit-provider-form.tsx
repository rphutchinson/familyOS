"use client";

import { useEffect, useState, useTransition } from "react";
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
import { providerFormSchema, ProviderFormData } from "@/lib/validations/provider-validation";
import { HEALTHCARE_SPECIALTIES, HealthcareSpecialty } from "@/types";
import { updateProviderAction } from "@/actions/providers";
import { useRouter } from "next/navigation";
import { HealthcareProviderData, FamilyMemberData } from "@/types/database";

interface EditProviderFormProps {
  provider: HealthcareProviderData | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  familyMembers: FamilyMemberData[];
}

export function EditProviderForm({ provider, open, onOpenChange, familyMembers }: EditProviderFormProps) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const form = useForm<ProviderFormData>({
    resolver: zodResolver(providerFormSchema),
    defaultValues: {
      providerName: "",
      portalUrl: "",
      specialty: "Other",
      familyMemberIds: [],
      loginUsername: "",
      notes: "",
    },
  });

  // Update form when provider changes
  useEffect(() => {
    if (provider) {
      form.reset({
        providerName: provider.providerName,
        portalUrl: provider.portalUrl,
        specialty: provider.specialty,
        familyMemberIds: provider.familyMemberIds,
        loginUsername: provider.loginUsername || "",
        notes: provider.notes || ""
      });
    }
  }, [provider, form]);

  const onSubmit = (data: ProviderFormData) => {
    if (!provider) return;

    startTransition(async () => {
      try {
        setError(null);
        const result = await updateProviderAction(provider.id, {
          providerName: data.providerName,
          portalUrl: data.portalUrl,
          specialty: data.specialty as HealthcareSpecialty,
          familyMemberIds: data.familyMemberIds,
          loginUsername: data.loginUsername || undefined,
          notes: data.notes || undefined,
        });

        if (result.success) {
          onOpenChange(false);
          router.refresh();
        } else {
          setError(result.error || "Failed to update provider");
        }
      } catch (error) {
        console.error("Failed to update provider:", error);
        setError("An unexpected error occurred");
      }
    });
  };

  const handleOpenChange = (newOpen: boolean) => {
    onOpenChange(newOpen);
    if (!newOpen) {
      form.reset();
      setError(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Healthcare Provider</DialogTitle>
          <DialogDescription>
            Update the information for this healthcare provider.
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {error && (
              <div className="rounded-md bg-red-50 p-4">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}
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
                      value={field.value}
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
                onClick={() => onOpenChange(false)}
                disabled={isPending}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? "Saving..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}