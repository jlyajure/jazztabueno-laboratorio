import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { initializeFirestore, collection, query, orderBy, onSnapshot, addDoc, deleteDoc, doc, updateDoc, increment, getDocs } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { getAnalytics, logEvent } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-analytics.js";

// Configuración de Chromecast
window.castUrl = ""; window.castTitle = ""; window.castCover = ""; window.lastTvTime = 0;
window['__onGCastApiAvailable'] = function(isAvailable) {
    if (isAvailable) {
        const castContext = cast.framework.CastContext.getInstance();
        castContext.setOptions({ 
            receiverApplicationId: chrome.cast.media.DEFAULT_MEDIA_RECEIVER_APP_ID, 
            autoJoinPolicy: chrome.cast.AutoJoinPolicy.ORIGIN_SCOPED 
        });
        const player = new cast.framework.RemotePlayer();
        const controller = new cast.framework.RemotePlayerController(player);
        controller.addEventListener(cast.framework.RemotePlayerEventType.CURRENT_TIME_CHANGED, () => {
            window.lastTvTime = player.currentTime;
        });
        castContext.addEventListener(cast.framework.CastContextEventType.SESSION_STATE_CHANGED, (event) => {
            const media = document.getElementById('main-media');
            if (event.sessionState === 'SESSION_STARTED') {
                media.pause();
                const session = castContext.getCurrentSession();
                const info = new chrome.cast.media.MediaInfo(window.castUrl, 'audio/mp3');
                const meta = new chrome.cast.media.MusicTrackMediaMetadata();
                meta.title = window.castTitle; meta.artist = "Jazztabueno Productions";
                meta.images = [new chrome.cast.Image(window.castCover)];
                info.metadata = meta;
                const req = new chrome.cast.media.LoadRequest(info);
                req.currentTime = media.currentTime;
                session.loadMedia(req);
            }
        });
    }
};

// Iconos SVG
const SVG_PLAY = `<svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z" fill="white"/></svg>`; 
const SVG_PAUSE = `<svg viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" fill="white"/></svg>`;

