// تكوين Firebase
const firebaseConfig = {
  apiKey: "AIzaSyD_GXKC3z1vXBtexx2dYQAhRt2DGRd1A",
  authDomain: "ppe-management-system2026.firebaseapp.com",
  projectId: "ppe-management-system2026",
  storageBucket: "ppe-management-system2026.appspot.com",
  messagingSenderId: "153719589284",
  appId: "1:153719589284:web:e8f4fa9e39e98324f49931",
  measurementId: "G-N2WYJZJD6"
};

// تهيئة Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// متغيرات البيانات
let employees = [];
let inventory = [];
let assignments = [];
let currentUser = null;
let settings = {
    companyName: 'شركة إدارة معدات الحماية الشخصية',
    lowStockThreshold: 10,
    notificationEmail: 'admin@company.com'
};

// بيانات المستخدمين الافتراضية
const users = [
    { username: 'admin', password: 'admin123', name: 'المدير العام' },
    { username: 'user', password: 'user123', name: 'مستخدم عادي' }
];

// دالة حفظ البيانات إلى Firebase
async function saveDataToFirebase() {
    try {
        // حفظ الموظفين
        const employeesRef = db.collection('employees');
        for (const employee of employees) {
            await employeesRef.doc(employee.id.toString()).set(employee);
        }

        // حفظ المخزون
        const inventoryRef = db.collection('inventory');
        for (const item of inventory) {
            await inventoryRef.doc(item.id.toString()).set(item);
        }

        // حفظ التسليمات
        const assignmentsRef = db.collection('assignments');
        for (const assignment of assignments) {
            await assignmentsRef.doc(assignment.id.toString()).set(assignment);
        }

        // حفظ الإعدادات
        await db.collection('settings').doc('main').set(settings);

        console.log('تم حفظ البيانات بنجاح في Firebase');
    } catch (error) {
        console.error('خطأ في حفظ البيانات:', error);
    }
}

// دالة تحميل البيانات من Firebase
async function loadDataFromFirebase() {
    try {
        // تحميل الموظفين
        const employeesSnapshot = await db.collection('employees').get();
        employees = [];
        employeesSnapshot.forEach(doc => {
            employees.push(doc.data());
        });

        // تحميل المخزون
        const inventorySnapshot = await db.collection('inventory').get();
        inventory = [];
        inventorySnapshot.forEach(doc => {
            inventory.push(doc.data());
        });

        // تحميل التسليمات
        const assignmentsSnapshot = await db.collection('assignments').get();
        assignments = [];
        assignmentsSnapshot.forEach(doc => {
            assignments.push(doc.data());
        });

        // تحميل الإعدادات
        const settingsDoc = await db.collection('settings').doc('main').get();
        if (settingsDoc.exists) {
            settings = settingsDoc.data();
        }

        console.log('تم تحميل البيانات بنجاح من Firebase');
        
        // تحديث واجهة المستخدم
        updateUI();
    } catch (error) {
        console.error('خطأ في تحميل البيانات:', error);
        // في حالة الخطأ، استخدم البيانات المحلية
        loadDataFromLocalStorage();
    }
}

// دالة تحديث واجهة المستخدم
function updateUI() {
    if (currentUser) {
        loadDashboardData();
        loadEmployeesData();
        loadInventoryData();
        loadAssignmentsTable();
        
        // تحديث حقول الإعدادات
        document.getElementById('companyName').value = settings.companyName;
        document.getElementById('lowStockThreshold').value = settings.lowStockThreshold;
        document.getElementById('notificationEmail').value = settings.notificationEmail;
    }
}

// دالة حفظ البيانات (تحفظ في Firebase و localStorage)
async function saveData() {
    await saveDataToFirebase();
    saveDataToLocalStorage(); // احتياطي
}

