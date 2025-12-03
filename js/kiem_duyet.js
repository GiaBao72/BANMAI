// --- 1. MOCK DATA (Đồng bộ) ---
const TODAY = "2025-12-04";

const reports = [
  { id: 601, emp: "Nguyễn Văn A", dept: "Kho vận", task: "Kiểm đếm hàng nhập sáng", time: "08:15", status: "pending", date: "2025-12-04" },
  { id: 602, emp: "Trần Thị B", dept: "Văn phòng", task: "Trực lễ tân", time: "08:00", status: "approved", date: "2025-12-04" },
  { id: 603, emp: "Lê Văn C", dept: "Kỹ thuật", task: "Bảo trì Server cụm 1", time: "09:30", status: "pending", date: "2025-12-04" },
  { id: 604, emp: "Phạm D", dept: "Kho vận", task: "Sắp xếp kho lạnh", time: "10:00", status: "pending", date: "2025-12-04" },
  { id: 605, emp: "Vũ E", dept: "Văn phòng", task: "Chuẩn bị tài liệu họp", time: "08:45", status: "rejected", date: "2025-12-04" },
  { id: 606, emp: "Hoàng F", dept: "Kỹ thuật", task: "Kiểm tra hệ thống PCCC", time: "11:00", status: "pending", date: "2025-12-04" },
  // Các ngày cũ
  { id: 501, emp: "Nguyễn Văn A", dept: "Kho vận", task: "Xuất hàng", time: "16:00", status: "approved", date: "2025-12-03" },
  { id: 502, emp: "Trần Thị B", dept: "Văn phòng", task: "Tổng hợp công văn", time: "16:30", status: "approved", date: "2025-12-03" },
];

let currentDetailId = null;

// --- 2. INIT ---
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('filter-date').value = TODAY;
  refreshAll();
});

function refreshAll() {
  renderStats();
  renderApprovalTable();
  renderHistoryTable();
}

// --- 3. NAVIGATION ---
function toggleSidebar() {
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('mobile-overlay');
  sidebar.classList.toggle('open');
  if (sidebar.classList.contains('open')) {
    overlay.classList.add('show');
  } else {
    overlay.classList.remove('show');
  }
}

function switchTab(tabId, event) {
  document.querySelectorAll('.nav-item').forEach(btn => btn.classList.remove('active'));
  if(event) event.currentTarget.classList.add('active');

  const titles = {
    'dashboard': 'Tổng quan công việc',
    'approval': 'Duyệt báo cáo',
    'history': 'Lịch sử duyệt'
  };
  if(titles[tabId]) document.getElementById('page-title').textContent = titles[tabId];

  document.querySelectorAll('.tab-pane').forEach(section => {
    section.classList.remove('active');
    section.classList.add('hidden');
  });

  const activeSection = document.getElementById(`tab-${tabId}`);
  if (activeSection) {
    activeSection.classList.remove('hidden');
    activeSection.classList.add('active');
  }

  // Đóng menu trên mobile khi chuyển tab
  if (window.innerWidth < 1024) toggleSidebar();

  refreshAll();
}

// --- 4. RENDER LOGIC ---
function renderStats() {
  const filterDate = document.getElementById('filter-date').value;
  const dailyData = reports.filter(r => r.date === filterDate);

  const total = dailyData.length;
  const pending = dailyData.filter(r => r.status === 'pending').length;
  const approved = dailyData.filter(r => r.status === 'approved').length;

  document.getElementById('stat-total').textContent = total;
  document.getElementById('stat-pending').textContent = pending;
  document.getElementById('stat-approved').textContent = approved;
}

function renderApprovalTable() {
  const filterDate = document.getElementById('filter-date').value;
  const filterDept = document.getElementById('filter-dept').value;
  const tbody = document.getElementById('approval-table-body');
  tbody.innerHTML = '';

  const pendingData = reports.filter(item => {
    const matchStatus = item.status === 'pending';
    const matchDate = !filterDate || item.date === filterDate;
    const matchDept = filterDept === 'all' || item.dept === filterDept;
    return matchStatus && matchDate && matchDept;
  });

  if (pendingData.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" class="text-center" style="padding:30px; color:#999;">Không có báo cáo nào cần duyệt</td></tr>`;
    return;
  }

  pendingData.forEach(item => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
            <td><strong>${item.emp}</strong></td>
            <td>${item.dept}</td>
            <td>${item.task}</td>
            <td>${item.time}</td>
            <td><span class="badge badge-pending">Chờ duyệt</span></td>
            <td class="text-center">
                <button class="btn-outline" onclick="openDetail(${item.id})"><i class="fa-regular fa-eye"></i> Xem</button>
                <button class="btn-primary" onclick="quickApprove(${item.id})"><i class="fa-solid fa-check"></i></button>
            </td>
        `;
    tbody.appendChild(tr);
  });
}

function renderHistoryTable() {
  const tbody = document.getElementById('history-table-body');
  tbody.innerHTML = '';

  const historyData = reports
    .filter(item => item.status !== 'pending')
    .sort((a, b) => new Date(b.date + 'T' + b.time) - new Date(a.date + 'T' + a.time));

  historyData.forEach(item => {
    let badgeClass = item.status === 'approved' ? 'badge-approved' : 'badge-rejected';
    let badgeText = item.status === 'approved' ? 'Đã duyệt' : 'Từ chối';

    const tr = document.createElement('tr');
    tr.innerHTML = `
            <td>#${item.id}</td>
            <td>${item.time} - ${item.date}</td>
            <td><strong>${item.emp}</strong></td>
            <td>${item.task}</td>
            <td><span class="badge ${badgeClass}">${badgeText}</span></td>
        `;
    tbody.appendChild(tr);
  });
}

// --- 5. ACTIONS ---
function quickApprove(id) {
  const item = reports.find(r => r.id === id);
  if (item && confirm("Duyệt nhanh?")) {
    item.status = 'approved';
    refreshAll();
  }
}

function approveAll() {
  if(confirm("Duyệt tất cả?")) {
    const filterDate = document.getElementById('filter-date').value;
    reports.forEach(r => {
      if(r.status === 'pending' && r.date === filterDate) {
        r.status = 'approved';
      }
    });
    refreshAll();
  }
}

// --- 6. MODAL ---
function openDetail(id) {
  currentDetailId = id;
  const item = reports.find(r => r.id === id);
  const mockImg = `https://via.placeholder.com/400x200?text=Minh+Chung+${id}`;

  document.getElementById('modal-content-body').innerHTML = `
        <div class="detail-row"><span class="detail-label">Nhân viên:</span> <span class="detail-value">${item.emp}</span></div>
        <div class="detail-row"><span class="detail-label">Bộ phận:</span> <span class="detail-value">${item.dept}</span></div>
        <div class="detail-row"><span class="detail-label">Công việc:</span> <span class="detail-value">${item.task}</span></div>
        <div class="detail-row"><span class="detail-label">Thời gian:</span> <span class="detail-value">${item.time}</span></div>
        <hr style="margin: 15px 0; border:0; border-top:1px solid #eee;">
        <img src="${mockImg}" style="width:100%; border-radius:8px;">
    `;
  document.getElementById('detail-modal').classList.remove('hidden');
}

function closeModal() { document.getElementById('detail-modal').classList.add('hidden'); currentDetailId = null; }
function handleApprove() { if(currentDetailId) { quickApprove(currentDetailId); closeModal(); } }
function handleReject() {
  if(currentDetailId) {
    if(confirm("Từ chối?")) {
      const item = reports.find(r => r.id === currentDetailId);
      item.status = 'rejected';
      refreshAll();
      closeModal();
    }
  }
}
