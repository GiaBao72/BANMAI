// --- 1. MOCK DATA ---
const appState = {
  // Giả sử đang đăng nhập là Nguyễn Văn A
  currentUser: { name: "Nguyễn Văn A", area: "Kho vận" },
  currentDate: new Date("2025-12-04"), // Cố định ngày hôm nay
  tasks: [
    {
      id: 601,
      name: "Kiểm đếm hàng nhập sáng",
      time: "08:15",
      status: "pending",
      photosRequired: [
        { id: "p1", label: "Ảnh phiếu nhập", required: true },
        { id: "p2", label: "Ảnh hàng hóa", required: true }
      ]
    },
    {
      id: 606, // Task tương lai
      name: "Vệ sinh kệ kho B",
      time: "16:00",
      status: "pending",
      photosRequired: []
    }
  ],
  currentTaskId: null,
  uploads: {}
};

// ... (Giữ nguyên các hàm renderHome, renderPhotoSlots, logic xử lý ảnh từ version trước) ...
// Lưu ý: Phần code xử lý DOM, Event Listener giữ nguyên, chỉ thay đổi khối Mock Data ở trên đầu file.