// باقي الكود يبقى كما هو مع تعديل استدعاءات الحفظ
document.addEventListener('DOMContentLoaded', function() {
    // تحميل البيانات عند بدء التطبيق
    loadDataFromFirebase();
    
    // معالج تسجيل الدخول
    document.getElementById('loginForm').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        
        const user = users.find(u => u.username === username && u.password === password);
        
        if (user) {
            currentUser = user;
            showMainApp();
            document.getElementById('loginError').classList.add('d-none');
        } else {
            document.getElementById('loginError').textContent = 'اسم المستخدم أو كلمة المرور غير صحيحة';
            document.getElementById('loginError').classList.remove('d-none');
        }
    });

    // معالجات تسجيل الخروج
    document.getElementById('logoutBtn').addEventListener('click', logout);
    document.getElementById('logoutBtn2').addEventListener('click', logout);

    // معالج التنقل بين الصفحات
    document.querySelectorAll('.sidebar-menu li').forEach(item => {
        if (!item.id.includes('logout')) {
            item.addEventListener('click', function() {
                const page = this.getAttribute('data-page');
                if (page) {
                    showPage(page);
                    
                    // تحديث الشريط الجانبي
                    document.querySelectorAll('.sidebar-menu li').forEach(li => li.classList.remove('active'));
                    this.classList.add('active');
                }
            });
        }
    });

    // معالج إضافة موظف جديد
    document.getElementById('addEmployeeBtn').addEventListener('click', function() {
        document.getElementById('addEmployeeModal').style.display = 'block';
        document.getElementById('addEmployeeForm').reset();
        document.getElementById('editEmployeeId').value = '';
    });

    // معالج إغلاق نافذة إضافة موظف
    document.getElementById('closeAddEmployeeModal').addEventListener('click', function() {
        document.getElementById('addEmployeeModal').style.display = 'none';
    });

    document.getElementById('cancelAddEmployee').addEventListener('click', function() {
        document.getElementById('addEmployeeModal').style.display = 'none';
    });

    // معالج نموذج إضافة موظف
    document.getElementById('addEmployeeForm').addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const editId = document.getElementById('editEmployeeId').value;
        const employeeData = {
            name: document.getElementById('newEmployeeName').value,
            company: document.getElementById('newEmployeeCompany').value,
            title: document.getElementById('newEmployeeTitle').value,
            tel: document.getElementById('newEmployeeTel').value,
            shift: document.getElementById('newEmployeeShift').value,
            status: document.getElementById('newEmployeeStatus').value
        };

        if (editId) {
            // تعديل موظف موجود
            const employeeIndex = employees.findIndex(e => e.id === parseInt(editId));
            if (employeeIndex !== -1) {
                employees[employeeIndex] = { ...employees[employeeIndex], ...employeeData };
            }
        } else {
            // إضافة موظف جديد
            const newEmployee = {
                id: Date.now(),
                ...employeeData
            };
            employees.push(newEmployee);
        }

        await saveData();
        loadEmployeesData();
        document.getElementById('addEmployeeModal').style.display = 'none';
        
        alert(editId ? 'تم تحديث بيانات الموظف بنجاح' : 'تم إضافة الموظف بنجاح');
    });

    // معالج إضافة معدة جديدة
    document.getElementById('addItemBtn').addEventListener('click', function() {
        document.getElementById('addItemModal').style.display = 'block';
        document.getElementById('addItemForm').reset();
        document.getElementById('editItemId').value = '';
    });

    // معالج إغلاق نافذة إضافة معدة
    document.getElementById('closeAddItemModal').addEventListener('click', function() {
        document.getElementById('addItemModal').style.display = 'none';
    });

    document.getElementById('cancelAddItem').addEventListener('click', function() {
        document.getElementById('addItemModal').style.display = 'none';
    });

    // معالج نموذج إضافة معدة
    document.getElementById('addItemForm').addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const editId = document.getElementById('editItemId').value;
        const itemData = {
            itemName: document.getElementById('newItemName').value,
            type: document.getElementById('newItemType').value,
            size: document.getElementById('newItemSize').value,
            stockIn: parseInt(document.getElementById('newItemStockIn').value),
            totalIssues: parseInt(document.getElementById('newItemTotalIssues').value) || 0
        };

        itemData.currentStock = itemData.stockIn - itemData.totalIssues;
        
        // تحديد حالة المعدة
        if (itemData.currentStock === 0) {
            itemData.status = "Out of Stock";
        } else if (itemData.currentStock <= settings.lowStockThreshold) {
            itemData.status = "Low Stock";
        } else {
            itemData.status = "Good";
        }

        if (editId) {
            // تعديل معدة موجودة
            const itemIndex = inventory.findIndex(i => i.id === parseInt(editId));
            if (itemIndex !== -1) {
                inventory[itemIndex] = { ...inventory[itemIndex], ...itemData };
            }
        } else {
            // إضافة معدة جديدة
            const newItem = {
                id: Date.now(),
                ...itemData
            };
            inventory.push(newItem);
        }

        await saveData();
        loadInventoryData();
        loadDashboardData();
        document.getElementById('addItemModal').style.display = 'none';
        
        alert(editId ? 'تم تحديث بيانات المعدة بنجاح' : 'تم إضافة المعدة بنجاح');
    });

    // معالج نموذج تسليم المعدات
    document.getElementById('assignmentForm').addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const employeeId = parseInt(document.getElementById('employeeSelect').value);
        const itemId = parseInt(document.getElementById('itemSelect').value);
        const quantity = parseInt(document.getElementById('assignmentQuantity').value);
        const reason = document.getElementById('assignmentReason').value;
        
        const employee = employees.find(e => e.id === employeeId);
        const item = inventory.find(i => i.id === itemId);
        
        if (!employee || !item) {
            alert('يرجى اختيار موظف ومعدة صحيحة');
            return;
        }
        
        if (quantity > item.currentStock) {
            alert('الكمية المطلوبة أكبر من المتوفر في المخزون');
            return;
        }
        
        // إنشاء سجل تسليم جديد
        const assignment = {
            id: Date.now(),
            employeeId: employeeId,
            employeeName: employee.name,
            itemId: itemId,
            itemName: item.itemName,
            size: item.size,
            quantity: quantity,
            reason: reason,
            date: new Date().toISOString().split('T')[0]
        };
        
        assignments.push(assignment);
        
        // تحديث المخزون
        item.totalIssues += quantity;
        item.currentStock -= quantity;
        
        // تحديث حالة المعدة
        if (item.currentStock === 0) {
            item.status = "Out of Stock";
        } else if (item.currentStock <= settings.lowStockThreshold) {
            item.status = "Low Stock";
        } else {
            item.status = "Good";
        }
        
        await saveData();
        loadInventoryData();
        loadAssignmentsTable();
        loadDashboardData();
        
        this.reset();
        alert('تم تسليم المعدة بنجاح');
    });

    // معالج البحث عن الموظفين
    document.getElementById('employeeSearchInput').addEventListener('input', function() {
        searchEmployees();
    });

    // معالج تصدير التقارير
    document.getElementById('exportInventoryPdfBtn').addEventListener('click', generateInventoryReport);
    document.getElementById('exportAssignmentsPdfBtn').addEventListener('click', generateAssignmentsReport);

    // معالج حفظ الإعدادات
    document.getElementById('settingsForm').addEventListener('submit', async function(e) {
        e.preventDefault();
        saveSettings();
    });

    // معالج مسح جميع البيانات
    document.getElementById('clearAllDataBtn').addEventListener('click', confirmClearAllData);

    // معالج استيراد الموظفين
    document.getElementById('importEmployeesBtn').addEventListener('click', function() {
        document.getElementById('importModal').style.display = 'block';
    });

    document.querySelector('.close-import').addEventListener('click', function() {
        document.getElementById('importModal').style.display = 'none';
    });

    document.getElementById('cancelImportBtn').addEventListener('click', function() {
        document.getElementById('importModal').style.display = 'none';
    });

    document.getElementById('importFile').addEventListener('change', handleFileImport);
    document.getElementById('confirmImportBtn').addEventListener('click', confirmImport);

    // إظهار صفحة تسجيل الدخول في البداية
    showLoginPage();
});

