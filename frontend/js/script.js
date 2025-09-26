document.addEventListener('DOMContentLoaded', () => {
    const uploadForm = document.getElementById('uploadForm');
    const uploadStatus = document.getElementById('uploadStatus');

    if (uploadForm) {
        uploadForm.addEventListener('submit', async function(event) {
            event.preventDefault();
            const videoTitle = document.getElementById('videoTitle').value;
            const videoFile = document.getElementById('videoFile').files[0];
            const pdfFile = document.getElementById('pdfFile').files[0];
            const course = document.getElementById('courseSelect').value;

            if (!videoFile) {
                uploadStatus.innerHTML = `<div class="alert alert-danger">الرجاء اختيار ملف فيديو أولاً.</div>`;
                return;
            }

            const formData = new FormData();
            formData.append('title', videoTitle);
            formData.append('course', course);
            formData.append('video', videoFile);
            if (pdfFile) formData.append('pdf', pdfFile);

            uploadStatus.innerHTML = `<div class="alert alert-info">جاري رفع الملفات...</div>`;

            try {
                const response = await fetch('http://localhost:3000/upload', {
                    method: 'POST',
                    body: formData
                });
                const result = await response.json();
                if (response.ok) {
                    uploadStatus.innerHTML = `<div class="alert alert-success">${result.message}</div>`;
                    uploadForm.reset();
                    loadCourseContent(course); // تحديث الفيديوهات والـ PDF للكورس
                } else {
                    throw new Error(result.message || 'حدث خطأ غير متوقع من السيرفر.');
                }
            } catch (err) {
                console.error(err);
                uploadStatus.innerHTML = `<div class="alert alert-danger">فشل الاتصال بالسيرفر.</div>`;
            }
        });
    }

    // تحميل المحتوى لكل الكورسات عند فتح الصفحة
    ['mobile', 'embedded'].forEach(course => loadCourseContent(course));
});

async function loadCourseContent(course) {
    const videoContainer = document.getElementById(`${course}-videos`);
    const pdfContainer = document.getElementById(`${course}-pdfs`);

    // فيديوهات
    try {
        const res = await fetch(`http://localhost:3000/api/videos/${course}`);
        const videos = await res.json();
        videoContainer.innerHTML = '';
        videos.forEach(video => {
            const div = document.createElement('div');
            div.className = 'mb-3';
            div.innerHTML = `<video width="100%" controls src="${video.url}"></video>`;
            videoContainer.appendChild(div);
        });
    } catch {
        videoContainer.innerHTML = '<p class="text-danger">فشل تحميل الفيديوهات.</p>';
    }

    // PDF
    try {
        const res = await fetch(`http://localhost:3000/api/pdfs/${course}`);
        const pdfs = await res.json();
        pdfContainer.innerHTML = '';
        pdfs.forEach(pdf => {
            const link = document.createElement('a');
            link.href = pdf.url;
            link.target = '_blank';
            link.innerText = pdf.name;
            link.className = 'd-block mb-1';
            pdfContainer.appendChild(link);
        });
    } catch {
        pdfContainer.innerHTML = '<p class="text-danger">فشل تحميل ملفات PDF.</p>';
    }
}
