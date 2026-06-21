"use client";

import React, { useState } from "react";

interface User {
  id: string;
  username: string;
  email: string;
  role: "student" | "teacher" | "admin";
  fullName: string;
  avatar: string;
}

interface PaymentItem {
  id: string;
  uploadDate: string;
  bank: string;
  sender: string;
  amount: string;
  fileName: string;
  fileSize: string;
  status: "Menunggu Verifikasi" | "Diterima" | "Ditolak";
  note: string;
}

interface StudentPaymentProps {
  user: User;
}

export default function StudentPayment({ user }: StudentPaymentProps) {
  // Initial payment history matching the screenshot
  const [history, setHistory] = useState<PaymentItem[]>([]);

  // Form states
  const [targetBank, setTargetBank] = useState("Bank Central Asia (BCA)");
  const [senderName, setSenderName] = useState(user.fullName || "Andi Wijaya");
  const [transferDate, setTransferDate] = useState("2024-05-20");
  const [selectedFile, setSelectedFile] = useState<{ name: string; size: string } | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [visibleCount, setVisibleCount] = useState(3);

  // File selection simulation
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const sizeKB = Math.round(file.size / 1024);
      setSelectedFile({
        name: file.name,
        size: `${sizeKB} KB`,
      });
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      const sizeKB = Math.round(file.size / 1024);
      setSelectedFile({
        name: file.name,
        size: `${sizeKB} KB`,
      });
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
  };

  // Submit payment handler
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      alert("Silakan pilih atau unggah bukti transfer terlebih dahulu.");
      return;
    }

    // Format current date & time
    const now = new Date();
    const months = [
      "Januari", "Februari", "Maret", "April", "Mei", "Juni",
      "Juli", "Agustus", "September", "Oktober", "November", "Desember"
    ];

    // Format date string from input
    const dateObj = new Date(transferDate);
    const day = dateObj.getDate() || now.getDate();
    const month = months[dateObj.getMonth() || now.getMonth()];
    const year = dateObj.getFullYear() || now.getFullYear();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');

    const formattedDate = `${day} ${month} ${year}, ${hours}:${minutes} WIB`;
    const bankAbbreviation = targetBank.match(/\(([^)]+)\)/)?.[1] || "BCA";

    const newPayment: PaymentItem = {
      id: `pay-${Date.now()}`,
      uploadDate: formattedDate,
      bank: bankAbbreviation,
      sender: senderName,
      amount: "Rp 1.200.000",
      fileName: selectedFile.name,
      fileSize: selectedFile.size,
      status: "Menunggu Verifikasi",
      note: "-",
    };

    setHistory([newPayment, ...history]);
    setSelectedFile(null);
    setShowNotification(true);

    setTimeout(() => {
      setShowNotification(false);
    }, 4000);
  };

  return (
    <div className="w-full space-y-6 pb-12 text-slate-800">
      {/* Toast Notification */}
      {showNotification && (
        <div className="fixed top-4 right-4 z-50 flex items-center p-4 mb-4 text-sm text-green-800 rounded-lg bg-green-50 border border-green-200 shadow-lg animate-bounce" role="alert">
          <svg className="flex-shrink-0 inline w-4 h-4 me-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5Zm3.707 8.207-4 4a1 1 0 0 1-1.414 0l-2-2a1 1 0 0 1 1.414-1.414L9 10.586l3.293-3.293a1 1 0 0 1 1.414 1.414Z" />
          </svg>
          <div>
            <span className="font-semibold">Sukses!</span> Bukti pembayaran berhasil diunggah. Menunggu verifikasi admin.
          </div>
        </div>
      )}

      {/* Section Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Payment</h1>
        <p className="text-slate-500 text-sm mt-1">
          Lakukan pembayaran secara manual dan unggah bukti transfer. Pembayaran akan diverifikasi oleh admin.
        </p>
      </div>

      {/* Grid Cards 4 Column */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Tagihan */}
        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5 flex items-start gap-4">
          <div className="bg-blue-600 rounded-xl p-2.5 text-white flex items-center justify-center flex-shrink-0">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <rect width="20" height="14" x="2" y="5" rx="2" />
              <line x1="2" x2="22" y1="10" y2="10" />
              <path d="M16 14h2" />
            </svg>
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Tagihan</p>
            <p className="text-xl font-bold text-slate-800 mt-1">Rp 1.200.000</p>
            <p className="text-xs text-slate-400 mt-2">Untuk periode Juni - Juli 2026</p>
          </div>
        </div>

        {/* Card 2: Status Pembayaran */}
        <div className="bg-amber-50 border border-amber-100 rounded-2xl p-5 flex items-start gap-4">
          <div className="bg-amber-500 rounded-xl p-2.5 text-white flex items-center justify-center flex-shrink-0">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 2h14" />
              <path d="M5 22h14" />
              <path d="M19 2v3.7c0 1.2-.5 2.4-1.4 3.3L12 14l-5.6-5c-.9-.9-1.4-2.1-1.4-3.3V2" />
              <path d="M5 22v-3.7c0-1.2.5-2.4 1.4-3.3L12 10l5.6 5c.9.9 1.4 2.1 1.4 3.3V22" />
            </svg>
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Status Pembayaran</p>
            <p className="text-xl font-bold text-amber-700 mt-1">Menunggu Verifikasi</p>
            <p className="text-xs text-slate-400 mt-2"></p>
          </div>
        </div>

        {/* Card 3: Batas Pembayaran */}
        <div className="bg-green-50 border border-green-100 rounded-2xl p-5 flex items-start gap-4">
          <div className="bg-green-600 rounded-xl p-2.5 text-white flex items-center justify-center flex-shrink-0">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <rect width="18" height="18" x="3" y="4" rx="2" />
              <line x1="16" x2="16" y1="2" y2="6" />
              <line x1="8" x2="8" y1="2" y2="6" />
              <line x1="3" x2="21" y1="10" y2="10" />
            </svg>
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Batas Pembayaran</p>
            <p className="text-xl font-bold text-slate-800 mt-1">30 Juli 2026</p>
            <p className="text-xs text-red-600 font-medium mt-2"></p>
          </div>
        </div>

        {/* Card 4: Petunjuk Pembayaran */}
        <div className="bg-purple-50 border border-purple-100 rounded-2xl p-5 flex items-start gap-4">
          <div className="bg-purple-600 rounded-xl p-2.5 text-white flex items-center justify-center flex-shrink-0">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 16v-4" />
              <path d="M12 8h.01" />
            </svg>
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Petunjuk Pembayaran</p>
            <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
              Lakukan transfer ke rekening berikut:
            </p>
            <p className="text-sm font-bold text-slate-800 mt-0.5">BCA - 1234 5678 9012</p>
            <p className="text-[11px] text-slate-500">a.n. Bimbel Cerdas Indonesia</p>
          </div>
        </div>
      </div>

      {/* Form Upload & Detail Tagihan Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upload Form (Left 2 Columns) */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 p-6 shadow-sm flex flex-col justify-between">
          <form onSubmit={handleSubmit} className="space-y-5">
            <h2 className="text-lg font-bold text-slate-800">Upload Bukti Pembayaran</h2>

            {/* Input 1: Bank Dropdown */}
            <div className="grid grid-cols-1 md:grid-cols-3 md:items-center gap-2">
              <label htmlFor="pilih-bank" className="text-sm font-medium text-slate-600">Pilih Bank Tujuan</label>
              <div className="md:col-span-2">
                <select
                  id="pilih-bank"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer"
                  value={targetBank}
                  onChange={(e) => setTargetBank(e.target.value)}
                >
                  <option>Bank Central Asia (BCA)</option>
                  <option>Bank Mandiri</option>
                  <option>Bank Rakyat Indonesia (BRI)</option>
                  <option>Bank Negara Indonesia (BNI)</option>
                </select>
              </div>
            </div>

            {/* Input 2: Nama Pengirim */}
            <div className="grid grid-cols-1 md:grid-cols-3 md:items-center gap-2">
              <label htmlFor="nama-pengirim" className="text-sm font-medium text-slate-600">Nama Pengirim</label>
              <div className="md:col-span-2">
                <input
                  type="text"
                  id="nama-pengirim"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  value={senderName}
                  onChange={(e) => setSenderName(e.target.value)}
                  placeholder="Masukkan nama pengirim"
                  required
                />
              </div>
            </div>

            {/* Input 3: Tanggal Transfer */}
            <div className="grid grid-cols-1 md:grid-cols-3 md:items-center gap-2">
              <label htmlFor="tanggal-transfer" className="text-sm font-medium text-slate-600">Tanggal Transfer</label>
              <div className="md:col-span-2 relative">
                <input
                  type="date"
                  id="tanggal-transfer"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  value={transferDate}
                  onChange={(e) => setTransferDate(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Input 4: File Upload */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              <span className="text-sm font-medium text-slate-600">Upload Bukti Transfer</span>
              <div className="md:col-span-2">
                {!selectedFile ? (
                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={`border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all ${dragOver
                      ? "border-blue-500 bg-blue-50/50"
                      : "border-slate-200 hover:border-slate-300 bg-slate-50/50"
                      }`}
                    onClick={() => document.getElementById("file-upload-input")?.click()}
                  >
                    <input
                      type="file"
                      id="file-upload-input"
                      className="hidden"
                      accept=".jpg,.jpeg,.png,.pdf"
                      onChange={handleFileChange}
                    />
                    <div className="bg-blue-50 rounded-full p-2.5 text-blue-600">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
                        <path d="M14 2v4a2 2 0 0 0 2 2h4" />
                        <path d="M10 9H8" />
                        <path d="M16 13H8" />
                        <path d="M16 17H8" />
                      </svg>
                    </div>
                    <p className="text-xs font-semibold text-slate-700">Klik atau drag file ke sini untuk mengupload</p>
                    <p className="text-[10px] text-slate-400">Format: JPG, PNG, PDF. Maksimal 2MB</p>
                  </div>
                ) : (
                  <div className="border border-slate-200 rounded-xl p-4 flex items-center justify-between bg-slate-50">
                    <div className="flex items-center gap-3">
                      <div className="bg-blue-100 rounded-lg p-2 text-blue-600">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
                          <path d="M14 2v4a2 2 0 0 0 2 2h4" />
                        </svg>
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-slate-700 truncate max-w-[200px] md:max-w-[300px]">
                          {selectedFile.name}
                        </p>
                        <p className="text-[10px] text-slate-400">{selectedFile.size}</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={removeFile}
                      className="text-red-500 hover:text-red-700 p-1.5 hover:bg-red-50 rounded-lg transition-all"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M18 6 6 18" />
                        <path d="m6 6 12 12" />
                      </svg>
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Info Message Box */}
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 flex items-start gap-2.5 text-xs text-blue-800">
              <svg className="flex-shrink-0 w-4 h-4 mt-0.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 16v-4" />
                <path d="M12 8h.01" />
              </svg>
              <span>Pastikan bukti transfer terlihat jelas.</span>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end pt-2">
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-5 py-2.5 font-semibold text-sm flex items-center gap-2 shadow-sm hover:shadow transition-all"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="17 8 12 3 7 8" />
                  <line x1="12" x2="12" y1="3" y2="15" />
                </svg>
                Kirim Bukti Pembayaran
              </button>
            </div>
          </form>
        </div>

        {/* Bill Details (Right 1 Column) */}
        <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm flex flex-col justify-between">
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-slate-800">Detail Tagihan</h2>
            <div className="border border-slate-100 rounded-xl p-4 bg-slate-50/50 space-y-3">
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Rincian Pembayaran</h3>

              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500 font-medium">Biaya Bimbingan Belajar (2 bulan)</span>
                  <span className="font-semibold text-slate-700">Rp 1.000.000</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500 font-medium">Biaya Pendaftaran</span>
                  <span className="font-semibold text-slate-700">Rp 150.000</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500 font-medium">Biaya Administrasi</span>
                  <span className="font-semibold text-slate-700">Rp 50.000</span>
                </div>
              </div>

              <div className="border-t border-slate-200/60 pt-3 flex justify-between items-center">
                <span className="text-xs font-bold text-slate-800">Total Tagihan</span>
                <span className="text-lg font-extrabold text-blue-600">Rp 1.200.000</span>
              </div>
            </div>
          </div>

          {/* Bottom Information */}
          <div className="bg-blue-50/70 border border-blue-100 rounded-xl p-4 flex items-start gap-3 text-xs text-blue-800 mt-4">
            <svg className="flex-shrink-0 w-4 h-4 mt-0.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 16v-4" />
              <path d="M12 8h.01" />
            </svg>
            <div className="space-y-1">
              <p className="font-bold">Informasi</p>
              <p className="text-[11px] leading-relaxed text-blue-700">
                Setelah mengirim bukti pembayaran, harap tunggu verifikasi dari admin (1x24 jam pada hari kerja).
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Payment History Section */}
      <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm space-y-4">
        <h2 className="text-lg font-bold text-slate-800">Riwayat Pembayaran</h2>

        {/* Responsive Table Wrapper */}
        <div className="overflow-x-auto rounded-xl border border-slate-100">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 font-semibold">
                <th className="p-4">Tanggal Upload</th>
                <th className="p-4">Bank Tujuan</th>
                <th className="p-4">Nama Pengirim</th>
                <th className="p-4">Jumlah</th>
                <th className="p-4">Bukti Transfer</th>
                <th className="p-4">Status</th>
                <th className="p-4">Keterangan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {history.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400 font-medium">
                    Belum ada riwayat pembayaran.
                  </td>
                </tr>
              ) : (
                history.slice(0, visibleCount).map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-4 font-medium text-slate-700">{item.uploadDate}</td>
                    <td className="p-4 text-slate-500 font-semibold">{item.bank}</td>
                    <td className="p-4 text-slate-700">{item.sender}</td>
                    <td className="p-4 font-semibold text-slate-800">{item.amount}</td>
                    <td className="p-4">
                      <a
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          alert(`Membuka file: ${item.fileName}`);
                        }}
                        className="inline-flex items-center gap-1.5 text-blue-600 hover:text-blue-800 hover:underline font-medium"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0">
                          <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
                          <path d="M14 2v4a2 2 0 0 0 2 2h4" />
                        </svg>
                        <span className="truncate max-w-[140px]">{item.fileName}</span>
                        <span className="text-[10px] text-slate-400 font-normal">({item.fileSize})</span>
                      </a>
                    </td>
                    <td className="p-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-semibold ${item.status === "Menunggu Verifikasi"
                          ? "bg-amber-50 border border-amber-200 text-amber-700"
                          : item.status === "Diterima"
                            ? "bg-green-50 border border-green-200 text-green-700"
                            : "bg-red-50 border border-red-200 text-red-700"
                          }`}
                      >
                        {item.status}
                      </span>
                    </td>
                    <td className="p-4 text-slate-500 leading-normal max-w-[200px] truncate" title={item.note}>
                      {item.note}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* See More Link */}
        {visibleCount < history.length ? (
          <div className="flex justify-center pt-2">
            <button
              onClick={() => setVisibleCount(history.length)}
              className="inline-flex items-center gap-1 text-slate-500 hover:text-slate-800 font-semibold text-xs transition-colors"
            >
              Lihat lebih banyak
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>
          </div>
        ) : history.length > 3 ? (
          <div className="flex justify-center pt-2">
            <button
              onClick={() => setVisibleCount(3)}
              className="inline-flex items-center gap-1 text-slate-500 hover:text-slate-800 font-semibold text-xs transition-colors"
            >
              Tampilkan lebih sedikit
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="18 15 12 9 6 15" />
              </svg>
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
