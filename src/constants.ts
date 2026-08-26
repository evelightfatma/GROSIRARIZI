import { BatikProduct, PricingConfig, AdminSettings, SizeType } from './types';

export const GOOGLE_SPREADSHEET_ID = '1x_NqCIRBrykwyKXAXC5riOy9eVVqBSPj6w1CIdAy3bo';
export const GOOGLE_DRIVE_CATALOG_ID = '14SwbMhaZG_pWJx2A8tcF4l99inXPo0HM';
export const GOOGLE_DRIVE_INVOICE_ID = '1unPJ9C4hYXnKLGImuE08ypSSKhIHqoFp';

export const SIZES: SizeType[] = ['S', 'M', 'L', 'XL', 'XXL', 'XXXL'];

export const DEFAULT_PRICING: PricingConfig = {
  underDozen: 93000,
  dozen1: 1050000,
  dozen2: 2050000,
  dozen3: 2800000,
  over48: 75000,
  remainderAfter1: 90000,
  remainderAfter2: 83000,
  remainderAfter3: 76000,
};

export const GOOGLE_APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbw0KZvdLYIzZTJgC1PGn8F3zwXC9FA3s8Kxea1wDfPBkDruH6JDA6ecm98YfF5Bh6FK/exec';

export const DEFAULT_ADMIN_SETTINGS: AdminSettings = {
  bankName: 'BANK BCA',
  bankAcc: '1234-5678-90',
  bankHolder: 'a.n Batik ARIZI',
  waNum: '6285199807011',
  gasUrl: GOOGLE_APPS_SCRIPT_URL,
};

export const INITIAL_PRODUCTS: BatikProduct[] = [
  {
    id: 'p1',
    name: 'Batik ARIZI — Motif Parang Royal Gold',
    imagePanjang: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=600&auto=format&fit=crop&q=80',
    imagePendek: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600&auto=format&fit=crop&q=80',
    sleeves: ['Panjang', 'Pendek'],
  },
  {
    id: 'p2',
    name: 'Batik ARIZI — Motif Kawung Solo Executive',
    imagePanjang: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600&auto=format&fit=crop&q=80',
    imagePendek: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=600&auto=format&fit=crop&q=80',
    sleeves: ['Panjang', 'Pendek'],
  },
  {
    id: 'p3',
    name: 'Batik ARIZI — Motif Mega Mendung Classy',
    imagePanjang: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=600&auto=format&fit=crop&q=80',
    imagePendek: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=600&auto=format&fit=crop&q=80',
    sleeves: ['Panjang', 'Pendek'],
  },
];

