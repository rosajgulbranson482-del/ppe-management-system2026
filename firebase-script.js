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
let users = [];
let currentUser = null;
let settings = {
    companyName: 'شركة إدارة معدات الحماية الشخصية',
    lowStockThreshold: 10,
    notificationEmail: 'admin@company.com'
};

// بيانات المستخدمين الافتراضية
const defaultUsers = [
    { id: 1, username: 'admin', password: 'admin123', name: 'المدير العام', role: 'admin' },
    { id: 2, username: 'user', password: 'user123', name: 'مستخدم عادي', role: 'user' }
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

        // حفظ المستخدمين
        const usersRef = db.collection('users');
        for (const user of users) {
            await usersRef.doc(user.id.toString()).set(user);
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

        // تحميل المستخدمين
        const usersSnapshot = await db.collection('users').get();
        users = [];
        usersSnapshot.forEach(doc => {
            users.push(doc.data());
        });

        // إذا لم توجد مستخدمين، استخدم المستخدمين الافتراضيين
        if (users.length === 0) {
            users = [...defaultUsers];
            await saveDataToFirebase();
        }

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
        // في حالة الخطأ، استخدم البيانات الافتراضية
        users = [...defaultUsers];
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
        loadUsersManagement();
        
        // إظهار/إخفاء قائمة إدارة المستخدمين حسب الصلاحية
        const adminMenuItem = document.getElementById('adminMenuItem');
        if (currentUser.role === 'admin') {
            adminMenuItem.style.display = 'block';
        } else {
            adminMenuItem.style.display = 'none';
        }
        
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

// دالة تحميل إدارة المستخدمين
function loadUsersManagement() {
    if (currentUser.role !== 'admin') return;
    
    const container = document.getElementById('usersManagementContainer');
    container.innerHTML = '';
    
    users.forEach(user => {
        const userCard = document.createElement('div');
        userCard.className = 'user-management-card';
        userCard.innerHTML = `
            <div class="d-flex justify-content-between align-items-center">
                <div>
                    <h6 class="mb-1">${user.name}</h6>
                    <p class="mb-1 text-muted">@${user.username}</p>
                    <span class="user-role-badge role-${user.role}">${getRoleDisplayName(user.role)}</span>
                </div>
                <div>
                    <button class="btn btn-sm btn-outline-primary me-2" onclick="editUser(${user.id})">
                        <i class="fas fa-edit"></i> تعديل
                    </button>
                    ${user.id !== currentUser.id ? `
                        <button class="btn btn-sm btn-outline-danger" onclick="deleteUser(${user.id})">
                            <i class="fas fa-trash"></i> حذف
                        </button>
                    ` : ''}
                </div>
            </div>
        `;
        container.appendChild(userCard);
    });
    
    // تحديث الإحصائيات
    document.getElementById('totalUsersCount').textContent = users.length;
    document.getElementById('adminUsersCount').textContent = users.filter(u => u.role === 'admin').length;
    document.getElementById('regularUsersCount').textContent = users.filter(u => u.role === 'user').length;
    document.getElementById('viewerUsersCount').textContent = users.filter(u => u.role === 'viewer').length;
}

// دالة الحصول على اسم الصلاحية للعرض
function getRoleDisplayName(role) {
    switch(role) {
        case 'admin': return 'مدير';
        case 'user': return 'مستخدم عادي';
        case 'viewer': return 'مشاهد فقط';
        default: return 'غير محدد';
    }
}

// دالة إضافة مستخدم جديد
async function addUser() {
    const editId = document.getElementById('editUserId').value;
    const userData = {
        name: document.getElementById('newUserName').value,
        username: document.getElementById('newUsername').value,
        password: document.getElementById('newUserPassword').value,
        role: document.getElementById('newUserRole').value
    };

    // التحقق من عدم تكرار اسم المستخدم
    const existingUser = users.find(u => u.username === userData.username && u.id !== parseInt(editId));
    if (existingUser) {
        alert('اسم المستخدم موجود بالفعل');
        return;
    }

    if (editId) {
        // تعديل مستخدم موجود
        const userIndex = users.findIndex(u => u.id === parseInt(editId));
        if (userIndex !== -1) {
            users[userIndex] = { ...users[userIndex], ...userData };
        }
    } else {
        // إضافة مستخدم جديد
        const newUser = {
            id: Date.now(),
            ...userData
        };
        users.push(newUser);
    }

    await saveData();
    loadUsersManagement();
    document.getElementById('addUserModal').style.display = 'none';
    
    alert(editId ? 'تم تحديث بيانات المستخدم بنجاح' : 'تم إضافة المستخدم بنجاح');
}

// دالة تعديل مستخدم
function editUser(userId) {
    const user = users.find(u => u.id === userId);
    if (!user) return;
    
    document.getElementById('editUserId').value = user.id;
    document.getElementById('newUserName').value = user.name;
    document.getElementById('newUsername').value = user.username;
    document.getElementById('newUserPassword').value = user.password;
    document.getElementById('newUserRole').value = user.role;
    
    document.getElementById('addUserModal').style.display = 'block';
}

// دالة حذف مستخدم
async function deleteUser(userId) {
    if (userId === currentUser.id) {
        alert('لا يمكنك حذف حسابك الخاص');
        return;
    }
    
    if (!confirm('هل أنت متأكد من حذف هذا المستخدم؟')) {
        return;
    }
    
    users = users.filter(u => u.id !== userId);
    
    await saveData();
    loadUsersManagement();
    
    alert('تم حذف المستخدم بنجاح');
}

// دالة التحقق من الصلاحيات
function hasPermission(action) {
    if (!currentUser) return false;
    
    switch(currentUser.role) {
        case 'admin':
            return true; // المدير له جميع الصلاحيات
        case 'user':
            return action !== 'delete' && action !== 'admin'; // المستخدم العادي لا يمكنه الحذف أو الوصول لإدارة المستخدمين
        case 'viewer':
            return action === 'view'; // المشاهد يمكنه المشاهدة فقط
        default:
            return false;
    }
}

// دالة حذف جميع البيانات (محدثة)
async function clearAllData() {
    try {
        // حذف البيانات من Firebase
        const collections = ['employees', 'inventory', 'assignments'];
        
        for (const collectionName of collections) {
            const snapshot = await db.collection(collectionName).get();
            const batch = db.batch();
            
            snapshot.docs.forEach(doc => {
                batch.delete(doc.ref);
            });
            
            await batch.commit();
        }
        
        // إعادة تعيين البيانات المحلية
        employees = [];
        inventory = [];
        assignments = [];
        
        // حفظ البيانات المحدثة
        await saveData();
        
        // تحديث واجهة المستخدم
        updateUI();
        
        alert('تم مسح جميع البيانات بنجاح');
    } catch (error) {
        console.error('خطأ في مسح البيانات:', error);
        alert('حدث خطأ أثناء مسح البيانات');
    }
}

// دالة تأكيد مسح البيانات
function confirmClearAllData() {
    if (!hasPermission('delete')) {
        alert('ليس لديك صلاحية لحذف البيانات');
        return;
    }
    
    const confirmation = prompt('لتأكيد مسح جميع البيانات، اكتب "مسح" في المربع أدناه:');
    if (confirmation === 'مسح') {
        clearAllData();
    } else {
        alert('تم إلغاء العملية');
    }
}

// دالة استيراد الموظفين من Excel (محدثة)
function handleFileImport(event) {
    if (!hasPermission('add')) {
        alert('ليس لديك صلاحية لإضافة البيانات');
        return;
    }
    
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: 'array' });
            const firstSheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[firstSheetName];
            
            // تحويل البيانات إلى JSON مع تحديد الأعمدة المطلوبة
            const jsonData = XLSX.utils.sheet_to_json(worksheet, { 
                header: ['name', 'company', 'title', 'tel', 'shift', 'status'],
                range: 1 // تجاهل الصف الأول (العناوين)
            });
            
            // تصفية البيانات الفارغة
            const validData = jsonData.filter(row => 
                row.name && row.company && row.title && row.shift && row.status
            );
            
            if (validData.length === 0) {
                alert('لم يتم العثور على بيانات صالحة في الملف. تأكد من أن الملف يحتوي على الأعمدة: الاسم، الشركة، المسمى الوظيفي، رقم الهاتف، الوردية، الحالة');
                return;
            }
            
            // عرض معاينة البيانات
            displayImportPreview(validData);
            
        } catch (error) {
            console.error('خطأ في قراءة الملف:', error);
            alert('حدث خطأ في قراءة الملف. تأكد من أن الملف بصيغة Excel صحيحة.');
        }
    };
    
    reader.readAsArrayBuffer(file);
}

