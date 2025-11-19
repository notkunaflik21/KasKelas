document.addEventListener('DOMContentLoaded', () => {
  const STORAGE_KEYS = {
    students: 'students',
    transactions: 'kasTransactions',
    wallets: 'wallets',
    withdraw: 'withdrawHistory',
    settings: 'settings'
  };

  const LEGACY_START_DATE = '2025-01-06';

  const DEFAULT_SETTINGS = {
    kasPerHari: 1000,
    startDate: '2025-11-10',
    endDate: '2025-12-19',
    tahunAjar: '2025'
  };

  const DEFAULT_STUDENTS_DATA = [
    'Aditia Rahman',
    'Bilqis Maharani',
    'Cahyo Saputra',
    'Dewi Permata',
    'Eka Widya',
    'Farhan Akbar',
    'Galih Putra',
    'Hana Lestari',
    'Indra Kusuma',
    'Jihan Safira',
    'Kirana Prameswari',
    'Lutfi Pratama',
    'Mega Andini',
    'Nanda Febrian',
    'Omar Pradipta',
    'Putri Maharani',
    'Quinn Alesha',
    'Rafi Alvaro',
    'Syifa Zahra',
    'Tegar Ramdhan',
    'Umar Prakoso',
    'Vania Kusuma',
    'Wahyu Firmansyah',
    'Xaviera Devani',
    'Yuni Maulida',
    'Zidan Prakoso',
    'Ani Kartika',
    'Bagus Prasetyo',
    'Citra Wulandari',
    'Danu Prakoso',
    'Erika Prameswari',
    'Fauzan Ramadhan',
    'Gita Permata',
    'Hafiz Maulana',
    'Ilham Satrio'
  ];

  function buildDefaultStudents(startDate = DEFAULT_SETTINGS.startDate) {
    return DEFAULT_STUDENTS_DATA.map((nama, index) => ({
      id: `STD-${(index + 1).toString().padStart(3, '0')}`,
      nama,
      nis: String(index + 1),
      aktif: true,
      tanggalDaftar: startDate
    }));
  }

  const state = {
    students: [],
    transactions: [],
    wallets: { dompet: 0 },
    withdrawHistory: [],
    settings: { ...DEFAULT_SETTINGS },
    editingStudentId: null,
    selectedStatusStudentId: null
  };

  const navButtons = document.querySelectorAll('[data-target]');
  const studentForm = document.getElementById('studentForm');
  const studentFormTitle = document.getElementById('studentFormTitle');
  const studentSubmitBtn = document.getElementById('studentSubmitBtn');
  const kasForm = document.getElementById('kasForm');
  const kasStudentSelect = document.getElementById('kasStudent');
  const kasAmountInput = document.getElementById('kasAmount');
  const withdrawForm = document.getElementById('withdrawForm');
  const withdrawDateInput = document.getElementById('withdrawDate');
  const settingsForm = document.getElementById('settingsForm');
  const resetDataBtn = document.getElementById('resetDataBtn');
  const globalSaveBtn = document.getElementById('globalSaveBtn');
  const settingsSaveBtn = document.getElementById('settingsSaveBtn');
  const quickAddStudentBtn = document.getElementById('quickAddStudentBtn');
  const goToWithdrawBtn = document.getElementById('goToWithdrawBtn');
  const alertContainer = document.getElementById('alertContainer');
  const kasProgressIndicator = document.getElementById('kasProgressIndicator');
  const kasTrendBars = document.getElementById('kasTrendBars');
  const studentStatusDetailBody = document.getElementById('studentStatusDetailBody');
  const kasStudentSearchInput = document.getElementById('kasStudentSearch');
  const kasStudentQuickList = document.getElementById('kasStudentQuickList');
  const backupDataBtn = document.getElementById('backupDataBtn');
  const importDataBtn = document.getElementById('importDataBtn');
  const importDataInput = document.getElementById('importDataInput');

  initStorage();
  loadState();
  bindNavigation();
  bindForms();
  populateSettingsForm();
  setDefaultDates();
  renderAll();
  showSection('section-dashboard');

  function initStorage() {
    if (!localStorage.getItem(STORAGE_KEYS.students)) localStorage.setItem(STORAGE_KEYS.students, '[]');
    if (!localStorage.getItem(STORAGE_KEYS.transactions)) localStorage.setItem(STORAGE_KEYS.transactions, '[]');
    if (!localStorage.getItem(STORAGE_KEYS.wallets)) localStorage.setItem(STORAGE_KEYS.wallets, JSON.stringify({ dompet: 0 }));
    if (!localStorage.getItem(STORAGE_KEYS.withdraw)) localStorage.setItem(STORAGE_KEYS.withdraw, '[]');
    if (!localStorage.getItem(STORAGE_KEYS.settings)) localStorage.setItem(STORAGE_KEYS.settings, JSON.stringify(DEFAULT_SETTINGS));
  }

  function loadState() {
    const storedSettings = parseStorage(STORAGE_KEYS.settings, DEFAULT_SETTINGS);
    if (!storedSettings.startDate || storedSettings.startDate === LEGACY_START_DATE) {
      storedSettings.startDate = DEFAULT_SETTINGS.startDate;
      persist(STORAGE_KEYS.settings, storedSettings);
    }
    state.settings = { ...DEFAULT_SETTINGS, ...storedSettings };
    document.getElementById('activeSchoolYear').textContent = state.settings.tahunAjar;

    state.students = parseStorage(STORAGE_KEYS.students, []);
    if (!state.students.length) {
      state.students = buildDefaultStudents(state.settings.startDate);
      persist(STORAGE_KEYS.students, state.students);
    }
    state.transactions = parseStorage(STORAGE_KEYS.transactions, []);
    const storedWallets = parseStorage(STORAGE_KEYS.wallets, { dompet: 0 });
    state.wallets = { dompet: storedWallets.dompet || 0 };
    state.withdrawHistory = parseStorage(STORAGE_KEYS.withdraw, []);
  }

  function parseStorage(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (err) {
      console.error('Failed to parse storage', err);
      return fallback;
    }
  }

  function bindNavigation() {
    navButtons.forEach((btn) => btn.addEventListener('click', () => showSection(btn.dataset.target)));
  }

  function bindForms() {
    if (studentForm) {
      studentForm.addEventListener('submit', handleStudentSubmit);
      studentForm.addEventListener('reset', () => {
        state.editingStudentId = null;
        studentFormTitle.textContent = 'Tambah Siswa';
        studentSubmitBtn.textContent = 'Simpan';
      });
    }
    if (kasForm) {
      kasForm.addEventListener('submit', handleKasSubmit);
    }
    if (withdrawForm) withdrawForm.addEventListener('submit', handleWithdrawSubmit);
    if (settingsForm) settingsForm.addEventListener('submit', handleSettingsSubmit);
    if (resetDataBtn) resetDataBtn.addEventListener('click', handleResetData);
    if (globalSaveBtn) globalSaveBtn.addEventListener('click', handleManualSave);
    if (settingsSaveBtn) settingsSaveBtn.addEventListener('click', handleManualSave);
    if (quickAddStudentBtn) {
      quickAddStudentBtn.addEventListener('click', (event) => {
        event.preventDefault();
        if (studentForm?.requestSubmit) {
          studentForm.requestSubmit();
        } else {
          studentForm?.submit();
        }
      });
    }
    if (goToWithdrawBtn) {
      goToWithdrawBtn.addEventListener('click', (event) => {
        event.preventDefault();
        showSection('section-withdraw');
        withdrawForm?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    }
    if (kasStudentSearchInput) {
      kasStudentSearchInput.addEventListener('input', (event) => applyKasStudentFilter(event.target.value));
    }
    if (kasStudentSelect) {
      kasStudentSelect.addEventListener('change', () => highlightQuickPick(kasStudentSelect.value));
    }
    if (backupDataBtn) backupDataBtn.addEventListener('click', handleBackupData);
    if (importDataBtn && importDataInput) {
      importDataBtn.addEventListener('click', () => importDataInput.click());
      importDataInput.addEventListener('change', handleImportData);
    }
  }

  function populateSettingsForm() {
    document.getElementById('settingKasPerHari').value = state.settings.kasPerHari;
    document.getElementById('settingStartDate').value = state.settings.startDate;
    document.getElementById('settingEndDate').value = state.settings.endDate;
    document.getElementById('settingSchoolYear').value = state.settings.tahunAjar;
  }

  function setDefaultDates() {
    const today = formatISODate(new Date());
    if (withdrawDateInput) withdrawDateInput.value = today;
  }

  function renderAll() {
    const recapData = buildRecapData();
    renderDashboard(recapData);
    renderStudents();
    renderWallets();
    renderWithdrawals();
    renderRekap(recapData);
  }

  function renderDashboard(recapData) {
    const totalStudents = state.students.length;
    const activeStudents = state.students.filter((s) => s.aktif).length;
    const dompet = state.wallets.dompet || 0;
    const totalKas = dompet;
    const expectedWorkingDays = getExpectedWorkingDays();
    const kasPerHari = state.settings.kasPerHari || 1000;
    const expectedKas = activeStudents * kasPerHari * expectedWorkingDays;
    const rawProgress = expectedKas > 0 ? (dompet / expectedKas) * 100 : 0;
    const progressPercent = Number.isFinite(rawProgress) ? rawProgress : 0;

    document.getElementById('statTotalStudents').textContent = totalStudents;
    document.getElementById('statActiveStudents').textContent = activeStudents;
    document.getElementById('statDompet').textContent = formatCurrency(dompet);
    document.getElementById('statSaldo').textContent = formatCurrency(totalKas);
    document.getElementById('runningDays').textContent = expectedWorkingDays;
    document.getElementById('statExpectedKas').textContent = formatCurrency(expectedKas);
    document.getElementById('statProgressPercent').textContent = `${Math.max(Math.round(progressPercent), 0)}%`;
    if (kasProgressIndicator) {
      kasProgressIndicator.style.width = `${Math.min(Math.max(progressPercent, 0), 100)}%`;
    }

    const topDebtorList = document.getElementById('topDebtorList');
    if (topDebtorList) {
      topDebtorList.innerHTML = '';
      const debtors = recapData.filter((item) => item.outstandingAmount > 0).slice(0, 3);
      if (!debtors.length) {
        topDebtorList.innerHTML = '<li class="rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-2 text-sm text-emerald-700">Semua siswa aman 🎉</li>';
      } else {
        debtors.forEach((item) => {
          const li = document.createElement('li');
          li.className = 'flex items-center justify-between rounded-2xl border border-rose-100 px-4 py-2';
          li.innerHTML = `
            <div>
              <p class="font-semibold text-slate-900">${item.nama}</p>
              <p class="text-xs text-slate-400">${item.outstandingDays} hari menunggak</p>
            </div>
            <span class="text-sm font-semibold text-rose-600">${formatCurrency(item.outstandingAmount)}</span>
          `;
          topDebtorList.appendChild(li);
        });
      }
    }

    const latestList = document.getElementById('latestPayments');
    if (latestList) {
      latestList.innerHTML = '';
      const latestTransactions = [...state.transactions]
        .sort((a, b) => new Date(b.tanggalBayar) - new Date(a.tanggalBayar))
        .slice(0, 5);
      if (!latestTransactions.length) {
        latestList.innerHTML = '<li class="text-slate-400">Belum ada transaksi kas</li>';
      } else {
        latestTransactions.forEach((trx) => {
          const student = findStudent(trx.studentId);
          const li = document.createElement('li');
          li.className = 'flex items-center gap-3';
          li.innerHTML = `
            <span class="h-2 w-2 rounded-full bg-brand-500"></span>
            <div class="flex-1">
              <p class="font-medium text-slate-900">${student ? student.nama : 'Siswa'}</p>
              <p class="text-xs text-slate-400">${formatShortDate(trx.tanggalBayar)}</p>
            </div>
            <span class="text-sm font-semibold text-slate-900">${formatCurrency(trx.jumlah)}</span>
          `;
          latestList.appendChild(li);
        });
      }
    }

    renderKasTrend();
    renderStudentStatusBoard(recapData, expectedWorkingDays);
  }

  function renderStudents() {
    const body = document.getElementById('studentTableBody');
    body.innerHTML = '';
    if (!state.students.length) {
      body.innerHTML = '<tr><td colspan="5" class="px-4 py-4 text-center text-sm text-slate-500">Belum ada siswa yang terdaftar</td></tr>';
    } else {
      [...state.students]
        .sort((a, b) => a.nama.localeCompare(b.nama))
        .forEach((student) => {
          const row = document.createElement('tr');
          row.className = 'align-top';
          row.innerHTML = `
            <td class="px-3 py-2 font-medium">${student.nama}</td>
            <td class="px-3 py-2 text-slate-600">${student.nis}</td>
            <td class="px-3 py-2">
              <span class="inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${student.aktif ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'}">
                ${student.aktif ? 'Aktif' : 'Nonaktif'}
              </span>
            </td>
            <td class="px-3 py-2 text-slate-500">${formatShortDate(student.tanggalDaftar)}</td>
            <td class="px-3 py-2 text-right space-x-2">
              <button class="text-brand-600 text-xs font-semibold" data-action="edit">Edit</button>
              <button class="text-rose-600 text-xs font-semibold" data-action="delete">Hapus</button>
            </td>
          `;
          row.querySelector('[data-action="edit"]').addEventListener('click', () => startEditStudent(student.id));
          row.querySelector('[data-action="delete"]').addEventListener('click', () => deleteStudent(student.id));
          body.appendChild(row);
        });
    }

    if (kasStudentSelect) {
      const keyword = kasStudentSearchInput?.value || '';
      applyKasStudentFilter(keyword);
    }
  }

  function applyKasStudentFilter(keyword = '') {
    if (!kasStudentSelect) return;
    const normalized = keyword.trim().toLowerCase();
    const activeStudents = state.students
      .filter((student) => student.aktif)
      .sort((a, b) => a.nama.localeCompare(b.nama));
    const filtered = normalized
      ? activeStudents.filter(
          (student) =>
            student.nama.toLowerCase().includes(normalized) || String(student.nis || '').toLowerCase().includes(normalized)
        )
      : activeStudents;
    populateKasSelect(filtered);
    renderKasQuickPick(filtered);
  }

  function populateKasSelect(list) {
    if (!kasStudentSelect) return;
    const currentValue = kasStudentSelect.value;
    kasStudentSelect.innerHTML = '<option value="">Pilih siswa</option>';
    list.forEach((student) => {
      const option = document.createElement('option');
      const labelPrefix = student.nis ? `${student.nis}. ` : '';
      option.value = student.id;
      option.textContent = `${labelPrefix}${student.nama}`;
      kasStudentSelect.appendChild(option);
    });
    if (currentValue && list.some((student) => student.id === currentValue)) {
      kasStudentSelect.value = currentValue;
    } else {
      kasStudentSelect.value = '';
    }
    highlightQuickPick(kasStudentSelect.value);
  }

  function renderKasQuickPick(list) {
    if (!kasStudentQuickList) return;
    kasStudentQuickList.innerHTML = '';
    if (!list.length) {
      kasStudentQuickList.innerHTML = '<p class="col-span-full text-xs text-slate-400">Tidak ada siswa yang cocok dengan pencarian.</p>';
      return;
    }
    list.forEach((student) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.dataset.studentId = student.id;
      btn.className =
        'rounded-xl border border-slate-200 bg-white px-3 py-2 text-left text-sm text-slate-700 hover:border-brand-300 hover:bg-brand-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-300';
      btn.innerHTML = `<p class="font-semibold text-slate-900">${student.nama}</p><p class="text-xs text-slate-500">No. ${student.nis || '-'}</p>`;
      btn.addEventListener('click', () => {
        if (kasStudentSelect) {
          kasStudentSelect.value = student.id;
          kasStudentSelect.dispatchEvent(new Event('change'));
        }
      });
      kasStudentQuickList.appendChild(btn);
    });
    highlightQuickPick(kasStudentSelect?.value);
  }

  function highlightQuickPick(studentId) {
    if (!kasStudentQuickList) return;
    kasStudentQuickList.querySelectorAll('button').forEach((btn) => {
      if (studentId && btn.dataset.studentId === studentId) {
        btn.classList.add('border-brand-400', 'bg-brand-50', 'shadow-sm');
      } else {
        btn.classList.remove('border-brand-400', 'bg-brand-50', 'shadow-sm');
      }
    });
  }

  function renderWallets() {
    document.getElementById('walletDompetBalance').textContent = formatCurrency(state.wallets.dompet || 0);
  }

  function renderWithdrawals() {
    const body = document.getElementById('withdrawTableBody');
    body.innerHTML = '';
    const rows = [...state.withdrawHistory].sort((a, b) => new Date(b.tanggal) - new Date(a.tanggal));
    if (!rows.length) {
      body.innerHTML = '<tr><td colspan="4" class="px-4 py-4 text-center text-sm text-slate-500">Belum ada pengeluaran dompet</td></tr>';
    } else {
      rows.forEach((item) => {
        const row = document.createElement('tr');
        row.innerHTML = `
          <td class="px-3 py-2">${formatShortDate(item.tanggal)}</td>
          <td class="px-3 py-2 font-semibold">${formatCurrency(item.jumlah)}</td>
          <td class="px-3 py-2 text-slate-600">${item.alasan}</td>
          <td class="px-3 py-2 text-slate-500">${item.dibuatOleh}</td>
        `;
        body.appendChild(row);
      });
    }
  }

  function renderRekap(recapData) {
    const body = document.getElementById('recapTableBody');
    body.innerHTML = '';
    if (!recapData.length) {
      body.innerHTML = '<tr><td colspan="6" class="px-4 py-4 text-center text-sm text-slate-500">Belum ada data siswa</td></tr>';
      return;
    }
    recapData.forEach((item) => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td class="px-3 py-2 font-medium">${item.nama}</td>
        <td class="px-3 py-2 text-slate-500">${item.coverSampai ? formatShortDate(item.coverSampai) : '-'}</td>
        <td class="px-3 py-2 text-right font-semibold">${formatCurrency(item.totalBayar)}</td>
        <td class="px-3 py-2 text-right text-slate-600">${item.paidDays}</td>
        <td class="px-3 py-2 text-right text-slate-600">${item.outstandingDays}</td>
        <td class="px-3 py-2 text-right font-semibold ${item.outstandingAmount > 0 ? 'text-rose-600' : 'text-emerald-600'}">${formatCurrency(item.outstandingAmount)}</td>
      `;
      body.appendChild(row);
    });
  }

  function buildRecapData() {
    const expectedDays = getExpectedWorkingDays();
    const kasPerHari = state.settings.kasPerHari || 1000;
    return state.students
      .map((student) => {
        const studentTransactions = state.transactions.filter((trx) => trx.studentId === student.id);
        const totalBayar = studentTransactions.reduce((sum, trx) => sum + (trx.jumlah || 0), 0);
        const paidDays = studentTransactions.reduce((sum, trx) => sum + workingDaysBetween(trx.coverDari, trx.coverSampai), 0);
        const outstandingDays = Math.max(expectedDays - paidDays, 0);
        const outstandingAmount = outstandingDays * kasPerHari;
        const latestCover = studentTransactions
          .filter((trx) => trx.coverSampai)
          .sort((a, b) => new Date(b.coverSampai) - new Date(a.coverSampai))[0]?.coverSampai || null;
        return {
          studentId: student.id,
          nama: student.nama,
          totalBayar,
          paidDays,
          outstandingDays,
          outstandingAmount,
          coverSampai: latestCover
        };
      })
      .sort((a, b) => b.outstandingAmount - a.outstandingAmount);
  }

  function getExpectedWorkingDays() {
    const start = new Date(state.settings.startDate);
    const today = new Date();
    let end = new Date(state.settings.endDate);
    if (today < end) end = today;
    if (end < start) return 0;
    return countWorkingDays(start, end);
  }

  function handleStudentSubmit(event) {
    event.preventDefault();
    const nama = document.getElementById('studentName').value.trim();
    const nis = document.getElementById('studentNis').value.trim();
    const aktif = document.getElementById('studentActive').checked;
    if (!nama || !nis) {
      showAlert('Nama dan No Absen wajib diisi', 'error');
      return;
    }
    if (state.editingStudentId) {
      const index = state.students.findIndex((s) => s.id === state.editingStudentId);
      if (index !== -1) {
        state.students[index] = { ...state.students[index], nama, nis, aktif };
      }
      showAlert('Data siswa diperbarui');
    } else {
      const newStudent = {
        id: generateId('STD'),
        nama,
        nis,
        aktif,
        tanggalDaftar: formatISODate(new Date())
      };
      state.students.push(newStudent);
      showAlert('Siswa berhasil ditambahkan');
    }
    persist(STORAGE_KEYS.students, state.students);
    state.editingStudentId = null;
    studentForm.reset();
    document.getElementById('studentActive').checked = true;
    studentFormTitle.textContent = 'Tambah Siswa';
    studentSubmitBtn.textContent = 'Simpan';
    renderAll();
  }

  function startEditStudent(studentId) {
    const student = state.students.find((s) => s.id === studentId);
    if (!student) return;
    state.editingStudentId = studentId;
    document.getElementById('studentName').value = student.nama;
    document.getElementById('studentNis').value = student.nis;
    document.getElementById('studentActive').checked = student.aktif;
    studentFormTitle.textContent = 'Edit Siswa';
    studentSubmitBtn.textContent = 'Perbarui';
  }

  function deleteStudent(studentId) {
    const student = state.students.find((s) => s.id === studentId);
    if (!student) return;
    const confirmed = confirm(`Hapus ${student.nama}? Data transaksi tetap tersimpan.`);
    if (!confirmed) return;
    state.students = state.students.filter((s) => s.id !== studentId);
    persist(STORAGE_KEYS.students, state.students);
    showAlert('Siswa dihapus');
    renderAll();
  }

  function handleKasSubmit(event) {
    event.preventDefault();
    const studentId = kasStudentSelect.value;
    const nominal = Number(kasAmountInput.value || 0);
    if (!studentId) {
      showAlert('Pilih siswa terlebih dahulu', 'error');
      return;
    }
    if (!nominal || nominal <= 0) {
      showAlert('Nominal pembayaran wajib diisi', 'error');
      return;
    }
    const minimum = state.settings.kasPerHari || 1000;
    if (nominal < minimum) {
      showAlert(`Nominal minimal setara 1 hari kas (${formatCurrency(minimum)})`, 'error');
      return;
    }
    const hariCover = Math.floor(nominal / minimum);
    if (hariCover < 1) {
      showAlert('Nominal belum cukup untuk menutup 1 hari kas', 'error');
      return;
    }
    const tanggalBayar = formatISODate(new Date());
    const coverage = calculateCoverage(studentId, tanggalBayar, hariCover);
    const transaksiBaru = {
      id: generateId('KAS'),
      studentId,
      tanggalBayar,
      jumlah: nominal,
      metode: 'manual',
      coverDari: coverage.coverDari,
      coverSampai: coverage.coverSampai
    };
    state.transactions.push(transaksiBaru);
    state.wallets.dompet = (state.wallets.dompet || 0) + nominal;
    persist(STORAGE_KEYS.transactions, state.transactions);
    persist(STORAGE_KEYS.wallets, state.wallets);
    kasForm.reset();
    showAlert('Pembayaran kas tersimpan');
    renderAll();
  }

  function calculateCoverage(studentId, tanggalBayar, hariCover) {
    const lastCover = getLastCoverageDate(studentId);
    const startSetting = new Date(state.settings.startDate);
    let startDate;
    if (lastCover) {
      startDate = nextWorkingDay(new Date(lastCover));
    } else {
      const bayarDate = alignToWorkingDay(new Date(tanggalBayar));
      startDate = bayarDate < startSetting ? alignToWorkingDay(startSetting) : bayarDate;
    }
    const range = expandWorkingDays(startDate, hariCover);
    return { coverDari: range.from, coverSampai: range.to };
  }

  function getLastCoverageDate(studentId) {
    const trx = state.transactions
      .filter((item) => item.studentId === studentId)
      .sort((a, b) => new Date(b.coverSampai) - new Date(a.coverSampai))[0];
    return trx ? trx.coverSampai : null;
  }

  function handleWithdrawSubmit(event) {
    event.preventDefault();
    const tanggal = withdrawDateInput.value;
    const jumlah = Number(document.getElementById('withdrawAmount').value || 0);
    const alasan = document.getElementById('withdrawReason').value.trim();
    const dibuatOleh = document.getElementById('withdrawAuthor').value.trim();
    if (!tanggal || !jumlah || !alasan || !dibuatOleh) {
      showAlert('Lengkapi data penarikan', 'error');
      return;
    }
    if (jumlah > (state.wallets.dompet || 0)) {
      showAlert('Saldo dompet tidak mencukupi', 'error');
      return;
    }
    const entry = {
      id: generateId('WD'),
      tanggal,
      jumlah,
      alasan,
      dibuatOleh
    };
    state.wallets.dompet -= jumlah;
    state.withdrawHistory.push(entry);
    persist(STORAGE_KEYS.wallets, state.wallets);
    persist(STORAGE_KEYS.withdraw, state.withdrawHistory);
    withdrawForm.reset();
    setDefaultDates();
    showAlert('Pengeluaran dompet dicatat');
    renderAll();
  }

  function handleSettingsSubmit(event) {
    event.preventDefault();
    const kasPerHari = Number(document.getElementById('settingKasPerHari').value || 1000);
    const startDate = document.getElementById('settingStartDate').value;
    const endDate = document.getElementById('settingEndDate').value;
    const tahunAjar = document.getElementById('settingSchoolYear').value.trim();
    if (new Date(endDate) < new Date(startDate)) {
      showAlert('Tanggal akhir tidak boleh sebelum tanggal mulai', 'error');
      return;
    }
    state.settings = {
      kasPerHari,
      startDate,
      endDate,
      tahunAjar: tahunAjar || '2025'
    };
    persist(STORAGE_KEYS.settings, state.settings);
    document.getElementById('activeSchoolYear').textContent = state.settings.tahunAjar;
    showAlert('Pengaturan diperbarui');
    renderAll();
  }

  function handleResetData() {
    const confirmed = confirm('Semua data akan dihapus dan direset. Lanjutkan?');
    if (!confirmed) return;
    Object.values(STORAGE_KEYS).forEach((key) => localStorage.removeItem(key));
    initStorage();
    loadState();
    populateSettingsForm();
    setDefaultDates();
    showAlert('Aplikasi kembali ke kondisi awal');
    renderAll();
    showSection('section-dashboard');
  }

  function handleManualSave(event) {
    if (event) event.preventDefault();
    persistAllState();
    showAlert('Seluruh data kas tersimpan ke penyimpanan lokal');
  }

  function persistAllState() {
    persist(STORAGE_KEYS.students, state.students);
    persist(STORAGE_KEYS.transactions, state.transactions);
    persist(STORAGE_KEYS.wallets, state.wallets);
    persist(STORAGE_KEYS.withdraw, state.withdrawHistory);
    persist(STORAGE_KEYS.settings, state.settings);
  }

  function handleBackupData() {
    const payload = {
      students: state.students,
      transactions: state.transactions,
      wallets: state.wallets,
      withdrawHistory: state.withdrawHistory,
      settings: state.settings
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `kaskelas-backup-${state.settings.tahunAjar || 'data'}-${Date.now()}.json`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
    showAlert('Backup data berhasil diunduh');
  }

  function handleImportData(event) {
    const input = event.target;
    const file = input.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(reader.result);
        const requiredKeys = ['students', 'transactions', 'wallets', 'withdrawHistory', 'settings'];
        if (!requiredKeys.every((key) => Object.prototype.hasOwnProperty.call(parsed, key))) {
          throw new Error('Invalid format');
        }
        state.students = Array.isArray(parsed.students) ? parsed.students : [];
        state.transactions = Array.isArray(parsed.transactions) ? parsed.transactions : [];
        state.wallets = parsed.wallets || { dompet: 0 };
        state.withdrawHistory = Array.isArray(parsed.withdrawHistory) ? parsed.withdrawHistory : [];
        state.settings = { ...DEFAULT_SETTINGS, ...(parsed.settings || {}) };
        document.getElementById('activeSchoolYear').textContent = state.settings.tahunAjar;
        state.selectedStatusStudentId = null;
        persistAllState();
        if (kasStudentSearchInput) kasStudentSearchInput.value = '';
        populateSettingsForm();
        setDefaultDates();
        renderAll();
        showAlert('Backup berhasil diimpor');
      } catch (error) {
        console.error('Failed to import backup', error);
        showAlert('Gagal mengimpor data. Pastikan file backup benar.', 'error');
      } finally {
        input.value = '';
      }
    };
    reader.readAsText(file);
  }

  function renderKasTrend() {
    if (!kasTrendBars) return;
    const barsData = buildKasTrendData();
    kasTrendBars.innerHTML = '';
    if (!barsData.length) {
      kasTrendBars.innerHTML = '<p class="text-xs text-slate-400">Belum ada pergerakan kas untuk divisualisasikan.</p>';
      return;
    }
    const maxValue = Math.max(...barsData.map((item) => item.value)) || 1;
    barsData.forEach((bar) => {
      const height = Math.max((bar.value / maxValue) * 100, 8);
      const wrapper = document.createElement('div');
      wrapper.className = 'flex flex-col items-center gap-2 text-[11px] text-slate-500 flex-1';
      wrapper.title = formatCurrency(bar.value);
      wrapper.innerHTML = `
        <div class="flex h-24 w-full items-end justify-center">
          <div class="w-4 rounded-full bg-slate-100">
            <div class="w-full rounded-full bg-gradient-to-t from-brand-200 to-brand-500" style="height: ${height}%"></div>
          </div>
        </div>
        <span>${bar.label}</span>
      `;
      kasTrendBars.appendChild(wrapper);
    });
  }

  function buildKasTrendData(limit = 7) {
    if (!state.transactions.length) return [];
    return [...state.transactions]
      .sort((a, b) => new Date(a.tanggalBayar) - new Date(b.tanggalBayar))
      .slice(-limit)
      .map((trx) => ({
        label: new Date(trx.tanggalBayar).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' }),
        value: trx.jumlah || 0
      }));
  }

  function renderStudentStatusBoard(recapData, expectedWorkingDays) {
    const board = document.getElementById('studentStatusBoard');
    if (!board) return;
    board.innerHTML = '';
    if (!recapData.length) {
      board.innerHTML = '<p class="text-sm text-slate-500">Belum ada data siswa untuk ditampilkan.</p>';
      state.selectedStatusStudentId = null;
      if (studentStatusDetailBody) {
        studentStatusDetailBody.textContent = 'Belum ada data status siswa.';
      }
      return;
    }

    const availableIds = recapData.map((item) => item.studentId);
    if (state.selectedStatusStudentId && !availableIds.includes(state.selectedStatusStudentId)) {
      state.selectedStatusStudentId = null;
    }
    if (!state.selectedStatusStudentId && studentStatusDetailBody) {
      studentStatusDetailBody.textContent = 'Pilih status siswa untuk menampilkan rincian tanggal.';
    }

    [...recapData]
      .sort((a, b) => a.nama.localeCompare(b.nama))
      .forEach((item) => {
        const info = getStudentStatusInfo(item, expectedWorkingDays);
        const isActive = state.selectedStatusStudentId === item.studentId;
        const cardButton = document.createElement('button');
        cardButton.type = 'button';
        cardButton.className = `text-left rounded-2xl border bg-white p-4 shadow-sm transition-all hover:border-brand-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-200 ${
          isActive ? 'border-brand-400 ring-2 ring-brand-100' : 'border-slate-200'
        }`;
        const width = Math.min(Math.max(info.progress, 0), 100);
        cardButton.innerHTML = `
          <div class="flex items-center justify-between gap-2">
            <p class="font-semibold text-slate-900">${item.nama}</p>
            <span class="inline-flex items-center rounded-full px-3 py-1 text-[11px] font-semibold ${info.badgeClass}">${info.badgeText}</span>
          </div>
          <div class="mt-3 flex items-center justify-between text-[11px] text-slate-500">
            <span>${info.dateLabel}</span>
            <span class="font-semibold text-slate-900">${info.dateValue}</span>
          </div>
          <div class="mt-3 h-2 w-full rounded-full bg-slate-100 overflow-hidden">
            <div class="h-full ${info.indicatorClass}" style="width: ${width}%"></div>
          </div>
          <div class="mt-2 flex items-center justify-between text-[11px] text-slate-500">
            <span>Tunggakan</span>
            <span class="font-semibold ${item.outstandingAmount > 0 ? 'text-rose-600' : 'text-emerald-600'}">${formatCurrency(item.outstandingAmount)}</span>
          </div>
        `;
        cardButton.addEventListener('click', () => {
          state.selectedStatusStudentId = item.studentId;
          renderStudentStatusBoard(recapData, expectedWorkingDays);
        });
        board.appendChild(cardButton);
      });

    if (state.selectedStatusStudentId) {
      const target = recapData.find((item) => item.studentId === state.selectedStatusStudentId);
      if (target) {
        const info = getStudentStatusInfo(target, expectedWorkingDays);
        renderStudentStatusDetail(target, info);
      }
    }
  }

  function renderStudentStatusDetail(item, info) {
    if (!studentStatusDetailBody) return;
    studentStatusDetailBody.innerHTML = `
      <div class="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <p class="text-xs text-slate-500">Siswa</p>
          <p class="text-lg font-semibold text-slate-900">${item.nama}</p>
        </div>
        <span class="inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${info.badgeClass}">${info.badgeText}</span>
      </div>
      <div class="mt-4 grid gap-2 text-sm">
        <div class="flex items-center justify-between text-slate-500">
          <span>${info.dateLabel}</span>
          <span class="font-semibold text-slate-900">${info.dateValue}</span>
        </div>
        <div class="flex items-center justify-between text-slate-500">
          <span>Hari terbayar</span>
          <span class="font-semibold text-slate-900">${item.paidDays}</span>
        </div>
        <div class="flex items-center justify-between text-slate-500">
          <span>Tunggakan</span>
          <span class="font-semibold ${item.outstandingAmount > 0 ? 'text-rose-600' : 'text-emerald-600'}">${formatCurrency(item.outstandingAmount)}</span>
        </div>
      </div>
      <p class="mt-3 text-xs text-slate-500">${info.detailDescription}</p>
    `;
  }

  function getStudentStatusInfo(item, expectedWorkingDays) {
    const today = alignToWorkingDay(new Date());
    const todayISO = formatISODate(today);
    const coverDate = item.coverSampai ? new Date(item.coverSampai) : null;
    const outstandingDays = item.outstandingDays;
    const outstandingAmount = item.outstandingAmount;
    const progress = expectedWorkingDays > 0 ? Math.min((item.paidDays / expectedWorkingDays) * 100, 100) : 0;
    const startAligned = alignToWorkingDay(new Date(state.settings.startDate));
    const startLabel = formatShortDate(formatISODate(startAligned));

    if (!coverDate) {
      return {
        badgeText: 'Belum Bayar',
        badgeClass: 'bg-rose-50 text-rose-700',
        dateLabel: 'Mulai menunggak',
        dateValue: startLabel,
        detailDescription: `Belum ada pembayaran tercatat. Total tunggakan ${formatCurrency(outstandingAmount)}.`,
        indicatorClass: 'bg-rose-500',
        progress: expectedWorkingDays ? progress : 0
      };
    }

    if (outstandingDays > 0) {
      const overdueStart = formatShortDate(formatISODate(nextWorkingDay(coverDate)));
      return {
        badgeText: 'Menunggak',
        badgeClass: 'bg-rose-50 text-rose-700',
        dateLabel: 'Menunggak sejak',
        dateValue: overdueStart,
        detailDescription: `${outstandingDays} hari tertunggak (${formatCurrency(outstandingAmount)}).`,
        indicatorClass: 'bg-rose-500',
        progress
      };
    }

    const aheadDays = Math.max(workingDaysBetween(todayISO, formatISODate(coverDate)) - 1, 0);
    const badgeText = aheadDays > 0 ? 'Bayar di muka' : 'Up to date';
    const description = aheadDays > 0 ? `Sudah menutup ${aheadDays} hari ke depan.` : 'Selaras dengan jadwal kas.';
    return {
      badgeText,
      badgeClass: 'bg-emerald-50 text-emerald-700',
      dateLabel: 'Lunas sampai',
      dateValue: formatShortDate(coverDate),
      detailDescription: description,
      indicatorClass: 'bg-emerald-500',
      progress: expectedWorkingDays ? Math.min(progress, 100) : 100
    };
  }

  function buildWorkingDateSequence(start, days) {
    const sequence = [];
    let current = new Date(start);
    while (sequence.length < days) {
      if (isWorkingDay(current)) {
        sequence.push(new Date(current));
      }
      current.setDate(current.getDate() + 1);
    }
    return sequence;
  }

  function expandWorkingDays(startDate, totalDays) {
    if (totalDays <= 1) {
      const aligned = alignToWorkingDay(startDate);
      return { from: formatISODate(aligned), to: formatISODate(aligned) };
    }
    const sequence = buildWorkingDateSequence(startDate, totalDays);
    const first = sequence[0];
    const last = sequence[sequence.length - 1];
    return { from: formatISODate(first), to: formatISODate(last) };
  }

  function workingDaysBetween(from, to) {
    if (!from || !to) return 0;
    const start = new Date(from);
    const end = new Date(to);
    if (end < start) return 0;
    let total = 0;
    const cursor = new Date(start);
    while (cursor <= end) {
      if (isWorkingDay(cursor)) total += 1;
      cursor.setDate(cursor.getDate() + 1);
    }
    return total;
  }

  function countWorkingDays(start, end) {
    if (end < start) return 0;
    let total = 0;
    const cursor = new Date(start);
    while (cursor <= end) {
      if (isWorkingDay(cursor)) total += 1;
      cursor.setDate(cursor.getDate() + 1);
    }
    return total;
  }

  function isWorkingDay(date) {
    const day = date.getDay();
    return day >= 1 && day <= 5;
  }

  function alignToWorkingDay(date) {
    const copy = new Date(date);
    const day = copy.getDay();
    if (day === 6) {
      copy.setDate(copy.getDate() + 2);
    } else if (day === 0) {
      copy.setDate(copy.getDate() + 1);
    }
    return copy;
  }

  function nextWorkingDay(date) {
    const next = new Date(date);
    next.setDate(next.getDate() + 1);
    return alignToWorkingDay(next);
  }

  function findStudent(id) {
    return state.students.find((student) => student.id === id) || null;
  }

  function formatCurrency(value) {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0
    }).format(value || 0);
  }

  function formatShortDate(value) {
    if (!value) return '-';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
  }

  function formatISODate(date) {
    return date.toISOString().split('T')[0];
  }

  function generateId(prefix) {
    const random = Math.floor(Math.random() * 9999)
      .toString()
      .padStart(4, '0');
    return `${prefix}-${Date.now()}-${random}`;
  }

  function persist(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  function showAlert(message, type = 'success') {
    if (!alertContainer) return;
    const div = document.createElement('div');
    div.className = `rounded-xl border px-4 py-3 text-sm ${type === 'error' ? 'bg-rose-50 border-rose-100 text-rose-700' : 'bg-emerald-50 border-emerald-100 text-emerald-700'}`;
    div.textContent = message;
    alertContainer.appendChild(div);
    setTimeout(() => {
      div.remove();
    }, 3500);
  }

  function showSection(sectionId) {
    document.querySelectorAll('[data-section]').forEach((section) => {
      if (section.id === sectionId) {
        section.classList.remove('hidden');
      } else {
        section.classList.add('hidden');
      }
    });
    setActiveNav(sectionId);
  }

  function setActiveNav(sectionId) {
    navButtons.forEach((btn) => {
      if (btn.dataset.target === sectionId) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });
  }
});
