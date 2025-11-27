import { z } from 'zod';

export const groupSchema = z.object({
  name: z
    .string()
    .min(2, 'Grup adı en az 2 karakter olmalıdır')
    .max(50, 'Grup adı en fazla 50 karakter olabilir'),
  description: z
    .string()
    .max(200, 'Açıklama en fazla 200 karakter olabilir')
    .optional()
    .or(z.literal('')),
  coach_id: z
    .string()
    .uuid('Geçerli bir antrenör seçiniz')
    .optional()
    .or(z.literal('')),
});

export type GroupFormValues = z.infer<typeof groupSchema>;