// Base de datos de la Bóveda del Legado
window.MIS_ARCHIVOS_BOVEDA = [
    { año: 2025, categoria: "Studio 79", titulo: "Especial Studio Mix Two", url: "https://archive.org/download/studio-79-13-2025-especial-studio-mix-one/Studio79%20-%2019_2025%20_ESPECIAL%20STUDIO%20MIX%20TWO_.mp3", plataforma: "archive" },
    { año: 2025, categoria: "Studio 79", titulo: "Funky Fever", url: "https://www.mixcloud.com/widget/iframe/?hide_cover=1&mini=1&feed=%2FStudio79%2Fstudio79-182025-funky-fever%2F", plataforma: "mixcloud" },
    { año: 2025, categoria: "Studio 79", titulo: "Especial Studio Mix One", url: "https://archive.org/download/studio-79-13-2025-especial-studio-mix-one/Studio79%20-%2013_2025%20_ESPECIAL%20STUDIO%20MIX%20ONE_.mp3", plataforma: "archive" },
    { año: 2025, categoria: "Studio 79", titulo: "Disco Nights", url: "https://www.mixcloud.com/widget/iframe/?hide_cover=1&mini=1&feed=%2FStudio79%2Fstudio79-122025-disco-nights%2F", plataforma: "mixcloud" },
    { año: 2025, categoria: "Studio 79", titulo: "Rhythm & Blues", url: "https://archive.org/download/programa-11-rhythm-blues/Programa%2011%20%28Rhythm%20%26%20Blues%29.mp3", plataforma: "archive" }, 
    { año: 2025, categoria: "Studio 79", titulo: "Especial Music IA", url: "https://www.mixcloud.com/widget/iframe/?hide_cover=1&mini=1&feed=%2FStudio79%2Fstudio79-142025-especial-music-ia%2F", plataforma: "mixcloud" },
    { año: 2025, categoria: "Studio 79", titulo: "Moonlight Deadline", url: "https://www.mixcloud.com/widget/iframe/?hide_cover=1&mini=1&feed=%2FStudio79%2Fstudio79-152025-moonlight-deadline%2F", plataforma: "mixcloud" },
    { año: 2025, categoria: "Studio 79", titulo: "You Win Again", url: "https://www.mixcloud.com/widget/iframe/?hide_cover=1&mini=1&feed=%2FStudio79%2Fstudio79-172025-you-win-again%2F", plataforma: "mixcloud" },
    { año: 2025, categoria: "Studio 79", titulo: "Be Good", url: "https://www.mixcloud.com/widget/iframe/?hide_cover=1&mini=1&feed=%2FStudio79%2Fstudio79-162025-be-good%2F", plataforma: "mixcloud" },
    { año: 2025, categoria: "JAZZTABUENO", titulo: "Seductive Soul", url: "https://www.mixcloud.com/widget/iframe/?hide_cover=1&mini=1&feed=%2FJazzTaBueno%2Fjazztabueno-042025-seductive-soul%2F", plataforma: "mixcloud" },
    { año: 2025, categoria: "Salsa Brava", titulo: "Traigo Salsa", url: "https://www.mixcloud.com/widget/iframe/?hide_cover=1&mini=1&feed=%2FByJTB%2Fsalsabrava-072025-traigo-salsa%2F", plataforma: "mixcloud" },
    { año: 2025, categoria: "Salsa Brava", titulo: "Salsa 1983", url: "https://www.mixcloud.com/widget/iframe/?hide_cover=1&mini=1&feed=%2FByJTB%2Fsalsabrava-062025-1983%2F", plataforma: "mixcloud" },
    { año: 2025, categoria: "Salsa Brava", titulo: "Palo Pa Rumba", url: "https://www.mixcloud.com/widget/iframe/?hide_cover=1&mini=1&feed=%2FByJTB%2Fsalsabrava-082025-palo-pa-rumba%2F", plataforma: "mixcloud" },
    { año: 2025, categoria: "Salsa Brava", titulo: "La Libertad", url: "https://www.mixcloud.com/widget/iframe/?hide_cover=1&mini=1&feed=%2FByJTB%2Fsalsabrava-092025-la-libertad%2F", plataforma: "mixcloud" },
    { año: 2025, categoria: "Salsa Brava", titulo: "Escucha El Ritmo", url: "https://www.mixcloud.com/widget/iframe/?hide_cover=1&mini=1&feed=%2FByJTB%2Fsalsabrava-102025-escucha-el-ritmo%2F", plataforma: "mixcloud" },
    { año: 2025, categoria: "Salsa Brava", titulo: "No Quiero Nada Regalao", url: "https://www.mixcloud.com/widget/iframe/?hide_cover=1&mini=1&feed=%2FByJTB%2Fsalsabrava-112025-no-quiero-nada-regalao%2F", plataforma: "mixcloud" },
    { año: 2024, categoria: "STUDIO 79", titulo: "Programa 5 Clásico", url: "https://archive.org/download/studio-79-programa-5/Studio%2079%20Programa%205.mp3", plataforma: "archive" },
    { año: 2023, categoria: "Old School Rock", titulo: "Slight Return", url: "https://www.mixcloud.com/widget/iframe/?hide_cover=1&mini=1&feed=%2Foldschoolradio%2Fold-school-rock-radio-012023-slight-return%2F", plataforma: "mixcloud" },
    { año: 2023, categoria: "Old School Rock", titulo: "Bionic Grass", url: "https://www.mixcloud.com/widget/iframe/?hide_cover=1&mini=1&feed=%2Foldschoolradio%2Fold-school-rock-radio-052023-bionic-grass%2F", plataforma: "mixcloud" },
    { año: 2023, categoria: "Old School Rock", titulo: "Deadly Screams", url: "https://www.mixcloud.com/widget/iframe/?hide_cover=1&mini=1&feed=%2Foldschoolradio%2Fold-school-rock-radio-092023-deadly-screams%2F", plataforma: "mixcloud" },
    { año: 2023, categoria: "Old School Rock", titulo: "Lunatic", url: "https://www.mixcloud.com/widget/iframe/?hide_cover=1&mini=1&feed=%2Foldschoolradio%2Fold-school-rock-radio-082023-lunatic%2F", plataforma: "mixcloud" },
    { año: 2023, categoria: "Old School Rock", titulo: "Bonded By Blood", url: "https://www.mixcloud.com/widget/iframe/?hide_cover=1&mini=1&feed=%2Foldschoolradio%2Fold-school-rock-radio-072023-bonded-by-blood%2F", plataforma: "mixcloud" },
    { año: 2023, categoria: "Old School Rock", titulo: "Malcolm", url: "https://www.mixcloud.com/widget/iframe/?hide_cover=1&mini=1&feed=%2Foldschoolradio%2Fold-school-rock-radio-062023-malcolm%2F", plataforma: "mixcloud" },
    { año: 2023, categoria: "Old School Rock", titulo: "Grandma", url: "https://www.mixcloud.com/widget/iframe/?hide_cover=1&mini=1&feed=%2Foldschoolradio%2Fold-school-rock-radio-042023-grandma%2F", plataforma: "mixcloud" },
    { año: 2023, categoria: "Old School Rock", titulo: "Viking Wylde", url: "https://www.mixcloud.com/widget/iframe/?hide_cover=1&mini=1&feed=%2Foldschoolradio%2Fold-school-rock-radio-032023-viking-wylde%2F", plataforma: "mixcloud" },
    { año: 2023, categoria: "JAZZTABUENO", titulo: "Acid Funk", url: "https://www.mixcloud.com/widget/iframe/?hide_cover=1&mini=1&feed=%2FJazzTaBueno%2Fjazztabueno-172023-acid-funk%2F", plataforma: "mixcloud" },
    { año: 2023, categoria: "JAZZTABUENO", titulo: "Big Band Orchestras Y Algo Jazz", url: "https://www.mixcloud.com/widget/iframe/?hide_cover=1&mini=1&feed=%2FJazzTaBueno%2Fjazztabueno-142023-big-band-orchestras-y-algo-jazz%2F", plataforma: "mixcloud" },
    { año: 2022, categoria: "JAZZTABUENO", titulo: "Programa 1", url: "https://archive.org/download/jazztabueno-programa-1-2022/Jazztabueno%20Programa%201-2022.mp3", plataforma: "archive" },
    { año: 2022, categoria: "JAZZTABUENO", titulo: "Programa 2", url: "https://archive.org/download/jazztabueno-programa-2-2022/Jazztabueno%20Programa%202-2022.mp3", plataforma: "archive" },
    { año: 2022, categoria: "JAZZTABUENO", titulo: "Programa 3", url: "https://archive.org/download/jazztabueno-programa-3-2022/Jazztabueno%20Programa%203-2022.mp3", plataforma: "archive" },
    { año: 2022, categoria: "JAZZTABUENO", titulo: "Get Lucky", url: "https://www.mixcloud.com/widget/iframe/?hide_cover=1&mini=1&feed=%2FJazzTaBueno%2Fjazztabueno-342022-get-lucky%2F", plataforma: "mixcloud" },
    { año: 2022, categoria: "JAZZTABUENO", titulo: "Original", url: "https://www.mixcloud.com/widget/iframe/?hide_cover=1&mini=1&feed=%2FJazzTaBueno%2Fjazztabueno-072022-original%2F", plataforma: "mixcloud" },
    { año: 2021, categoria: "SALSA BRAVA", titulo: "Programa 1", url: "https://archive.org/download/salsa-brava-programa-1-2021/Salsa%20Brava%20Programa%201-2021.mp3", plataforma: "archive" },
    { año: 2021, categoria: "SALSA BRAVA", titulo: "Programa 2", url: "https://archive.org/download/salsa-brava-programa-2-2021/Salsa%20Brava%20Programa%202-2021.mp3", plataforma: "archive" },
    { año: 2021, categoria: "JAZZTABUENO", titulo: "The Music Time", url: "https://www.mixcloud.com/widget/iframe/?hide_cover=1&mini=1&feed=%2FJazzTaBueno%2Fjazztabueno-012021-the-music-time%2F", plataforma: "mixcloud" },
    { año: 2020, categoria: "STUDIO 79", titulo: "Programa 4", url: "https://archive.org/download/studio-79-programa-4-2020/Studio%2079%20Programa%204-2020.mp3", plataforma: "archive" },
    { año: 2020, categoria: "STUDIO 79", titulo: "Programa 5", url: "https://archive.org/download/studio-79-programa-5-2020/Studio%2079%20Programa%205-2020.mp3", plataforma: "archive" },
    { año: 2020, categoria: "STUDIO 79", titulo: "Programa 6", url: "https://archive.org/download/studio-79-programa-6-2020/Studio%2079%20Programa%206-2020.mp3", plataforma: "archive" },
    { año: 2020, categoria: "STUDIO 79", titulo: "Programa 7", url: "https://archive.org/download/studio-79-programa-7-2020/Studio%2079%20Programa%207-2020.mp3", plataforma: "archive" },
    { año: 2020, categoria: "STUDIO 79", titulo: "Programa 8", url: "https://archive.org/download/studio-79-programa-8-2020/Studio%2079%20Programa%208-2020.mp3", plataforma: "archive" },
    { año: 2020, categoria: "JAZZTABUENO", titulo: "Funky Moment", url: "https://www.mixcloud.com/widget/iframe/?hide_cover=1&mini=1&feed=%2FJazzTaBueno%2Fjazztabueno-212020-funky-moment%2F", plataforma: "mixcloud" },
    { año: 2020, categoria: "JAZZTABUENO", titulo: "Blues", url: "https://www.mixcloud.com/widget/iframe/?hide_cover=1&mini=1&feed=%2FJazzTaBueno%2Fjazztabueno-232020-blues%2F", plataforma: "mixcloud" },
    { año: 2020, categoria: "JAZZTABUENO", titulo: "The People", url: "https://www.mixcloud.com/widget/iframe/?hide_cover=1&mini=1&feed=%2FJazzTaBueno%2Fjazztabueno-282020-the-people%2F", plataforma: "mixcloud" }
];

