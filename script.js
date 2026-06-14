document.addEventListener("DOMContentLoaded", () => {
  // ==========================================
  // 1. SELEKSI ELEMEN DOM (AMBIL ELEMEN HTML)
  // ==========================================
  const navLinks = document.querySelectorAll(".nav-link");
  const tabContents = document.querySelectorAll(".tab-content");
  
  const ecoToggleBtn = document.getElementById("eco-toggle");
  const totalEnergyEl = document.getElementById("total-energy");
  const totalCostEl = document.getElementById("total-cost");
  
  const budgetInput = document.getElementById("budget-input");
  const budgetProgress = document.getElementById("budget-progress");
  const budgetStatus = document.getElementById("budget-status");
  const toast = document.getElementById("toast");
  const deviceCards = document.querySelectorAll(".device-card");

  const profileTrigger = document.getElementById("user-profile-trigger");
  const userModal = document.getElementById("user-modal");
  const closeModalBtn = document.getElementById("close-modal-btn");
  const userOptBtns = document.querySelectorAll(".user-opt-btn");
  const currentUserName = document.getElementById("current-user-name");
  const resetBtn = document.getElementById("btn-reset-data");

  // ==========================================
  // 2. STATE APLIKASI (VARIABEL PENYIMPAN DATA)
  // ==========================================
  let isEcoMode = false;
  let budgetLimit = parseFloat(budgetInput.value);

  // ==========================================
  // 3. FUNGSI UTAMA: KALKULASI ENERGI & BUDGET
  // ==========================================
  function updateEnergyCalculation() {
    let currentTotal = 0;

    // Scan semua kartu perangkat yang saklarnya aktif (ON)
    deviceCards.forEach(card => {
      const btn = card.querySelector(".switch-btn");
      if (btn.classList.contains("active")) {
        currentTotal += parseFloat(card.dataset.energy);
      }
    });

    // Pembulatan matematika agar desimal tidak berantakan
    currentTotal = Math.round(currentTotal * 10) / 10;
    
    // Update angka di halaman Dashboard
    totalEnergyEl.textContent = currentTotal.toFixed(1);
    totalCostEl.textContent = Math.round(currentTotal * 1500); // Estimasi tarif Rp1.500/kWh

    // Hitung persentase bar anggaran
    const percentage = (currentTotal / budgetLimit) * 100;
    budgetProgress.style.width = `${Math.min(percentage, 100)}%`;

    // LOGIKA WARNA & NOTIFIKASI (Aspek Utama HCI Feedback)
    if (currentTotal > budgetLimit) {
      budgetProgress.style.backgroundColor = "#dc3545"; // Merah (Bahaya)
      budgetStatus.textContent = "Status: MELEBIHI BATAS ANGGARAN!";
      budgetStatus.style.color = "#dc3545";
      toast.classList.remove("hidden"); // Munculkan pop-up peringatan dini
    } else if (percentage >= 80) {
      budgetProgress.style.backgroundColor = "#ffc107"; // Kuning (Waspada)
      budgetStatus.textContent = "Status: Waspada (Mendekati Batas)";
      budgetStatus.style.color = "#ffc107";
      toast.classList.add("hidden");
    } else {
      budgetProgress.style.backgroundColor = "var(--progress-color)"; // Hijau (Aman)
      budgetStatus.textContent = "Status: Aman";
      budgetStatus.style.color = "inherit";
      toast.classList.add("hidden");
    }
  }

  // ==========================================
  // 4. LOGIKA INTEGRASI ECO-MODE (TEMA & SAKLAR)
  // ==========================================
  function enableEcoMode() {
    isEcoMode = true;
    ecoToggleBtn.textContent = "☀️ Matikan Eco-Mode";
    document.documentElement.classList.add("eco-mode-active"); // Ubah CSS Variables ke tema hijau

    // Matikan otomatis semua perangkat non-esensial (Sesuai Activity Diagram)
    deviceCards.forEach(card => {
      if (card.dataset.essential === "false") {
        const btn = card.querySelector(".switch-btn");
        const statusText = card.querySelector(".status-text");
        
        btn.classList.remove("active");
        btn.textContent = "OFF";
        statusText.textContent = "Status: OFF";
        card.classList.add("off");
      }
    });
    updateEnergyCalculation();
  }

  function disableEcoMode() {
    isEcoMode = false;
    ecoToggleBtn.textContent = "🌿 Aktifkan Eco-Mode";
    document.documentElement.classList.remove("eco-mode-active"); // Balik ke tema biru default
  }

  // Event listener tombol utama Eco-Mode
  ecoToggleBtn.addEventListener("click", () => {
    if (!isEcoMode) {
      enableEcoMode();
    } else {
      disableEcoMode();
    }
  });

  // ==========================================
  // 5. LOGIKA SAKLAR INDIVIDUAL PERANGKAT
  // ==========================================
  deviceCards.forEach(card => {
    const btn = card.querySelector(".switch-btn");
    const statusText = card.querySelector(".status-text");

    btn.addEventListener("click", () => {
      // Fitur HCI: Jika Eco-Mode aktif tapi user maksa menyalakan alat non-esensial,
      // otomatis matikan status global Eco-Mode agar visual tema sinkron kembali.
      if (isEcoMode && card.dataset.essential === "false" && !btn.classList.contains("active")) {
        disableEcoMode();
      }

      // Toggle status tombol ON/OFF
      const isActive = btn.classList.toggle("active");
      if (isActive) {
        btn.textContent = "ON";
        statusText.textContent = "Status: ON";
        card.classList.remove("off");
      } else {
        btn.textContent = "OFF";
        statusText.textContent = "Status: OFF";
        card.classList.add("off");
      }

      // Hitung ulang setiap kali ada saklar yang ditekan
      updateEnergyCalculation();
    });
  });

  // ==========================================
  // 6. SISTEM PERPINDAHAN HALAMAN (TAB SWITCH)
  // ==========================================
  navLinks.forEach(link => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      
      // Atur class aktif pada menu sidebar
      navLinks.forEach(l => l.classList.remove("active"));
      link.classList.add("active");

      // Sembunyikan halaman lama dan tampilkan halaman tujuan
      const targetPage = link.dataset.target;
      tabContents.forEach(tab => {
        if (tab.id === targetPage) {
          tab.classList.add("active");
        } else {
          tab.classList.remove("active");
        }
      });
    });
  });

  // ==========================================
  // 7. MANAJEMEN USER & VALIDASI PRIVILEGE (HCI)
  // ==========================================
  profileTrigger.addEventListener("click", () => userModal.classList.remove("hidden"));
  closeModalBtn.addEventListener("click", () => userModal.classList.add("hidden"));

  userOptBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      const selectedUser = btn.dataset.user;
      currentUserName.textContent = selectedUser;
      userModal.classList.add("hidden");

      // Penerapan Error Prevention: Akun anak dikunci tidak bisa mematikan/menyalakan alat utama
      if (selectedUser.includes("Anak")) {
        alert("🔒 Akses Terbatasi! Profil Anak-anak tidak diizinkan mengubah konfigurasi perangkat utama.");
        document.querySelectorAll(".switch-btn, #eco-toggle, #budget-input").forEach(b => b.disabled = true);
      } else {
        // Buka kembali akses jika yang masuk Admin/Orang tua
        document.querySelectorAll(".switch-btn, #eco-toggle, #budget-input").forEach(b => b.disabled = false);
      }
    });
  });

  // ==========================================
  // 8. EVENT INPUT BUDGET & RESET DATA (SETTINGS)
  // ==========================================
  budgetInput.addEventListener("input", (e) => {
    let val = parseFloat(e.target.value);
    if (!isNaN(val) && val > 0) {
      budgetLimit = val;
      updateEnergyCalculation();
    }
  });

  if (resetBtn) {
    resetBtn.addEventListener("click", () => {
      if (confirm("Apakah Anda yakin ingin mengosongkan seluruh riwayat data pemakaian energi?")) {
        alert("Data berhasil dibersihkan kembali ke pengaturan pabrik.");
        budgetInput.value = 5.0;
        budgetLimit = 5.0;
        disableEcoMode();
        updateEnergyCalculation();
      }
    });
  }

  // RUN PERTAMA KALI SAAT WEB DI-REFRESH
  updateEnergyCalculation();
});