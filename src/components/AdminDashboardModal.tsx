import React, { useState, useRef } from 'react';
import {
  Sliders,
  LogOut,
  X,
  Package,
  CreditCard,
  Tags,
  Code2,
  PlusCircle,
  Trash2,
  Save,
  RotateCcw,
  Copy,
  Check,
  Info,
} from 'lucide-react';
import { BatikProduct, PricingConfig, AdminSettings, SleeveType } from '../types';
import { GOOGLE_APPS_SCRIPT_CODE, GOOGLE_SPREADSHEET_ID, GOOGLE_DRIVE_CATALOG_ID, GOOGLE_DRIVE_INVOICE_ID, GOOGLE_APPS_SCRIPT_URL } from '../constants';
import { compressImageFile } from '../utils/pricing';

interface AdminDashboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogout: () => void;
  products: BatikProduct[];
  pricing: PricingConfig;
  adminSettings: AdminSettings;
  onAddProduct: (prod: BatikProduct) => void;
  onDeleteProduct: (prodId: string) => void;
  onSavePricing: (pricing: PricingConfig) => void;
  onSaveSettings: (settings: AdminSettings) => void;
  onOpenResetConfirm: () => void;
  onToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

type AdminTab = 'products' | 'settings' | 'prices' | 'gas';

