// --- 1. MOCK DATA (DỮ LIỆU GIẢ LẬP) ---
const appState = {
  currentUser: { name: "Nguyễn Văn A", area: "Kho vận" },
  currentDate: new Date("2025-12-04"), // Cố định ngày 04/12/2025
  tasks: [
    // 1. Công việc ĐANG MỞ (Cần làm ngay)
    {
      id: 601,
      name: "Kiểm đếm hàng nhập sáng",
      time: "08:15 - 09:00",
      status: "open",
      description: "Kiểm tra số lượng và tình trạng lô hàng A.",
      photosRequired: [
        { id: "p1", label: "1. Ảnh phiếu nhập kho", required: true },
        { id: "p2", label: "2. Ảnh toàn cảnh hàng hóa", required: true }
      ]
    },
    // 2. Công việc ĐÃ HOÀN THÀNH (Đã gửi ảnh & Được duyệt)
    {
      id: 602,
      name: "Kiểm tra an toàn PCCC",
      time: "07:30 - 08:00",
      status: "approved",
      description: "Chụp ảnh các bình cứu hỏa tại khu vực kho.",
      photosRequired: []
    },
    // 3. Công việc BỊ TỪ CHỐI (Cần chụp lại)
    {
      id: 605,
      name: "Sắp xếp pallet khu C",
      time: "09:30 - 10:00",
      status: "rejected",
      description: "Yêu cầu: Xếp thẳng hàng, không chồng quá cao.",
      photosRequired: [
        { id: "p1", label: "1. Ảnh hàng pallet", required: true }
      ]
    },
    // 4. Công việc CHƯA ĐẾN GIỜ (Tương lai)
    {
      id: 606,
      name: "Vệ sinh kệ kho B",
      time: "16:00 - 17:00",
      status: "pending",
      photosRequired: []
    }
  ],
  currentTaskId: null,
  uploads: {} // Lưu ảnh đã chụp tạm thời
};

// --- 2. DOM ELEMENTS (CÁC THÀNH PHẦN GIAO DIỆN) ---
const screens = {
  home: document.getElementById('scr-home'),
  detail: document.getElementById('scr-detail'),
  modal: document.getElementById('scr-success')
};

// --- 3. HELPER FUNCTIONS (HÀM HỖ TRỢ) ---
const formatDate = (date) => {
  return new Intl.DateTimeFormat('vi-VN', {
    weekday: 'long',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).format(date);
};

const switchScreen = (screenName) => {
  // Ẩn tất cả màn hình
  Object.values(screens).forEach(el => el.classList.add('hidden'));
  // Hiện màn hình cần chuyển đến
  screens[screenName].classList.remove('hidden');
  window.scrollTo(0, 0);
};

// --- 4. RENDER LOGIC (LOGIC HIỂN THỊ) ---

// Hiển thị Màn hình chính (Home)
const renderHome = () => {
  document.getElementById('user-name').textContent = appState.currentUser.name;
  document.getElementById('user-area').textContent = appState.currentUser.area;
  document.getElementById('date-display').textContent = formatDate(appState.currentDate);

  const openTask = appState.tasks.find(t => t.status === 'open');
  const banner = document.getElementById('notification-banner');
  if (openTask) {
    banner.classList.remove('hidden');
    document.getElementById('banner-message').textContent = `⚡ Việc cần làm ngay: "${openTask.name}"`;
  } else {
    banner.classList.add('hidden');
  }

  const listEl = document.getElementById('task-list');
  listEl.innerHTML = '';

  appState.tasks.forEach(task => {
    const li = document.createElement('li');
    li.className = `task-item status-${task.status}`;

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

    li.innerHTML = `
            <div class="task-info-group">
                <div class="task-name">${task.name}</div>
                <div class="task-time">🕒 ${task.time}</div>
            </div>
            <div class="status-badge ${badgeClass}">
                ${icon} ${statusLabel}
            </div>
        `;

    if (task.status === 'open' || task.status === 'rejected') {
      li.style.cursor = 'pointer';
      li.addEventListener('click', () => openTaskDetail(task.id));
    } else {
      li.style.cursor = 'default';
      li.style.opacity = '0.7';
    }

    listEl.appendChild(li);
  });
};

// Logic mở màn hình chi tiết (Detail)
const openTaskDetail = (taskId) => {
  appState.currentTaskId = taskId;
  const task = appState.tasks.find(t => t.id === taskId);
  appState.uploads = {};

  document.getElementById('detail-title').textContent = task.name;
  renderPhotoSlots(task);
  checkSubmitStatus(task);
  switchScreen('detail');
};

// Hiển thị các ô chụp ảnh (Photo Slots)
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

            <label for="file-${photo.id}" class="btn-primary" style="margin-top:15px; width:auto; display:inline-flex; align-items: center; gap: 5px;">
                📷 Chụp ảnh
            </label>
            <input type="file" id="file-${photo.id}" accept="image/*" capture="environment" class="hidden">
        `;

    container.appendChild(slot);

    const input = slot.querySelector(`#file-${photo.id}`);
    input.addEventListener('change', (e) => handleFileUpload(e, photo.id, index, task));
  });
};

// --- PHẦN 3 MÀ BẠN THẮC MẮC NẰM Ở ĐÂY ---
const handleFileUpload = (e, photoId, index, task) => {
  const file = e.target.files[0];
  if (!file) return;

  if (index > 0) {
    const prevId = task.photosRequired[index - 1].id;
    if (!appState.uploads[prevId]) {
      alert("⚠️ Vui lòng hoàn thành ảnh trước đó theo thứ tự!");
      e.target.value = '';
      return;
    }
  }

  const reader = new FileReader();
  reader.onload = (event) => {
    appState.uploads[photoId] = event.target.result;

    const slot = document.getElementById(`slot-${photoId}`);
    slot.classList.add('uploaded');

    // === ĐÂY LÀ ĐOẠN CODE ĐÃ ĐƯỢC SỬA ===
    // Mục đích: Đổi nút từ "Chụp ảnh" (Màu xanh đặc) sang "Chụp lại" (Nền trắng viền xanh)
    const btnLabel = slot.querySelector(`label`);
    btnLabel.innerHTML = "🔄 Chụp lại"; // Đổi chữ

    // Xóa class cũ (btn-primary: nút xanh)
    btnLabel.classList.remove('btn-primary');

    // Thêm class mới (btn-outline-primary: nút viền xanh)
    btnLabel.classList.add('btn-outline-primary');

    // Reset một số style để đảm bảo class mới hoạt động đúng
    btnLabel.style.width = 'auto';
    btnLabel.style.marginTop = '15px';
    // ======================================

    const previewArea = document.getElementById(`preview-area-${photoId}`);
    previewArea.innerHTML = `<img src="${event.target.result}" alt="Evidence">`;

    checkSubmitStatus(task);
  };
  reader.readAsDataURL(file);
};

// Kiểm tra trạng thái nút Gửi báo cáo
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

// --- 5. INITIALIZATION (KHỞI CHẠY) ---
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
      task.status = 'approved';
      renderHome();

    } catch (error) {
      alert("Có lỗi xảy ra. Vui lòng thử lại.");
    } finally {
      btn.innerHTML = "Gửi báo cáo";
    }
  });

  document.getElementById('btn-home').addEventListener('click', () => {
    screens.modal.classList.add('hidden');
    switchScreen('home');
  });
});
