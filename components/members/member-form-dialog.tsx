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
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { memberSchema, MemberFormValues } from '@/lib/validations/member';
import type { Member, Group } from '@/types';

interface MemberFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  member?: Member | null;
  groups: Group[];
  loading?: boolean;
  onSubmit: (data: MemberFormValues) => void;
}

export function MemberFormDialog({
  open,
  onOpenChange,
  member,
  groups,
  loading = false,
  onSubmit,
}: MemberFormDialogProps) {
  const isEditing = !!member;

  const form = useForm({
    resolver: zodResolver(memberSchema),
    defaultValues: {
      name: '',
      surname: '',
      email: '',
      phone: '',
      birthdate: '',
      is_child: false,
      parent_name: '',
      parent_phone: '',
      group_id: '',
    },
  });

  const isChild = form.watch('is_child');

  // Reset form when member changes or dialog opens
  useEffect(() => {
    if (open) {
      if (member) {
        form.reset({
          name: member.name,
          surname: member.surname,
          email: member.email || '',
          phone: member.phone || '',
          birthdate: member.birthdate || '',
          is_child: member.is_child,
          parent_name: member.parent_name || '',
          parent_phone: member.parent_phone || '',
          group_id: member.group_id || '',
        });
      } else {
        form.reset({
          name: '',
          surname: '',
          email: '',
          phone: '',
          birthdate: '',
          is_child: false,
          parent_name: '',
          parent_phone: '',
          group_id: '',
        });
      }
    }
  }, [open, member, form]);

  const handleSubmit = (data: MemberFormValues) => {
    onSubmit(data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Üye Düzenle' : 'Yeni Üye Ekle'}
          </DialogTitle>
          <DialogDescription>
            {isEditing 
              ? 'Üye bilgilerini güncelleyin.' 
              : 'Yeni bir üye eklemek için formu doldurun.'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            {/* Name & Surname */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>İsim *</FormLabel>
                    <FormControl>
                      <Input placeholder="Ahmet" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="surname"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Soyisim *</FormLabel>
                    <FormControl>
                      <Input placeholder="Yılmaz" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Email & Phone */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>E-posta</FormLabel>
                    <FormControl>
                      <Input 
                        type="email" 
                        placeholder="ornek@email.com" 
                        {...field} 
                      />
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
                    <FormLabel>Telefon</FormLabel>
                    <FormControl>
                      <Input placeholder="0532 123 4567" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Birthdate & Group */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="birthdate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Doğum Tarihi</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="group_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Grup</FormLabel>
                    <Select 
                      onValueChange={(value) => field.onChange(value === 'none' ? '' : value)} 
                      value={field.value || 'none'}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Grup seçin" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="none">Grup yok</SelectItem>
                        {groups.map((group) => (
                          <SelectItem key={group.id} value={group.id}>
                            {group.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Is Child Checkbox */}
            <FormField
              control={form.control}
              name="is_child"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Çocuk Üye</FormLabel>
                    <FormDescription>
                      18 yaşından küçük üyeler için veli bilgileri gereklidir.
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />

            {/* Parent Info (shown when is_child is true) */}
            {isChild && (
              <div className="grid grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
                <FormField
                  control={form.control}
                  name="parent_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Veli Adı Soyadı *</FormLabel>
                      <FormControl>
                        <Input placeholder="Mehmet Yılmaz" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="parent_phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Veli Telefonu</FormLabel>
                      <FormControl>
                        <Input placeholder="0532 987 6543" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

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
                {isEditing ? 'Güncelle' : 'Ekle'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