// دالة عرض معاينة البيانات المستوردة
function displayImportPreview(data) {
    const previewContainer = document.getElementById('importPreview');
    const previewTable = document.getElementById('importPreviewTable');
    
    let tableHTML = `
        <table class="table table-sm">
            <thead>
                <tr>
                    <th>الاسم</th>
                    <th>الشركة</th>
                    <th>المسمى الوظيفي</th>
                    <th>رقم الهاتف</th>
                    <th>الوردية</th>
                    <th>الحالة</th>
                </tr>
            </thead>
            <tbody>
    `;
    
    data.slice(0, 5).forEach(row => {
        tableHTML += `
            <tr>
                <td>${row.name || ''}</td>
                <td>${row.company || ''}</td>
                <td>${row.title || ''}</td>
                <td>${row.tel || ''}</td>
                <td>${row.shift || ''}</td>
                <td>${row.status || ''}</td>
            </tr>
        `;
    });
    
    if (data.length > 5) {
        tableHTML += `<tr><td colspan="6" class="text-center">... و ${data.length - 5} صف آخر</td></tr>`;
    }
    
    tableHTML += '</tbody></table>';
    
    previewTable.innerHTML = tableHTML;
    previewContainer.style.display = 'block';
    document.getElementById('confirmImportBtn').style.display = 'inline-block';
    
    // حفظ البيانات للاستيراد
    window.importData = data;
}

