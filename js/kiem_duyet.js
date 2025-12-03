// --- 1. MOCK DATA ---
let submissions = [
  {
    id: 101,
    employee: "Trần Văn B",
    area: "Khu vực Kho - Kệ A1",
    task: "Sắp xếp hàng hóa",
    time: "08:15 03/12/2023",
    photo: "https://via.placeholder.com/600x800?text=Anh+Bao+Cao+1",
    status: "pending", // pending, approved, rejected
    gps: "21.0285, 105.8542"
  },
  {
    id: 102,
    employee: "Lê Thị C",
    area: "Khu vực Sảnh - Lễ tân",
    task: "Vệ sinh sàn",
    time: "08:30 03/12/2023",
    photo: "https://via.placeholder.com/600x800?text=Anh+Bao+Cao+2",
    status: "approved",
    gps: "21.0285, 105.8542"
  },
  {
    id: 103,
    employee: "Phạm Văn D",
    area: "Nhà xe - B1",
    task: "Kiểm tra PCCC",
    time: "09:00 03/12/2023",
    photo: "https://via.placeholder.com/600x800?text=Anh+Bao+Cao+3",
    status: "pending",
    gps: "21.0285, 105.8542"
  }
];

let currentTab = 'pending';
let currentReviewId = null;
let zoomLevel = 1;
let rotation = 0;

// --- 2. RENDER LOGIC ---
const renderFeed = () => {
  const container = document.getElementById('submission-feed');
  container.innerHTML = '';

  // Filter logic
  const filteredItems = submissions.filter(item => {
    if (currentTab === 'pending') return item.status === 'pending';
    return item.status !== 'pending';
  });

  // Update Badge
  const pendingCount = submissions.filter(i => i.status === 'pending').length;
  document.getElementById('badge-count').textContent = pendingCount;
  document.getElementById('badge-count').style.display = pendingCount > 0 ? 'inline-block' : 'none';

  // Empty State
  if (filteredItems.length === 0) {
    const tpl = document.getElementById('empty-state-tpl');
    container.appendChild(tpl.content.cloneNode(true));
    return;
  }

  // Render Items
  filteredItems.forEach(item => {
    const card = document.createElement('article');
    card.className = `review-card status-${item.status}`;

    let actionButtons = '';
    if (item.status === 'pending') {
      actionButtons = `
                <button class="action-btn-sm btn-reject" onclick="initReject(${item.id})" title="Từ chối">✕</button>
                <button class="action-btn-sm btn-approve" onclick="quickApprove(${item.id})" title="Duyệt">✓</button>
            `;
    } else {
      // Show badge for history
      const label = item.status === 'approved' ? 'Đã duyệt' : 'Đã từ chối';
      const color = item.status === 'approved' ? 'green' : 'red';
      actionButtons = `<span style="font-size:12px; font-weight:bold; color:${color}">${label}</span>`;
    }

    card.innerHTML = `
            <img src="${item.photo}" class="card-thumb" onclick="openDetail(${item.id})" alt="Thumb">
            <div class="card-content" onclick="openDetail(${item.id})">
                <div class="emp-name">${item.employee}</div>
                <div class="area-info">${item.area}</div>
                <div class="time-stamp">${item.time}</div>
            </div>
            <div class="card-actions">
                ${actionButtons}
            </div>
        `;
    container.appendChild(card);
  });
};

const switchTab = (tabName) => {
  currentTab = tabName;
  document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
  document.querySelector(`.tab-btn[data-tab="${tabName}"]`).classList.add('active');
  renderFeed();
};

// --- 3. ACTIONS: APPROVE & REJECT ---

const quickApprove = async (id) => {
  if (!confirm('Xác nhận DUYỆT báo cáo này?')) return;

  // Optimistic UI update
  const index = submissions.findIndex(i => i.id === id);
  if (index !== -1) {
    submissions[index].status = 'approved';

    // If in detail view, close it
    closeDetail();

    // Show simplified toast (alert for now)
    // alert(`Đã duyệt báo cáo của ${submissions[index].employee}`);

    renderFeed();
  }
};

const initReject = (id) => {
  currentReviewId = id; // Store ID for Modal
  openRejectModal();
};

// --- 4. DETAIL VIEW LOGIC ---

const openDetail = (id) => {
  const item = submissions.find(i => i.id === id);
  if (!item) return;

  currentReviewId = id;

  // Populate Data
  document.getElementById('detail-image').src = item.photo;
  document.getElementById('detail-emp-name').textContent = item.employee;
  document.getElementById('detail-task-name').textContent = item.task;
  document.getElementById('detail-loc').textContent = item.gps;
  document.getElementById('detail-time').textContent = item.time;

  // Reset Zoom/Rotate
  zoomLevel = 1;
  rotation = 0;
  applyImageTransform();

  // Show/Hide Decision Buttons based on status
  const btnGroup = document.querySelector('.decision-panel .button-group');
  if (item.status !== 'pending') {
    btnGroup.style.display = 'none';
  } else {
    btnGroup.style.display = 'flex';
  }

  document.getElementById('scr-detail').classList.remove('hidden');
};

const closeDetail = () => {
  document.getElementById('scr-detail').classList.add('hidden');
};

// Image Transform Logic
const transformImage = (type) => {
  if (type === 'zoom-in') zoomLevel += 0.2;
  if (type === 'zoom-out' && zoomLevel > 0.4) zoomLevel -= 0.2;
  if (type === 'rotate') rotation += 90;
  applyImageTransform();
};

const applyImageTransform = () => {
  const img = document.getElementById('detail-image');
  img.style.transform = `scale(${zoomLevel}) rotate(${rotation}deg)`;
};

// --- 5. MODAL LOGIC ---
const modal = document.getElementById('scr-reject-modal');
const rejectForm = document.getElementById('reject-form');

const openRejectModal = () => {
  document.getElementById('reject-reason').value = '';
  document.getElementById('modal-error').classList.add('hidden');
  modal.showModal();
};

const closeRejectModal = () => {
  modal.close();
};

rejectForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const reason = document.getElementById('reject-reason').value.trim();

  if (reason.length < 5) {
    document.getElementById('modal-error').classList.remove('hidden');
    return;
  }

  // Process Reject
  const index = submissions.findIndex(i => i.id === currentReviewId);
  if (index !== -1) {
    submissions[index].status = 'rejected';
    submissions[index].rejectReason = reason;

    closeRejectModal();
    closeDetail();
    renderFeed();
    // alert("Đã gửi phản hồi từ chối.");
  }
});

// --- INIT ---
document.addEventListener('DOMContentLoaded', renderFeed);
