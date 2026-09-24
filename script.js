let canvas, ctx;

if ("scrollRestoration" in history) {
    history.scrollRestoration = "manual";
}
window.scrollTo(0, 0);

window.addEventListener("pageshow", () => {
    window.scrollTo(0, 0);
});

window.addEventListener("load", () => {
    const pageTransition = document.getElementById("page-transition");
    if (!pageTransition) return;
    setTimeout(() => {
        pageTransition.remove();
    }, 3200);
});

document.addEventListener('DOMContentLoaded', () => {
    const startBtn = document.getElementById('startBtn');
    const resetBtn = document.getElementById('resetBtn');
    const simulation = document.getElementById('simulation');
    const problemSection = document.querySelector('.problem-section');
    const interactionSection = document.querySelector('.interaction-section');
    const developerBtn = document.getElementById('developerBtn');
    const developerSection = document.querySelector('.developer-section');

    canvas = document.getElementById('fingerprintCanvas');
    
    startBtn.addEventListener('click', async () => {
        problemSection.classList.add('hidden');
        interactionSection.classList.add('hidden');
        simulation.classList.remove('hidden');
        
        canvas = document.getElementById('fingerprintCanvas');
        ctx = canvas.getContext('2d');
        canvas.width = 400;
        canvas.height = 300;
        
        drawInitialFingerprint();
        await getRealUserData();
        showNotification('Data lokasi & IP Anda berhasil dikumpulkan!');
    });

    resetBtn.addEventListener('click', () => {
        trackedData = {
            preferences: 0,
            location: 0,
            personal: 0,
            behavior: 0,
            activities: []
        };
        userRealData = {
            ip: null,
            country: null,
            city: null,
            latitude: null,
            longitude: null,
            isp: null
        };
        updateDisplay();
        clearDetails();
        clearInsights();
        drawInitialFingerprint();
    });

    document.querySelectorAll('.btn-activity').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            const card = e.target.closest('.activity-card');
            const activity = card.dataset.activity;
            await performActivityWithRealData(activity);
        });
    });

    developerBtn.addEventListener('click', () => {
        developerSection.classList.remove('hidden');
        developerSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
});

const activityData = {
    search: {
        name: 'Pencarian Web',
        collected: [
            'Query pencarian: "cara membuat KTP online"',
            'Waktu pencarian: ' + new Date().toLocaleString('id-ID'),
            'IP Address: 192.168.1.xxx',
            'Browser: Chrome 120',
            'Perangkat: Windows 11',
            'Riwayat pencarian tersimpan',
            'Cookie pelacak tertanam'
        ],
        impact: { preferences: 3, location: 1, personal: 2, behavior: 4 }
    },
    social: {
        name: 'Media Sosial',
        collected: [
            'Lokasi posting: Jakarta Selatan',
            'Waktu aktivitas: ' + new Date().toLocaleString('id-ID'),
            'Teman yang di-tag: 5 orang',
            'Foto wajah (biometric data)',
            'Metadata foto: kamera, lokasi GPS',
            'Pola aktivitas harian',
            'Jaringan pertemanan',
            'Likes & interests'
        ],
        impact: { preferences: 5, location: 3, personal: 8, behavior: 5 }
    },
    shop: {
        name: 'Belanja Online',
        collected: [
            'Produk dilihat: Laptop Gaming',
            'Harga yang dicari: 10-15 juta',
            'Alamat pengiriman lengkap',
            'Nomor telepon',
            'Metode pembayaran tersimpan',
            'Riwayat pembelian',
            'Preferensi produk',
            'Budget range'
        ],
        impact: { preferences: 6, location: 2, personal: 5, behavior: 4 }
    },
    location: {
        name: 'Berbagi Lokasi',
        collected: [
            'Koordinat GPS: -6.xxx, 106.xxx',
            'Lokasi: Mall Central Park',
            'Waktu check-in: ' + new Date().toLocaleString('id-ID'),
            'Rute perjalanan',
            'Tempat yang sering dikunjungi',
            'Pola mobilitas harian',
            'Alamat rumah/kantor (estimasi)'
        ],
        impact: { preferences: 2, location: 10, personal: 3, behavior: 5 }
    },
    video: {
        name: 'Streaming Video',
        collected: [
            'Video ditonton: "Tutorial Coding Python"',
            'Durasi menonton: 45 menit',
            'Video yang di-skip',
            'Waktu menonton (malam/siang)',
            'Konten yang disukai',
            'Kanal yang di-subscribe',
            'Komentar & engagement',
            'Rekomendasi profil'
        ],
        impact: { preferences: 7, location: 0, personal: 2, behavior: 6 }
    },
    email: {
        name: 'Email & Chat',
        collected: [
            'Kontak email: 15 orang',
            'Isi percakapan (scan kata kunci)',
            'Attachment yang dikirim',
            'Waktu aktivitas chat',
            'Pola komunikasi',
            'Relasi dengan kontak',
            'Minat berdasarkan topik',
            'Metadata pesan'
        ],
        impact: { preferences: 4, location: 0, personal: 9, behavior: 3 }
    }
};

