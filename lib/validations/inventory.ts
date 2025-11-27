import { z } from 'zod';

export const inventorySchema = z.object({
  name: z
    .string()
    .min(2, 'Ürün adı en az 2 karakter olmalıdır')
    .max(100, 'Ürün adı en fazla 100 karakter olabilir'),
  category: z
    .string()
    .max(50, 'Kategori en fazla 50 karakter olabilir')
    .optional()
    .or(z.literal('')),
  quantity: z
    .number()
    .min(0, 'Miktar 0 veya daha büyük olmalıdır')
    .max(10000, 'Miktar çok yüksek'),
  min_stock: z
    .number()
    .min(0, 'Minimum stok 0 veya daha büyük olmalıdır')
    .max(1000, 'Minimum stok çok yüksek'),
  description: z
    .string()
    .max(300, 'Açıklama en fazla 300 karakter olabilir')
    .optional()
    .or(z.literal('')),
});

export type InventoryFormValues = z.infer<typeof inventorySchema>;