window.openVault = () => {
    document.getElementById('main-view').style.display = 'none';
    document.getElementById('vault-view').style.display = 'block';
    document.getElementById('btn-boveda-header').style.display = 'none';
    document.getElementById('btn-volver-header').style.display = 'block';
    window.mostrarPorAño(2025, document.getElementById('btn-2025')); 
    window.scrollTo({top:0, behavior:'smooth'});
};

window.closeVault = () => {
    document.getElementById('vault-view').style.display = 'none';
    document.getElementById('main-view').style.display = 'block';
    document.getElementById('btn-volver-header').style.display = 'none';
    document.getElementById('btn-boveda-header').style.display = 'flex';
    document.getElementById('grid-archivos').innerHTML = ''; 
    if(window.misReproductoresMixcloud) {
        window.misReproductoresMixcloud.forEach(item => { try { item.reproductor.pause(); } catch(e){} });
    }
    window.misReproductoresMixcloud = [];
    document.querySelectorAll('.vintage-audio').forEach(a => { a.pause(); });
    window.scrollTo({top:0, behavior:'smooth'});
};

window.toggleList = (id) => { 
    const el = document.getElementById(`list-${id}`); 
    if(el) el.style.display = (el.style.display === 'block') ? 'none' : 'block'; 
};

window.toggleComments = (id) => { 
    const el = document.getElementById(`comments-${id}`); 
    if(el) {
        el.style.display = (el.style.display === 'block') ? 'none' : 'block'; 
        if(el.style.display === 'block') window.cargarComentarios(id);
    }
};

