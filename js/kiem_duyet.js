// --- 1. SHARED DATA (Dữ liệu đồng bộ) ---
// Giả định hôm nay là: 04/12/2025
const TODAY = "2025-12-04";

const reports = [
  // --- NGÀY HÔM NAY (04/12/2025) - Tập trung vào Pending ---
  { id: 601, emp: "Nguyễn Văn A", dept: "Kho vận", task: "Kiểm đếm hàng nhập sáng", time: "08:15", status: "pending", date: "2025-12-04" },
  { id: 602, emp: "Trần Thị B", dept: "Văn phòng", task: "Trực lễ tân", time: "08:00", status: "approved", date: "2025-12-04" }, // Đã duyệt sớm
  { id: 603, emp: "Lê Văn C", dept: "Kỹ thuật", task: "Bảo trì Server cụm 1", time: "09:30", status: "pending", date: "2025-12-04" },
  { id: 604, emp: "Phạm D", dept: "Kho vận", task: "Sắp xếp kho lạnh", time: "10:00", status: "pending", date: "2025-12-04" },
  { id: 605, emp: "Vũ E", dept: "Văn phòng", task: "Chuẩn bị tài liệu họp", time: "08:45", status: "rejected", date: "2025-12-04" }, // Bị từ chối

  // --- HÔM QUA (03/12/2025) ---
  { id: 501, emp: "Nguyễn Văn A", dept: "Kho vận", task: "Xuất hàng", time: "16:00", status: "approved", date: "2025-12-03" },
  { id: 502, emp: "Trần Thị B", dept: "Văn phòng", task: "Tổng hợp công văn", time: "16:30", status: "approved", date: "2025-12-03" },
  { id: 503, emp: "Lê Văn C", dept: "Kỹ thuật", task: "Sửa máy in tầng 2", time: "14:00", status: "approved", date: "2025-12-03" },
  { id: 504, emp: "Phạm D", dept: "Kho vận", task: "Vệ sinh kho", time: "17:00", status: "approved", date: "2025-12-03" },
  { id: 505, emp: "Vũ E", dept: "Văn phòng", task: "Đặt văn phòng phẩm", time: "10:00", status: "approved", date: "2025-12-03" },

  // --- 02/12/2025 ---
  { id: 401, emp: "Nguyễn Văn A", dept: "Kho vận", task: "Kiểm kê tồn kho", time: "09:00", status: "approved", date: "2025-12-02" },
  { id: 403, emp: "Lê Văn C", dept: "Kỹ thuật", task: "Cài đặt phần mềm", time: "09:00", status: "rejected", date: "2025-12-02" }, // Làm sai

  // --- 01/12/2025 (Chủ nhật - Ít người làm) ---
  { id: 303, emp: "Lê Văn C", dept: "Kỹ thuật", task: "Trực sự cố cuối tuần", time: "08:00", status: "approved", date: "2025-12-01" },

  // --- 30/11/2025 ---
  { id: 201, emp: "Nguyễn Văn A", dept: "Kho vận", task: "Nhập hàng lô B", time: "08:30", status: "approved", date: "2025-11-30" },
  { id: 202, emp: "Trần Thị B", dept: "Văn phòng", task: "Báo cáo tháng", time: "16:00", status: "approved", date: "2025-11-30" },

  // --- 29/11/2025 ---
  { id: 101, emp: "Nguyễn Văn A", dept: "Kho vận", task: "Vệ sinh kệ", time: "16:45", status: "approved", date: "2025-11-29" },
  { id: 104, emp: "Phạm D", dept: "Kho vận", task: "Bốc xếp hàng", time: "16:50", status: "approved", date: "2025-11-29" },
  { id: 105, emp: "Vũ E", dept: "Văn phòng", task: "Gửi thư mời", time: "09:00", status: "approved", date: "2025-11-29" },
];

let currentDetailId = null;

// --- 2. INIT & RENDER ---
document.addEventListener('DOMContentLoaded', () => {
  // Đặt mặc định ngày hiển thị là TODAY (04/12/2025)
  document.getElementById('filter-date').value = TODAY;
  refreshAll();
});

function refreshAll() {
  renderStats();
  renderApprovalTable();
  renderHistoryTable();
}

// --- 3. NAVIGATION ---
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
  refreshAll();
}

// --- 4. RENDER FUNCTIONS ---

function renderStats() {
  // Stat tính theo NGÀY ĐANG CHỌN (filter-date)
  const filterDate = document.getElementById('filter-date').value;

  // Lọc data theo ngày
  const dailyData = reports.filter(r => r.date === filterDate);

  // Tổng hợp số liệu
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

  // Logic: Tab duyệt chỉ hiện Pending của ngày được chọn (hoặc tất cả pending nếu muốn)
  // Ở đây ta hiện Pending của ngày được chọn
  const pendingData = reports.filter(item => {
    const matchStatus = item.status === 'pending';
    const matchDate = !filterDate || item.date === filterDate;
    const matchDept = filterDept === 'all' || item.dept === filterDept;
    return matchStatus && matchDate && matchDept;
  });

  if (pendingData.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" class="text-center" style="padding:30px; color:#999;">Không có báo cáo nào cần duyệt cho ngày ${filterDate}</td></tr>`;
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
                <button class="btn-primary" style="display:inline-flex; padding:6px 12px;" onclick="quickApprove(${item.id})"><i class="fa-solid fa-check"></i></button>
            </td>
        `;
    tbody.appendChild(tr);
  });
}

function renderHistoryTable() {
  const tbody = document.getElementById('history-table-body');
  tbody.innerHTML = '';

  // Tab lịch sử: Hiện tất cả các trạng thái KHÔNG phải pending (đã xử lý)
  // Sắp xếp mới nhất lên đầu
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

// --- 5. ACTION LOGIC ---
function quickApprove(id) {
  const item = reports.find(r => r.id === id);
  if (item) {
    item.status = 'approved';
    refreshAll();
  }
}

function approveAll() {
  const filterDate = document.getElementById('filter-date').value;
  if(confirm(`Duyệt tất cả báo cáo của ngày ${filterDate}?`)) {
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
  const mockImg = `https://via.placeholder.com/400x200?text=Anh+Bao+Cao+${id}`;

  document.getElementById('modal-content-body').innerHTML = `
        <div class="detail-row"><span class="detail-label">Nhân viên:</span> <span class="detail-value">${item.emp}</span></div>
        <div class="detail-row"><span class="detail-label">Bộ phận:</span> <span class="detail-value">${item.dept}</span></div>
        <div class="detail-row"><span class="detail-label">Công việc:</span> <span class="detail-value">${item.task}</span></div>
        <div class="detail-row"><span class="detail-label">Thời gian:</span> <span class="detail-value">${item.time} (${item.date})</span></div>
        <hr style="margin: 15px 0; border:0; border-top:1px solid #eee;">
        <img src="${mockImg}" style="width:100%; border-radius:8px;">
    `;
  document.getElementById('detail-modal').classList.remove('hidden');
}

function closeModal() { document.getElementById('detail-modal').classList.add('hidden'); currentDetailId = null; }
function handleApprove() { if(currentDetailId) { quickApprove(currentDetailId); closeModal(); } }
function handleReject() {
  if(currentDetailId) {
    if(confirm("Từ chối báo cáo này?")) {
      const item = reports.find(r => r.id === currentDetailId);
      item.status = 'rejected';
      refreshAll();
      closeModal();
    }
  }
}
