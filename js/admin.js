// --- 1. MOCK DATA (Đồng bộ) ---
// Giả định hôm nay là: 04/12/2025
const TODAY = "2025-12-04";

const users = [
  { id: 101, name: "Nguyễn Văn A", dept: "Kho vận", role: "Employee" },
  { id: 102, name: "Trần Thị B", dept: "Văn phòng", role: "Employee" },
  { id: 103, name: "Lê Văn C", dept: "Kỹ thuật", role: "Employee" },
  { id: 104, name: "Phạm D", dept: "Kho vận", role: "Employee" },
  { id: 105, name: "Vũ E", dept: "Văn phòng", role: "Employee" },
];

// Mapping User Name to ID for Syncing with Report Data
const userMap = {
  "Nguyễn Văn A": 101,
  "Trần Thị B": 102,
  "Lê Văn C": 103,
  "Phạm D": 104,
  "Vũ E": 105
};

// Dữ liệu Reports (Copy y hệt từ kiem_duyet.js để đồng bộ)
const reports = [
  { id: 601, emp: "Nguyễn Văn A", dept: "Kho vận", task: "Kiểm đếm hàng", time: "08:15", status: "pending", date: "2025-12-04" },
  { id: 602, emp: "Trần Thị B", dept: "Văn phòng", task: "Trực lễ tân", time: "08:00", status: "approved", date: "2025-12-04" },
  { id: 603, emp: "Lê Văn C", dept: "Kỹ thuật", task: "Bảo trì Server", time: "09:30", status: "pending", date: "2025-12-04" },
  { id: 604, emp: "Phạm D", dept: "Kho vận", task: "Sắp xếp kho", time: "10:00", status: "pending", date: "2025-12-04" },
  { id: 605, emp: "Vũ E", dept: "Văn phòng", task: "Chuẩn bị họp", time: "08:45", status: "rejected", date: "2025-12-04" },
  // Các ngày cũ (chỉ cần demo số liệu tổng quan, có thể thêm nếu cần)
  { id: 501, emp: "Nguyễn Văn A", dept: "Kho vận", time: "16:00", status: "approved", date: "2025-12-03" },
  { id: 502, emp: "Trần Thị B", dept: "Văn phòng", time: "16:30", status: "approved", date: "2025-12-03" },
];

// --- 2. INIT ---
document.addEventListener('DOMContentLoaded', () => {
  // Mặc định chọn ngày hôm nay
  document.getElementById('global-date').value = TODAY;
  refreshData();
});

// --- 3. NAVIGATION ---
function switchTab(tabId) {
  document.querySelectorAll('.nav-item').forEach(btn => btn.classList.remove('active'));
  event.currentTarget.classList.add('active');

  const titles = {
    'dashboard': 'Tổng quan hệ thống',
    'matrix': 'Theo dõi chi tiết',
    'users': 'Quản lý nhân sự',
    'settings': 'Cấu hình'
  };
  document.getElementById('page-title').textContent = titles[tabId];

  document.querySelectorAll('.tab-pane').forEach(sec => sec.classList.remove('active'));
  document.getElementById(`tab-${tabId}`).classList.add('active');
}

// --- 4. RENDER LOGIC ---
function refreshData() {
  renderDashboard();
  renderMatrix();
  renderUserList();
}

