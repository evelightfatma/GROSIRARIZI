import React, { useState, useEffect, useMemo } from 'react';
import { Header } from './components/Header';
import { CatalogSection } from './components/CatalogSection';
import { CartSection } from './components/CartSection';
import { CustomerForm } from './components/CustomerForm';
import { PaymentInfo } from './components/PaymentInfo';
import { OrderAction } from './components/OrderAction';
import { WholesaleTable } from './components/WholesaleTable';
import { AdminLoginModal } from './components/AdminLoginModal';
import { AdminDashboardModal } from './components/AdminDashboardModal';
import { ConfirmResetModal } from './components/ConfirmResetModal';
import { ToastContainer } from './components/ToastContainer';
import {
  BatikProduct,
  PricingConfig,
  AdminSettings,
  CustomerFormData,
  SizeType,
  CartBreakdownItem,
  ToastMessage,
} from './types';
import {
  INITIAL_PRODUCTS,
  DEFAULT_PRICING,
  DEFAULT_ADMIN_SETTINGS,
  GOOGLE_APPS_SCRIPT_URL,
  SIZES,
  GOOGLE_SPREADSHEET_ID,
} from './constants';
import {
  calculateWholesalePrice,
  formatRupiah,
  generateTextInvoice,
  generateWhatsAppUrl,
  fetchCatalogFromRemote,
} from './utils/pricing';

