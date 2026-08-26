import {
  PricingConfig,
  PriceCalculationResult,
  CartBreakdownItem,
  CustomerFormData,
  AdminSettings,
  BatikProduct,
  SleeveType,
} from '../types';

export function formatRupiah(number: number): string {
  if (isNaN(number)) return 'Rp0';
  return 'Rp' + Math.round(number).toLocaleString('id-ID');
}

export function calculateWholesalePrice(
  totalQty: number,
  config: PricingConfig,
  items: CartBreakdownItem[] = []
): PriceCalculationResult | null {
  const qty = Math.floor(Number(totalQty));
  if (isNaN(qty) || qty <= 0) return null;

  const normalPrice = qty * config.underDozen;
  let total = 0;
  let fullDozen = 0;
  let remainder = 0;
  let remainderUnitPrice = 0;

  if (qty < 12) {
    total = normalPrice;
    fullDozen = 0;
    remainder = qty;
    remainderUnitPrice = config.underDozen;
  } else if (qty >= 12 && qty < 24) {
    fullDozen = 1;
    remainder = qty - 12;
    const dozenCost = config.dozen1;
    const remainderCost = remainder * config.remainderAfter1;
    total = dozenCost + remainderCost;
    remainderUnitPrice = config.remainderAfter1;
  } else if (qty >= 24 && qty < 36) {
    fullDozen = 2;
    remainder = qty - 24;
    const dozenCost = config.dozen2;
    const remainderCost = remainder * config.remainderAfter2;
    total = dozenCost + remainderCost;
    remainderUnitPrice = config.remainderAfter2;
  } else if (qty >= 36 && qty < 48) {
    fullDozen = 3;
    remainder = qty - 36;
    const dozenCost = config.dozen3;
    const remainderCost = remainder * config.remainderAfter3;
    total = dozenCost + remainderCost;
    remainderUnitPrice = config.remainderAfter3;
  } else {
    // qty >= 48
    fullDozen = Math.floor(qty / 12);
    remainder = qty % 12;
    total = qty * config.over48;
    remainderUnitPrice = config.over48;
  }

  const saving = normalPrice - total;
  const averagePrice = Math.round(total / qty);
  const savingPercentage = normalPrice > 0 ? Math.round((saving / normalPrice) * 100) : 0;

  return {
    quantity: qty,
    fullDozen,
    remainder,
    total,
    averagePrice,
    normalPrice,
    saving: saving > 0 ? saving : 0,
    savingPercentage: saving > 0 ? savingPercentage : 0,
    remainderUnitPrice,
    items,
  };
}

export function normalizeDriveImageUrl(url?: string): string {
  if (!url || typeof url !== 'string') return '';
  const trimmed = url.trim();
  if (!trimmed) return '';
  if (trimmed.startsWith('data:image/')) return trimmed;
  if (trimmed.includes('unsplash.com') || trimmed.includes('placehold.co')) return trimmed;

  // Extract Google Drive ID if present
  let fileId = '';
  const dMatch = trimmed.match(/\/d\/([a-zA-Z0-9_-]+)/);
  const idParamMatch = trimmed.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  const idDirectMatch = trimmed.match(/^[a-zA-Z0-9_-]{25,}$/);

  if (dMatch && dMatch[1]) {
    fileId = dMatch[1];
  } else if (idParamMatch && idParamMatch[1]) {
    fileId = idParamMatch[1];
  } else if (idDirectMatch) {
    fileId = trimmed;
  }

  if (fileId) {
    return `https://lh3.googleusercontent.com/d/${fileId}`;
  }

  return trimmed;
}