function renderDashboard() {
  // Lấy ngày đang chọn để thống kê
  const selectedDate = document.getElementById('global-date').value;

  // Filter reports theo ngày chọn
  const dailyReports = reports.filter(r => r.date === selectedDate);

  // Tính toán
  const totalEmp = users.length;

  // Đếm số người ĐÃ NỘP (dựa trên unique User ID trong reports)
  const submittedUserIds = new Set(dailyReports.map(r => userMap[r.emp]));
  const submittedCount = submittedUserIds.size;

  const missingCount = totalEmp - submittedCount;
  const rate = totalEmp === 0 ? 0 : Math.round((submittedCount / totalEmp) * 100);

  // Update Cards
  document.getElementById('stat-total-emp').textContent = totalEmp;
  document.getElementById('stat-submitted').textContent = submittedCount;
  document.getElementById('stat-missing').textContent = missingCount;
  document.getElementById('stat-rate').textContent = `${rate}%`;

  // Render Bảng Tiến Độ Bộ Phận
  const depts = ["Kho vận", "Văn phòng", "Kỹ thuật"];
  const tbody = document.getElementById('dept-table-body');
  tbody.innerHTML = '';

  depts.forEach(dept => {
    const deptUsers = users.filter(u => u.dept === dept);
    const deptTotal = deptUsers.length;

    // Đếm người đã nộp trong bộ phận này
    const deptSubmitted = deptUsers.filter(u => submittedUserIds.has(u.id)).length;
    const deptRate = deptTotal === 0 ? 0 : Math.round((deptSubmitted / deptTotal) * 100);

    let color = '#3b82f6';
    let status = '<span class="badge badge-warning">Đang nộp</span>';
    if (deptRate === 100) { color = '#10b981'; status = '<span class="badge badge-success">Hoàn thành</span>'; }
    else if (deptRate < 50) { color = '#ef4444'; status = '<span class="badge badge-danger">Chậm</span>'; }

    const tr = document.createElement('tr');
    tr.innerHTML = `
            <td><strong>${dept}</strong></td>
            <td class="text-center">${deptTotal}</td>
            <td class="text-center">${deptSubmitted} / ${deptTotal}</td>
            <td>
                <div style="display:flex; align-items:center; gap:8px;">
                    <div class="progress-bg"><div class="progress-fill" style="width:${deptRate}%; background:${color}"></div></div>
                    <span style="font-size:12px; width:30px;">${deptRate}%</span>
                </div>
            </td>
            <td class="text-center">${status}</td>
        `;
    tbody.appendChild(tr);
  });
}

function renderMatrix() {
  const selectedDate = document.getElementById('global-date').value;
  const filterDept = document.getElementById('matrix-dept-filter').value;
  const filterStatus = document.getElementById('matrix-status-filter').value;
  const tbody = document.getElementById('matrix-table-body');
  tbody.innerHTML = '';

  // Loop qua TẤT CẢ nhân viên để xem ai thiếu
  users.forEach(user => {
    if (filterDept !== 'all' && user.dept !== filterDept) return;

    // Tìm report của user này trong ngày đang chọn
    const userReport = reports.find(r => r.date === selectedDate && userMap[r.emp] === user.id);

    // Xác định trạng thái
    let statusKey = 'missing';
    if (userReport) {
      // Giả sử nộp sau 09:00 là muộn (logic demo)
      const cutoffTime = "09:00";
      statusKey = userReport.time > cutoffTime ? 'late' : 'on_time';
    }

    if (filterStatus !== 'all' && statusKey !== filterStatus) return;

    let badgeHtml = '';
    if(statusKey === 'missing') badgeHtml = '<span class="badge badge-danger">🔴 Chưa nộp</span>';
    else if(statusKey === 'late') badgeHtml = '<span class="badge badge-warning">🟠 Muộn</span>';
    else badgeHtml = '<span class="badge badge-success">🟢 Đúng giờ</span>';

    const timeText = userReport ? userReport.time : '--:--';

    const tr = document.createElement('tr');
    tr.innerHTML = `
            <td>
                <strong>${user.name}</strong><br>
                <span style="font-size:12px; color:#666">ID: ${user.id}</span>
            </td>
            <td>${user.dept}</td>
            <td>08:00</td>
            <td>${timeText}</td>
            <td>${badgeHtml}</td>
            <td>
                ${statusKey === 'missing' ? `<button class="btn-sm btn-outline" onclick="alert('Đã gửi nhắc nhở đến ${user.name}')"><i class="fa-solid fa-bell"></i> Nhắc</button>` : '<span style="color:#ccc">-</span>'}
            </td>
        `;
    tbody.appendChild(tr);
  });
}

function remindAllMissing() {
  alert("Hệ thống đang gửi tin nhắn Zalo đến tất cả nhân viên chưa nộp báo cáo...");
}

function renderUserList() {
  const tbody = document.getElementById('user-list-body');
  tbody.innerHTML = '';
  users.forEach(user => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
            <td>#${user.id}</td>
            <td><strong>${user.name}</strong></td>
            <td>${user.dept}</td>
            <td><span class="badge" style="background:#e2e8f0">${user.role}</span></td>
            <td>
                <button class="btn-sm btn-outline"><i class="fa-solid fa-pen"></i></button>
            </td>
        `;
    tbody.appendChild(tr);
  });
}

// Modal Functions
function openUserModal() { document.getElementById('user-modal').classList.remove('hidden'); }
function closeUserModal() { document.getElementById('user-modal').classList.add('hidden'); }
function saveUser() { alert("Đã lưu (Demo)"); closeUserModal(); }