// دالة تعديل موظف
async function editEmployee(employeeId) {
    const employee = employees.find(e => e.id === employeeId);
    if (!employee) return;
    
    document.getElementById('editEmployeeId').value = employee.id;
    document.getElementById('newEmployeeName').value = employee.name;
    document.getElementById('newEmployeeCompany').value = employee.company;
    document.getElementById('newEmployeeTitle').value = employee.title;
    document.getElementById('newEmployeeTel').value = employee.tel || '';
    document.getElementById('newEmployeeShift').value = employee.shift;
    document.getElementById('newEmployeeStatus').value = employee.status;
    
    document.getElementById('addEmployeeModal').style.display = 'block';
}

// دالة حذف موظف
async function deleteEmployee(employeeId) {
    if (!confirm('هل أنت متأكد من حذف هذا الموظف؟ سيتم حذف جميع سجلات التسليم المرتبطة به.')) {
        return;
    }
    
    employees = employees.filter(e => e.id !== employeeId);
    assignments = assignments.filter(a => a.employeeId !== employeeId);
    
    await saveData();
    loadEmployeesData();
    loadAssignmentsTable();
    loadDashboardData();
    
    alert('تم حذف الموظف بنجاح');
}

// دالة تعديل معدة
async function editItem(itemId) {
    const item = inventory.find(i => i.id === itemId);
    if (!item) return;
    
    document.getElementById('editItemId').value = item.id;
    document.getElementById('newItemName').value = item.itemName;
    document.getElementById('newItemType').value = item.type;
    document.getElementById('newItemSize').value = item.size;
    document.getElementById('newItemStockIn').value = item.stockIn;
    document.getElementById('newItemTotalIssues').value = item.totalIssues;
    
    document.getElementById('addItemModal').style.display = 'block';
}

