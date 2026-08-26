import React from 'react';
import { Truck } from 'lucide-react';
import { CustomerFormData } from '../types';

interface CustomerFormProps {
  formData: CustomerFormData;
  onChange: (field: keyof CustomerFormData, value: string) => void;
}

export const CustomerForm: React.FC<CustomerFormProps> = ({ formData, onChange }) => {
  return (
    <section
      id="customer-form-section"
      className="bg-[#16161C] rounded-2xl p-5 border border-white/10 shadow-xl space-y-4"
    >
      <div className="flex items-center justify-between border-b border-white/10 pb-3">
        <h3 className="text-xs font-bold text-gray-300 uppercase tracking-wider flex items-center gap-2">
          <Truck className="w-4 h-4 text-[#D4AF37]" />
          <span>Data Pemesan & Alamat Pengiriman</span>
        </h3>
        <span className="text-[10px] text-red-400 font-semibold">* Wajib diisi</span>
      </div>

      <div className="space-y-3 text-xs">
        <div>
          <label htmlFor="cust-name" className="block text-gray-300 font-semibold mb-1">
            Nama Lengkap Pembeli *
          </label>
          <input
            type="text"
            id="cust-name"
            placeholder="Contoh: Bpk. H. Ahmad Wijaya"
            required
            value={formData.name}
            onChange={(e) => onChange('name', e.target.value)}
            className="w-full bg-[#0D0D10] border border-white/15 rounded-xl py-2.5 px-3 text-white outline-none focus:border-[#D4AF37] transition-colors"
          />
        </div>

        <div>
          <label htmlFor="cust-phone" className="block text-gray-300 font-semibold mb-1">
            Nomor WhatsApp / Telp *
          </label>
          <input
            type="tel"
            id="cust-phone"
            placeholder="Contoh: 081234567890"
            required
            value={formData.phone}
            onChange={(e) => onChange('phone', e.target.value)}
            className="w-full bg-[#0D0D10] border border-white/15 rounded-xl py-2.5 px-3 text-white outline-none focus:border-[#D4AF37] transition-colors"
          />
        </div>

        <div>
          <label htmlFor="cust-address" className="block text-gray-300 font-semibold mb-1">
            Alamat Lengkap Pengiriman *
          </label>
          <textarea
            id="cust-address"
            rows={3}
            placeholder="Jalan, RT/RW, No. Rumah, Kelurahan, Kecamatan, Kota/Kabupaten, Provinsi, Kode Pos"
            required
            value={formData.address}
            onChange={(e) => onChange('address', e.target.value)}
            className="w-full bg-[#0D0D10] border border-white/15 rounded-xl py-2.5 px-3 text-white outline-none focus:border-[#D4AF37] transition-colors resize-none"
          ></textarea>
        </div>

        <div>
          <label htmlFor="cust-note" className="block text-gray-300 font-semibold mb-1">
            Catatan Tambahan (Opsional)
          </label>
          <input
            type="text"
            id="cust-note"
            placeholder="Contoh: Pengiriman via Cargo / Ekspedisi Indah Cargo"
            value={formData.note}
            onChange={(e) => onChange('note', e.target.value)}
            className="w-full bg-[#0D0D10] border border-white/15 rounded-xl py-2.5 px-3 text-white outline-none focus:border-[#D4AF37] transition-colors"
          />
        </div>
      </div>
    </section>
  );
};