export async function fetchCatalogFromRemote(
  gasUrl: string,
  spreadsheetId: string
): Promise<BatikProduct[]> {
  // 1. Try Google Apps Script Web App first
  if (gasUrl) {
    try {
      const res = await fetch(gasUrl, { method: 'GET' });
      if (res.ok) {
        const data = await res.json();
        if (data && data.status === 'success' && Array.isArray(data.catalog) && data.catalog.length > 0) {
          return data.catalog.map((item: any) => ({
            id: String(item.id || ('p_' + Math.random().toString(36).substr(2, 6))),
            name: String(item.name || 'Batik ARIZI Solo'),
            imagePanjang: normalizeDriveImageUrl(item.imagePanjang),
            imagePendek: normalizeDriveImageUrl(item.imagePendek),
            image: normalizeDriveImageUrl(item.image),
            sleeves: Array.isArray(item.sleeves)
              ? item.sleeves
              : String(item.sleeves || 'Panjang,Pendek').split(',').map((s: string) => s.trim() as SleeveType),
          }));
        }
      }
    } catch (e) {
      console.warn('Apps Script fetch failed, attempting Google Spreadsheet direct query...', e);
    }
  }

  // 2. Fallback: Query Google Spreadsheet directly via GViz API (public read)
  if (spreadsheetId) {
    try {
      const gvizUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/gviz/tq?tqx=out:json&sheet=Katalog`;
      const res = await fetch(gvizUrl);
      if (res.ok) {
        const text = await res.text();
        // GViz returns a wrapped JSON: google.visualization.Query.setResponse({...});
        const jsonMatch = text.match(/google\.visualization\.Query\.setResponse\(([\s\S\w]+)\);/);
        if (jsonMatch && jsonMatch[1]) {
          const gvizData = JSON.parse(jsonMatch[1]);
          const rows = gvizData?.table?.rows || [];
          if (rows.length > 0) {
            const parsedProducts: BatikProduct[] = [];
            
            // Check column labels if available
            const cols = gvizData?.table?.cols || [];
            let nameColIdx = -1;
            let panjangColIdx = -1;
            let pendekColIdx = -1;
            let sleevesColIdx = -1;
            let idColIdx = -1;

            cols.forEach((col: any, idx: number) => {
              const label = String(col?.label || '').toLowerCase().trim();
              if (label.includes('nama produk')) nameColIdx = idx;
              else if (label.includes('lengan panjang')) panjangColIdx = idx;
              else if (label.includes('lengan pendek')) pendekColIdx = idx;
              else if (label.includes('varian') || label.includes('sleeve')) sleevesColIdx = idx;
              else if (label.includes('id')) idColIdx = idx;
            });

            rows.forEach((r: any, idx: number) => {
              const c = r.c || [];
              let rawName = '';
              let rawPanjang = '';
              let rawPendek = '';
              let rawSleeves = 'Panjang,Pendek';
              let rawId = `p_${idx + 1}`;

              if (nameColIdx !== -1) {
                rawName = c[nameColIdx]?.v ? String(c[nameColIdx].v) : '';
                rawPanjang = panjangColIdx !== -1 && c[panjangColIdx]?.v ? String(c[panjangColIdx].v) : '';
                rawPendek = pendekColIdx !== -1 && c[pendekColIdx]?.v ? String(c[pendekColIdx].v) : '';
                rawSleeves = sleevesColIdx !== -1 && c[sleevesColIdx]?.v ? String(c[sleevesColIdx].v) : 'Panjang,Pendek';
                rawId = idColIdx !== -1 && c[idColIdx]?.v ? String(c[idColIdx].v) : `p_${idx + 1}`;
              } else {
                // Column 0: Nama Produk, Column 1: Link Lengan Panjang, Column 2: Link Lengan Pendek
                const val0 = c[0]?.v ? String(c[0].v).trim() : '';
                const val1 = c[1]?.v ? String(c[1].v).trim() : '';
                const val2 = c[2]?.v ? String(c[2].v).trim() : '';
                const val3 = c[3]?.v ? String(c[3].v).trim() : '';
                const val4 = c[4]?.v ? String(c[4].v).trim() : '';
                const val5 = c[5]?.v ? String(c[5].v).trim() : '';

                // If Column 1 or 2 is a URL / Drive link
                if (val1.includes('http') || val1.includes('drive') || val1.includes('google') || val2.includes('http')) {
                  rawName = val0;
                  rawPanjang = val1;
                  rawPendek = val2;
                  rawSleeves = val3 || 'Panjang,Pendek';
                  rawId = val4 || `p_${idx + 1}`;
                } else if (val3.includes('http') || val3.includes('drive') || val4.includes('http')) {
                  // Legacy order: ID in col 0, Date in col 1, Name in col 2, Panjang in col 3, Pendek in col 4
                  rawId = val0 || `p_${idx + 1}`;
                  rawName = val2 || val1;
                  rawPanjang = val3;
                  rawPendek = val4;
                  rawSleeves = val5 || 'Panjang,Pendek';
                } else {
                  // Default standard
                  rawName = val0;
                  rawPanjang = val1;
                  rawPendek = val2;
                  rawSleeves = val3 || 'Panjang,Pendek';
                  rawId = val4 || `p_${idx + 1}`;
                }
              }

              if (rawName && rawName.toLowerCase() !== 'nama produk') {
                parsedProducts.push({
                  id: rawId,
                  name: rawName,
                  imagePanjang: normalizeDriveImageUrl(rawPanjang),
                  imagePendek: normalizeDriveImageUrl(rawPendek),
                  sleeves: rawSleeves.split(',').map((s: string) => s.trim() as SleeveType),
                });
              }
            });

            if (parsedProducts.length > 0) {
              return parsedProducts;
            }
          }
        }
      }
    } catch (err) {
      console.warn('Direct Google Spreadsheet GViz query failed:', err);
    }
  }

  return [];
}

export function compressImageFile(
  file: File,
  maxWidth = 600,
  maxHeight = 600,
  quality = 0.75
): Promise<{ filename: string; mimeType: string; base64: string; dataUrl: string } | null> {
  return new Promise((resolve) => {
    if (!file) return resolve(null);
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return resolve(null);

        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        const base64Data = dataUrl.split(',')[1] || '';

        resolve({
          filename: (file.name || 'image').replace(/\.[^/.]+$/, '') + '.jpg',
          mimeType: 'image/jpeg',
          base64: base64Data,
          dataUrl: dataUrl,
        });
      };
      img.onerror = () => resolve(null);
      img.src = e.target?.result as string;
    };
    reader.onerror = () => resolve(null);
    reader.readAsDataURL(file);
  });
}

export function generateTextInvoice(
  invNo: string,
  invDate: string,
  customer: CustomerFormData,
  c: PriceCalculationResult,
  admin: AdminSettings
): string {
  let text = `====================================================\n`;
  text += `                 BATIK ARIZI                     \n`;
  text += `      Produsen & Grosir Kemeja Batik Solo Premium  \n`;
  text += `====================================================\n`;
  text += `NO. INVOICE  : ${invNo}\n`;
  text += `TANGGAL      : ${invDate}\n`;
  text += `WA ADMIN     : +${admin.waNum}\n`;
  text += `----------------------------------------------------\n`;
  text += `DATA PEMESAN & ALAMAT PENGIRIMAN:\n`;
  text += `• Nama Pembeli : ${customer.name}\n`;
  text += `• No. WhatsApp : ${customer.phone}\n`;
  text += `• Alamat       : ${customer.address}\n`;
  if (customer.note) text += `• Catatan      : ${customer.note}\n`;
  text += `----------------------------------------------------\n`;
  text += `RINCIAN ITEM PESANAN:\n`;

  c.items.forEach((item, idx) => {
    text += `${idx + 1}. ${item.prodName}\n`;
    text += `   Varian : Lengan ${item.sleeve}\n`;
    text += `   Ukuran : ${item.sizesStr}\n`;
    text += `   Jumlah : ${item.qty} Pcs\n\n`;
  });

  text += `----------------------------------------------------\n`;
  text += `RINGKASAN PEMBAYARAN:\n`;
  text += `Total Jumlah Barang  : ${c.quantity} Pcs\n`;
  text += `Harga Normal         : ${formatRupiah(c.normalPrice)}\n`;
  if (c.saving > 0) {
    text += `Diskon Grosir ARIZI  : - ${formatRupiah(c.saving)} (${c.savingPercentage}%)\n`;
  }
  text += `Rata-rata Per Pcs    : ${formatRupiah(c.averagePrice)}/pcs\n`;
  text += `----------------------------------------------------\n`;
  text += `TOTAL HARGA GROSIR   : ${formatRupiah(c.total)}\n`;
  text += `====================================================\n`;
  text += `REKENING PEMBAYARAN RESMI:\n`;
  text += `${admin.bankName} : ${admin.bankAcc}\n`;
  text += `Atas Nama   : ${admin.bankHolder}\n`;
  text += `====================================================\n`;
  text += `* Harap lakukan konfirmasi transfer ke WA Admin setelah pembayaran.\n`;
  text += `  Terima kasih telah berbelanja di Batik ARIZI Solo!\n`;

  return text;
}

export function generateWhatsAppUrl(
  invNo: string,
  customer: CustomerFormData,
  c: PriceCalculationResult,
  admin: AdminSettings
): string {
  let text = `*PESANAN BATIK ARIZI — INVOICE ${invNo}*\n`;
  text += `===============================\n\n`;
  text += `*DATA PEMESAN:*\n`;
  text += `• Nama : ${customer.name}\n`;
  text += `• No. WA : ${customer.phone}\n`;
  text += `• Alamat Lengkap : ${customer.address}\n`;
  if (customer.note) text += `• Catatan : ${customer.note}\n`;
  text += `\n*RINCIAN PESANAN GROSIR:*\n`;

  c.items.forEach((item) => {
    text += `▫️ ${item.prodName}\n   Lengan ${item.sleeve} [${item.sizesStr}] (${item.qty} pcs)\n`;
  });

  text += `\n*SUMMARY PEMBAYARAN:*\n`;
  text += `• Total Pcs : ${c.quantity} Pcs\n`;
  text += `• Harga Normal : ${formatRupiah(c.normalPrice)}\n`;
  if (c.saving > 0) text += `• Hemat Grosir : ${formatRupiah(c.saving)} (${c.savingPercentage}%)\n`;
  text += `• *TOTAL PEMBAYARAN : ${formatRupiah(c.total)}*\n`;
  text += `• Rata-rata/pcs : ${formatRupiah(c.averagePrice)}/pcs\n\n`;
  text += `*REKENING PEMBAYARAN:*\n`;
  text += `${admin.bankName} : ${admin.bankAcc} (${admin.bankHolder})\n\n`;
  text += `_Halo Admin Batik ARIZI, saya sudah membuat invoice dan ingin melanjutkan pembayaran pesanan di atas._`;

  const encoded = encodeURIComponent(text);
  const cleanWa = admin.waNum.replace(/\D/g, '');
  return `https://wa.me/${cleanWa}?text=${encoded}`;
}
