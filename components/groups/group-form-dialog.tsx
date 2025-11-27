'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { groupSchema, GroupFormValues } from '@/lib/validations/group';
import type { Group, User } from '@/types';

interface GroupFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  group?: Group | null;
  coaches?: User[];
  loading?: boolean;
  onSubmit: (data: GroupFormValues) => void;
}

export function GroupFormDialog({
  open,
  onOpenChange,
  group,
  coaches = [],
  loading = false,
  onSubmit,
}: GroupFormDialogProps) {
  const isEditing = !!group;

  const form = useForm<GroupFormValues>({
    resolver: zodResolver(groupSchema),
    defaultValues: {
      name: '',
      description: '',
      coach_id: '',
    },
  });

  useEffect(() => {
    if (open) {
      if (group) {
        form.reset({
          name: group.name,
          description: group.description || '',
          coach_id: group.coach_id || '',
        });
      } else {
        form.reset({
          name: '',
          description: '',
          coach_id: '',
        });
      }
    }
  }, [open, group, form]);

  const handleSubmit = (data: GroupFormValues) => {
    onSubmit(data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Grup Düzenle' : 'Yeni Grup Oluştur'}
          </DialogTitle>
          <DialogDescription>
            {isEditing 
              ? 'Grup bilgilerini güncelleyin.' 
              : 'Yeni bir tenis grubu oluşturun.'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Grup Adı *</FormLabel>
                  <FormControl>
                    <Input placeholder="Yetişkinler A" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Açıklama</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Grup hakkında kısa açıklama..."
                      className="resize-none"
                      rows={3}
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="coach_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Antrenör</FormLabel>
                  <Select 
                    onValueChange={(value) => field.onChange(value === 'none' ? '' : value)} 
                    value={field.value || 'none'}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Antrenör seçin" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="none">Antrenör atanmadı</SelectItem>
                      {coaches.map((coach) => (
                        <SelectItem key={coach.id} value={coach.id}>
                          {coach.full_name || coach.email}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={loading}
              >
                İptal
              </Button>
              <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isEditing ? 'Güncelle' : 'Oluştur'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

