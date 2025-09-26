const express = require('express');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 3000;

// السماح بالـ CORS
app.use(cors());

// مجلد للملفات الثابتة (الـ HTML، CSS، JS)
app.use(express.static(path.join(__dirname, '../frontend')));

// إنشاء مجلدات لكل كورس لو مش موجودة
const courses = ['mobile', 'embedded'];
courses.forEach(course => {
    if (!fs.existsSync(`uploads/${course}/videos`)) fs.mkdirSync(`uploads/${course}/videos`, { recursive: true });
    if (!fs.existsSync(`uploads/${course}/pdfs`)) fs.mkdirSync(`uploads/${course}/pdfs`, { recursive: true });
});

// إعداد multer لحفظ الفيديوهات والـ PDF
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const course = req.body.course;
        if (file.mimetype.includes('video')) cb(null, `uploads/${course}/videos`);
        else if (file.mimetype === 'application/pdf') cb(null, `uploads/${course}/pdfs`);
        else cb(new Error('File type not supported'), false);
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    }
});
const upload = multer({ storage: storage });

// رفع الفيديو أو PDF
app.post('/upload', upload.fields([{ name: 'video', maxCount: 1 }, { name: 'pdf', maxCount: 1 }]), (req, res) => {
    res.json({ message: 'تم رفع الملفات بنجاح' });
});

// API لجلب الفيديوهات لكل كورس
app.get('/api/videos/:course', (req, res) => {
    const course = req.params.course;
    const dir = `uploads/${course}/videos`;
    if (!fs.existsSync(dir)) return res.json([]);

    const files = fs.readdirSync(dir).map(file => ({
        name: file,
        url: `/uploads/${course}/videos/${file}`
    }));
    res.json(files);
});

// API لجلب ملفات PDF لكل كورس
app.get('/api/pdfs/:course', (req, res) => {
    const course = req.params.course;
    const dir = `uploads/${course}/pdfs`;
    if (!fs.existsSync(dir)) return res.json([]);

    const files = fs.readdirSync(dir).map(file => ({
        name: file,
        url: `/uploads/${course}/pdfs/${file}`
    }));
    res.json(files);
});

// جعل مجلدات التحميل ثابتة للعرض على الموقع
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// تشغيل السيرفر
app.listen(PORT, () => {
    console.log(`✅ Server is running on http://localhost:${PORT}`);
});