// دالة حذف معدة
async function deleteItem(itemId) {
    if (!confirm('هل أنت متأكد من حذف هذه المعدة؟ لا يمكن التراجع عن هذا الإجراء.')) {
        return;
    }
    
    inventory = inventory.filter(i => i.id !== itemId);
    
    await saveData();
    loadInventoryData();
    loadDashboardData();
    
    alert('تم حذف المعدة بنجاح');
}

// باقي الدوال تبقى كما هي...
function showLoginPage() {
    document.getElementById('loginPage').classList.remove('d-none');
    document.getElementById('mainApp').classList.add('d-none');
    document.getElementById('username').value = '';
    document.getElementById('password').value = '';
    document.getElementById('loginError').classList.add('d-none');
}

function showMainApp() {
    document.getElementById('loginPage').classList.add('d-none');
    document.getElementById('mainApp').classList.remove('d-none');
    document.getElementById('currentUserName').textContent = currentUser.name;
    
    updateUI();
    showPage('dashboard');
}

function showPage(page) {
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    
    const pageElement = document.getElementById(`${page}Page`);
    if (pageElement) {
        pageElement.classList.add('active');
    }
}

function logout() {
    currentUser = null;
    showLoginPage();
}

function searchEmployees() {
    const searchTerm = document.getElementById('employeeSearchInput').value.toLowerCase();
    const filteredEmployees = employees.filter(employee => 
        employee.name.toLowerCase().includes(searchTerm) ||
        employee.company.toLowerCase().includes(searchTerm) ||
        employee.title.toLowerCase().includes(searchTerm)
    );
    
    renderEmployeesTable(filteredEmployees);
}