export default function App() {
  // State: Products
  const [products, setProducts] = useState<BatikProduct[]>(() => {
    const saved = localStorage.getItem('batikAriziProducts');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {
        console.error('Error loading products from localStorage:', e);
      }
    }
    return INITIAL_PRODUCTS;
  });

  // State: Pricing
  const [pricing, setPricing] = useState<PricingConfig>(() => {
    const saved = localStorage.getItem('batikAriziPricing');
    if (saved) {
      try {
        return { ...DEFAULT_PRICING, ...JSON.parse(saved) };
      } catch (e) {
        console.error('Error loading pricing from localStorage:', e);
      }
    }
    return DEFAULT_PRICING;
  });

  // State: Admin Settings
  const [adminSettings, setAdminSettings] = useState<AdminSettings>(() => {
    const saved = localStorage.getItem('batikAriziAdminSettings');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return { ...DEFAULT_ADMIN_SETTINGS, ...parsed, gasUrl: GOOGLE_APPS_SCRIPT_URL };
      } catch (e) {
        console.error('Error loading admin settings from localStorage:', e);
      }
    }
    return DEFAULT_ADMIN_SETTINGS;
  });

  // State: Customer Details Form
  const [customerData, setCustomerData] = useState<CustomerFormData>(() => {
    const saved = localStorage.getItem('batikAriziCustomerForm');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return { name: '', phone: '', address: '', note: '' };
  });

  // State: Cart Selection map => { [cartKey: `${productId}_${sleeve}`]: { S: 0, M: 0, ... } }
  const [cart, setCart] = useState<Record<string, Record<SizeType, number>>>(() => {
    const saved = localStorage.getItem('batikAriziCart');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return {};
  });

  // UI state
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isProcessingOrder, setIsProcessingOrder] = useState(false);
  const [isSummaryCopied, setIsSummaryCopied] = useState(false);
  const [isBankCopied, setIsBankCopied] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Persist products
  useEffect(() => {
    try {
      localStorage.setItem('batikAriziProducts', JSON.stringify(products));
    } catch (e) {
      console.warn('LocalStorage limit exceeded, trying sanitize', e);
      const sanitized = products.map((p) => ({
        ...p,
        imagePanjang:
          p.imagePanjang && p.imagePanjang.length > 100000
            ? 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=600&auto=format&fit=crop&q=80'
            : p.imagePanjang,
        imagePendek:
          p.imagePendek && p.imagePendek.length > 100000
            ? 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600&auto=format&fit=crop&q=80'
            : p.imagePendek,
      }));
      try {
        localStorage.setItem('batikAriziProducts', JSON.stringify(sanitized));
      } catch (err) {}
    }
  }, [products]);

  // Persist pricing
  useEffect(() => {
    localStorage.setItem('batikAriziPricing', JSON.stringify(pricing));
  }, [pricing]);

  // Persist admin settings
  useEffect(() => {
    localStorage.setItem('batikAriziAdminSettings', JSON.stringify(adminSettings));
  }, [adminSettings]);

  // Persist customer form
  useEffect(() => {
    localStorage.setItem('batikAriziCustomerForm', JSON.stringify(customerData));
  }, [customerData]);

  // Persist cart
  useEffect(() => {
    localStorage.setItem('batikAriziCart', JSON.stringify(cart));
  }, [cart]);

  // Add toast helper
  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = Date.now().toString() + Math.random().toString(36).substring(2, 6);
    setToasts((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Adjust size quantity
  const handleAdjustQty = (cartKey: string, size: SizeType, delta: number) => {
    setCart((prev) => {
      const currentSizeObj = prev[cartKey] || {
        S: 0,
        M: 0,
        L: 0,
        XL: 0,
        XXL: 0,
        XXXL: 0,
      };
      const currentVal = currentSizeObj[size] || 0;
      const updatedVal = Math.max(0, currentVal + delta);
      return {
        ...prev,
        [cartKey]: {
          ...currentSizeObj,
          [size]: updatedVal,
        },
      };
    });
  };

  // Directly set size quantity
  const handleSetQty = (cartKey: string, size: SizeType, value: number) => {
    setCart((prev) => {
      const currentSizeObj = prev[cartKey] || {
        S: 0,
        M: 0,
        L: 0,
        XL: 0,
        XXL: 0,
        XXXL: 0,
      };
      return {
        ...prev,
        [cartKey]: {
          ...currentSizeObj,
          [size]: Math.max(0, value),
        },
      };
    });
  };

  // Compile cart items breakdown and calculate wholesale price
  const { cartItemsList, totalCartQuantity, calculation } = useMemo(() => {
    let totalQty = 0;
    const items: CartBreakdownItem[] = [];

    Object.keys(cart).forEach((key) => {
      const parts = key.split('_');
      const prodId = parts[0];
      const sleeve = parts[1] as 'Panjang' | 'Pendek';

      const prod = products.find((p) => p.id === prodId);
      if (!prod) return;

      const sizeData = cart[key];
      if (!sizeData) return;

      let subTotalPcs = 0;
      const sizeStrParts: string[] = [];

      SIZES.forEach((sz) => {
        const count = sizeData[sz] || 0;
        if (count > 0) {
          subTotalPcs += count;
          sizeStrParts.push(`${sz}: ${count}`);
        }
      });

      if (subTotalPcs > 0) {
        totalQty += subTotalPcs;
        items.push({
          prodId: prod.id,
          prodName: prod.name,
          sleeve,
          sizes: sizeData,
          sizesStr: sizeStrParts.join(', '),
          qty: subTotalPcs,
        });
      }
    });

    const calcResult = calculateWholesalePrice(totalQty, pricing, items);
    return {
      cartItemsList: items,
      totalCartQuantity: totalQty,
      calculation: calcResult,
    };
  }, [cart, products, pricing]);

  // Scroll to Cart helper
  const handleScrollToCart = () => {
    document.getElementById('cart-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  // Handle Admin Button Click
  const handleAdminButtonClick = () => {
    if (sessionStorage.getItem('batikAriziAdminLoggedIn') === 'true') {
      setIsAdminModalOpen(true);
    } else {
      setIsLoginModalOpen(true);
    }
  };

  // Handle Admin Logout
  const handleAdminLogout = () => {
    sessionStorage.removeItem('batikAriziAdminLoggedIn');
    setIsAdminModalOpen(false);
    showToast('Berhasil Logout dari Admin');
  };

  // Add Product from Admin
  const handleAddProduct = (newProduct: BatikProduct) => {
    setProducts((prev) => [newProduct, ...prev]);
  };

  // Delete Product from Admin
  const handleDeleteProduct = (prodId: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== prodId));
    setCart((prev) => {
      const nextCart = { ...prev };
      Object.keys(nextCart).forEach((key) => {
        if (key.startsWith(prodId + '_')) {
          delete nextCart[key];
        }
      });
      return nextCart;
    });
    showToast('Produk berhasil dihapus dari katalog.');
  };

  // Save Pricing
  const handleSavePricing = (updatedPricing: PricingConfig) => {
    setPricing(updatedPricing);
  };

  // Save Admin Settings
  const handleSaveSettings = (updatedSettings: AdminSettings) => {
    setAdminSettings(updatedSettings);
  };

  // Reset Pricing to default
  const handleConfirmResetPricing = () => {
    setPricing(DEFAULT_PRICING);
    setIsResetConfirmOpen(false);
    showToast('Seluruh tier harga grosir dikembalikan ke default');
  };

  // Copy Calculation Summary
  const handleCopySummary = () => {
    if (!calculation || calculation.quantity <= 0) {
      showToast('Keranjang belanja masih kosong', 'error');
      return;
    }
    const c = calculation;
    let text = `BATIK ARIZI — RINGKASAN PEMBELIAN GROSIR\n`;
    text += `-----------------------------------\n`;
    text += `Total Barang : ${c.quantity} pcs\n`;
    text += `Total Pembayaran : ${formatRupiah(c.total)}\n`;
    text += `Rata-rata/pcs : ${formatRupiah(c.averagePrice)}/pcs\n`;
    if (c.saving > 0) {
      text += `Total Hemat : ${formatRupiah(c.saving)} (${c.savingPercentage}%)\n`;
    }
    text += `-----------------------------------\n`;
    text += `Rekening: ${adminSettings.bankName} ${adminSettings.bankAcc} ${adminSettings.bankHolder}\n`;
    text += `WA Admin: wa.me/${adminSettings.waNum}`;

    navigator.clipboard.writeText(text).then(
      () => {
        setIsSummaryCopied(true);
        showToast('Hasil perhitungan berhasil disalin!');
        setTimeout(() => setIsSummaryCopied(false), 2500);
      },
      () => {
        showToast('Gagal menyalin ringkasan', 'error');
      }
    );
  };

  // Copy Bank Account
  const handleCopyBank = () => {
    const text = `${adminSettings.bankName} ${adminSettings.bankAcc} a.n ${adminSettings.bankHolder}`;
    navigator.clipboard.writeText(text).then(
      () => {
        setIsBankCopied(true);
        showToast('Nomor rekening berhasil disalin!');
        setTimeout(() => setIsBankCopied(false), 2500);
      },
      () => {
        showToast('Gagal menyalin nomor rekening', 'error');
      }
    );
  };

  // Initial remote fetch on app load
  useEffect(() => {
    let isMounted = true;
    const loadRemoteCatalog = async () => {
      try {
        const remoteProducts = await fetchCatalogFromRemote(
          adminSettings.gasUrl,
          GOOGLE_SPREADSHEET_ID
        );
        if (isMounted && remoteProducts && remoteProducts.length > 0) {
          setProducts(remoteProducts);
          console.log('Successfully loaded catalog from Google Spreadsheet:', remoteProducts.length, 'products');
        }
      } catch (e) {
        console.warn('Initial remote catalog fetch skipped:', e);
      }
    };
    loadRemoteCatalog();
    return () => {
      isMounted = false;
    };
  }, [adminSettings.gasUrl]);

  // Sync Data from Google Sheets
  const handleSyncData = async () => {
    setIsSyncing(true);
    showToast('Menghubungkan ke Google Spreadsheet & Drive...', 'info');

    try {
      const remoteProducts = await fetchCatalogFromRemote(
        adminSettings.gasUrl,
        GOOGLE_SPREADSHEET_ID
      );

      if (remoteProducts && remoteProducts.length > 0) {
        setProducts(remoteProducts);
        showToast(`Berhasil menyinkronkan ${remoteProducts.length} produk dari Google Spreadsheet!`);
      } else {
        showToast('Koneksi sukses! Data katalog di Spreadsheet telah dimuat.', 'success');
      }
    } catch (err) {
      console.warn('Sync error:', err);
      showToast('Gagal terhubung ke Google Spreadsheet. Periksa koneksi internet.', 'error');
    } finally {
      setIsSyncing(false);
    }
  };

  // Process Order, Generate & Download Text Invoice, Post to GAS, and Open WhatsApp
  const handleProcessOrder = () => {
    if (!calculation || calculation.quantity <= 0) {
      showToast('Keranjang Anda masih kosong. Silakan atur jumlah batik yang akan dibeli.', 'error');
      return;
    }

    const name = customerData.name.trim();
    const phone = customerData.phone.trim();
    const address = customerData.address.trim();

    if (!name || !phone || !address) {
      showToast('Mohon lengkapi Nama, Nomor WA, dan Alamat Pengiriman!', 'error');
      return;
    }

    setIsProcessingOrder(true);

    const invNo = `INV-${Date.now().toString().slice(-6)}`;
    const invDate = new Date().toLocaleString('id-ID', {
      dateStyle: 'medium',
      timeStyle: 'short',
    });

    // 1. Generate text invoice content
    const textInvoice = generateTextInvoice(
      invNo,
      invDate,
      customerData,
      calculation,
      adminSettings
    );

    // 2. Download Text file locally (.txt)
    try {
      const blob = new Blob([textInvoice], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Batik_ARIZI_Invoice_${invNo}.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      showToast(`Invoice ${invNo}.txt berhasil diunduh!`);
    } catch (e) {
      console.error('Error downloading invoice file:', e);
    }

    // 3. Post to Google Apps Script (Drive / Spreadsheet) if URL configured
    if (adminSettings.gasUrl) {
      showToast('Menyimpan file invoice ke Google Drive...', 'info');
      fetch(adminSettings.gasUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          invNo,
          invDate,
          name: customerData.name,
          phone: customerData.phone,
          address: customerData.address,
          note: customerData.note,
          totalQty: calculation.quantity,
          totalPrice: calculation.total,
          items: calculation.items,
          textInvoice: textInvoice,
        }),
      }).catch((err) => {
        console.warn('GAS POST failed:', err);
      });
    }

    // 4. Open WhatsApp with pre-formatted message
    const waUrl = generateWhatsAppUrl(invNo, customerData, calculation, adminSettings);
    setTimeout(() => {
      setIsProcessingOrder(false);
      window.open(waUrl, '_blank');
    }, 800);
  };

  return (
    <div className="min-h-screen bg-[#0D0D10] text-white pb-16 antialiased selection:bg-[#D4AF37] selection:text-black font-sans">
      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onDismiss={removeToast} />

      {/* Sticky Header */}
      <Header
        totalCartQty={totalCartQuantity}
        onCartClick={handleScrollToCart}
        onAdminClick={handleAdminButtonClick}
      />

      {/* Branding Subtitle Banner */}
      <div className="bg-[#16161C]/60 border-b border-white/5 py-2.5 px-4 text-center">
        <p className="text-[11px] text-gray-300 font-medium italic max-w-xl mx-auto">
          &quot;Pilih motif, varian lengan & ukuran. Harga otomatis mengikuti diskon grosir Batik ARIZI!&quot;
        </p>
      </div>

      {/* Main Content */}
      <main className="max-w-xl mx-auto px-4 py-5 space-y-6">
        {/* SECTION 1: KATALOG PRODUK */}
        <CatalogSection
          products={products}
          cart={cart}
          isSyncing={isSyncing}
          onSync={handleSyncData}
          onAdjustQty={handleAdjustQty}
          onSetQty={handleSetQty}
        />

        {/* SECTION 2: RINGKASAN PESANAN & KALKULATOR GROSIR */}
        <CartSection
          calculation={calculation}
          onCopySummary={handleCopySummary}
          isCopied={isSummaryCopied}
        />

        {/* SECTION 3: FORM DATA PEMESAN & ALAMAT PENGIRIMAN */}
        <CustomerForm
          formData={customerData}
          onChange={(field, value) =>
            setCustomerData((prev) => ({ ...prev, [field]: value }))
          }
        />

        {/* SECTION 4: INFORMASI REKENING RESMI */}
        <PaymentInfo
          adminSettings={adminSettings}
          onCopyBank={handleCopyBank}
          isBankCopied={isBankCopied}
        />

        {/* SECTION 5: TOMBOL ORDER & INVOICE */}
        <OrderAction
          onProcessOrder={handleProcessOrder}
          adminWa={adminSettings.waNum}
          isProcessing={isProcessingOrder}
        />

        {/* SECTION 6: DAFTAR TINGKAT HARGA GROSIR */}
        <WholesaleTable pricing={pricing} />
      </main>

      {/* MODAL 1: Admin Login PIN */}
      <AdminLoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onSuccess={() => {
          setIsLoginModalOpen(false);
          setIsAdminModalOpen(true);
          showToast('Login Admin Berhasil');
        }}
        onErrorToast={(msg) => showToast(msg, 'error')}
      />

      {/* MODAL 2: Admin Dashboard Panel */}
      <AdminDashboardModal
        isOpen={isAdminModalOpen}
        onClose={() => setIsAdminModalOpen(false)}
        onLogout={handleAdminLogout}
        products={products}
        pricing={pricing}
        adminSettings={adminSettings}
        onAddProduct={handleAddProduct}
        onDeleteProduct={handleDeleteProduct}
        onSavePricing={handleSavePricing}
        onSaveSettings={handleSaveSettings}
        onOpenResetConfirm={() => setIsResetConfirmOpen(true)}
        onToast={showToast}
      />

      {/* MODAL 3: Confirm Reset Modal */}
      <ConfirmResetModal
        isOpen={isResetConfirmOpen}
        onClose={() => setIsResetConfirmOpen(false)}
        onConfirm={handleConfirmResetPricing}
      />
    </div>
  );
}
