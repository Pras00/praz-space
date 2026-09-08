import { z } from "zod";

export const orderItemInputSchema = z.object({
  productId: z.string().min(1, "ID Produk wajib diisi"),
  quantity: z.number().int().positive("Jumlah pesanan minimal 1"),
});

export const createOrderSchema = z.object({
  customerId: z.string().nullable().optional(),
  customerName: z.string().optional(),
  customerPhone: z.string().optional(),
  items: z
    .array(orderItemInputSchema)
    .min(1, "Keranjang pesanan tidak boleh kosong"),
  discountPercent: z.number().min(0).max(100).default(0),
});

export type OrderItemInput = z.infer<typeof orderItemInputSchema>;
export type CreateOrderInput = z.infer<typeof createOrderSchema>;
