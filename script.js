document.addEventListener("DOMContentLoaded", () => {
  // --- A. DOM Elements ---
  const ecoToggleBtn = document.getElementById("eco-toggle");
  const totalEnergyEl = document.getElementById("total-energy");
  const totalCostEl = document.getElementById("total-cost");
  const budgetInput = document.getElementById("budget-input");
  const budgetProgress = document.getElementById("budget-progress");
  const budgetStatus = document.getElementById("budget-status");
  const toast = document.getElementById("toast");
  const deviceCards = document.querySelectorAll(".device-card");

  // --- B. App State ---
  let isEcoMode = false;
  let budgetLimit = parseFloat(budgetInput.value);

  // --- C. Fungsi Hitung Total Konsumsi Energi ---
  function updateEnergyCalculation() {
    let currentTotal = 0;

    // Scan semua device card yang saklarnya aktif (ON)
    deviceCards.forEach(card => {
      const btn = card.querySelector(".switch-btn");
      if (btn.classList.contains("active")) {
        currentTotal += parseFloat(card.dataset.energy);
      }
    });

    // Bulatkan hasil kalkulasi
    currentTotal = Math.round(currentTotal * 10) / 10;
    
    // Update Tampilan UI Angka
    totalEnergyEl.textContent = currentTotal.toFixed(1);
    totalCostEl.textContent = Math.round(currentTotal * 1500); // Simulasi tarif listrik per kWh

    // Update Progress Bar Anggaran (HCI Visual Feedback)
    const percentage = (currentTotal / budgetLimit) * 100;
    budgetProgress.style.width = `${Math.min(percentage, 100)}%`;

    // Pengkondisian Warna Progress Bar & Notifikasi Over-Limit
    if (currentTotal > budgetLimit) {
      budgetProgress.style.backgroundColor = "#dc3545"; // Merah jika over-limit
      budgetStatus.textContent = "Status: MELEBIHI BATAS ANGGARAN!";
      budgetStatus.style.color = "#dc3545";
      toast.classList.remove("hidden"); // Tampilkan Pop-up Peringatan
    } else if (percentage >= 80) {
      budgetProgress.style.backgroundColor = "#ffc107"; // Kuning waspada
      budgetStatus.textContent = "Status: Waspada (Mendekati Batas)";
      budgetStatus.style.color = "#ffc107";
      toast.classList.add("hidden");
    } else {
      budgetProgress.style.backgroundColor = "var(--progress-color)"; // Hijau aman
      budgetStatus.textContent = "Status: Aman";
      budgetStatus.style.color = "inherit";
      toast.classList.add("hidden");
    }
  }

  // --- D. Logika Saklar Individual Perangkat ---
  deviceCards.forEach(card => {
    const btn = card.querySelector(".switch-btn");
    const statusText = card.querySelector(".status-text");

    btn.addEventListener("click", () => {
      // Jika Eco-Mode sedang menyala, matikan dulu Eco-Mode kalau user mengubah manual
      if (isEcoMode && !card.dataset.essential) {
        disableEcoMode();
      }

      // Toggle status tombol saklar
      const isActive = btn.classList.toggle("active");
      if (isActive) {
        btn.textContent = "ON";
        statusText.textContent = "Status: ON";
        card.classList.remove("off");
        btn.setAttribute("aria-checked", "true");
      } else {
        btn.textContent = "OFF";
        statusText.textContent = "Status: OFF";
        card.classList.add("off");
        btn.setAttribute("aria-checked", "false");
      }

      // Jalankan hitung ulang energi setelah saklar berubah
      updateEnergyCalculation();
    });
  });

  // --- E. Logika Fitur Utama Eco-Mode ---
  function enableEcoMode() {
    isEcoMode = true;
    ecoToggleBtn.textContent = "☀️ Matikan Eco-Mode";
    document.documentElement.classList.add("eco-mode-active"); // Ganti tema CSS variabel

    // JavaScript memindai dan MEMATIKAN semua perangkat non-esensial (Sesuai Activity Diagram)
    deviceCards.forEach(card => {
      if (card.dataset.essential === "false") {
        const btn = card.querySelector(".switch-btn");
        const statusText = card.querySelector(".status-text");
        
        btn.classList.remove("active");
        btn.textContent = "OFF";
        statusText.textContent = "Status: OFF";
        card.classList.add("off");
        btn.setAttribute("aria-checked", "false");
      }
    });
    updateEnergyCalculation();
  }

  function disableEcoMode() {
    isEcoMode = false;
    ecoToggleBtn.textContent = "🌿 Aktifkan Eco-Mode";
    document.documentElement.classList.remove("eco-mode-active"); // Kembalikan ke tema default
  }

  ecoToggleBtn.addEventListener("click", () => {
    if (!isEcoMode) {
      enableEcoMode();
    } else {
      disableEcoMode();
    }
  });

  // --- F. Event Listener Input Anggaran ---
  budgetInput.addEventListener("input", (e) => {
    let val = parseFloat(e.target.value);
    if (!isNaN(val) && val > 0) {
      budgetLimit = val;
      updateEnergyCalculation();
    }
  });

  // Inisialisasi hitungan awal saat aplikasi pertama kali dimuat
  updateEnergyCalculation();
});