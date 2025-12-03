// --- MOCK DATA ---
const areas = [
  { id: 'A', name: 'Kho A (NV: A)' },
  { id: 'B', name: 'Kho B (NV: B)' },
  { id: 'C', name: 'Sảnh (NV: C)' }
];

const steps = [
  { id: 1, name: '1. Kiểm tra an ninh' },
  { id: 2, name: '2. Vệ sinh sàn' },
  { id: 3, name: '3. Kiểm tra PCCC' },
  { id: 4, name: '4. Tắt thiết bị điện' }
];

// Data Matrix: Key = StepID_AreaID
const matrixData = {
  '1_A': { status: 'approved', emp: 'Nguyễn Văn A', time: '08:00', photos: ['url1', 'url2'] },
  '1_B': { status: 'approved', emp: 'Trần Văn B', time: '08:15', photos: ['url1'] },
  '1_C': { status: 'pending', emp: 'Lê Thị C', time: '08:30', photos: [] },
  '2_A': { status: 'rejected', emp: 'Nguyễn Văn A', time: '09:00', note: 'Sàn chưa khô, còn vết bẩn', photos: ['url3'] },
  '2_B': { status: 'empty' }, // Not done
  // ... other mappings
};

// --- DOM ELEMENTS ---
const matrixTable = document.getElementById('matrix-table');
const modal = document.getElementById('detail-modal');
const sidebar = document.getElementById('sidebar');

// --- 1. RENDER MATRIX ---
function renderMatrix() {
  // 1. Render Header Row (Columns = Areas)
  let thead = `<thead><tr><th style="min-width:150px">Hạng mục</th>`;
  areas.forEach(area => {
    thead += `<th style="min-width:120px">${area.name}</th>`;
  });
  thead += `</tr></thead>`;

  // 2. Render Body Rows (Rows = Steps)
  let tbody = `<tbody>`;
  steps.forEach(step => {
    tbody += `<tr>`;
    tbody += `<th>${step.name}</th>`; // Sticky Left Column

    areas.forEach(area => {
      const key = `${step.id}_${area.id}`;
      const data = matrixData[key] || { status: 'empty' };
      const statusClass = data.status;

      let cellContent = '';
      let label = '';

      if (statusClass === 'approved') label = 'Đạt';
      if (statusClass === 'rejected') label = 'Chưa đạt';
      if (statusClass === 'pending') label = '(x) Chờ';
      if (statusClass === 'empty') label = '-';

      tbody += `
                <td>
                    <div class="cell-status ${statusClass}"
                         onclick="openCellDetail('${key}', '${step.name}', '${area.name}')">
                        ${label}
                    </div>
                </td>
            `;
    });
    tbody += `</tr>`;
  });
  tbody += `</tbody>`;

  matrixTable.innerHTML = thead + tbody;
}

// --- 2. MODAL LOGIC ---
window.openCellDetail = (key, stepName, areaName) => {
  const data = matrixData[key];
  if (!data || data.status === 'empty') return; // Do nothing for empty cells

  // Bind Data
  document.getElementById('modal-title').textContent = `${stepName} - ${areaName}`;
  document.getElementById('modal-emp').textContent = data.emp;
  document.getElementById('modal-time').textContent = data.time;

  // Status Badge Style
  const badge = document.getElementById('modal-badge');
  badge.textContent = data.status === 'approved' ? 'Đạt' : (data.status === 'rejected' ? 'Chưa đạt' : 'Chờ duyệt');
  badge.style.background = data.status === 'approved' ? 'var(--success)' : (data.status === 'rejected' ? 'var(--danger)' : '#999');

  // Notes
  const noteArea = document.getElementById('modal-note-area');
  if (data.status === 'rejected' && data.note) {
    noteArea.classList.remove('hidden');
    document.getElementById('modal-note-content').textContent = data.note;
  } else {
    noteArea.classList.add('hidden');
  }

  // Mock Gallery
  const gallery = document.getElementById('modal-gallery');
  gallery.innerHTML = '';
  if (data.photos && data.photos.length > 0) {
    data.photos.forEach(img => {
      const el = document.createElement('div');
      el.className = 'gallery-img'; // In real app, put <img> tag here
      el.style.backgroundColor = '#ddd'; // Placeholder color
      el.textContent = 'IMG'; // Placeholder text
      el.style.display = 'flex';
      el.style.alignItems = 'center';
      el.style.justifyContent = 'center';
      gallery.appendChild(el);
    });
  } else {
    gallery.innerHTML = '<p style="grid-column: span 2; text-align:center; color:#999">Chưa có ảnh</p>';
  }

  modal.showModal();
};

window.closeModal = () => modal.close();

// --- 3. NAVIGATION & UI ---
window.navTo = (e, targetId) => {
  e.preventDefault();
  // Active Class for Menu
  document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
  e.currentTarget.classList.add('active');

  // Show Section
  document.querySelectorAll('.page-section').forEach(el => el.classList.add('hidden'));
  document.getElementById(targetId).classList.remove('hidden');

  // Mobile: Close sidebar after click
  if (window.innerWidth <= 768) toggleSidebar();
};

window.toggleSidebar = () => {
  sidebar.classList.toggle('open');
};

window.exportExcel = () => {
  alert("Chức năng đang phát triển: Xuất dữ liệu ra file .xlsx");
};

// --- INIT ---
document.addEventListener('DOMContentLoaded', () => {
  renderMatrix();
  // Render mock user list (simplified)
  const userBody = document.getElementById('user-list-body');
  userBody.innerHTML = `
        <tr><td>Nguyễn Văn A</td><td>Nhân viên</td><td>Khu A</td><td><button class="btn btn-outline">Sửa</button></td></tr>
        <tr><td>Trần Văn B</td><td>Quản lý</td><td>Khu B</td><td><button class="btn btn-outline">Sửa</button></td></tr>
    `;
});
