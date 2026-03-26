import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, collection, query, orderBy, onSnapshot } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const firebaseConfig = { apiKey: "AIzaSyBwBq4gLgv4DSfUidzUuC7Irmvj_4pCTtI", authDomain: "familia-yajure-app.firebaseapp.com", projectId: "familia-yajure-app", storageBucket: "familia-yajure-app.firebasestorage.app", messagingSenderId: "692035727386", appId: "1:692035727386:web:dfa3e39a481d56368a61a3" };
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const media = document.getElementById('main-media');
const seekBar = document.getElementById('seek-bar');
let programas = []; let idActual = null; let filtro = 'Todo';

const SVG_PLAY = `<svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>`;
const SVG_PAUSE = `<svg viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>`;

onSnapshot(query(collection(db, "radio_programas"), orderBy("fecha", "desc")), (snap) => {
    programas = []; snap.forEach(d => programas.push({id: d.id, ...d.data()}));
    render();
});

window.openVault = () => { document.getElementById('main-view').style.display = 'none'; document.getElementById('vault-view').style.display = 'block'; window.mostrarPorAño(2025); };
window.closeVault = () => { document.getElementById('vault-view').style.display = 'none'; document.getElementById('main-view').style.display = 'block'; idActual = null; render(); };

window.mostrarPorAño = (año) => {
    const grid = document.getElementById('grid-archivos');
    const boveda = [
        { año: 2025, categoria: "Studio 79", titulo: "Especial Studio Mix Two", url: "https://archive.org/download/studio-79-13-2025-especial-studio-mix-one/Studio79%20-%2019_2025%20_ESPECIAL%20STUDIO%20MIX%20TWO_.mp3" },
        { año: 2025, categoria: "Studio 79", titulo: "Especial Studio Mix One", url: "https://archive.org/download/studio-79-13-2025-especial-studio-mix-one/Studio79%20-%2013_2025%20_ESPECIAL%20STUDIO%20MIX%20ONE_.mp3" }
    ];
    grid.innerHTML = boveda.filter(i => i.año === año).map(item => {
        const esEspecial = item.titulo.toLowerCase().includes('especial');
        return `<div class="vault-card ${esEspecial ? 'card-especial-v' : ''}">
            <span class="ep-category">${item.categoria}</span>
            <h3 style="margin:8px 0; font-size:18px;">${item.titulo}</h3>
            <div class="vintage-player">
                <img src="https://i.postimg.cc/NKMDbYJB/S79.png" class="vp-cover">
                <button class="vp-btn" onclick="window.playVault('${item.url}', '${item.titulo}')">${SVG_PLAY}</button>
                <span style="font-size:10px; color:var(--gold); font-weight:800;">REPRODUCTOR VIP</span>
            </div>
        </div>`;
    }).join('');
};

function render() {
    const feed = document.getElementById('feed'); if(!feed) return; feed.innerHTML = "";
    const filtered = (filtro === 'Todo') ? programas : programas.filter(p => p.programa === filtro);
    
    filtered.forEach(p => {
        const isPlaying = idActual === p.id && !media.paused;
        const div = document.createElement('div'); div.className = 'card';
        
        div.innerHTML = `
            <div class="card-cover" style="background-image: url('${p.imagenUrl}')">
                <div class="card-overlay"><button class="btn-play-card" onclick="window.playItem('${p.id}','${p.mp3Url}','${p.titulo}','${p.imagenUrl}')">${isPlaying ? SVG_PAUSE : SVG_PLAY}</button></div>
            </div>
            <div class="info">
                <div class="header-row"><span class="ep-category">${p.programa}</span><div class="listeners">🎧 34</div></div>
                <div class="title-row">
                    <h3 class="ep-title">${p.titulo}</h3>
                    <div class="likes-box"><img src="https://cdn-icons-png.flaticon.com/512/833/833472.png" width="22" style="filter: brightness(2);"><span>3</span></div>
                </div>
                <div class="tag-container"><span class="tag">#worldmusic</span><span class="tag">#podcast</span><span class="tag">#funk</span><span class="tag">#pop</span></div>
                <div class="btn-group">
                    <button class="btn-action" onclick="window.playItem('${p.id}','${p.mp3Url}','${p.titulo}','${p.imagenUrl}')">${isPlaying ? 'PAUSAR' : 'ESCUCHAR'}</button>
                    <button class="btn-action">💬 CHAT</button>
                    <button class="btn-small">🔗</button>
                </div>
                <div class="admin-row"><button class="btn-edit">🖋️ EDITAR</button><button class="btn-delete">🗑️ BORRAR</button></div>
                <button style="background:transparent;border:none;color:#555;font-size:12px;font-weight:700;margin-top:20px;cursor:pointer;">Ver más...</button>
            </div>`;
        feed.appendChild(div);
    });
}

window.playItem = async (id, url, tit, img) => {
    if(idActual === id) { media.paused ? media.play() : media.pause(); } 
    else {
        idActual = id; 
        media.pause();
        media.removeAttribute('crossorigin');
        media.src = url; 
        media.load();
        document.getElementById('p-title').innerText = tit;
        document.getElementById('p-vinyl').style.backgroundImage = `url('${img}')`;
        document.getElementById('global-player').style.display = 'block';
        try { await media.play(); } catch(e) {}
    }
    render();
};

window.confirmarSalida = () => { if(confirm("¿Deseas detener la radio y salir?")) { media.pause(); document.getElementById('pantalla-salida').style.display='flex'; } };
window.doToggle = () => { if(media.paused) media.play(); else media.pause(); render(); };
window.doClose = () => { media.pause(); document.getElementById('global-player').style.display='none'; idActual=null; render(); };
media.ontimeupdate = () => { seekBar.value = media.currentTime; };
media.onloadedmetadata = () => { seekBar.max = media.duration; };