let trackedData = {
    preferences: 0,
    location: 0,
    personal: 0,
    behavior: 0,
    activities: []
};

let userRealData = {
    ip: null,
    country: null,
    city: null,
    latitude: null,
    longitude: null,
    isp: null
};

async function getRealUserData() {
    try {
        const ipRes = await fetch('https://ipinfo.io/json?token=94c2ea29de0e9d');
        const ipData = await ipRes.json();
        
        userRealData.ip = ipData.ip || 'N/A';
        userRealData.country = ipData.country || 'N/A';
        userRealData.city = ipData.city || 'N/A';
        userRealData.isp = ipData.org || 'N/A';
        
        if (ipData.loc) {
            const [lat, lon] = ipData.loc.split(',');
            userRealData.latitude = parseFloat(lat).toFixed(6);
            userRealData.longitude = parseFloat(lon).toFixed(6);
        }
        
        updateRealDataDisplay();
        
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    const lat = position.coords.latitude;
                    const lon = position.coords.longitude;
                    userRealData.latitude = lat.toFixed(6);
                    userRealData.longitude = lon.toFixed(6);
                    
                    updateRealDataDisplay();
                    
                    try {
                        const geoRes = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`);
                        const geoData = await geoRes.json();
                        if (geoData.address) {
                            const addr = geoData.address;
                            userRealData.city = addr.city || addr.town || addr.village || userRealData.city;
                            userRealData.country = addr.country || userRealData.country;
                            updateRealDataDisplay();
                        }
                    } catch (e) {
                        console.log('Reverse geocoding failed');
                    }
                },
                () => {
                    if (!userRealData.latitude) {
                        userRealData.latitude = 'Tidak diizinkan';
                        userRealData.longitude = 'Tidak diizinkan';
                    }
                    updateRealDataDisplay();
                }
            );
        }
    } catch (error) {
        console.log('Error fetching IP data:', error);
        userRealData.ip = 'Error mengambil data';
        updateRealDataDisplay();
    }
}

function updateRealDataDisplay() {
    document.getElementById('real-ip').textContent = userRealData.ip || 'Memuat...';
    document.getElementById('real-gps').textContent = `${userRealData.latitude || 'Memuat...'}, ${userRealData.longitude || 'Memuat...'}`;
    document.getElementById('real-city').textContent = userRealData.city || 'Memuat...';
    document.getElementById('real-country').textContent = userRealData.country || 'Memuat...';
    document.getElementById('real-isp').textContent = userRealData.isp || 'Memuat...';
    document.getElementById('real-ua').textContent = navigator.userAgent;
}

async function performActivityWithRealData(activityType) {
    await getRealUserData();
    
    const data = activityData[activityType];
    const activityDataWithReal = { ...data };
    
    activityDataWithReal.collected = [
        ...data.collected.filter(item => 
            !item.includes('IP Address:') && 
            !item.includes('Koordinat GPS:') &&
            !item.includes('Lokasi posting:') &&
            !item.includes('Lokasi:')
        ),
        `IP Address: ${userRealData.ip}`,
        `Koordinat GPS: ${userRealData.latitude}, ${userRealData.longitude}`,
        `Lokasi: ${userRealData.city}, ${userRealData.country}`,
        `ISP/Provider: ${userRealData.isp}`
    ];
    
    trackedData.preferences += data.impact.preferences;
    trackedData.location += data.impact.location;
    trackedData.personal += data.impact.personal;
    trackedData.behavior += data.impact.behavior;
    trackedData.activities.push(activityType);

    updateDisplay();
    addDetails(activityDataWithReal);
    updateInsights();
    drawFingerprint();

    showNotification(`Data dari "${data.name}" telah dikumpulkan!`);
}

function performActivity(activityType) {
    const data = activityData[activityType];
    
    trackedData.preferences += data.impact.preferences;
    trackedData.location += data.impact.location;
    trackedData.personal += data.impact.personal;
    trackedData.behavior += data.impact.behavior;
    trackedData.activities.push(activityType);

    updateDisplay();
    addDetails(data);
    updateInsights();
    drawFingerprint();

    showNotification(`Data dari "${data.name}" telah dikumpulkan!`);
}

function updateDisplay() {
    document.getElementById('preferences-count').textContent = trackedData.preferences;
    document.getElementById('location-count').textContent = trackedData.location;
    document.getElementById('personal-count').textContent = trackedData.personal;
    document.getElementById('behavior-count').textContent = trackedData.behavior;

    document.querySelectorAll('.data-count').forEach(el => {
        el.classList.add('animate-pulse');
        setTimeout(() => el.classList.remove('animate-pulse'), 1000);
    });
}

function addDetails(data) {
    const detailsList = document.getElementById('details-list');
    const detailItem = document.createElement('div');
    detailItem.className = 'detail-item';
    detailItem.innerHTML = `<strong>${data.name}</strong>`;
    
    data.collected.forEach(item => {
        const span = document.createElement('div');
        span.innerHTML = `• ${item}`;
        span.style.marginTop = '5px';
        detailItem.appendChild(span);
    });

    detailsList.appendChild(detailItem);
}

function clearDetails() {
    document.getElementById('details-list').innerHTML = '';
}

function updateInsights() {
    const insights = document.getElementById('insights');
    const total = trackedData.preferences + trackedData.location + 
                  trackedData.personal + trackedData.behavior;
    
    insights.innerHTML = '';

    if (total === 0) return;

    if (total < 20) {
        addInsight(insights, 'Jejak digital Anda masih minimal. Namun sudah mulai terbentuk profil dasar tentang Anda.');
    } else if (total < 40) {
        addInsight(insights, 'Cukup banyak data terkumpul! Platform sudah bisa membuat profil cukup detail tentang preferensi Anda.');
    } else if (total < 60) {
        addInsight(insights, 'Data Anda sangat banyak! Advertiser bisa menargetkan iklan dengan sangat spesifik ke Anda.');
    } else {
        addInsight(insights, 'Jejak digital Anda sangat masif! Hampir semua aktivitas online Anda terpantau dan tercatat.');
    }

    if (trackedData.location > 5) {
        addInsight(insights, '[PERINGATAN] Data lokasi Anda banyak terlacak. Siapapun bisa tahu rutinitas dan tempat favorit Anda.');
    }

    if (trackedData.personal > 10) {
        addInsight(insights, '[BAHAYA] Data personal sangat tinggi! Identitas dan kehidupan pribadi Anda sangat terbuka.');
    }

    if (trackedData.activities.length >= 4) {
        addInsight(insights, '[ANALISIS] Dengan data dari berbagai platform, profil Anda bisa dijual ke ratusan perusahaan.');
    }

    const uniqueness = Math.min(95, (total * 1.5).toFixed(1));
    addInsight(insights, `[SIDIK JARI] Digital fingerprint Anda ${uniqueness}% unik. Anda bisa dilacak meski tanpa login.`);
}

function addInsight(container, text) {
    const item = document.createElement('div');
    item.className = 'insight-item';
    item.textContent = text;
    container.appendChild(item);
}

function clearInsights() {
    document.getElementById('insights').innerHTML = '';
}

function drawInitialFingerprint() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = '#35f2c4';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(200, 150, 50, 0, Math.PI * 2);
    ctx.stroke();
}

function drawFingerprint() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    const centerX = 200;
    const centerY = 150;
    const activities = trackedData.activities.length;
    const total = trackedData.preferences + trackedData.location + 
                  trackedData.personal + trackedData.behavior;

    for (let i = 0; i < activities; i++) {
        const angle = (Math.PI * 2 * i) / Math.max(activities, 1);
        const radius = 30 + (total * 2);
        const x = centerX + Math.cos(angle) * radius;
        const y = centerY + Math.sin(angle) * radius;

        ctx.beginPath();
        ctx.arc(x, y, 10 + (i * 2), 0, Math.PI * 2);
        ctx.strokeStyle = `hsl(${160 - i * 12}, 85%, 60%)`;
        ctx.lineWidth = 2;
        ctx.stroke();
    }

    for (let i = 0; i < total / 3; i++) {
        const angle = Math.random() * Math.PI * 2;
        const radius = 20 + Math.random() * (total * 1.5);
        const x = centerX + Math.cos(angle) * radius;
        const y = centerY + Math.sin(angle) * radius;

        ctx.beginPath();
        ctx.arc(x, y, 2, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(53, 242, 196, ${0.3 + Math.random() * 0.4})`;
        ctx.fill();
    }

    ctx.beginPath();
    ctx.arc(centerX, centerY, 10, 0, Math.PI * 2);
    ctx.fillStyle = '#ffb224';
    ctx.fill();

    for (let i = 1; i <= 5; i++) {
        ctx.beginPath();
        ctx.arc(centerX, centerY, 10 + (i * (total / 2)), 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(53, 242, 196, ${0.6 - i * 0.1})`;
        ctx.lineWidth = 1;
        ctx.stroke();
    }
}

function showNotification(message) {
    const notification = document.createElement('div');
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 30px;
        right: 30px;
        background: #0d1216;
        color: #edf1f4;
        padding: 16px 22px 16px 18px;
        border-radius: 6px;
        border: 1px solid #242e36;
        border-left: 3px solid #35f2c4;
        box-shadow: 0 12px 32px rgba(0, 0, 0, 0.5);
        z-index: 1000;
        animation: slideIn 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        font-family: 'JetBrains Mono', monospace;
        font-weight: 500;
        font-size: 0.85em;
        letter-spacing: 0.04em;
        max-width: 340px;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.4s cubic-bezier(0.4, 0, 0.2, 1)';
        setTimeout(() => notification.remove(), 400);
    }, 3500);
}
