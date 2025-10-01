"use client";

import { useEffect } from "react";
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
import { familyMemberSchema, FamilyMemberFormData } from "@/lib/validations/family-validation";
import { useFamilyStore } from "@/lib/stores/family-store";
import { FAMILY_RELATIONSHIPS, FAMILY_COLORS, FamilyMember } from "@/types";

interface EditFamilyMemberFormProps {
  member: FamilyMember | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditFamilyMemberForm({ member, open, onOpenChange }: EditFamilyMemberFormProps) {
  const { updateFamilyMember } = useFamilyStore();

  const form = useForm<FamilyMemberFormData>({
    resolver: zodResolver(familyMemberSchema),
    defaultValues: {
      name: "",
      relationship: "Child",
      color: "",
      isDefault: false,
    },
  });

  // Update form when member changes
  useEffect(() => {
    if (member) {
      form.reset({
        name: member.name,
        relationship: member.relationship,
        color: member.color,
        isDefault: member.isDefault,
      });
    }
  }, [member, form]);

  const onSubmit = (data: FamilyMemberFormData) => {
    if (!member) return;

    try {
      updateFamilyMember(member.id, {
        name: data.name,
        relationship: data.relationship,
        color: data.color,
      });
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to update family member:", error);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    onOpenChange(newOpen);
    if (!newOpen) {
      form.reset();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Family Member</DialogTitle>
          <DialogDescription>
            Update the information for this family member.
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="e.g., Sarah, Emma, Dad" 
                      {...field} 
                    />
                  </FormControl>
                  <FormDescription>
                    Enter a personal name or nickname.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="relationship"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Relationship</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select relationship" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {FAMILY_RELATIONSHIPS.map((relationship) => (
                        <SelectItem key={relationship} value={relationship}>
                          {relationship}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="color"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Color</FormLabel>
                  <FormControl>
                    <div className="grid grid-cols-5 gap-2">
                      {FAMILY_COLORS.map((color) => (
                        <button
                          key={color}
                          type="button"
                          className={`w-8 h-8 rounded-full border-2 ${
                            field.value === color 
                              ? "border-gray-900 ring-2 ring-gray-300" 
                              : "border-gray-200 hover:border-gray-400"
                          }`}
                          style={{ backgroundColor: color }}
                          onClick={() => field.onChange(color)}
                          aria-label={`Select color ${color}`}
                        />
                      ))}
                    </div>
                  </FormControl>
                  <FormDescription>
                    Choose a color to visually identify this family member.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit">Save Changes</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}