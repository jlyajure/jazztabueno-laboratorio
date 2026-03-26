import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, collection, query, orderBy, onSnapshot } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const firebaseConfig = { apiKey: "AIzaSyBwBq4gLgv4DSfUidzUuC7Irmvj_4pCTtI", authDomain: "familia-yajure-app.firebaseapp.com", projectId: "familia-yajure-app", storageBucket: "familia-yajure-app.firebasestorage.app", messagingSenderId: "692035727386", appId: "1:692035727386:web:dfa3e39a481d56368a61a3" };
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const media = document.getElementById('main-media');
let programas = []; let idActual = null; let filtro = 'Todo';

const SVG_PLAY = `<svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>`;
const SVG_PAUSE = `<svg viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>`;

onSnapshot(query(collection(db, "radio_programas"), orderBy("fecha", "desc")), (snap) => {
    programas = []; snap.forEach(d => programas.push({id: d.id, ...d.data()}));
    render();
});

function render() {
    const feed = document.getElementById('feed'); if(!feed) return; feed.innerHTML = "";
    const filtered = (filtro === 'Todo') ? programas : programas.filter(p => p.programa === filtro);
    
    filtered.forEach(p => {
        const isPlaying = idActual === p.id && !media.paused;
        const div = document.createElement('div'); div.className = 'card';
        
        /* ESTRUCTURA EXACTA DE LA IMAGEN 2 */
        div.innerHTML = `
            <div class="card-cover" style="background-image: url('${p.imagenUrl}')">
                <div style="position:absolute; inset:0; display:flex; align-items:center; justify-content:center;">
                    <button class="btn-play-card" onclick="window.playItem('${p.id}','${p.mp3Url}','${p.titulo}','${p.imagenUrl}')">
                        ${isPlaying ? SVG_PAUSE : SVG_PLAY}
                    </button>
                </div>
            </div>
            <div class="info">
                <div class="header-row">
                    <span class="ep-category">${p.programa}</span>
                    <div class="listeners">🎧 34</div>
                </div>
                <div class="title-row">
                    <h3 class="ep-title">${p.titulo}</h3>
                    <div class="likes-box">
                        <img src="https://cdn-icons-png.flaticon.com/512/833/833472.png" width="22" style="filter: brightness(2);">
                        <span>3</span>
                    </div>
                </div>
                <div class="tag-container">
                    <span class="tag">#worldmusic</span><span class="tag">#podcast</span><span class="tag">#funk</span><span class="tag">#pop</span>
                </div>
                <div class="btn-group">
                    <button class="btn-main">📜 INFO</button>
                    <button class="btn-main">💬 CHAT</button>
                    <button class="btn-link">🔗</button>
                </div>
                <div class="admin-row">
                    <button class="btn-edit">🖋️ EDITAR</button>
                    <button class="btn-delete">🗑️ BORRAR</button>
                </div>
            </div>`;
        feed.appendChild(div);
    });
}

window.playItem = async (id, url, tit, img) => {
    if(idActual === id) { media.paused ? media.play() : media.pause(); } 
    else {
        idActual = id; media.src = url; media.load();
        try { await media.play(); } catch(e) {}
    }
    render();
};
