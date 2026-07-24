// =========================================================================
// GOOGLE APPS SCRIPT FOR RSVP & COMMENTS (JSONP CORS-FREE VERSION)
// =========================================================================
// 1. Buka Google Sheets Anda: https://docs.google.com/spreadsheets/d/1vfAdtV4lklqX0m5nw16-1E0ETluRZXcP_M0VOxPgeJM/edit
// 2. Klik Menu "Extensions" -> "Apps Script"
// 3. Hapus kode bawaan, lalu paste kode di bawah ini.
// 4. Ubah SPREADSHEET_ID jika diperlukan (saat ini sudah sesuai dengan sheet Anda).
// 5. Klik tombol Save (ikon disket).
// 6. Klik "Deploy" -> "New deployment"
// 7. Pilih type: "Web app"
// 8. Atur konfigurasi:
//    - Description: "RSVP API"
//    - Execute as: "Me"
//    - Who has access: "Anyone" (Sangat penting agar web bisa mengirim data tanpa login)
// 9. Klik "Deploy", lalu berikan izin akses (Authorize Access) jika diminta.
// 10. Copy "Web app URL" yang muncul (berakhiran /exec) dan paste ke variabel APPS_SCRIPT_URL di file index.html Anda.
// =========================================================================

const SPREADSHEET_ID = "1vfAdtV4lklqX0m5nw16-1E0ETluRZXcP_M0VOxPgeJM";
const SHEET_NAME = "Sheet1";

function getSheet() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    // Tulis header jika sheet baru dibuat
    sheet.appendRow(["timestamp", "nama tamu", "ucapan", "konfirmasi kehadiran", "jumlah tamu"]);
  }
  return sheet;
}

// Menangani permintaan GET (Bisa membaca data ATAU menyimpan data, mendukung JSONP)
function doGet(e) {
  try {
    const sheet = getSheet();
    let resultData = {};
    
    // Jika terdapat parameter 'nama_tamu', tandanya adalah request SUBMIT RSVP
    if (e.parameter.nama_tamu) {
      const timestamp = new Date();
      const namaTamu = e.parameter.nama_tamu || "";
      const ucapan = e.parameter.ucapan || "";
      const kehadiran = e.parameter.kehadiran || "";
      const jumlahTamu = e.parameter.jumlah_tamu || "0";
      
      sheet.appendRow([timestamp, namaTamu, ucapan, kehadiran, jumlahTamu]);
      
      resultData = {
        status: "success",
        message: "Data berhasil disimpan!"
      };
    } else {
      // Jika tidak ada parameter 'nama_tamu', tampilkan daftar ucapan (GET biasa)
      const data = sheet.getDataRange().getValues();
      const rows = data.slice(1); // Lewati baris header
      
      const results = rows.map(row => {
        return {
          timestamp: row[0],
          nama_tamu: row[1],
          ucapan: row[2],
          kehadiran: row[3],
          jumlah_tamu: row[4]
        };
      });
      
      results.reverse();
      
      resultData = {
        status: "success",
        data: results
      };
    }
    
    // Periksa jika ada parameter callback untuk JSONP (Sangat penting agar bebas dari masalah CORS browser)
    const callback = e.parameter.callback;
    if (callback) {
      const output = callback + "(" + JSON.stringify(resultData) + ");";
      return ContentService.createTextOutput(output)
        .setMimeType(ContentService.MimeType.JAVASCRIPT);
    } else {
      return ContentService.createTextOutput(JSON.stringify(resultData))
        .setMimeType(ContentService.MimeType.JSON)
        .setHeader('Access-Control-Allow-Origin', '*');
    }
       
  } catch (error) {
    const errorData = {
      status: "error",
      message: error.toString()
    };
    const callback = e.parameter.callback;
    if (callback) {
      const output = callback + "(" + JSON.stringify(errorData) + ");";
      return ContentService.createTextOutput(output)
        .setMimeType(ContentService.MimeType.JAVASCRIPT);
    } else {
      return ContentService.createTextOutput(JSON.stringify(errorData))
        .setMimeType(ContentService.MimeType.JSON)
        .setHeader('Access-Control-Allow-Origin', '*');
    }
  }
}

// Menangani permintaan POST (tetap didukung sebagai alternatif)
function doPost(e) {
  try {
    const sheet = getSheet();
    let parameters;
    
    if (e.postData && e.postData.contents) {
      parameters = JSON.parse(e.postData.contents);
    } else {
      parameters = e.parameter;
    }
    
    const timestamp = new Date();
    const namaTamu = parameters.nama_tamu || "";
    const ucapan = parameters.ucapan || "";
    const kehadiran = parameters.kehadiran || "";
    const jumlahTamu = parameters.jumlah_tamu || "0";
    
    sheet.appendRow([timestamp, namaTamu, ucapan, kehadiran, jumlahTamu]);
    
    return ContentService.createTextOutput(JSON.stringify({
      status: "success",
      message: "Data berhasil disimpan!"
    })).setMimeType(ContentService.MimeType.JSON)
       .setHeader('Access-Control-Allow-Origin', '*');
       
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      status: "error",
      message: error.toString()
    })).setMimeType(ContentService.MimeType.JSON)
       .setHeader('Access-Control-Allow-Origin', '*');
  }
}

// Menangani pre-flight request CORS
function doOptions(e) {
  return ContentService.createTextOutput("")
    .setHeader('Access-Control-Allow-Origin', '*')
    .setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
    .setHeader('Access-Control-Allow-Headers', 'Content-Type');
}