export const GOOGLE_APPS_SCRIPT_CODE = `/**
 * BATIK ARIZI — GOOGLE APPS SCRIPT BACKEND (Code.gs)
 * Terintegrasi Otomatis dengan Google Spreadsheet & Google Drive
 *
 * Spreadsheet ID: ${GOOGLE_SPREADSHEET_ID}
 * Folder Katalog Google Drive: ${GOOGLE_DRIVE_CATALOG_ID}
 * Folder Invoice Google Drive: ${GOOGLE_DRIVE_INVOICE_ID}
 */

const SPREADSHEET_ID = "${GOOGLE_SPREADSHEET_ID}";
const CATALOG_FOLDER_ID = "${GOOGLE_DRIVE_CATALOG_ID}";
const INVOICE_FOLDER_ID = "${GOOGLE_DRIVE_INVOICE_ID}";

/**
 * 1. GET Request: Mengambil data katalog produk dari Spreadsheet
 * Otomatis membuat Sheet "Katalog" dengan header jika belum ada.
 */
function doGet(e) {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    let sheet = ss.getSheetByName("Katalog");
    
    // Otomatis buat Sheet Katalog jika belum ada
    if (!sheet) {
      sheet = ss.insertSheet("Katalog");
      sheet.appendRow([
        "Nama Produk",
        "Link Foto Lengan Panjang",
        "Link Foto Lengan Pendek",
        "Varian Lengan",
        "ID Produk",
        "Tanggal Ditambahkan"
      ]);
      return ContentService.createTextOutput(JSON.stringify({ status: "success", catalog: [] }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    const data = sheet.getDataRange().getValues();
    if (data.length <= 1) {
      return ContentService.createTextOutput(JSON.stringify({ status: "success", catalog: [] }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    // Identifikasi posisi kolom secara dinamis
    let colName = 0;
    let colPanjang = 1;
    let colPendek = 2;
    let colSleeves = 3;
    let colId = 4;

    const headers = data[0].map(function(h) { return String(h).toLowerCase().trim(); });
    
    if (headers.indexOf("nama produk") !== -1) colName = headers.indexOf("nama produk");
    if (headers.indexOf("link foto lengan panjang") !== -1) colPanjang = headers.indexOf("link foto lengan panjang");
    else if (headers.indexOf("url lengan panjang") !== -1) colPanjang = headers.indexOf("url lengan panjang");
    
    if (headers.indexOf("link foto lengan pendek") !== -1) colPendek = headers.indexOf("link foto lengan pendek");
    else if (headers.indexOf("url lengan pendek") !== -1) colPendek = headers.indexOf("url lengan pendek");
    
    if (headers.indexOf("varian lengan") !== -1) colSleeves = headers.indexOf("varian lengan");
    if (headers.indexOf("id produk") !== -1) colId = headers.indexOf("id produk");

    const catalog = [];
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      const prodName = row[colName] ? String(row[colName]).trim() : "";
      
      if (prodName && prodName.toLowerCase() !== "nama produk") {
        catalog.push({
          id: row[colId] ? String(row[colId]) : "p_" + i,
          name: prodName,
          imagePanjang: row[colPanjang] ? String(row[colPanjang]).trim() : "",
          imagePendek: row[colPendek] ? String(row[colPendek]).trim() : "",
          sleeves: (row[colSleeves] || "Panjang,Pendek").toString().split(",").map(function(s) { return s.trim(); })
        });
      }
    }

    return ContentService.createTextOutput(JSON.stringify({ status: "success", catalog: catalog }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ status: "error", message: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * 2. POST Request: Upload Gambar ke Google Drive & Simpan ke Spreadsheet
 * - Nama file foto otomatis: "<Nama Produk> - Lengan Panjang.jpg" & "<Nama Produk> - Lengan Pendek.jpg"
 * - Data produk otomatis tersimpan dengan urutan kolom: Nama Produk, Link Foto Lengan Panjang, Link Foto Lengan Pendek
 */
function doPost(e) {
  try {
    const contents = JSON.parse(e.postData.contents);
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);

    // ACTION A: TAMBAH PRODUK BARU & UPLOAD FOTO KE GOOGLE DRIVE
    if (contents.action === "addProduct") {
      let catalogSheet = ss.getSheetByName("Katalog");
      
      // Otomatis buat Sheet jika belum ada
      if (!catalogSheet) {
        catalogSheet = ss.insertSheet("Katalog");
        catalogSheet.appendRow([
          "Nama Produk",
          "Link Foto Lengan Panjang",
          "Link Foto Lengan Pendek",
          "Varian Lengan",
          "ID Produk",
          "Tanggal Ditambahkan"
        ]);
      } else if (catalogSheet.getLastRow() === 0) {
        catalogSheet.appendRow([
          "Nama Produk",
          "Link Foto Lengan Panjang",
          "Link Foto Lengan Pendek",
          "Varian Lengan",
          "ID Produk",
          "Tanggal Ditambahkan"
        ]);
      }

      const catalogFolder = DriveApp.getFolderById(CATALOG_FOLDER_ID);
      const rawName = (contents.name || "Batik ARIZI").trim();
      const safeName = rawName.replace(/[\\\\/:*?"<>|]/g, "_");
      
      let imgPanjangUrl = "";
      let imgPendekUrl = "";

      // 1. Upload & Simpan Foto Lengan Panjang Otomatis Bernama "<Nama Produk> - Lengan Panjang.jpg"
      if (contents.filePanjang && contents.filePanjang.base64) {
        const fileNamePanjang = safeName + " - Lengan Panjang.jpg";
        const blobP = Utilities.newBlob(
          Utilities.base64Decode(contents.filePanjang.base64),
          contents.filePanjang.mimeType || "image/jpeg",
          fileNamePanjang
        );
        const fileP = catalogFolder.createFile(blobP);
        fileP.setName(fileNamePanjang);
        fileP.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
        imgPanjangUrl = "https://lh3.googleusercontent.com/d/" + fileP.getId();
      }

      // 2. Upload & Simpan Foto Lengan Pendek Otomatis Bernama "<Nama Produk> - Lengan Pendek.jpg"
      if (contents.filePendek && contents.filePendek.base64) {
        const fileNamePendek = safeName + " - Lengan Pendek.jpg";
        const blobK = Utilities.newBlob(
          Utilities.base64Decode(contents.filePendek.base64),
          contents.filePendek.mimeType || "image/jpeg",
          fileNamePendek
        );
        const fileK = catalogFolder.createFile(blobK);
        fileK.setName(fileNamePendek);
        fileK.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
        imgPendekUrl = "https://lh3.googleusercontent.com/d/" + fileK.getId();
      }

      if (!imgPanjangUrl && imgPendekUrl) imgPanjangUrl = imgPendekUrl;
      if (!imgPendekUrl && imgPanjangUrl) imgPendekUrl = imgPanjangUrl;

      // 3. Simpan baris data produk dengan urutan:
      // Kolom 1: Nama Produk
      // Kolom 2: Link Foto Lengan Panjang
      // Kolom 3: Link Foto Lengan Pendek
      catalogSheet.appendRow([
        rawName,
        imgPanjangUrl,
        imgPendekUrl,
        contents.sleeves || "Panjang,Pendek",
        contents.id || ("p_" + Date.now()),
        new Date()
      ]);

      return ContentService.createTextOutput(JSON.stringify({
        status: "success",
        message: "Foto otomatis tersimpan di Google Drive dan tercatat di Spreadsheet!",
        imagePanjangUrl: imgPanjangUrl,
        imagePendekUrl: imgPendekUrl
      })).setMimeType(ContentService.MimeType.JSON);
    }

    // ACTION B: SIMPAN PESANAN & INVOICE TEXT KE GOOGLE DRIVE
    let pesananSheet = ss.getSheetByName("Pesanan");
    if (!pesananSheet) {
      pesananSheet = ss.insertSheet("Pesanan");
      pesananSheet.appendRow([
        "Tanggal",
        "No Invoice",
        "Nama Pembeli",
        "No WA",
        "Alamat",
        "Total Pcs",
        "Total Bayar",
        "Detail Items",
        "Catatan"
      ]);
    } else if (pesananSheet.getLastRow() === 0) {
      pesananSheet.appendRow([
        "Tanggal",
        "No Invoice",
        "Nama Pembeli",
        "No WA",
        "Alamat",
        "Total Pcs",
        "Total Bayar",
        "Detail Items",
        "Catatan"
      ]);
    }
    
    pesananSheet.appendRow([
      new Date(),
      contents.invNo || "",
      contents.name || "",
      contents.phone || "",
      contents.address || "",
      contents.totalQty || 0,
      contents.totalPrice || 0,
      JSON.stringify(contents.items || []),
      contents.note || ""
    ]);

    if (contents.textInvoice) {
      const invoiceFolder = DriveApp.getFolderById(INVOICE_FOLDER_ID);
      const safeBuyer = (contents.name || "Pelanggan").replace(/[^a-zA-Z0-9]/g, "_");
      const fileName = "Invoice_" + (contents.invNo || "ORDER") + "_" + safeBuyer + ".txt";
      invoiceFolder.createFile(fileName, contents.textInvoice, MimeType.PLAIN_TEXT);
    }
    
    return ContentService.createTextOutput(JSON.stringify({
      status: "success",
      message: "Pesanan & Invoice Text berhasil tersimpan di Google Drive!"
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({
      status: "error",
      message: err.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}`;