export const AdminDashboardModal: React.FC<AdminDashboardModalProps> = ({
  isOpen,
  onClose,
  onLogout,
  products,
  pricing,
  adminSettings,
  onAddProduct,
  onDeleteProduct,
  onSavePricing,
  onSaveSettings,
  onOpenResetConfirm,
  onToast,
}) => {
  const [activeTab, setActiveTab] = useState<AdminTab>('products');

  // New product form states
  const [newProdName, setNewProdName] = useState('');
  const [newPanjangChecked, setNewPanjangChecked] = useState(true);
  const [newPendekChecked, setNewPendekChecked] = useState(true);
  const [previewPanjang, setPreviewPanjang] = useState<string>('');
  const [previewPendek, setPreviewPendek] = useState<string>('');
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const filePanjangRef = useRef<HTMLInputElement>(null);
  const filePendekRef = useRef<HTMLInputElement>(null);

  // Settings form state
  const [settingsForm, setSettingsForm] = useState<AdminSettings>({ ...adminSettings });

  // Pricing form state
  const [pricingForm, setPricingForm] = useState<PricingConfig>({ ...pricing });

  // GAS code copied state
  const [isGasCopied, setIsGasCopied] = useState(false);

  // Keep state synced when modal opens
  React.useEffect(() => {
    if (isOpen) {
      setSettingsForm({ ...adminSettings });
      setPricingForm({ ...pricing });
    }
  }, [isOpen, adminSettings, pricing]);

  if (!isOpen) return null;

  const handleFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
    setPreview: (url: string) => void
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      const compressed = await compressImageFile(file, 600, 600, 0.8);
      if (compressed) {
        setPreview(compressed.dataUrl);
      }
    } else {
      setPreview('');
    }
  };

  const handleAddNewProduct = async () => {
    const name = newProdName.trim();
    const filePanjang = filePanjangRef.current?.files?.[0];
    const filePendek = filePendekRef.current?.files?.[0];

    if (!name) {
      onToast('Nama produk Batik wajib diisi!', 'error');
      return;
    }

    if (!filePanjang && !filePendek && !previewPanjang && !previewPendek) {
      onToast('Pilih minimal 1 file gambar dari perangkat Anda!', 'error');
      return;
    }

    const sleeves: SleeveType[] = [];
    if (newPanjangChecked) sleeves.push('Panjang');
    if (newPendekChecked) sleeves.push('Pendek');
    if (sleeves.length === 0) sleeves.push('Panjang', 'Pendek');

    setIsAddingProduct(true);
    onToast('Memproses gambar & menyimpan...', 'info');

    try {
      const cleanSafeName = name.replace(/[\\/:*?"<>|]/g, '_');
      let base64Panjang = filePanjang ? await compressImageFile(filePanjang) : null;
      let base64Pendek = filePendek ? await compressImageFile(filePendek) : null;

      let imgPanjangUrl = base64Panjang ? base64Panjang.dataUrl : (base64Pendek ? base64Pendek.dataUrl : previewPanjang);
      let imgPendekUrl = base64Pendek ? base64Pendek.dataUrl : (base64Panjang ? base64Panjang.dataUrl : previewPendek);

      const newProdId = 'p_' + Date.now();
      const newProd: BatikProduct = {
        id: newProdId,
        name,
        imagePanjang: imgPanjangUrl,
        imagePendek: imgPendekUrl,
        sleeves,
      };

      // Upload to Google Apps Script Web App with automatic file naming
      const gasUrlTarget = adminSettings.gasUrl || GOOGLE_APPS_SCRIPT_URL;
      if (gasUrlTarget) {
        fetch(gasUrlTarget, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'addProduct',
            id: newProdId,
            name,
            sleeves: sleeves.join(','),
            filePanjang: base64Panjang ? { filename: `${cleanSafeName} - Lengan Panjang.jpg`, mimeType: base64Panjang.mimeType, base64: base64Panjang.base64 } : null,
            filePendek: base64Pendek ? { filename: `${cleanSafeName} - Lengan Pendek.jpg`, mimeType: base64Pendek.mimeType, base64: base64Pendek.base64 } : null,
          }),
        })
          .then((res) => res.json())
          .then((resData) => {
            if (resData.status === 'success') {
              onToast('Foto otomatis tersimpan di Google Drive & Spreadsheet!');
            }
          })
          .catch(() => {
            // fallback gracefully
          });
      }

      onAddProduct(newProd);

      // Reset form
      setNewProdName('');
      setPreviewPanjang('');
      setPreviewPendek('');
      if (filePanjangRef.current) filePanjangRef.current.value = '';
      if (filePendekRef.current) filePendekRef.current.value = '';
      onToast('Produk baru berhasil ditambahkan ke katalog!');
    } catch (err) {
      console.error(err);
      onToast('Gagal memproses gambar produk', 'error');
    } finally {
      setIsAddingProduct(false);
    }
  };

  const handleSaveGeneralSettings = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveSettings(settingsForm);
    onToast('Pengaturan Rekening & Admin WA Berhasil Disimpan');
  };

  const handleSavePricing = (e: React.FormEvent) => {
    e.preventDefault();
    for (const key in pricingForm) {
      if ((pricingForm as any)[key] <= 0) {
        onToast('Semua harga harus berupa angka positif', 'error');
        return;
      }
    }
    onSavePricing(pricingForm);
    onToast('Pengaturan tier harga grosir berhasil disimpan!');
  };

  const handleCopyGasCode = () => {
    navigator.clipboard.writeText(GOOGLE_APPS_SCRIPT_CODE).then(
      () => {
        setIsGasCopied(true);
        onToast('Code.gs berhasil disalin ke clipboard!');
        setTimeout(() => setIsGasCopied(false), 2500);
      },
      () => {
        onToast('Gagal menyalin script', 'error');
      }
    );
  };

  return (
    <div
      id="modal-admin"
      className="fixed inset-0 bg-[#0D0D10] z-50 flex flex-col overflow-hidden animate-in fade-in duration-200"
    >
      {/* Top Navbar */}
      <div className="bg-[#16161C] border-b border-white/10 p-4 flex justify-between items-center sticky top-0 z-10">
        <div className="flex items-center space-x-2">
          <Sliders className="w-5 h-5 text-[#D4AF37]" />
          <h2 className="text-base font-bold text-white tracking-wide">
            Panel Dashboard Admin
          </h2>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={onLogout}
            className="bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Logout</span>
          </button>
          <button
            onClick={onClose}
            className="bg-[#20202A] hover:bg-white/10 text-gray-300 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
            <span>Tutup</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-[#20202A]/60 border-b border-white/10 px-4 flex space-x-2 overflow-x-auto no-scrollbar">
        <button
          id="tab-btn-products"
          onClick={() => setActiveTab('products')}
          className={`py-2.5 px-3 text-xs font-semibold border-b-2 whitespace-nowrap transition-colors flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'products'
              ? 'border-[#D4AF37] text-[#D4AF37]'
              : 'border-transparent text-gray-400 hover:text-gray-200'
          }`}
        >
          <Package className="w-3.5 h-3.5" />
          <span>Kelola Produk</span>
        </button>
        <button
          id="tab-btn-settings"
          onClick={() => setActiveTab('settings')}
          className={`py-2.5 px-3 text-xs font-semibold border-b-2 whitespace-nowrap transition-colors flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'settings'
              ? 'border-[#D4AF37] text-[#D4AF37]'
              : 'border-transparent text-gray-400 hover:text-gray-200'
          }`}
        >
          <CreditCard className="w-3.5 h-3.5" />
          <span>Rekening & WA Admin</span>
        </button>
        <button
          id="tab-btn-prices"
          onClick={() => setActiveTab('prices')}
          className={`py-2.5 px-3 text-xs font-semibold border-b-2 whitespace-nowrap transition-colors flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'prices'
              ? 'border-[#D4AF37] text-[#D4AF37]'
              : 'border-transparent text-gray-400 hover:text-gray-200'
          }`}
        >
          <Tags className="w-3.5 h-3.5" />
          <span>Harga Grosir</span>
        </button>
        <button
          id="tab-btn-gas"
          onClick={() => setActiveTab('gas')}
          className={`py-2.5 px-3 text-xs font-semibold border-b-2 whitespace-nowrap transition-colors flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'gas'
              ? 'border-[#D4AF37] text-[#D4AF37]'
              : 'border-transparent text-gray-400 hover:text-gray-200'
          }`}
        >
          <Code2 className="w-3.5 h-3.5" />
          <span>Script Code.gs (Google)</span>
        </button>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* TAB 1: KELOLA PRODUK */}
          {activeTab === 'products' && (
            <div id="adm-tab-products" className="space-y-6">
              {/* Form Tambah Produk Baru */}
              <div className="bg-[#16161C] p-4 rounded-2xl border border-white/10 space-y-4">
                <h4 className="text-xs font-bold text-[#D4AF37] uppercase tracking-wider border-b border-white/10 pb-2 flex items-center justify-between">
                  <span>Tambah Produk Katalog Baru</span>
                  <PlusCircle className="w-4 h-4" />
                </h4>

                <div className="space-y-3 text-xs">
                  <div>
                    <label className="block text-gray-300 font-medium mb-1">
                      Nama Produk Batik *
                    </label>
                    <input
                      type="text"
                      id="new-prod-name"
                      placeholder="Contoh: Batik Parang Kusumo Royal"
                      value={newProdName}
                      onChange={(e) => setNewProdName(e.target.value)}
                      className="w-full bg-[#0D0D10] border border-white/15 rounded-xl py-2 px-3 text-white outline-none focus:border-[#D4AF37]"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-300 font-medium mb-1">
                      Foto Lengan Panjang (Pilih File Perangkat)
                    </label>
                    <div className="flex items-center gap-3">
                      <input
                        ref={filePanjangRef}
                        type="file"
                        id="new-prod-file-panjang"
                        accept="image/*"
                        onChange={(e) => handleFileChange(e, setPreviewPanjang)}
                        className="block w-full text-xs text-gray-400 file:mr-3 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-[#D4AF37]/20 file:text-[#D4AF37] hover:file:bg-[#D4AF37]/30 cursor-pointer bg-[#0D0D10] border border-white/15 rounded-xl"
                      />
                      {previewPanjang && (
                        <img
                          src={previewPanjang}
                          alt="Preview Lengan Panjang"
                          className="w-10 h-10 rounded-lg object-cover bg-[#20202A] border border-[#D4AF37]/30 shrink-0"
                        />
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-gray-300 font-medium mb-1">
                      Foto Lengan Pendek (Pilih File Perangkat)
                    </label>
                    <div className="flex items-center gap-3">
                      <input
                        ref={filePendekRef}
                        type="file"
                        id="new-prod-file-pendek"
                        accept="image/*"
                        onChange={(e) => handleFileChange(e, setPreviewPendek)}
                        className="block w-full text-xs text-gray-400 file:mr-3 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-[#D4AF37]/20 file:text-[#D4AF37] hover:file:bg-[#D4AF37]/30 cursor-pointer bg-[#0D0D10] border border-white/15 rounded-xl"
                      />
                      {previewPendek && (
                        <img
                          src={previewPendek}
                          alt="Preview Lengan Pendek"
                          className="w-10 h-10 rounded-lg object-cover bg-[#20202A] border border-[#D4AF37]/30 shrink-0"
                        />
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-gray-300 font-medium mb-1">
                      Varian Lengan Yang Tersedia
                    </label>
                    <div className="flex items-center space-x-4 pt-1">
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={newPanjangChecked}
                          onChange={(e) => setNewPanjangChecked(e.target.checked)}
                          className="rounded accent-[#D4AF37] cursor-pointer"
                        />
                        <span className="text-gray-300">Lengan Panjang</span>
                      </label>
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={newPendekChecked}
                          onChange={(e) => setNewPendekChecked(e.target.checked)}
                          className="rounded accent-[#D4AF37] cursor-pointer"
                        />
                        <span className="text-gray-300">Lengan Pendek</span>
                      </label>
                    </div>
                  </div>

                  <button
                    onClick={handleAddNewProduct}
                    disabled={isAddingProduct}
                    className="w-full bg-gradient-to-r from-[#AA820A] via-[#D4AF37] to-[#F3E5AB] hover:brightness-110 text-black font-extrabold py-2.5 rounded-xl transition-all shadow-md active:scale-95 cursor-pointer disabled:opacity-50"
                  >
                    {isAddingProduct ? 'Menyimpan...' : 'TAMBAHKAN KE KATALOG'}
                  </button>
                </div>
              </div>

              {/* List Existing Products */}
              <div className="bg-[#16161C] p-4 rounded-2xl border border-white/10 space-y-3">
                <h4 className="text-xs font-bold text-gray-300 uppercase tracking-wider border-b border-white/10 pb-2">
                  Daftar Produk Aktif ({products.length})
                </h4>
                <div id="adm-product-list" className="space-y-2 text-xs">
                  {products.map((p) => {
                    const previewImg =
                      p.imagePanjang ||
                      p.imagePendek ||
                      p.image ||
                      'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=600&auto=format&fit=crop&q=80';
                    return (
                      <div
                        key={p.id}
                        className="bg-[#0D0D10] p-2.5 rounded-xl border border-white/10 flex items-center justify-between"
                      >
                        <div className="flex items-center space-x-2 min-w-0">
                          <img
                            src={previewImg}
                            alt={p.name}
                            className="w-10 h-10 rounded-lg object-cover bg-[#16161C] shrink-0 border border-white/5"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src =
                                'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=600&auto=format&fit=crop&q=80';
                            }}
                          />
                          <div className="truncate">
                            <span className="text-xs font-bold text-white block truncate">
                              {p.name}
                            </span>
                            <span className="text-[10px] text-gray-400">
                              Varian: {p.sleeves.join(', ')}
                            </span>
                          </div>
                        </div>
                        <button
                          onClick={() => onDeleteProduct(p.id)}
                          className="text-red-400 hover:text-red-300 p-2 text-xs transition-colors cursor-pointer"
                          aria-label={`Hapus ${p.name}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: PENGATURAN REKENING & ADMIN WA */}
          {activeTab === 'settings' && (
            <form onSubmit={handleSaveGeneralSettings} id="adm-tab-settings" className="space-y-6">
              <div className="bg-[#16161C] p-4 rounded-2xl border border-white/10 space-y-4">
                <h4 className="text-xs font-bold text-[#D4AF37] uppercase tracking-wider border-b border-white/10 pb-2">
                  Pengaturan Rekening Pembayaran
                </h4>

                <div className="space-y-3 text-xs">
                  <div>
                    <label className="block text-gray-300 font-medium mb-1">Nama Bank</label>
                    <input
                      type="text"
                      id="adm-bank-name"
                      placeholder="BCA / Mandiri / BRI"
                      value={settingsForm.bankName}
                      onChange={(e) =>
                        setSettingsForm({ ...settingsForm, bankName: e.target.value })
                      }
                      className="w-full bg-[#0D0D10] border border-white/15 rounded-xl py-2 px-3 text-white outline-none focus:border-[#D4AF37]"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-300 font-medium mb-1">Nomor Rekening</label>
                    <input
                      type="text"
                      id="adm-bank-acc"
                      placeholder="1234-5678-90"
                      value={settingsForm.bankAcc}
                      onChange={(e) =>
                        setSettingsForm({ ...settingsForm, bankAcc: e.target.value })
                      }
                      className="w-full bg-[#0D0D10] border border-white/15 rounded-xl py-2 px-3 text-white outline-none focus:border-[#D4AF37] font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-300 font-medium mb-1">
                      Atas Nama Pemilik Rekening
                    </label>
                    <input
                      type="text"
                      id="adm-bank-holder"
                      placeholder="a.n Batik ARIZI"
                      value={settingsForm.bankHolder}
                      onChange={(e) =>
                        setSettingsForm({ ...settingsForm, bankHolder: e.target.value })
                      }
                      className="w-full bg-[#0D0D10] border border-white/15 rounded-xl py-2 px-3 text-white outline-none focus:border-[#D4AF37]"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-[#16161C] p-4 rounded-2xl border border-white/10 space-y-4">
                <h4 className="text-xs font-bold text-[#D4AF37] uppercase tracking-wider border-b border-white/10 pb-2">
                  Nomor Admin Tujuan Chat WhatsApp
                </h4>

                <div className="space-y-3 text-xs">
                  <div>
                    <label className="block text-gray-300 font-medium mb-1">
                      Nomor WhatsApp Admin (Format 62...)
                    </label>
                    <input
                      type="text"
                      id="adm-wa-num"
                      value={settingsForm.waNum}
                      onChange={(e) =>
                        setSettingsForm({ ...settingsForm, waNum: e.target.value })
                      }
                      className="w-full bg-[#0D0D10] border border-white/15 rounded-xl py-2 px-3 text-white outline-none focus:border-[#D4AF37] font-mono"
                    />
                    <span className="text-[10px] text-gray-400 block mt-1">
                      Default: 6285199807011 (Link: wa.me/6285199807011)
                    </span>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-[#AA820A] via-[#D4AF37] to-[#F3E5AB] hover:brightness-110 text-black font-extrabold py-3 rounded-xl transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2 cursor-pointer text-xs uppercase"
              >
                <Save className="w-4 h-4" />
                <span>SIMPAN REKENING & WA ADMIN</span>
              </button>
            </form>
          )}

          {/* TAB 3: HARGA GROSIR CONFIG */}
          {activeTab === 'prices' && (
            <form onSubmit={handleSavePricing} id="adm-tab-prices" className="space-y-6">
              <div className="bg-[#16161C] p-4 rounded-2xl border border-white/10 space-y-4">
                <h4 className="text-xs font-bold text-[#D4AF37] uppercase tracking-wider border-b border-white/10 pb-2">
                  Pengaturan Harga Tier Paket Lusin
                </h4>

                <div className="space-y-3 text-xs">
                  <div>
                    <label className="block text-gray-300 font-medium mb-1">
                      Harga Eceran (&lt; 12 pcs / pcs)
                    </label>
                    <input
                      type="number"
                      id="adm-underDozen"
                      value={pricingForm.underDozen}
                      onChange={(e) =>
                        setPricingForm({
                          ...pricingForm,
                          underDozen: parseInt(e.target.value, 10) || 0,
                        })
                      }
                      className="w-full bg-[#0D0D10] border border-white/15 rounded-xl py-2 px-3 text-white outline-none focus:border-[#D4AF37]"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-300 font-medium mb-1">
                      Harga Paket 1 Lusin (12 pcs)
                    </label>
                    <input
                      type="number"
                      id="adm-dozen1"
                      value={pricingForm.dozen1}
                      onChange={(e) =>
                        setPricingForm({
                          ...pricingForm,
                          dozen1: parseInt(e.target.value, 10) || 0,
                        })
                      }
                      className="w-full bg-[#0D0D10] border border-white/15 rounded-xl py-2 px-3 text-white outline-none focus:border-[#D4AF37]"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-300 font-medium mb-1">
                      Harga Paket 2 Lusin (24 pcs)
                    </label>
                    <input
                      type="number"
                      id="adm-dozen2"
                      value={pricingForm.dozen2}
                      onChange={(e) =>
                        setPricingForm({
                          ...pricingForm,
                          dozen2: parseInt(e.target.value, 10) || 0,
                        })
                      }
                      className="w-full bg-[#0D0D10] border border-white/15 rounded-xl py-2 px-3 text-white outline-none focus:border-[#D4AF37]"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-300 font-medium mb-1">
                      Harga Paket 3 Lusin (36 pcs)
                    </label>
                    <input
                      type="number"
                      id="adm-dozen3"
                      value={pricingForm.dozen3}
                      onChange={(e) =>
                        setPricingForm({
                          ...pricingForm,
                          dozen3: parseInt(e.target.value, 10) || 0,
                        })
                      }
                      className="w-full bg-[#0D0D10] border border-white/15 rounded-xl py-2 px-3 text-white outline-none focus:border-[#D4AF37]"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-300 font-medium mb-1">
                      Harga Grosir Besar (≥48 pcs / pcs)
                    </label>
                    <input
                      type="number"
                      id="adm-over48"
                      value={pricingForm.over48}
                      onChange={(e) =>
                        setPricingForm({
                          ...pricingForm,
                          over48: parseInt(e.target.value, 10) || 0,
                        })
                      }
                      className="w-full bg-[#0D0D10] border border-white/15 rounded-xl py-2 px-3 text-white outline-none focus:border-[#D4AF37]"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-[#16161C] p-4 rounded-2xl border border-white/10 space-y-4">
                <h4 className="text-xs font-bold text-[#D4AF37] uppercase tracking-wider border-b border-white/10 pb-2">
                  Harga Sisa Pcs Tambahan
                </h4>

                <div className="space-y-3 text-xs">
                  <div>
                    <label className="block text-gray-300 font-medium mb-1">
                      Sisa setelah 1 Lusin (/pcs)
                    </label>
                    <input
                      type="number"
                      id="adm-rem1"
                      value={pricingForm.remainderAfter1}
                      onChange={(e) =>
                        setPricingForm({
                          ...pricingForm,
                          remainderAfter1: parseInt(e.target.value, 10) || 0,
                        })
                      }
                      className="w-full bg-[#0D0D10] border border-white/15 rounded-xl py-2 px-3 text-white outline-none focus:border-[#D4AF37]"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-300 font-medium mb-1">
                      Sisa setelah 2 Lusin (/pcs)
                    </label>
                    <input
                      type="number"
                      id="adm-rem2"
                      value={pricingForm.remainderAfter2}
                      onChange={(e) =>
                        setPricingForm({
                          ...pricingForm,
                          remainderAfter2: parseInt(e.target.value, 10) || 0,
                        })
                      }
                      className="w-full bg-[#0D0D10] border border-white/15 rounded-xl py-2 px-3 text-white outline-none focus:border-[#D4AF37]"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-300 font-medium mb-1">
                      Sisa setelah 3 Lusin (/pcs)
                    </label>
                    <input
                      type="number"
                      id="adm-rem3"
                      value={pricingForm.remainderAfter3}
                      onChange={(e) =>
                        setPricingForm({
                          ...pricingForm,
                          remainderAfter3: parseInt(e.target.value, 10) || 0,
                        })
                      }
                      className="w-full bg-[#0D0D10] border border-white/15 rounded-xl py-2 px-3 text-white outline-none focus:border-[#D4AF37]"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-[#AA820A] via-[#D4AF37] to-[#F3E5AB] hover:brightness-110 text-black font-extrabold py-3 rounded-xl transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2 cursor-pointer text-xs uppercase"
                >
                  <Save className="w-4 h-4" />
                  <span>SIMPAN TIER HARGA GROSIR</span>
                </button>

                <button
                  type="button"
                  onClick={onOpenResetConfirm}
                  className="w-full bg-[#20202A] hover:bg-red-950/40 text-red-400 border border-red-500/30 font-semibold py-2.5 rounded-xl transition-all active:scale-95 flex items-center justify-center gap-2 text-xs cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>RESET KE HARGA DEFAULT</span>
                </button>
              </div>
            </form>
          )}

          {/* TAB 4: GOOGLE APPS SCRIPT CODE.GS */}
          {activeTab === 'gas' && (
            <div id="adm-tab-gas" className="space-y-4">
              <div className="bg-[#D4AF37]/10 border border-[#D4AF37]/30 p-4 rounded-2xl text-xs space-y-2">
                <div className="flex items-center gap-2 font-bold text-[#D4AF37]">
                  <Info className="w-4 h-4" />
                  <span>PETUNJUK INTEGRASI SPREADSHEET & GOOGLE DRIVE</span>
                </div>
                <p className="text-gray-300 leading-relaxed">
                  Salin kode <code>Code.gs</code> di bawah ini dan tempelkan pada menu{' '}
                  <strong>Extensions &gt; Apps Script</strong> di Google Spreadsheet Anda.
                </p>
                <div className="text-[11px] text-[#F3E5AB] font-mono space-y-1 pt-1">
                  <div>• Google Spreadsheet: <code>{GOOGLE_SPREADSHEET_ID}</code></div>
                  <div>• Folder Drive Katalog Gambar: <code>{GOOGLE_DRIVE_CATALOG_ID}</code></div>
                  <div>• Folder Drive PDF / Invoice: <code>{GOOGLE_DRIVE_INVOICE_ID}</code></div>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-gray-300 uppercase tracking-wider">
                  Source Code: Code.gs
                </span>
                <button
                  onClick={handleCopyGasCode}
                  className="bg-[#D4AF37]/10 hover:bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/30 px-3 py-1.5 rounded-lg text-xs font-bold active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  {isGasCopied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">Tersalin</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Salin Code.gs</span>
                    </>
                  )}
                </button>
              </div>

              <pre
                id="gas-code-block"
                className="bg-[#0D0D10] p-4 rounded-2xl border border-white/15 text-[11px] font-mono text-emerald-400 overflow-x-auto whitespace-pre leading-normal max-h-96"
              >
                {GOOGLE_APPS_SCRIPT_CODE}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