function showEmployeeDetails(employeeId) {
    const employee = employees.find(e => e.id === employeeId);
    if (!employee) return;
    
    document.getElementById('employeeDetailName').textContent = employee.name;
    document.getElementById('employeeDetailCompany').textContent = employee.company;
    document.getElementById('employeeDetailTitle').textContent = employee.title;
    document.getElementById('employeeDetailPhone').textContent = employee.tel || 'غير متوفر';
    document.getElementById('employeeDetailShift').textContent = employee.shift;
    document.getElementById('employeeDetailStatus').textContent = getStatusText(employee.status);
    
    const employeeAssignments = assignments.filter(a => a.employeeId === employeeId);
    const equipmentTable = document.getElementById('employeeEquipmentTable');
    equipmentTable.innerHTML = '';
    
    if (employeeAssignments.length === 0) {
        equipmentTable.innerHTML = '<tr><td colspan="5" class="text-center">لا توجد معدات مسلمة لهذا الموظف</td></tr>';
    } else {
        employeeAssignments.forEach(assignment => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${assignment.itemName}</td>
                <td>${assignment.size}</td>
                <td>${assignment.quantity}</td>
                <td>${assignment.date}</td>
                <td>${getReasonText(assignment.reason)}</td>
            `;
            equipmentTable.appendChild(row);
        });
    }
    
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    document.getElementById('employeeDetailsPage').classList.add('active');
}

function loadDashboardData() {
    document.getElementById('totalItems').textContent = inventory.length;
    document.getElementById('availableItems').textContent = inventory.filter(i => i.status === 'Good').length;
    document.getElementById('lowStockItems').textContent = inventory.filter(i => i.status === 'Low Stock').length;
    document.getElementById('outOfStockItems').textContent = inventory.filter(i => i.status === 'Out of Stock').length;
    
    updateRecentAssignmentsTable();
    createCharts();
}

function loadEmployeesData() {
    renderEmployeesTable(employees);
    
    const employeeSelect = document.getElementById('employeeSelect');
    employeeSelect.innerHTML = '<option value="">اختر موظف...</option>';
    
    employees.filter(e => e.status === 'Active').forEach(employee => {
        const option = document.createElement('option');
        option.value = employee.id;
        option.textContent = `${employee.name} - ${employee.company}`;
        employeeSelect.appendChild(option);
    });
}

function loadInventoryData() {
    const inventoryTable = document.getElementById('inventoryTable');
    inventoryTable.innerHTML = '';
    
    inventory.forEach(item => {
        const row = document.createElement('tr');
        if (item.status === 'Low Stock') {
            row.classList.add('low-stock');
        } else if (item.status === 'Out of Stock') {
            row.classList.add('no-stock');
        }
        
        row.innerHTML = `
            <td>${item.itemName}</td>
            <td>${item.type}</td>
            <td>${item.size}</td>
            <td>${item.stockIn}</td>
            <td>${item.totalIssues}</td>
            <td>${item.currentStock}</td>
            <td>
                <span class="badge ${getStatusBadgeClass(item.status)}">
                    ${getStatusText(item.status)}
                </span>
            </td>
            <td>
                <button class="btn btn-sm btn-warning me-2 edit-item" data-id="${item.id}">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-sm btn-danger delete-item" data-id="${item.id}">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        inventoryTable.appendChild(row);
    });
    
    document.querySelectorAll('.edit-item').forEach(btn => {
        btn.addEventListener('click', function() {
            const itemId = parseInt(this.getAttribute('data-id'));
            editItem(itemId);
        });
    });
    
    document.querySelectorAll('.delete-item').forEach(btn => {
        btn.addEventListener('click', function() {
            const itemId = parseInt(this.getAttribute('data-id'));
            deleteItem(itemId);
        });
    });
    
    const itemSelect = document.getElementById('itemSelect');
    itemSelect.innerHTML = '<option value="">اختر معدة...</option>';
    
    inventory.filter(i => i.status !== 'Out of Stock').forEach(item => {
        const option = document.createElement('option');
        option.value = item.id;
        option.textContent = `${item.itemName} (${item.size}) - متوفر: ${item.currentStock}`;
        itemSelect.appendChild(option);
    });
}

function renderEmployeesTable(employeesToShow) {
    const employeesTable = document.getElementById('employeesTable').querySelector('tbody');
    employeesTable.innerHTML = '';
    
    if (employeesToShow.length === 0) {
        employeesTable.innerHTML = '<tr><td colspan="5" class="text-center">لا توجد بيانات</td></tr>';
        return;
    }
    
    employeesToShow.forEach(employee => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>
                <a href="#" class="employee-name-link" data-id="${employee.id}">
                    ${employee.name}
                </a>
            </td>
            <td>${employee.company}</td>
            <td>${employee.title}</td>
            <td>
                <span class="badge ${getStatusBadgeClass(employee.status)}">
                    ${getStatusText(employee.status)}
                </span>
            </td>
            <td>
                <button class="btn btn-sm btn-warning me-2 edit-employee" data-id="${employee.id}">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-sm btn-danger delete-employee" data-id="${employee.id}">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        employeesTable.appendChild(row);
    });
    
    document.querySelectorAll('.edit-employee').forEach(btn => {
        btn.addEventListener('click', function() {
            const employeeId = parseInt(this.getAttribute('data-id'));
            editEmployee(employeeId);
        });
    });
    
    document.querySelectorAll('.delete-employee').forEach(btn => {
        btn.addEventListener('click', function() {
            const employeeId = parseInt(this.getAttribute('data-id'));
            deleteEmployee(employeeId);
        });
    });
    
    document.querySelectorAll('.employee-name-link').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const employeeId = parseInt(this.getAttribute('data-id'));
            showEmployeeDetails(employeeId);
        });
    });
}

