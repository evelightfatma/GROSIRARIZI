import React from 'react';
import { Table } from 'lucide-react';
import { PricingConfig } from '../types';
import { formatRupiah } from '../utils/pricing';

interface WholesaleTableProps {
  pricing: PricingConfig;
}

export const WholesaleTable: React.FC<WholesaleTableProps> = ({ pricing }) => {
  return (
    <section
      id="wholesale-pricing-table-section"
      className="bg-[#16161C] rounded-2xl p-5 border border-white/10 shadow-xl space-y-3"
    >
      <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center justify-between">
        <span>Daftar Tingkat Harga Grosir Batik ARIZI</span>
        <Table className="w-4 h-4 text-[#D4AF37]" />
      </h3>

      <div className="overflow-x-auto rounded-xl border border-white/10">
        <table className="w-full text-left text-xs text-gray-300">
          <thead className="bg-[#20202A] text-gray-400 font-semibold border-b border-white/10">
            <tr>
              <th className="py-2.5 px-3">Jumlah Pcs</th>
              <th className="py-2.5 px-3">Ketentuan Harga Paket</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 text-[11px]">
            <tr>
              <td className="py-2 px-3 font-medium text-white">1–11 pcs</td>
              <td id="tbl-underDozen" className="py-2 px-3 text-gray-300">
                {formatRupiah(pricing.underDozen)} / pcs (Eceran)
              </td>
            </tr>
            <tr className="bg-white/[0.02]">
              <td className="py-2 px-3 font-medium text-[#D4AF37]">12 pcs (1 Lusin)</td>
              <td id="tbl-dozen1" className="py-2 px-3 text-[#D4AF37] font-semibold">
                {formatRupiah(pricing.dozen1)}
              </td>
            </tr>
            <tr>
              <td className="py-2 px-3 font-medium text-white">13–23 pcs</td>
              <td id="tbl-rem1" className="py-2 px-3 text-gray-300">
                1 Lusin + Sisa{' '}
                <span className="text-white font-medium">
                  {formatRupiah(pricing.remainderAfter1)}
                </span>
                /pcs
              </td>
            </tr>
            <tr className="bg-white/[0.02]">
              <td className="py-2 px-3 font-medium text-[#D4AF37]">24 pcs (2 Lusin)</td>
              <td id="tbl-dozen2" className="py-2 px-3 text-[#D4AF37] font-semibold">
                {formatRupiah(pricing.dozen2)}
              </td>
            </tr>
            <tr>
              <td className="py-2 px-3 font-medium text-white">25–35 pcs</td>
              <td id="tbl-rem2" className="py-2 px-3 text-gray-300">
                2 Lusin + Sisa{' '}
                <span className="text-white font-medium">
                  {formatRupiah(pricing.remainderAfter2)}
                </span>
                /pcs
              </td>
            </tr>
            <tr className="bg-white/[0.02]">
              <td className="py-2 px-3 font-medium text-[#D4AF37]">36 pcs (3 Lusin)</td>
              <td id="tbl-dozen3" className="py-2 px-3 text-[#D4AF37] font-semibold">
                {formatRupiah(pricing.dozen3)}
              </td>
            </tr>
            <tr>
              <td className="py-2 px-3 font-medium text-white">37–47 pcs</td>
              <td id="tbl-rem3" className="py-2 px-3 text-gray-300">
                3 Lusin + Sisa{' '}
                <span className="text-white font-medium">
                  {formatRupiah(pricing.remainderAfter3)}
                </span>
                /pcs
              </td>
            </tr>
            <tr className="bg-[#D4AF37]/10 font-bold">
              <td className="py-2 px-3 text-[#D4AF37]">≥48 pcs (4 Lusin+)</td>
              <td id="tbl-over48" className="py-2 px-3 text-[#D4AF37]">
                {formatRupiah(pricing.over48)} / pcs
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  );
};