// دالة تأكيد الاستيراد
async function confirmImport() {
    if (!window.importData) return;
    
    try {
        const importedCount = window.importData.length;
        
        window.importData.forEach(row => {
            const newEmployee = {
                id: Date.now() + Math.random(), // ضمان عدم التكرار
                name: row.name,
                company: row.company,
                title: row.title,
                tel: row.tel || '',
                shift: row.shift,
                status: row.status
            };
            employees.push(newEmployee);
        });
        
        await saveData();
        loadEmployeesData();
        
        document.getElementById('importModal').style.display = 'none';
        document.getElementById('importFile').value = '';
        document.getElementById('importPreview').style.display = 'none';
        document.getElementById('confirmImportBtn').style.display = 'none';
        
        alert(`تم استيراد ${importedCount} موظف بنجاح`);
        
    } catch (error) {
        console.error('خطأ في الاستيراد:', error);
        alert('حدث خطأ أثناء استيراد البيانات');
    }
}

// باقي الدوال الأساسية
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
    document.getElementById('logoutMenuItem').addEventListener('click', logout);

    // معالج التنقل بين الصفحات
    document.querySelectorAll('.sidebar-menu li').forEach(item => {
        if (!item.id.includes('logout') && !item.id.includes('admin')) {
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

    // معالج صفحة إدارة المستخدمين
    document.querySelector('[data-page="admin"]').addEventListener('click', function() {
        if (currentUser.role === 'admin') {
            showPage('admin');
            document.querySelectorAll('.sidebar-menu li').forEach(li => li.classList.remove('active'));
            this.classList.add('active');
        } else {
            alert('ليس لديك صلاحية للوصول إلى هذه الصفحة');
        }
    });

    // معالج إضافة موظف جديد
    document.getElementById('addEmployeeBtn').addEventListener('click', function() {
        if (!hasPermission('add')) {
            alert('ليس لديك صلاحية لإضافة الموظفين');
            return;
        }
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
        
        if (!hasPermission('add')) {
            alert('ليس لديك صلاحية لإضافة أو تعديل الموظفين');
            return;
        }
        
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
        if (!hasPermission('add')) {
            alert('ليس لديك صلاحية لإضافة المعدات');
            return;
        }
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
        
        if (!hasPermission('add')) {
            alert('ليس لديك صلاحية لإضافة أو تعديل المعدات');
            return;
        }
        
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
        
        if (!hasPermission('add')) {
            alert('ليس لديك صلاحية لتسليم المعدات');
            return;
        }
        
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
        if (hasPermission('admin')) {
            saveSettings();
        } else {
            alert('ليس لديك صلاحية لتعديل الإعدادات');
        }
    });

    // معالج مسح جميع البيانات
    document.getElementById('clearAllDataBtn').addEventListener('click', confirmClearAllData);

    // معالج استيراد الموظفين
    document.getElementById('importEmployeesBtn').addEventListener('click', function() {
        if (!hasPermission('add')) {
            alert('ليس لديك صلاحية لاستيراد البيانات');
            return;
        }
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

    // معالجات إدارة المستخدمين
    document.getElementById('addUserBtn').addEventListener('click', function() {
        document.getElementById('addUserModal').style.display = 'block';
        document.getElementById('addUserForm').reset();
        document.getElementById('editUserId').value = '';
    });

    document.getElementById('closeAddUserModal').addEventListener('click', function() {
        document.getElementById('addUserModal').style.display = 'none';
    });

    document.getElementById('cancelAddUser').addEventListener('click', function() {
        document.getElementById('addUserModal').style.display = 'none';
    });

    document.getElementById('addUserForm').addEventListener('submit', async function(e) {
        e.preventDefault();
        await addUser();
    });

    // إظهار صفحة تسجيل الدخول في البداية
    showLoginPage();
});

// دالة تعديل موظف
async function editEmployee(employeeId) {
    if (!hasPermission('edit')) {
        alert('ليس لديك صلاحية لتعديل الموظفين');
        return;
    }
    
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
    if (!hasPermission('delete')) {
        alert('ليس لديك صلاحية لحذف الموظفين');
        return;
    }
    
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
    if (!hasPermission('edit')) {
        alert('ليس لديك صلاحية لتعديل المعدات');
        return;
    }
    
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
    if (!hasPermission('delete')) {
        alert('ليس لديك صلاحية لحذف المعدات');
        return;
    }
    
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
    
    document.getElementById(page).classList.add('active');
    
    if (page === 'assignments') {
        loadEmployeeSelect();
        loadItemSelect();
    }
}

function logout() {
    currentUser = null;
    showLoginPage();
}

function loadDashboardData() {
    // إحصائيات الموظفين
    document.getElementById('totalEmployees').textContent = employees.length;
    
    // إحصائيات المخزون
    const availableItems = inventory.filter(item => item.status === 'Good').length;
    const lowStockItems = inventory.filter(item => item.status === 'Low Stock').length;
    const outOfStockItems = inventory.filter(item => item.status === 'Out of Stock').length;
    
    document.getElementById('availableItems').textContent = availableItems;
    document.getElementById('lowStockItems').textContent = lowStockItems;
    document.getElementById('outOfStockItems').textContent = outOfStockItems;
    
    // آخر عمليات التسليم
    loadRecentAssignments();
    
    // الرسوم البيانية
    loadCharts();
}

function loadRecentAssignments() {
    const recentAssignments = assignments.slice(-5).reverse();
    const tableBody = document.getElementById('recentAssignmentsTable');
    
    if (recentAssignments.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="4" class="text-center">لا توجد عمليات تسليم مسجلة</td></tr>';
        return;
    }
    
    tableBody.innerHTML = recentAssignments.map(assignment => `
        <tr>
            <td>${assignment.date}</td>
            <td>${assignment.employeeName}</td>
            <td>${assignment.itemName} (${assignment.size})</td>
            <td>${assignment.quantity}</td>
        </tr>
    `).join('');
}

function loadCharts() {
    // رسم بياني لحالة الموظفين
    const employeeStatusData = {
        'نشط': employees.filter(e => e.status === 'نشط').length,
        'غير نشط': employees.filter(e => e.status === 'غير نشط').length,
        'ترك العمل': employees.filter(e => e.status === 'ترك العمل').length
    };
    
    const employeeCtx = document.getElementById('employeeStatusChart').getContext('2d');
    new Chart(employeeCtx, {
        type: 'doughnut',
        data: {
            labels: Object.keys(employeeStatusData),
            datasets: [{
                data: Object.values(employeeStatusData),
                backgroundColor: ['#28a745', '#ffc107', '#dc3545']
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false
        }
    });
    
    // رسم بياني لحالة المخزون
    const inventoryStatusData = {
        'متوفر': inventory.filter(i => i.status === 'Good').length,
        'مخزون منخفض': inventory.filter(i => i.status === 'Low Stock').length,
        'منتهي': inventory.filter(i => i.status === 'Out of Stock').length
    };
    
    const inventoryCtx = document.getElementById('inventoryStatusChart').getContext('2d');
    new Chart(inventoryCtx, {
        type: 'bar',
        data: {
            labels: Object.keys(inventoryStatusData),
            datasets: [{
                data: Object.values(inventoryStatusData),
                backgroundColor: ['#28a745', '#ffc107', '#dc3545']
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            }
        }
    });
}

function loadEmployeesData() {
    const tableBody = document.getElementById('employeesTable');
    
    if (employees.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="5" class="text-center">لا توجد بيانات</td></tr>';
        return;
    }
    
    tableBody.innerHTML = employees.map(employee => `
        <tr>
            <td>
                <a href="#" class="employee-name-link" onclick="showEmployeeDetails(${employee.id})">
                    ${employee.name}
                </a>
            </td>
            <td>${employee.company}</td>
            <td>${employee.title}</td>
            <td>
                <span class="badge ${employee.status === 'نشط' ? 'bg-success' : employee.status === 'غير نشط' ? 'bg-warning' : 'bg-danger'}">
                    ${employee.status}
                </span>
            </td>
            <td>
                ${hasPermission('edit') ? `
                    <button class="btn btn-sm btn-outline-primary me-1" onclick="editEmployee(${employee.id})">
                        <i class="fas fa-edit"></i>
                    </button>
                ` : ''}
                ${hasPermission('delete') ? `
                    <button class="btn btn-sm btn-outline-danger" onclick="deleteEmployee(${employee.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                ` : ''}
            </td>
        </tr>
    `).join('');
}

function loadInventoryData() {
    const tableBody = document.getElementById('inventoryTable');
    
    if (inventory.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="6" class="text-center">لا توجد بيانات</td></tr>';
        return;
    }
    
    tableBody.innerHTML = inventory.map(item => `
        <tr>
            <td>${item.itemName}</td>
            <td>${item.type}</td>
            <td>${item.size}</td>
            <td>${item.currentStock}</td>
            <td>
                <span class="badge ${item.status === 'Good' ? 'bg-success' : item.status === 'Low Stock' ? 'bg-warning' : 'bg-danger'}">
                    ${item.status === 'Good' ? 'متوفر' : item.status === 'Low Stock' ? 'مخزون منخفض' : 'منتهي'}
                </span>
            </td>
            <td>
                ${hasPermission('edit') ? `
                    <button class="btn btn-sm btn-outline-primary me-1" onclick="editItem(${item.id})">
                        <i class="fas fa-edit"></i>
                    </button>
                ` : ''}
                ${hasPermission('delete') ? `
                    <button class="btn btn-sm btn-outline-danger" onclick="deleteItem(${item.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                ` : ''}
            </td>
        </tr>
    `).join('');
}

function loadAssignmentsTable() {
    const tableBody = document.getElementById('assignmentsTable');
    
    if (assignments.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="6" class="text-center">لا توجد عمليات تسليم مسجلة</td></tr>';
        return;
    }
    
    tableBody.innerHTML = assignments.map(assignment => `
        <tr>
            <td>${assignment.date}</td>
            <td>${assignment.employeeName}</td>
            <td>${assignment.itemName}</td>
            <td>${assignment.size}</td>
            <td>${assignment.quantity}</td>
            <td>${assignment.reason || '-'}</td>
        </tr>
    `).join('');
}

function loadEmployeeSelect() {
    const select = document.getElementById('employeeSelect');
    select.innerHTML = '<option value="">اختر الموظف</option>';
    
    employees.filter(e => e.status === 'نشط').forEach(employee => {
        const option = document.createElement('option');
        option.value = employee.id;
        option.textContent = employee.name;
        select.appendChild(option);
    });
}

function loadItemSelect() {
    const select = document.getElementById('itemSelect');
    select.innerHTML = '<option value="">اختر المعدة</option>';
    
    inventory.filter(i => i.currentStock > 0).forEach(item => {
        const option = document.createElement('option');
        option.value = item.id;
        option.textContent = `${item.itemName} (${item.size}) - متوفر: ${item.currentStock}`;
        select.appendChild(option);
    });
}

function searchEmployees() {
    const searchTerm = document.getElementById('employeeSearchInput').value.toLowerCase();
    const filteredEmployees = employees.filter(employee => 
        employee.name.toLowerCase().includes(searchTerm) ||
        employee.company.toLowerCase().includes(searchTerm) ||
        employee.title.toLowerCase().includes(searchTerm)
    );
    
    const tableBody = document.getElementById('employeesTable');
    
    if (filteredEmployees.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="5" class="text-center">لا توجد نتائج</td></tr>';
        return;
    }
    
    tableBody.innerHTML = filteredEmployees.map(employee => `
        <tr>
            <td>
                <a href="#" class="employee-name-link" onclick="showEmployeeDetails(${employee.id})">
                    ${employee.name}
                </a>
            </td>
            <td>${employee.company}</td>
            <td>${employee.title}</td>
            <td>
                <span class="badge ${employee.status === 'نشط' ? 'bg-success' : employee.status === 'غير نشط' ? 'bg-warning' : 'bg-danger'}">
                    ${employee.status}
                </span>
            </td>
            <td>
                ${hasPermission('edit') ? `
                    <button class="btn btn-sm btn-outline-primary me-1" onclick="editEmployee(${employee.id})">
                        <i class="fas fa-edit"></i>
                    </button>
                ` : ''}
                ${hasPermission('delete') ? `
                    <button class="btn btn-sm btn-outline-danger" onclick="deleteEmployee(${employee.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                ` : ''}
            </td>
        </tr>
    `).join('');
}

async function saveSettings() {
    settings.companyName = document.getElementById('companyName').value;
    settings.lowStockThreshold = parseInt(document.getElementById('lowStockThreshold').value);
    settings.notificationEmail = document.getElementById('notificationEmail').value;
    
    await saveData();
    alert('تم حفظ الإعدادات بنجاح');
}

function generateInventoryReport() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    // إعداد الخط العربي
    doc.setFont('helvetica');
    doc.setFontSize(16);
    doc.text('Inventory Report', 20, 20);
    
    // إنشاء الجدول
    const tableData = inventory.map(item => [
        item.itemName,
        item.type,
        item.size,
        item.currentStock.toString(),
        item.status === 'Good' ? 'Available' : item.status === 'Low Stock' ? 'Low Stock' : 'Out of Stock'
    ]);
    
    doc.autoTable({
        head: [['Item Name', 'Type', 'Size', 'Current Stock', 'Status']],
        body: tableData,
        startY: 30
    });
    
    doc.save('inventory-report.pdf');
}

function generateAssignmentsReport() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    // إعداد الخط العربي
    doc.setFont('helvetica');
    doc.setFontSize(16);
    doc.text('Assignments Report', 20, 20);
    
    // إنشاء الجدول
    const tableData = assignments.map(assignment => [
        assignment.date,
        assignment.employeeName,
        assignment.itemName,
        assignment.size,
        assignment.quantity.toString(),
        assignment.reason || '-'
    ]);
    
    doc.autoTable({
        head: [['Date', 'Employee', 'Item', 'Size', 'Quantity', 'Reason']],
        body: tableData,
        startY: 30
    });
    
    doc.save('assignments-report.pdf');
}

// دالة حفظ البيانات في localStorage (احتياطي)
function saveDataToLocalStorage() {
    localStorage.setItem('employees', JSON.stringify(employees));
    localStorage.setItem('inventory', JSON.stringify(inventory));
    localStorage.setItem('assignments', JSON.stringify(assignments));
    localStorage.setItem('users', JSON.stringify(users));
    localStorage.setItem('settings', JSON.stringify(settings));
}

// دالة تحميل البيانات من localStorage (احتياطي)
function loadDataFromLocalStorage() {
    const savedEmployees = localStorage.getItem('employees');
    const savedInventory = localStorage.getItem('inventory');
    const savedAssignments = localStorage.getItem('assignments');
    const savedUsers = localStorage.getItem('users');
    const savedSettings = localStorage.getItem('settings');
    
    if (savedEmployees) employees = JSON.parse(savedEmployees);
    if (savedInventory) inventory = JSON.parse(savedInventory);
    if (savedAssignments) assignments = JSON.parse(savedAssignments);
    if (savedUsers) users = JSON.parse(savedUsers);
    if (savedSettings) settings = JSON.parse(savedSettings);
    
    // إذا لم توجد مستخدمين، استخدم المستخدمين الافتراضيين
    if (users.length === 0) {
        users = [...defaultUsers];
    }
}

