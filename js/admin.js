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

// Mapping User Name to ID
const userMap = {
  "Nguyễn Văn A": 101,
  "Trần Thị B": 102,
  "Lê Văn C": 103,
  "Phạm D": 104,
  "Vũ E": 105
};

// Dữ liệu Reports
const reports = [
  { id: 601, emp: "Nguyễn Văn A", dept: "Kho vận", task: "Kiểm đếm hàng", time: "08:15", status: "pending", date: "2025-12-04" },
  { id: 602, emp: "Trần Thị B", dept: "Văn phòng", task: "Trực lễ tân", time: "08:00", status: "approved", date: "2025-12-04" },
  { id: 603, emp: "Lê Văn C", dept: "Kỹ thuật", task: "Bảo trì Server", time: "09:30", status: "pending", date: "2025-12-04" },
  { id: 604, emp: "Phạm D", dept: "Kho vận", task: "Sắp xếp kho", time: "10:00", status: "pending", date: "2025-12-04" },
  { id: 605, emp: "Vũ E", dept: "Văn phòng", task: "Chuẩn bị họp", time: "08:45", status: "rejected", date: "2025-12-04" },
  // Các ngày cũ
  { id: 501, emp: "Nguyễn Văn A", dept: "Kho vận", time: "16:00", status: "approved", date: "2025-12-03" },
  { id: 502, emp: "Trần Thị B", dept: "Văn phòng", time: "16:30", status: "approved", date: "2025-12-03" },
];

// --- 2. INIT ---
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('global-date').value = TODAY;
  refreshData();
});

// --- 3. NAVIGATION ---
function switchTab(tabId, event) {
  // Update UI Menu
  document.querySelectorAll('.nav-item').forEach(btn => btn.classList.remove('active'));
  if (event) {
    event.currentTarget.classList.add('active');
  }

  // Update Title
  const titles = {
    'dashboard': 'Tổng quan hệ thống',
    'matrix': 'Theo dõi chi tiết',
    'users': 'Quản lý nhân sự',
    'settings': 'Cấu hình'
  };
  document.getElementById('page-title').textContent = titles[tabId];

  // Show/Hide Sections
  document.querySelectorAll('.tab-pane').forEach(sec => {
    sec.classList.remove('active');
    sec.classList.add('hidden');
  });

  const target = document.getElementById(`tab-${tabId}`);
  if(target) {
    target.classList.remove('hidden');
    target.classList.add('active');
  }

  // Mobile: Close menu after click
  if (window.innerWidth < 1024) {
    toggleSidebar();
  }
}

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

// --- 4. RENDER LOGIC ---
function refreshData() {
  renderDashboard();
  renderMatrix();
  renderUserList();
}

function renderDashboard() {
  const selectedDate = document.getElementById('global-date').value;
  const dailyReports = reports.filter(r => r.date === selectedDate);

  const totalEmp = users.length;
  const submittedUserIds = new Set(dailyReports.map(r => userMap[r.emp]));
  const submittedCount = submittedUserIds.size;
  const missingCount = totalEmp - submittedCount;
  const rate = totalEmp === 0 ? 0 : Math.round((submittedCount / totalEmp) * 100);

  document.getElementById('stat-total-emp').textContent = totalEmp;
  document.getElementById('stat-submitted').textContent = submittedCount;
  document.getElementById('stat-missing').textContent = missingCount;
  document.getElementById('stat-rate').textContent = `${rate}%`;

  const depts = ["Kho vận", "Văn phòng", "Kỹ thuật"];
  const tbody = document.getElementById('dept-table-body');
  tbody.innerHTML = '';

  depts.forEach(dept => {
    const deptUsers = users.filter(u => u.dept === dept);
    const deptTotal = deptUsers.length;
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
  const tbody = document.getElementById('matrix-table-body');
  tbody.innerHTML = '';

  users.forEach(user => {
    if (filterDept !== 'all' && user.dept !== filterDept) return;

    const userReport = reports.find(r => r.date === selectedDate && userMap[r.emp] === user.id);

    let statusHtml = '';
    let actionHtml = '';

    if (!userReport) {
      statusHtml = `<span class="status-missing">-- Chưa nộp --</span>`;
      actionHtml = `<button class="btn-sm btn-outline" onclick="remindUser('${user.name}')"><i class="fa-solid fa-bell"></i> Nhắc</button>`;
    } else {
      if (userReport.status === 'approved') {
        statusHtml = `<div class="status-approved"><i class="fa-solid fa-check"></i> Đạt</div>`;
        actionHtml = `<span class="text-muted" style="font-size:12px;">-</span>`;
      }
      else if (userReport.status === 'rejected') {
        statusHtml = `<div class="status-rejected"><i class="fa-solid fa-xmark"></i> Chưa đạt</div>`;
        actionHtml = `<button class="btn-sm btn-outline" onclick="viewDetail(${userReport.id})">Xem lỗi</button>`;
      }
      else {
        statusHtml = `<div class="status-pending"><i class="fa-regular fa-clock"></i> Chờ duyệt</div>`;
        actionHtml = `<button class="btn-sm btn-primary" onclick="quickReview(${userReport.id})">Duyệt ngay</button>`;
      }
    }

    const timeText = userReport ? userReport.time : '';

    const tr = document.createElement('tr');
    tr.innerHTML = `
            <td>
                <strong>${user.name}</strong><br>
                <span style="font-size:12px; color:#999">ID: ${user.id}</span>
            </td>
            <td>${user.dept}</td>
            <td>${timeText}</td>
            <td>${statusHtml}</td>
            <td>${actionHtml}</td>
        `;
    tbody.appendChild(tr);
  });
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
            <td><span class="badge" style="background:#e2e8f0; color:#333;">${user.role}</span></td>
            <td>
                <button class="btn-sm btn-outline"><i class="fa-solid fa-pen"></i></button>
            </td>
        `;
    tbody.appendChild(tr);
  });
}

// --- 5. ACTIONS ---
function remindAllMissing() {
  alert("Hệ thống đang gửi tin nhắn Zalo đến tất cả nhân viên chưa nộp báo cáo...");
}

function remindUser(name) {
  const btn = event.target.closest('button');
  btn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Gửi...`;
  btn.disabled = true;
  setTimeout(() => {
    alert(`Đã gửi tin nhắn nhắc nhở đến: ${name}`);
    btn.innerHTML = `<i class="fa-solid fa-check"></i> Đã nhắc`;
    btn.classList.add('btn-primary');
    btn.classList.remove('btn-outline');
  }, 800);
}

function quickReview(id) {
  const item = reports.find(r => r.id === id);
  if (item && confirm("Duyệt nhanh báo cáo này?")) {
    item.status = 'approved';
    refreshData();
  }
}

function viewDetail(id) {
  const item = reports.find(r => r.id === id);
  alert(`Chi tiết lỗi của ${item.emp}:\n- Ảnh mờ\n- Thiếu góc chụp\n(Demo)`);
}

// Modal Functions
function openUserModal() { document.getElementById('user-modal').classList.remove('hidden'); }
function closeUserModal() { document.getElementById('user-modal').classList.add('hidden'); }
function saveUser() { alert("Đã lưu (Demo)"); closeUserModal(); }
