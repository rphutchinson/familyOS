"use client";

import { useState, useTransition } from "react";
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
import { Plus } from "lucide-react";
import { familyMemberSchema, FamilyMemberFormData } from "@/lib/validations/family-validation";
import { FAMILY_RELATIONSHIPS, FAMILY_COLORS } from "@/types";
import { createFamilyMemberAction, getAvailableColorAction } from "@/actions/family-members";
import { useRouter } from "next/navigation";

interface AddFamilyMemberFormProps {
  trigger?: React.ReactNode;
}

export function AddFamilyMemberForm({ trigger }: AddFamilyMemberFormProps) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const form = useForm<FamilyMemberFormData>({
    resolver: zodResolver(familyMemberSchema),
    defaultValues: {
      name: "",
      relationship: "Child",
      color: "",
      isDefault: false,
    },
  });

  // Set default color when form opens
  const handleOpenChange = async (newOpen: boolean) => {
    setOpen(newOpen);
    if (newOpen) {
      const result = await getAvailableColorAction();
      if (result.success && result.data) {
        form.setValue("color", result.data);
      }
    } else {
      form.reset();
    }
  };

  const onSubmit = (data: FamilyMemberFormData) => {
    startTransition(async () => {
      try {
        setError(null);
        const result = await createFamilyMemberAction({
          name: data.name,
          relationship: data.relationship,
          color: data.color,
          isDefault: data.isDefault ?? false,
        });

        if (result.success) {
          setOpen(false);
          form.reset();
          router.refresh();
        } else {
          setError(result.error || "Failed to add family member");
        }
      } catch (error) {
        console.error("Failed to add family member:", error);
        setError("An unexpected error occurred");
      }
    });
  };

  const defaultTrigger = (
    <Button>
      <Plus className="h-4 w-4 mr-2" />
      Add Family Member
    </Button>
  );

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {trigger || defaultTrigger}
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Family Member</DialogTitle>
          <DialogDescription>
            Add a new family member to organize healthcare providers.
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {error && (
              <div className="rounded-md bg-red-50 p-4">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}
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
                    defaultValue={field.value}
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
                onClick={() => setOpen(false)}
                disabled={isPending}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? "Adding..." : "Add Family Member"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}