window.mostrarPorAño = (año, botonApretado) => {
    const botones = document.querySelectorAll('.year-btn');
    botones.forEach(b => b.classList.remove('activo'));
    if(botonApretado) botonApretado.classList.add('activo');

    const grid = document.getElementById('grid-archivos');
    window.misReproductoresMixcloud = []; 
    const filtrados = window.MIS_ARCHIVOS_BOVEDA.filter(item => item.año === año);

    if (filtrados.length === 0) { grid.innerHTML = `<p style="color:#D4AF37; text-align: center; font-size:12px;">Puliendo diamantes...</p>`; return; }

    let contenidoHtml = "";
    const categoriasUnicas = [...new Set(filtrados.map(item => item.categoria))];
    let idCounter = 0;

    categoriasUnicas.forEach(cat => {
        contenidoHtml += `<div class="categoria-titulo-vault">► ${cat}</div>`;
        const programasDeCat = filtrados.filter(item => item.categoria === cat);
        programasDeCat.forEach(item => {
            const esEspecial = item.titulo.toLowerCase().includes('especial');
            const claseEspecial = esEspecial ? 'card-especial-v' : '';
            
            contenidoHtml += `
            <div class="vault-card ${claseEspecial}">
                <span style="color:var(--gold); font-size:9px; font-weight:900; text-transform:uppercase;">${item.categoria}</span>
                <h3 style="margin:5px 0 10px 0; font-size:15px; font-weight:800; color:#fff;">${item.titulo}</h3>`;

            if (item.plataforma === 'archive') {
                let defaultCover = "https://i.postimg.cc/zVD4mstP/Jazztabueno-(2).png";
                const catUp = item.categoria.toUpperCase();
                if(catUp.includes("STUDIO")) defaultCover = "https://i.postimg.cc/NKMDbYJB/S79.png";
                else if(catUp.includes("SALSA")) defaultCover = "https://i.postimg.cc/75fchgyt/Salsa-Brava.png";
                else if(catUp.includes("OLD")) defaultCover = "https://i.postimg.cc/jwQ3mczC/Old-School-Radio.png";
                
                const finalCover = item.cover ? item.cover : defaultCover;

                contenidoHtml += `
                <div class="vintage-player" id="vp-card-${idCounter}">
                    <img src="${finalCover}" class="vp-cover" onerror="this.src='https://i.postimg.cc/zVD4mstP/Jazztabueno-(2).png'">
                    <div class="vp-info">
                        <div class="vp-title">Reproductor VIP</div>
                        <div class="vp-controls">
                            <button class="vp-btn" id="vp-btn-${idCounter}" onclick="window.toggleVintage('vp-audio-${idCounter}', 'vp-btn-${idCounter}', 'vp-card-${idCounter}')">
                                ${SVG_PLAY}
                            </button>
                            <input type="range" class="vp-slider" id="vp-slider-${idCounter}" value="0" min="0" step="1" oninput="window.seekVintage('vp-audio-${idCounter}', this.value)">
                            <span class="vp-time" id="vp-time-${idCounter}">00:00</span>
                        </div>
                    </div>
                    <audio id="vp-audio-${idCounter}" class="vintage-audio" src="${item.url}" playsinline webkit-playsinline ontimeupdate="window.updateVintageTime('vp-audio-${idCounter}', 'vp-slider-${idCounter}', 'vp-time-${idCounter}')" onended="window.resetVintage('vp-btn-${idCounter}', 'vp-card-${idCounter}')"></audio>
                </div>`;
            } else {
                contenidoHtml += `
                <div class="mix-iframe-container">
                    <iframe id="mix-iframe-${idCounter}" width="100%" height="60" src="${item.url}" frameborder="0" style="margin-top: -2px;"></iframe>
                </div>`;
            }
            
            contenidoHtml += `</div>`;
            idCounter++;
        });
    });

    grid.innerHTML = contenidoHtml;

    setTimeout(() => {
        if (typeof Mixcloud === 'undefined') return; 
        const iframes = document.querySelectorAll('.mix-iframe-container iframe');
        iframes.forEach(iframe => {
            try {
                if(iframe.src.includes('mixcloud.com')) {
                    const widget = Mixcloud.PlayerWidget(iframe);
                    window.misReproductoresMixcloud.push({ id: iframe.id, reproductor: widget });
                    widget.bind('play', function() {
                        const mainMedia = document.getElementById('main-media');
                        if(mainMedia && !mainMedia.paused) { mainMedia.pause(); if(window.actualizarUI) window.actualizarUI(); }
                        window.misReproductoresMixcloud.forEach(item => { if (item.id !== iframe.id) { item.reproductor.pause(); } });
                        document.querySelectorAll('.vintage-audio').forEach(a => { a.pause(); document.getElementById(a.id.replace('audio', 'btn')).innerHTML = SVG_PLAY; });
                        document.querySelectorAll('.vintage-player').forEach(c => c.classList.remove('playing'));
                    });
                }
            } catch (error) {}
        });
    }, 1500);
};

window.toggleVintage = (audioId, btnId, cardId) => {
    const audio = document.getElementById(audioId);
    const btn = document.getElementById(btnId);
    const card = document.getElementById(cardId);
    const mainMedia = document.getElementById('main-media');
    
    if(mainMedia && !mainMedia.paused) { mainMedia.pause(); if(window.actualizarUI) window.actualizarUI(); }
    if(window.misReproductoresMixcloud) { window.misReproductoresMixcloud.forEach(item => { try { item.reproductor.pause(); } catch(e){} }); }

    if (audio.paused) {
        document.querySelectorAll('.vintage-audio').forEach(a => { 
            if(a.id !== audioId) { a.pause(); document.getElementById(a.id.replace('audio', 'btn')).innerHTML = SVG_PLAY; } 
        });
        document.querySelectorAll('.vintage-player').forEach(c => c.classList.remove('playing'));
        audio.play();
        btn.innerHTML = SVG_PAUSE;
        if(card) card.classList.add('playing');
    } else {
        audio.pause();
        btn.innerHTML = SVG_PLAY;
        if(card) card.classList.remove('playing');
    }
};