function loadAssignmentsTable() {
    const assignmentsTable = document.getElementById('assignmentsTable');
    if (!assignmentsTable) return;
    
    assignmentsTable.innerHTML = '';
    
    assignments.slice().reverse().forEach(assignment => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${assignment.employeeName}</td>
            <td>${assignment.itemName} (${assignment.size})</td>
            <td>${assignment.quantity}</td>
            <td>${assignment.date}</td>
            <td>${getReasonText(assignment.reason)}</td>
        `;
        assignmentsTable.appendChild(row);
    });
}

function updateRecentAssignmentsTable() {
    const tableBody = document.getElementById('recentAssignmentsTable');
    tableBody.innerHTML = '';
    
    const recentAssignments = [...assignments].reverse().slice(0, 5);
    
    if (recentAssignments.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="4" class="text-center">لا توجد عمليات تسليم مسجلة</td></tr>';
    } else {
        recentAssignments.forEach(assignment => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${assignment.employeeName}</td>
                <td>${assignment.itemName} (${assignment.size})</td>
                <td>${assignment.quantity}</td>
                <td>${assignment.date}</td>
            `;
            tableBody.appendChild(row);
        });
    }
}

function createCharts() {
    // رسم بياني لحالة المخزون
    const inventoryCtx = document.getElementById('inventoryChart').getContext('2d');
    new Chart(inventoryCtx, {
        type: 'pie',
        data: {
            labels: ['متوفر', 'مخزون منخفض', 'منتهي'],
            datasets: [{
                data: [
                    inventory.filter(i => i.status === 'Good').length,
                    inventory.filter(i => i.status === 'Low Stock').length,
                    inventory.filter(i => i.status === 'Out of Stock').length
                ],
                backgroundColor: [
                    'rgba(39, 174, 96, 0.7)',
                    'rgba(243, 156, 18, 0.7)',
                    'rgba(231, 76, 60, 0.7)'
                ],
                borderColor: [
                    'rgba(39, 174, 96, 1)',
                    'rgba(243, 156, 18, 1)',
                    'rgba(231, 76, 60, 1)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'bottom',
                    rtl: true
                }
            }
        }
    });
    
    // رسم بياني لحالة الموظفين
    const employeesCtx = document.getElementById('employeesChart').getContext('2d');
    new Chart(employeesCtx, {
        type: 'bar',
        data: {
            labels: ['نشط', 'غير نشط', 'ترك العمل'],
            datasets: [{
                label: 'حالة الموظفين',
                data: [
                    employees.filter(e => e.status === 'Active').length,
                    employees.filter(e => e.status === 'Inactive').length,
                    employees.filter(e => e.status === 'Left').length
                ],
                backgroundColor: [
                    'rgba(52, 152, 219, 0.7)',
                    'rgba(155, 89, 182, 0.7)',
                    'rgba(149, 165, 166, 0.7)'
                ],
                borderColor: [
                    'rgba(52, 152, 219, 1)',
                    'rgba(155, 89, 182, 1)',
                    'rgba(149, 165, 166, 1)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true
                }
            },
            plugins: {
                legend: {
                    display: false
                }
            }
        }
    });
}

function generateInventoryReport() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    doc.setFont('Tajawal', 'normal');
    doc.setFontSize(18);
    doc.text('تقرير المخزون', 105, 15, { align: 'center' });
    
    doc.setFontSize(12);
    doc.text(`تاريخ التقرير: ${new Date().toLocaleDateString('ar-EG')}`, 105, 25, { align: 'center' });
    
    const headers = [['الاسم', 'النوع', 'المقاس', 'المخزون الحالي', 'الحالة']];
    const data = inventory.map(item => [
        item.itemName,
        item.type,
        item.size,
        item.currentStock.toString(),
        getStatusText(item.status)
    ]);
    
    doc.autoTable({
        head: headers,
        body: data,
        startY: 30,
        styles: { font: 'Tajawal', halign: 'right' },
        headStyles: { fillColor: [41, 128, 185], textColor: 255, fontStyle: 'bold' },
        columnStyles: {
            0: { cellWidth: 50 },
            1: { cellWidth: 40 },
            2: { cellWidth: 30 },
            3: { cellWidth: 30 },
            4: { cellWidth: 30 }
        }
    });
    
    doc.save(`تقرير_المخزون_${new Date().toISOString().split('T')[0]}.pdf`);
}

function generateAssignmentsReport() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    const dateFrom = document.getElementById('reportDateFrom').value;
    const dateTo = document.getElementById('reportDateTo').value;
    
    let title = "تقرير التسليمات";
    let assignmentsToReport = [...assignments].reverse();
    
    if (dateFrom && dateTo) {
        title = `تقرير التسليمات من ${dateFrom} إلى ${dateTo}`;
        assignmentsToReport = assignmentsToReport.filter(a => 
            a.date >= dateFrom && a.date <= dateTo
        );
    }
    
    doc.setFont('Tajawal', 'normal');
    doc.setFontSize(18);
    doc.text(title, 105, 15, { align: 'center' });
    
    doc.setFontSize(12);
    doc.text(`تاريخ التقرير: ${new Date().toLocaleDateString('ar-EG')}`, 105, 25, { align: 'center' });
    
    const headers = [['التاريخ', 'الموظف', 'المعدة', 'الكمية', 'السبب']];
    const data = assignmentsToReport.map(assignment => [
        assignment.date,
        assignment.employeeName,
        `${assignment.itemName} (${assignment.size})`,
        assignment.quantity.toString(),
        getReasonText(assignment.reason)
    ]);
    
    doc.autoTable({
        head: headers,
        body: data,
        startY: 30,
        styles: { font: 'Tajawal', halign: 'right' },
        headStyles: { fillColor: [41, 128, 185], textColor: 255, fontStyle: 'bold' },
        columnStyles: {
            0: { cellWidth: 30 },
            1: { cellWidth: 50 },
            2: { cellWidth: 50 },
            3: { cellWidth: 20 },
            4: { cellWidth: 30 }
        }
    });
    
    doc.save(`تقرير_التسليمات_${new Date().toISOString().split('T')[0]}.pdf`);
}

