"use client";

import * as React from "react";
import { Printer, Download, Coffee } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatDate } from "@/lib/utils";

export interface ReceiptData {
  orderNumber: string;
  transactionNumber?: string;
  date: Date | string;
  cashierName?: string;
  customerName?: string;
  paymentMethod?: string;
  paymentStatus?: string;
  subtotal: number | string;
  discount: number | string;
  tax: number | string;
  total: number | string;
  items: Array<{
    productNameSnapshot: string;
    quantity: number;
    unitPrice: number | string;
    subtotal: number | string;
  }>;
}

export function ThermalReceipt({ data }: { data: ReceiptData }) {
  function handlePrint() {
    window.print();
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end gap-2 no-print">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handlePrint}
          className="gap-2 text-xs"
        >
          <Printer className="h-4 w-4" />
          Cetak Struk (Thermal)
        </Button>
      </div>

      {/* 80mm Standard Thermal Paper Layout */}
      <div
        id="thermal-receipt-paper"
        className="mx-auto w-full max-w-[340px] rounded-xl border border-dashed border-border bg-white text-black p-6 font-mono text-xs shadow-sm"
      >
        {/* Header */}
        <div className="text-center space-y-1 pb-3 border-b border-dashed border-zinc-300">
          <h2 className="text-lg font-black tracking-widest uppercase text-black">
            PRAZ SPACE
          </h2>
          <p className="text-[10px] uppercase tracking-wider text-zinc-600 font-semibold">
            Specialty Coffee & Eatery
          </p>
          <p className="text-[9px] text-zinc-500 leading-tight">
            Jl. Praz Space No. 1, Jakarta Selatan
          </p>
          <p className="text-[9px] text-zinc-500">Telp: 0812-3456-7890</p>
        </div>

        {/* Metadata */}
        <div className="py-2.5 space-y-1 border-b border-dashed border-zinc-300 text-[11px]">
          <div className="flex justify-between">
            <span className="text-zinc-600">No. Pesanan:</span>
            <span className="font-bold text-black">{data.orderNumber}</span>
          </div>
          {data.transactionNumber && (
            <div className="flex justify-between">
              <span className="text-zinc-600">No. Transaksi:</span>
              <span className="font-bold text-black">{data.transactionNumber}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-zinc-600">Waktu:</span>
            <span className="text-zinc-800">{formatDate(data.date)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-zinc-600">Kasir:</span>
            <span className="text-zinc-800">{data.cashierName || "Staff"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-zinc-600">Pelanggan:</span>
            <span className="text-zinc-800 font-semibold">{data.customerName || "Walk-In"}</span>
          </div>
          {data.paymentMethod && (
            <div className="flex justify-between">
              <span className="text-zinc-600">Metode Bayar:</span>
              <span className="font-bold uppercase text-black">
                {data.paymentMethod}
              </span>
            </div>
          )}
        </div>

        {/* Line Items */}
        <div className="py-2.5 space-y-2 border-b border-dashed border-zinc-300 text-[11px]">
          {data.items.map((item, idx) => (
            <div key={idx} className="flex justify-between items-start">
              <div className="pr-2 flex-1">
                <p className="font-bold text-black leading-tight">
                  {item.productNameSnapshot}
                </p>
                <p className="text-[10px] text-zinc-600">
                  {item.quantity} × {formatCurrency(item.unitPrice)}
                </p>
              </div>
              <span className="font-bold text-black shrink-0">
                {formatCurrency(item.subtotal)}
              </span>
            </div>
          ))}
        </div>

        {/* Calculation Summary */}
        <div className="pt-2.5 space-y-1 text-[11px]">
          <div className="flex justify-between text-zinc-600">
            <span>Subtotal:</span>
            <span className="text-black font-semibold">
              {formatCurrency(data.subtotal)}
            </span>
          </div>

          {Number(data.discount) > 0 && (
            <div className="flex justify-between text-zinc-600">
              <span>Diskon:</span>
              <span className="text-black font-semibold">
                - {formatCurrency(data.discount)}
              </span>
            </div>
          )}

          <div className="flex justify-between text-zinc-600">
            <span>PB1 Cafe Restoran (10%):</span>
            <span className="text-black font-semibold">
              {formatCurrency(data.tax)}
            </span>
          </div>

          <div className="flex justify-between pt-1.5 font-bold text-sm text-black border-t border-zinc-400">
            <span>TOTAL PEMBAYARAN:</span>
            <span className="text-base">{formatCurrency(data.total)}</span>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center pt-4 border-t border-dashed border-zinc-300 mt-3 space-y-1 text-[10px] text-zinc-500">
          <p className="font-semibold text-zinc-700">
            Terima kasih telah mengunjungi Praz Space!
          </p>
          <p>Follow Instagram: @prazspace.cafe</p>
          <p className="text-[9px] pt-1 text-zinc-400">
            Struk ini adalah bukti pembayaran yang sah.
          </p>
        </div>
      </div>
    </div>
  );
}
