import fs from 'fs';
import path from 'path';

function walk(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    if (isDirectory) walk(dirPath, callback);
    else callback(path.join(dir, f));
  });
}

function processFile(filePath) {
  if (filePath.includes('node_modules') || filePath.includes('.git') || filePath.includes('dist')) return;
  if (!filePath.endsWith('.js') && !filePath.endsWith('.ts') && !filePath.endsWith('.tsx') && !filePath.endsWith('.sql') && !filePath.endsWith('.md') && !filePath.endsWith('.css') && !filePath.endsWith('.html')) return;

  let content = fs.readFileSync(filePath, 'utf8');
  let original = content;

  // Words
  content = content.replace(/\btask\b/g, 'order');
  content = content.replace(/\bTask\b/g, 'Order');
  content = content.replace(/\btasks\b/g, 'orders');
  content = content.replace(/\bTasks\b/g, 'Orders');
  
  // Columns
  content = content.replace(/\btitle\b/g, 'customer_name');
  content = content.replace(/\bdescription\b/g, 'product_name');
  
  // Statuses
  content = content.replace(/\bopen\b/g, 'pending');
  content = content.replace(/\bin_progress\b/g, 'shipping');
  content = content.replace(/\bdone\b/g, 'delivered');

  // UI Texts
  content = content.replace(/Tiêu đề/g, 'Tên Khách Hàng');
  content = content.replace(/Mô tả/g, 'Tên Sản Phẩm');
  content = content.replace(/Task Manager/g, 'Order Tracking System');
  content = content.replace(/Quản lý công việc realtime/g, 'Hệ thống theo dõi đơn hàng realtime');
  content = content.replace(/Chưa có task nào/g, 'Chưa có đơn hàng nào');
  content = content.replace(/Tạo task đầu tiên để bắt đầu/g, 'Tạo đơn hàng đầu tiên để bắt đầu');
  content = content.replace(/Tạo Task Mới/g, 'Tạo Đơn Hàng Mới');
  content = content.replace(/Đang tải danh sách task/g, 'Đang tải danh sách đơn hàng');
  content = content.replace(/Nhập tiêu đề task/g, 'Nhập tên khách hàng');
  content = content.replace(/Nhập mô tả chi tiết/g, 'Nhập tên sản phẩm');

  if (original !== content) {
    fs.writeFileSync(filePath, content);
    console.log('Updated', filePath);
  }
}

['frontend/src', 'frontend/index.html', 'backend/src', 'backend/server.js', 'database.sql'].forEach(p => {
  if (fs.existsSync(p)) {
    if (fs.statSync(p).isDirectory()) {
      walk(p, processFile);
    } else {
      processFile(p);
    }
  }
});

const renames = [
  ['backend/src/controllers/taskController.js', 'backend/src/controllers/orderController.js'],
  ['frontend/src/components/TaskForm.tsx', 'frontend/src/components/OrderForm.tsx'],
  ['frontend/src/components/TaskItem.tsx', 'frontend/src/components/OrderItem.tsx'],
  ['frontend/src/components/TaskList.tsx', 'frontend/src/components/OrderList.tsx'],
  ['frontend/src/hooks/useRealtimeTasks.ts', 'frontend/src/hooks/useRealtimeOrders.ts']
];

renames.forEach(([oldPath, newPath]) => {
  if (fs.existsSync(oldPath)) {
    fs.renameSync(oldPath, newPath);
    console.log('Renamed', oldPath, 'to', newPath);
  }
});