async function saveSettings() {
    settings.companyName = document.getElementById('companyName').value;
    settings.lowStockThreshold = parseInt(document.getElementById('lowStockThreshold').value);
    settings.notificationEmail = document.getElementById('notificationEmail').value;
    
    await saveData();
    alert('تم حفظ الإعدادات بنجاح');
}

async function confirmClearAllData() {
    if (confirm('هل أنت متأكد أنك تريد مسح جميع البيانات؟ لا يمكن التراجع عن هذا الإجراء.')) {
        await clearAllData();
    }
}

async function clearAllData() {
    try {
        // مسح البيانات من Firebase
        const batch = db.batch();
        
        // مسح الموظفين
        const employeesSnapshot = await db.collection('employees').get();
        employeesSnapshot.forEach(doc => {
            batch.delete(doc.ref);
        });
        
        // مسح المخزون
        const inventorySnapshot = await db.collection('inventory').get();
        inventorySnapshot.forEach(doc => {
            batch.delete(doc.ref);
        });
        
        // مسح التسليمات
        const assignmentsSnapshot = await db.collection('assignments').get();
        assignmentsSnapshot.forEach(doc => {
            batch.delete(doc.ref);
        });
        
        await batch.commit();
        
        // مسح البيانات المحلية
        employees = [];
        inventory = [];
        assignments = [];
        
        // مسح localStorage
        localStorage.removeItem('ppeManagementData');
        
        // تحديث واجهة المستخدم
        updateUI();
        
        alert('تم مسح جميع البيانات بنجاح');
    } catch (error) {
        console.error('خطأ في مسح البيانات:', error);
        alert('حدث خطأ أثناء مسح البيانات');
    }
}

