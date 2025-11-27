import { z } from 'zod';

export const lessonSchema = z.object({
  group_id: z
    .string({ required_error: 'Grup seçimi zorunludur' })
    .min(1, 'Lütfen bir grup seçin'),
  date: z
    .string()
    .min(1, 'Tarih seçimi zorunludur'),
  start_time: z
    .string()
    .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Geçerli bir saat giriniz (HH:MM)')
    .min(1, 'Başlangıç saati zorunludur'),
  end_time: z
    .string()
    .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Geçerli bir saat giriniz (HH:MM)')
    .min(1, 'Bitiş saati zorunludur'),
  notes: z
    .string()
    .max(500, 'Notlar en fazla 500 karakter olabilir')
    .optional()
    .or(z.literal('')),
}).refine((data) => {
  if (data.start_time && data.end_time) {
    return data.start_time < data.end_time;
  }
  return true;
}, {
  message: 'Bitiş saati başlangıç saatinden sonra olmalıdır',
  path: ['end_time'],
});

export type LessonFormValues = z.infer<typeof lessonSchema>;
