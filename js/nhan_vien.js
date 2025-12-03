// --- 1. MOCK DATA & STATE ---
const appState = {
  currentUser: { name: "Nguyễn Văn A", area: "Kho Hàng A" },
  currentDate: new Date(),
  tasks: [
    {
      id: 1,
      name: "Kiểm tra hàng nhập",
      time: "08:00 - 09:00",
      status: "approved",
      photosRequired: []
    },
    {
      id: 2,
      name: "Vệ sinh khu vực kệ B",
      time: "10:00 - 11:00",
      status: "open",
      description: "Chụp ảnh trước và sau khi dọn.",
      photosRequired: [
        { id: "p1", label: "1. Ảnh tổng quan kệ B", required: true },
        { id: "p2", label: "2. Ảnh chi tiết sàn nhà", required: true }
      ]
    },
    {
      id: 3,
      name: "Báo cáo tồn kho",
      time: "16:00 - 17:00",
      status: "pending",
      photosRequired: []
    }
  ],
  currentTaskId: null,
  uploads: {}
};

// --- 2. DOM ELEMENTS ---
const screens = {
  home: document.getElementById('scr-home'),
  detail: document.getElementById('scr-detail'),
  modal: document.getElementById('scr-success')
};

// --- 3. HELPER FUNCTIONS ---
const formatDate = (date) => new Intl.DateTimeFormat('vi-VN', { weekday: 'long', day: '2-digit', month: '2-digit' }).format(date);

const switchScreen = (screenName) => {
  Object.values(screens).forEach(el => el.classList.add('hidden'));
  screens[screenName].classList.remove('hidden');
  window.scrollTo(0, 0);
};

// --- 4. RENDER LOGIC ---

// Render Home Screen
const renderHome = () => {
  document.getElementById('user-name').textContent = appState.currentUser.name;
  document.getElementById('user-area').textContent = appState.currentUser.area;
  document.getElementById('date-display').textContent = formatDate(appState.currentDate);

  // Render Banner Logic
  const openTask = appState.tasks.find(t => t.status === 'open');
  const banner = document.getElementById('notification-banner');
  if (openTask) {
    banner.classList.remove('hidden');
    document.getElementById('banner-message').textContent = `⚡ Việc cần làm ngay: "${openTask.name}"`;
  }

  // Render List
  const listEl = document.getElementById('task-list');
  listEl.innerHTML = '';

  appState.tasks.forEach(task => {
    const li = document.createElement('li');
    li.className = `task-item status-${task.status}`;

    // Tạo nội dung HTML cho Badge và Icon
    let badgeClass = 'badge-pending';
    let statusLabel = 'Chưa đến giờ';
    let icon = '🔒';

    if (task.status === 'open') {
      badgeClass = 'badge-open';
      statusLabel = 'Đang mở';
      icon = '📸';
    } else if (task.status === 'approved') {
      badgeClass = 'badge-approved';
      statusLabel = 'Đạt';
      icon = '✅';
    } else if (task.status === 'rejected') {
      badgeClass = 'badge-rejected';
      statusLabel = 'Sửa lại';
      icon = '⚠️';
    }

    // HTML Template mới (Card Layout)
    li.innerHTML = `
            <div class="task-info-group">
                <div class="task-name">${task.name}</div>
                <div class="task-time">🕒 ${task.time}</div>
            </div>
            <div class="status-badge ${badgeClass}">
                ${icon} ${statusLabel}
            </div>
        `;

    // Click Handler
    if (task.status === 'open' || task.status === 'rejected') {
      li.addEventListener('click', () => openTaskDetail(task.id));
    }

    listEl.appendChild(li);
  });
};

// Logic Open Detail
const openTaskDetail = (taskId) => {
  appState.currentTaskId = taskId;
  const task = appState.tasks.find(t => t.id === taskId);
  appState.uploads = {};

  document.getElementById('detail-title').textContent = task.name;
  renderPhotoSlots(task);
  checkSubmitStatus(task);
  switchScreen('detail');
};

// Render Photo Slots
const renderPhotoSlots = (task) => {
  const container = document.getElementById('photo-slots');
  container.innerHTML = '';

  task.photosRequired.forEach((photo, index) => {
    const slot = document.createElement('div');
    slot.className = 'photo-slot';
    slot.id = `slot-${photo.id}`;

    slot.innerHTML = `
            <span class="slot-header">${photo.label}</span>
            <div id="preview-area-${photo.id}" class="preview-container"></div>

            <label for="file-${photo.id}" class="btn-primary" style="margin-top:15px; width:auto; display:inline-flex;">
                📷 Chụp ảnh
            </label>
            <input type="file" id="file-${photo.id}" accept="image/*" capture="environment" class="hidden">
        `;

    container.appendChild(slot);

    const input = slot.querySelector(`#file-${photo.id}`);
    input.addEventListener('change', (e) => handleFileUpload(e, photo.id, index, task));
  });
};

// Handle File Upload
const handleFileUpload = (e, photoId, index, task) => {
  const file = e.target.files[0];
  if (!file) return;

  if (index > 0) {
    const prevId = task.photosRequired[index - 1].id;
    if (!appState.uploads[prevId]) {
      alert("⚠️ Vui lòng hoàn thành ảnh trước đó!");
      e.target.value = '';
      return;
    }
  }

  const reader = new FileReader();
  reader.onload = (event) => {
    appState.uploads[photoId] = event.target.result;

    // Update UI
    const slot = document.getElementById(`slot-${photoId}`);
    slot.classList.add('uploaded');

    // Change button text
    const btnLabel = slot.querySelector(`label`);
    btnLabel.textContent = "🔄 Chụp lại";
    btnLabel.style.backgroundColor = "white";
    btnLabel.style.color = "var(--primary-color)";
    btnLabel.style.border = "1px solid var(--primary-color)";

    const previewArea = document.getElementById(`preview-area-${photoId}`);
    previewArea.innerHTML = `<img src="${event.target.result}" alt="Evidence">`;

    checkSubmitStatus(task);
  };
  reader.readAsDataURL(file);
};

// Check Button State
const checkSubmitStatus = (task) => {
  const btn = document.getElementById('btn-submit');
  const msg = document.getElementById('submit-msg');

  const requiredIds = task.photosRequired.map(p => p.id);
  const allUploaded = requiredIds.every(id => appState.uploads[id]);

  if (allUploaded) {
    btn.disabled = false;
    msg.classList.add('hidden');
  } else {
    btn.disabled = true;
    msg.classList.remove('hidden');
  }
};

// --- 5. EVENT HANDLERS ---
document.addEventListener('DOMContentLoaded', () => {
  renderHome();

  document.getElementById('btn-back').addEventListener('click', () => {
    switchScreen('home');
  });

  document.getElementById('btn-submit').addEventListener('click', async () => {
    const btn = document.getElementById('btn-submit');
    try {
      btn.innerHTML = "⏳ Đang gửi...";
      btn.disabled = true;

      await new Promise(r => setTimeout(r, 1000));

      screens.detail.classList.add('hidden');
      screens.modal.classList.remove('hidden');

      const task = appState.tasks.find(t => t.id === appState.currentTaskId);
      task.status = 'approved'; // Mock auto-approve for demo visual
      renderHome();

    } catch (error) {
      alert("Có lỗi xảy ra.");
    } finally {
      btn.textContent = "Gửi báo cáo";
    }
  });

  document.getElementById('btn-home').addEventListener('click', () => {
    screens.modal.classList.add('hidden');
    switchScreen('home');
  });
});