window.updateVintageTime = (audioId, sliderId, timeId) => {
    const audio = document.getElementById(audioId);
    const slider = document.getElementById(sliderId);
    const timeDisplay = document.getElementById(timeId);

    if(!isNaN(audio.duration)) {
        slider.max = audio.duration;
        slider.value = audio.currentTime;
        const m = Math.floor(audio.currentTime / 60);
        const s = Math.floor(audio.currentTime % 60);
        timeDisplay.innerText = `${m}:${s < 10 ? '0' : ''}${s}`;
    }
};

window.seekVintage = (audioId, val) => { document.getElementById(audioId).currentTime = val; };
window.resetVintage = (btnId, cardId) => { 
    document.getElementById(btnId).innerHTML = SVG_PLAY; 
    const c = document.getElementById(cardId);
    if(c) c.classList.remove('playing');
};

// Configuración de Firebase y Componentes
const firebaseConfig = { apiKey: "AIzaSyBwBq4gLgv4DSfUidzUuC7Irmvj_4pCTtI", authDomain: "familia-yajure-app.firebaseapp.com", projectId: "familia-yajure-app", storageBucket: "familia-yajure-app.firebasestorage.app", messagingSenderId: "692035727386", appId: "1:692035727386:web:dfa3e39a481d56368a61a3", measurementId: "G-GDBL4HPE79" };
const app = initializeApp(firebaseConfig);
const db = initializeFirestore(app, { experimentalForceLongPolling: true });

let analytics; try { analytics = getAnalytics(app); logEvent(analytics, 'page_view'); } catch(e) {}

const media = document.getElementById('main-media');
const seekBar = document.getElementById('seek-bar');
let programas = []; let currentRenderedList = []; let idActual = null; let filtro = 'Todo'; let hashtagFiltro = ''; let isAdmin = false;
let audioCtx, analyser, source; let isVisualizerRunning = false; const canvas = document.getElementById('visualizador'); const ctx = canvas.getContext('2d');

window.actualizarUI = () => { render(); }; 

window.copiarLinkVIP = (id) => {
    const urlPase = window.location.origin + window.location.pathname + "?play=" + id;
    navigator.clipboard.writeText(urlPase).then(() => {
        alert("🎟️ ¡Pase VIP copiado!\n\nYa puedes pegar el link en WhatsApp. Quien lo abra, escuchará este programa.");
    }).catch(err => {
        alert("Error al copiar: " + err);
    });
};

media.addEventListener('play', () => {
    if(window.misReproductoresMixcloud) {
        window.misReproductoresMixcloud.forEach(item => {
            try { item.reproductor.pause(); } catch(e){}
        });
    }
    document.querySelectorAll('.vintage-audio').forEach(a => { 
        a.pause(); 
        const btn = document.getElementById(a.id.replace('audio', 'btn'));
        if(btn) btn.innerHTML = SVG_PLAY;
    });
    document.querySelectorAll('.vintage-player').forEach(c => c.classList.remove('playing'));
});

if(localStorage.getItem('jtp_auth') === 'ok') { isAdmin = true; document.getElementById('btn-salir').style.display = 'block'; }
window.doLogout = () => { localStorage.removeItem('jtp_auth'); location.reload(); };

let taps = 0, lastTap = 0;
document.getElementById('admin-trigger').onclick = () => {
    const now = new Date().getTime(); if(now - lastTap > 1000) taps = 0; lastTap = now; taps++;
    if(taps === 3) {
        if(!isAdmin) {
            const pass = prompt("🔐 DIRECTOR: Ingrese Clave de Cabina:");
            if(pass === "ticoadmin2026") { localStorage.setItem('jtp_auth', 'ok'); isAdmin = true; document.getElementById('admin-panel').style.display = 'block'; document.getElementById('btn-salir').style.display = 'block'; render(); } 
            else { if(pass) alert("❌ Clave Incorrecta"); }
        } else { document.getElementById('admin-panel').style.display = 'block'; }
        taps = 0;
    }
};

window.setFilter = (cat, el) => { filtro = cat; hashtagFiltro = ''; document.querySelectorAll('.ch-item').forEach(i => i.classList.remove('active')); el.classList.add('active'); render(); };
window.setHashtagFilter = (tag) => { hashtagFiltro = tag; render(); window.scrollTo({top:0, behavior:'smooth'}); };
window.clearHashtag = () => { hashtagFiltro = ''; render(); };

window.doLike = async (id, el) => {
    if(localStorage.getItem('jtp_like_' + id) === 'true') { alert("¡Ya le diste me gusta a este programa! ❤️"); return; }
    localStorage.setItem('jtp_like_' + id, 'true'); el.classList.add('liked');
    let countSpan = el.querySelector('.like-count'); let current = parseInt(countSpan.innerText || "0");
    el.innerHTML = `❤️ <span class="like-count">${current + 1}</span>`;
    try { await updateDoc(doc(db, "radio_programas", id), { likes: increment(1) }); } catch(e) {}
};

