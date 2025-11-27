import { z } from 'zod';

export const paymentSchema = z.object({
  member_id: z
    .string()
    .uuid('Geçerli bir üye seçiniz')
    .min(1, 'Üye seçimi zorunludur'),
  period: z
    .string()
    .regex(/^\d{4}-(0[1-9]|1[0-2])$/, 'Geçerli bir dönem seçiniz (YYYY-MM)')
    .min(1, 'Dönem seçimi zorunludur'),
  amount: z
    .number()
    .min(0, 'Tutar 0 veya daha büyük olmalıdır')
    .max(100000, 'Tutar çok yüksek'),
  paid: z.boolean().default(false),
  notes: z
    .string()
    .max(200, 'Notlar en fazla 200 karakter olabilir')
    .optional()
    .or(z.literal('')),
});

export type PaymentFormValues = z.infer<typeof paymentSchema>;

