# نظام إدارة معدات الحماية الشخصية مع Firebase

## PPE Management System with Firebase Integration

نظام شامل لإدارة معدات الحماية الشخصية مع تكامل Firebase لحفظ البيانات في السحابة.

### المميزات

- **إدارة الموظفين**: إضافة وتعديل وحذف بيانات الموظفين
- **إدارة المخزون**: تتبع معدات الحماية الشخصية والمخزون
- **تسليم المعدات**: تسجيل عمليات تسليم المعدات للموظفين
- **التقارير**: إنشاء تقارير PDF للمخزون والتسليمات
- **لوحة التحكم**: عرض إحصائيات شاملة مع رسوم بيانية
- **Firebase Integration**: حفظ البيانات في السحابة مع إمكانية الوصول من أي مكان

### التقنيات المستخدمة

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **UI Framework**: Bootstrap 5
- **Charts**: Chart.js
- **PDF Generation**: jsPDF
- **Excel Import**: SheetJS
- **Database**: Firebase Firestore
- **Icons**: Font Awesome

### كيفية الاستخدام

1. افتح الملف `index.html` في المتصفح
2. استخدم بيانات تسجيل الدخول التجريبية:
   - المدير: `admin` / `admin123`
   - المستخدم: `user` / `user123`
3. ابدأ في إدارة الموظفين والمعدات

### إعداد Firebase

1. قم بإنشاء مشروع Firebase جديد
2. فعّل Firestore Database
3. استبدل تكوين Firebase في ملف `firebase-script.js`
4. تأكد من إعداد قواعد الأمان المناسبة

### الملفات

- `index.html` - الواجهة الرئيسية للتطبيق
- `firebase-script.js` - منطق التطبيق مع تكامل Firebase
- `style.css` - تنسيقات CSS (مضمنة في HTML)

### المطور

تم تطوير هذا النظام بواسطة Manus AI لإدارة معدات الحماية الشخصية بكفاءة عالية.

### الترخيص

هذا المشروع مفتوح المصدر ومتاح للاستخدام والتطوير.

---

## English

A comprehensive Personal Protective Equipment (PPE) management system with Firebase cloud integration.

### Features

- Employee management with full CRUD operations
- Inventory tracking for PPE items
- Equipment assignment logging
- PDF report generation
- Dashboard with analytics and charts
- Real-time Firebase cloud synchronization

### Technologies

- HTML5, CSS3, JavaScript
- Bootstrap 5, Chart.js, jsPDF
- Firebase Firestore
- Font Awesome icons

### Usage

1. Open `index.html` in your browser
2. Use demo credentials: `admin`/`admin123` or `user`/`user123`
3. Start managing your PPE inventory and assignments

### Firebase Setup

1. Create a new Firebase project
2. Enable Firestore Database
3. Replace Firebase config in `firebase-script.js`
4. Configure appropriate security rules