window.cargarComentarios = (id) => {
    const listDiv = document.getElementById(`clist-${id}`);
    onSnapshot(query(collection(db, "radio_programas", id, "comentarios"), orderBy("fecha", "asc")), (snap) => {
        listDiv.innerHTML = ""; if(snap.empty) { listDiv.innerHTML = "<div style='color:#666; font-size:11px; text-align:center;'>Sé el primero en comentar.</div>"; return; }
        snap.forEach(d => {
            const c = d.data(); const div = document.createElement('div'); div.className = 'c-item';
            let replyHtml = c.respuesta ? `<div class="c-reply"><div class="c-reply-head">🎙️ JTP OFICIAL:</div><div class="c-reply-msg">${c.respuesta}</div></div>` : "";
            let adminTools = isAdmin ? `<div style="display:flex; align-items:center;">${!c.respuesta ? `<button class="btn-admin-reply" onclick="window.responderCom('${id}', '${d.id}')">↩️ RESPONDER</button>` : ""}<button class="btn-admin-del" onclick="window.borrarComentario('${id}', '${d.id}')">🗑️</button></div>` : "";
            div.innerHTML = `<div class="c-user"><span>${c.usuario}</span> ${adminTools}</div><div class="c-msg">${c.mensaje}</div>${replyHtml}`;
            listDiv.appendChild(div);
        });
        listDiv.scrollTop = listDiv.scrollHeight;
    });
};

window.enviarComentario = async (id) => {
    const userIn = document.getElementById(`cuser-${id}`); const msgIn = document.getElementById(`cmsg-${id}`); const btn = document.getElementById(`cbtn-${id}`);
    if(!userIn.value || !msgIn.value) return alert("Escribe nombre y mensaje");
    btn.disabled = true; btn.innerText = "...";
    try { await addDoc(collection(db, "radio_programas", id, "comentarios"), { usuario: userIn.value, mensaje: msgIn.value, fecha: new Date().getTime() }); msgIn.value = ""; } catch(e) {}
    btn.disabled = false; btn.innerText = "ENVIAR";
};

window.responderCom = async (progId, comId) => {
    const resp = prompt("Escribe tu respuesta oficial:");
    if(resp) { try { await updateDoc(doc(db, "radio_programas", progId, "comentarios", comId), { respuesta: resp }); } catch(e) {} }
};

window.borrarComentario = async (progId, comId) => { if(confirm("¿Borrar este comentario permanentemente?")) { try { await deleteDoc(doc(db, "radio_programas", progId, "comentarios", comId)); } catch(e) {} } };

function encenderVisualizador() {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)(); analyser = audioCtx.createAnalyser();
        try { source = audioCtx.createMediaElementSource(media); source.connect(analyser); analyser.connect(audioCtx.destination); } catch(e) {}
        analyser.fftSize = 256; 
        analyser.smoothingTimeConstant = 0.85; 
    }
    if (audioCtx.state === 'suspended') audioCtx.resume();
    if (!isVisualizerRunning) pintarBarras();
}

function pintarBarras() {
    isVisualizerRunning = true; requestAnimationFrame(pintarBarras); if (!analyser) return;
    const bufferLength = analyser.frequencyBinCount; const dataArray = new Uint8Array(bufferLength); analyser.getByteFrequencyData(dataArray);
    const dpr = window.devicePixelRatio || 1; const displayWidth = canvas.clientWidth; const displayHeight = canvas.clientHeight;
    canvas.width = displayWidth * dpr; canvas.height = displayHeight * dpr; ctx.scale(dpr, dpr); ctx.clearRect(0, 0, displayWidth, displayHeight);
    const isMobile = displayWidth < 600; const barrasActivas = isMobile ? 40 : 80; const gap = isMobile ? 2 : 4; 
    const barWidth = (displayWidth / barrasActivas) - gap; let x = gap / 2;
    for (let i = 0; i < barrasActivas; i++) {
        const dataIndex = Math.floor(i * (bufferLength / 100)); 
        let barHeight = (dataArray[dataIndex] / 255) * displayHeight * 1.3; ctx.fillStyle = '#a68a44'; 
        const finalHeight = Math.max(barHeight, isMobile ? 3 : 4); ctx.fillRect(x, displayHeight - finalHeight, barWidth, finalHeight);
        x += barWidth + gap;
    }
}

window.playItem = async (id, url, tit, img) => {
    if(idActual === id) { 
        window.doToggle(); 
    } else {
        idActual = id; window.castUrl = url; window.castTitle = tit; window.castCover = img; media.src = url; 
        
        document.getElementById('p-title').innerText = tit;
        document.getElementById('p-vinyl').style.backgroundImage = `url('${img}')`;
        document.getElementById('global-player').style.display = 'block';

        let promesa = media.play();
        if (promesa !== undefined) {
            promesa.then(_ => {
                let memoria = localStorage.getItem('jtbp_mem_' + id);
                if(memoria && parseFloat(memoria) > 5) { media.currentTime = parseFloat(memoria); }
                encenderVisualizador();
            }).catch(e => {
                const btn = document.getElementById('p-play-btn');
                if(btn) btn.innerHTML = SVG_PLAY;
                alert("🎟️ ¡Tu Pase VIP está listo!\n\nPor reglas de seguridad de tu navegador, presiona el botón de PLAY (▶️) en la barra inferior para escuchar.");
            });
        }
        
        if ('mediaSession' in navigator) {
            navigator.mediaSession.metadata = new MediaMetadata({
                title: tit, artist: 'Jazztabueno Productions', album: 'Radio Oficial', artwork: [ { src: img, sizes: '512x512', type: 'image/jpeg' } ]
            });
            navigator.mediaSession.setActionHandler('play', function() { media.play(); encenderVisualizador(); render(); });
            navigator.mediaSession.setActionHandler('pause', function() { media.pause(); render(); });
        }
        if(analytics) logEvent(analytics, 'play_program', { program_name: tit });
        if(!localStorage.getItem('oyente_' + id)) {
            localStorage.setItem('oyente_' + id, 'true');
            try { await updateDoc(doc(db, "radio_programas", id), { reproducciones: increment(1) }); } catch(e) {}
        }
    }
    render();
};

