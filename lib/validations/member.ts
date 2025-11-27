import { z } from 'zod';

export const memberSchema = z.object({
  name: z
    .string()
    .min(2, 'İsim en az 2 karakter olmalıdır')
    .max(50, 'İsim en fazla 50 karakter olabilir'),
  surname: z
    .string()
    .min(2, 'Soyisim en az 2 karakter olmalıdır')
    .max(50, 'Soyisim en fazla 50 karakter olabilir'),
  email: z
    .string()
    .email('Geçerli bir e-posta adresi giriniz')
    .optional()
    .or(z.literal('')),
  phone: z
    .string()
    .regex(/^[0-9\s\-\+\(\)]*$/, 'Geçerli bir telefon numarası giriniz')
    .optional()
    .or(z.literal('')),
  birthdate: z
    .string()
    .optional()
    .or(z.literal('')),
  is_child: z.boolean().default(false),
  parent_name: z
    .string()
    .max(100, 'Veli adı en fazla 100 karakter olabilir')
    .optional()
    .or(z.literal('')),
  parent_phone: z
    .string()
    .regex(/^[0-9\s\-\+\(\)]*$/, 'Geçerli bir telefon numarası giriniz')
    .optional()
    .or(z.literal('')),
  group_id: z
    .string()
    .optional()
    .transform((val) => (val === 'none' || val === '' ? undefined : val)),
}).refine((data) => {
  // If is_child is true, parent_name should be provided
  if (data.is_child && (!data.parent_name || data.parent_name.trim() === '')) {
    return false;
  }
  return true;
}, {
  message: 'Çocuk üyeler için veli adı zorunludur',
  path: ['parent_name'],
});

export type MemberFormValues = z.infer<typeof memberSchema>;

export const memberFilterSchema = z.object({
  search: z.string().optional(),
  group_id: z.string().optional(),
  is_child: z.enum(['all', 'true', 'false']).optional(),
  status: z.enum(['all', 'active', 'inactive']).optional(),
});

export type MemberFilterValues = z.infer<typeof memberFilterSchema>;