function handleFileImport(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: 'array' });
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const jsonData = XLSX.utils.sheet_to_json(worksheet);
            
            // عرض معاينة البيانات
            displayImportPreview(jsonData);
        } catch (error) {
            alert('خطأ في قراءة الملف. تأكد من أن الملف بصيغة Excel صحيحة.');
        }
    };
    reader.readAsArrayBuffer(file);
}

function displayImportPreview(data) {
    const preview = document.getElementById('importPreview');
    if (data.length === 0) {
        preview.innerHTML = '<p>لا توجد بيانات في الملف</p>';
        return;
    }
    
    let html = '<table class="table table-sm"><thead><tr>';
    const headers = Object.keys(data[0]);
    headers.forEach(header => {
        html += `<th>${header}</th>`;
    });
    html += '</tr></thead><tbody>';
    
    data.slice(0, 5).forEach(row => {
        html += '<tr>';
        headers.forEach(header => {
            html += `<td>${row[header] || ''}</td>`;
        });
        html += '</tr>';
    });
    
    html += '</tbody></table>';
    if (data.length > 5) {
        html += `<p class="text-muted">عرض أول 5 صفوف من ${data.length} صف</p>`;
    }
    
    preview.innerHTML = html;
    window.importData = data; // حفظ البيانات للاستيراد
}

async function confirmImport() {
    if (!window.importData || window.importData.length === 0) {
        alert('لا توجد بيانات للاستيراد');
        return;
    }
    
    let importedCount = 0;
    
    window.importData.forEach(row => {
        // تحويل البيانات إلى تنسيق الموظف
        const employee = {
            id: Date.now() + Math.random(),
            name: row['الاسم'] || row['name'] || '',
            company: row['الشركة'] || row['company'] || '',
            title: row['المسمى الوظيفي'] || row['title'] || '',
            tel: row['الهاتف'] || row['tel'] || '',
            shift: row['الوردية'] || row['shift'] || 'صباحي',
            status: row['الحالة'] || row['status'] || 'Active'
        };
        
        if (employee.name && employee.company) {
            employees.push(employee);
            importedCount++;
        }
    });
    
    if (importedCount > 0) {
        await saveData();
        loadEmployeesData();
        document.getElementById('importModal').style.display = 'none';
        alert(`تم استيراد ${importedCount} موظف بنجاح`);
    } else {
        alert('لم يتم استيراد أي بيانات. تأكد من صحة تنسيق الملف.');
    }
}

function getStatusText(status) {
    switch(status) {
        case 'Active': return 'نشط';
        case 'Inactive': return 'غير نشط';
        case 'Left': return 'ترك العمل';
        case 'Good': return 'جيد';
        case 'Low Stock': return 'مخزون منخفض';
        case 'Out of Stock': return 'منتهي';
        default: return status;
    }
}

function getStatusBadgeClass(status) {
    switch(status) {
        case 'Active':
        case 'Good':
            return 'bg-success';
        case 'Low Stock':
            return 'bg-warning';
        case 'Out of Stock':
        case 'Left':
            return 'bg-danger';
        case 'Inactive':
            return 'bg-secondary';
        default:
            return 'bg-primary';
    }
}

function getReasonText(reason) {
    switch(reason) {
        case 'new': return 'تسليم جديد';
        case 'replacement': return 'استبدال';
        case 'lost': return 'فقدان';
        case 'damaged': return 'تلف';
        default: return reason;
    }
}

// دالة حفظ البيانات في localStorage (احتياطي)
function saveDataToLocalStorage() {
    const data = {
        employees,
        inventory,
        assignments,
        settings
    };
    localStorage.setItem('ppeManagementData', JSON.stringify(data));
}

// دالة تحميل البيانات من localStorage
function loadDataFromLocalStorage() {
    const savedData = localStorage.getItem('ppeManagementData');
    if (savedData) {
        const data = JSON.parse(savedData);
        employees = data.employees || [];
        inventory = data.inventory || [];
        assignments = data.assignments || [];
        settings = data.settings || settings;
        
        updateUI();
    }
}