window.doToggle = () => { if(media.paused) { media.play(); encenderVisualizador(); } else { media.pause(); } render(); };
window.doClose = () => { media.pause(); document.getElementById('global-player').style.display='none'; idActual=null; render(); };
window.doSpeed = () => { const r = [1.0, 1.25, 1.5, 2.0]; media.playbackRate = r[(r.indexOf(media.playbackRate)+1)%r.length]; document.getElementById('btn-speed').innerText = media.playbackRate+"x"; };
window.doMute = () => { media.muted = !media.muted; document.getElementById('btn-mute').innerText = media.muted ? "🔇 MUTE" : "🔊 VOL"; };
window.cancelEdit = () => { document.getElementById('admin-panel').style.display='none'; document.getElementById('edit-id').value=""; };
window.prepEdit = (id) => { const p = programas.find(x => x.id === id); document.getElementById('edit-id').value = p.id; document.getElementById('t-titulo').value = p.titulo; document.getElementById('t-programa').value = p.programa; document.getElementById('t-url').value = p.mp3Url; document.getElementById('t-img').value = p.imagenUrl; document.getElementById('t-tags').value = p.tags || ""; document.getElementById('t-playlist').value = p.playlist || ""; document.getElementById('admin-panel').style.display = 'block'; window.scrollTo({top:0, behavior:'smooth'}); };
window.doDel = async (id) => { if(confirm("¿Borrar?")) await deleteDoc(doc(db, "radio_programas", id)); };

document.getElementById('btn-save').onclick = async () => {
    const id = document.getElementById('edit-id').value;
    const data = { titulo: document.getElementById('t-titulo').value, programa: document.getElementById('t-programa').value, mp3Url: document.getElementById('t-url').value, imagenUrl: document.getElementById('t-img').value || "logo.png", tags: document.getElementById('t-tags').value, playlist: document.getElementById('t-playlist').value, fecha: new Date().getTime() };
    if(!id) { data.reproducciones = 0; data.likes = 0; }
    if(id) await updateDoc(doc(db, "radio_programas", id), data); else await addDoc(collection(db, "radio_programas"), data);
    window.cancelEdit();
};

let paseVipUsado = false; 

onSnapshot(query(collection(db, "radio_programas"), orderBy("fecha", "desc")), (snap) => { 
    programas = []; 
    snap.forEach(d => programas.push({id: d.id, ...d.data()})); 
    render(); 

    if (!paseVipUsado) {
        const parametros = new URLSearchParams(window.location.search);
        const programaId = parametros.get('play');
        
        if (programaId) {
            const programaEspecial = programas.find(p => p.id === programaId);
            if (programaEspecial) {
                setTimeout(() => {
                    window.playItem(programaEspecial.id, programaEspecial.mp3Url, programaEspecial.titulo, programaEspecial.imagenUrl);
                    window.history.replaceState(null, null, window.location.pathname);
                }, 1000); 
            }
        }
        paseVipUsado = true;
    }
});

function render() {
    const feed = document.getElementById('feed'); if(!feed) return; feed.innerHTML = "";
    if(hashtagFiltro !== '') { feed.innerHTML = `<div style="text-align:center; margin-bottom:20px;"><span style="background:var(--gold); color:black; padding:8px 15px; border-radius:20px; font-weight:bold; font-size:12px;">Buscando: ${hashtagFiltro} <span style="margin-left:10px; cursor:pointer;" onclick="window.clearHashtag()">✖ Quitar Filtro</span></span></div>`; }
    const list = programas.filter(p => {
        let matchCanal = false;
        if(filtro === 'Todo') matchCanal = true;
        else {
            const dbVal = (p.programa || "").toUpperCase(); const titVal = (p.titulo || "").toUpperCase(); const filterVal = filtro.toUpperCase();
            if(filterVal.includes("STUDIO")) matchCanal = dbVal.includes("STUDIO") || dbVal.includes("79") || titVal.includes("STUDIO") || titVal.includes("79");
            else matchCanal = dbVal.includes(filterVal.split(' ')[0]) || titVal.includes(filterVal.split(' ')[0]);
        }
        let matchTag = hashtagFiltro === '' ? true : (p.tags || "").toLowerCase().includes(hashtagFiltro.toLowerCase());
        return matchCanal && matchTag;
    });

    currentRenderedList = list;

    list.forEach(p => {
        const isPlaying = idActual === p.id && !media.paused;
        const vistas = p.reproducciones || 0; const likes = p.likes || 0;
        const isLiked = localStorage.getItem('jtp_like_' + p.id) === 'true'; const userLikedClass = isLiked ? 'liked' : ''; const heartIcon = isLiked ? '❤️' : '🤍';
        const arrayTags = (p.tags || "").split(' ').filter(t => t.trim().startsWith('#'));
        let htmlTags = arrayTags.length > 0 ? `<div style="margin-top:6px;">` + arrayTags.map(t => `<span onclick="window.setHashtagFilter('${t}')" style="color:var(--gold); background:#222; padding:4px 10px; border-radius:12px; font-size:10px; font-weight:800; margin-right:5px; cursor:pointer; display:inline-block; border: 1px solid #333;">${t}</span>`).join('') + `</div>` : "";

        const div = document.createElement('div'); div.className = `card ${isPlaying ? 'playing' : ''}`;
        div.innerHTML = `
            <div class="card-cover" style="background-image: url('${p.imagenUrl}')">
                <div class="card-overlay"><button class="btn-play" onclick="window.playItem('${p.id}','${p.mp3Url}','${p.titulo}','${p.imagenUrl}')">${isPlaying ? SVG_PAUSE : SVG_PLAY}</button></div>
            </div>
            <div class="info">
                <div style="display:flex; justify-content:space-between; align-items:center;">
                    <span style="color:var(--gold); font-size:9px; font-weight:900; text-transform:uppercase;">${p.programa}</span><div class="contador-oyentes">🎧 <span>${vistas}</span></div>
                </div>
                <div style="display:flex; justify-content:space-between; align-items:start; margin-top:8px;">
                     <h3 class="ep-title" style="margin:0;">${p.titulo}</h3>
                     <button class="btn-like ${userLikedClass}" onclick="window.doLike('${p.id}', this)">${heartIcon} <span class="like-count">${likes}</span></button>
                </div>
                ${htmlTags}
                <div style="display:flex; gap:10px;">
                    <button class="btn-list" style="flex:1" onclick="window.toggleList('${p.id}')">📋 INFO</button>
                    <button class="btn-list" style="flex:1" onclick="window.toggleComments('${p.id}')">💬 CHAT</button>
                    <button class="btn-list" style="flex:0.4; font-size: 15px !important; padding: 0 !important; display: flex; align-items: center; justify-content: center;" onclick="window.copiarLinkVIP('${p.id}')" title="Copiar link directo">🔗</button>
                </div>
                <div id="list-${p.id}" class="list-box">${p.playlist || "Próximamente."}</div>
                <div id="comments-${p.id}" class="comments-section">
                    <div id="clist-${p.id}" class="c-list"></div>
                    <div style="margin-top:10px; padding-top:10px; border-top:1px solid #222;">
                        <input type="text" id="cuser-${p.id}" class="c-input" placeholder="Tu Nombre">
                        <textarea id="cmsg-${p.id}" class="c-input" placeholder="Tu Mensaje..."></textarea>
                        <button id="cbtn-${p.id}" class="c-btn" onclick="window.enviarComentario('${p.id}')">ENVIAR</button>
                    </div>
                </div>
                ${isAdmin ? `<div style="display:flex; gap:10px; margin-top:20px; border-top:1px solid #222; padding-top:20px;"><button onclick="window.prepEdit('${p.id}')" style="flex:1; background:transparent; border:1px solid var(--gold); color:var(--gold); padding:10px; border-radius:10px; font-weight:800;">🖋️ EDITAR</button><button onclick="window.doDel('${p.id}')" style="flex:1; background:transparent; border:1px solid #f44; color:#f44; padding:10px; border-radius:10px; font-weight:800;">🗑️ BORRAR</button></div>` : ''}
            </div>`;
        feed.appendChild(div);
    });

    const pBtn = document.getElementById('p-play-btn'); if(pBtn) pBtn.innerHTML = media.paused ? SVG_PLAY : SVG_PAUSE;
    if(!media.paused) document.getElementById('global-player').classList.add('playing'); else document.getElementById('global-player').classList.remove('playing');
}

media.ontimeupdate = () => { 
    seekBar.value = media.currentTime; 
    const m = Math.floor(media.currentTime/60), s = Math.floor(media.currentTime%60);
    const dm = isNaN(media.duration) ? 0 : Math.floor(media.duration/60);
    const ds = isNaN(media.duration) ? 0 : Math.floor(media.duration%60);
    document.getElementById('p-time').innerText = `${m}:${s<10?'0':''}${s} / ${dm}:${ds<10?'0':''}${ds}`;
    if (idActual && media.currentTime > 5) { localStorage.setItem('jtbp_mem_' + idActual, media.currentTime); }
};

media.onloadedmetadata = () => { if(!isNaN(media.duration)) seekBar.max = media.duration; };
media.onended = () => {
    if(idActual) localStorage.removeItem('jtbp_mem_' + idActual);
    if (currentRenderedList.length > 0) {
        let idxActual = currentRenderedList.findIndex(p => p.id === idActual);
        if (idxActual !== -1 && idxActual + 1 < currentRenderedList.length) {
            let siguiente = currentRenderedList[idxActual + 1];
            window.playItem(siguiente.id, siguiente.mp3Url, siguiente.titulo, siguiente.imagenUrl);
        } else { window.doClose(); }
    }
};
seekBar.oninput = () => { media.currentTime = seekBar.value; };
