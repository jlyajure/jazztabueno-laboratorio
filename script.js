import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, collection, query, orderBy, onSnapshot } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const firebaseConfig = { apiKey: "AIzaSyBwBq4gLgv4DSfUidzUuC7Irmvj_4pCTtI", authDomain: "familia-yajure-app.firebaseapp.com", projectId: "familia-yajure-app", storageBucket: "familia-yajure-app.firebasestorage.app", messagingSenderId: "692035727386", appId: "1:692035727386:web:dfa3e39a481d56368a61a3" };
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const media = document.getElementById('main-media');
const seekBar = document.getElementById('seek-bar');
let programas = []; let idActual = null; let filtro = 'Todo';

const SVG_PLAY = `<svg viewBox="0 0 24 24" width="30"><path d="M8 5v14l11-7z" fill="black"/></svg>`;
const SVG_PAUSE = `<svg viewBox="0 0 24 24" width="30"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" fill="black"/></svg>`;

window.MIS_ARCHIVOS_BOVEDA = [
    { año: 2025, categoria: "Studio 79", titulo: "Especial Studio Mix Two", url: "https://archive.org/download/studio-79-13-2025-especial-studio-mix-one/Studio79%20-%2019_2025%20_ESPECIAL%20STUDIO%20MIX%20TWO_.mp3" },
    { año: 2025, categoria: "Studio 79", titulo: "Funky Fever", url: "https://www.mixcloud.com/widget/iframe/?hide_cover=1&mini=1&feed=%2FStudio79%2Fstudio79-182025-funky-fever%2F", plataforma: "mixcloud" },
    { año: 2025, categoria: "Studio 79", titulo: "Especial Studio Mix One", url: "https://archive.org/download/studio-79-13-2025-especial-studio-mix-one/Studio79%20-%2013_2025%20_ESPECIAL%20STUDIO%20MIX%20ONE_.mp3" },
    { año: 2025, categoria: "Studio 79", titulo: "Disco Nights", url: "https://www.mixcloud.com/widget/iframe/?hide_cover=1&mini=1&feed=%2FStudio79%2Fstudio79-122025-disco-nights%2F", plataforma: "mixcloud" },
    { año: 2025, categoria: "Studio 79", titulo: "Rhythm & Blues", url: "https://archive.org/download/programa-11-rhythm-blues/Programa%2011%20%28Rhythm%20%26%20Blues%29.mp3" },
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
    { año: 2024, categoria: "STUDIO 79", titulo: "Programa 5 Clásico", url: "https://archive.org/download/studio-79-programa-5/Studio%2079%20Programa%205.mp3" },
    { año: 2024, categoria: "STUDIO 79", titulo: "Programa 1", url: "https://archive.org/download/studio-79-programa-1/Studio%2079%20Programa%201.mp3" },
    { año: 2023, categoria: "Old School Rock", titulo: "Slight Return", url: "https://www.mixcloud.com/widget/iframe/?hide_cover=1&mini=1&feed=%2Foldschoolradio%2Fold-school-rock-radio-012023-slight-return%2F", plataforma: "mixcloud" },
    { año: 2023, categoria: "Old School Rock", titulo: "Bionic Grass", url: "https://www.mixcloud.com/widget/iframe/?hide_cover=1&mini=1&feed=%2Foldschoolradio%2Fold-school-rock-radio-052023-bionic-grass%2F", plataforma: "mixcloud" },
    { año: 2023, categoria: "JAZZTABUENO", titulo: "Acid Funk", url: "https://www.mixcloud.com/widget/iframe/?hide_cover=1&mini=1&feed=%2FJazzTaBueno%2Fjazztabueno-172023-acid-funk%2F", plataforma: "mixcloud" },
    { año: 2022, categoria: "JAZZTABUENO", titulo: "Programa 1", url: "https://archive.org/download/jazztabueno-programa-1-2022/Jazztabueno%20Programa%201-2022.mp3" },
    { año: 2021, categoria: "SALSA BRAVA", titulo: "Programa 1", url: "https://archive.org/download/salsa-brava-programa-1-2021/Salsa%20Brava%20Programa%201-2021.mp3" },
    { año: 2020, categoria: "STUDIO 79", titulo: "Programa 4", url: "https://archive.org/download/studio-79-programa-4-2020/Studio%2079%20Programa%204-2020.mp3" },
    { año: 2020, categoria: "JAZZTABUENO", titulo: "The People", url: "https://www.mixcloud.com/widget/iframe/?hide_cover=1&mini=1&feed=%2FJazzTaBueno%2Fjazztabueno-282020-the-people%2F", plataforma: "mixcloud" }
];

window.openVault = () => { document.getElementById('main-view').style.display = 'none'; document.getElementById('vault-view').style.display = 'block'; document.getElementById('btn-boveda-header').style.display = 'none'; document.getElementById('btn-volver-header').style.display = 'block'; window.mostrarPorAño(2025, document.getElementById('btn-2025')); window.scrollTo({top:0, behavior:'smooth'}); };
window.closeVault = () => { document.getElementById('vault-view').style.display = 'none'; document.getElementById('main-view').style.display = 'block'; document.getElementById('btn-volver-header').style.display = 'none'; document.getElementById('btn-boveda-header').style.display = 'flex'; idActual = null; media.pause(); render(); window.scrollTo({top:0, behavior:'smooth'}); };

window.mostrarPorAño = (año, btn) => {
    document.querySelectorAll('.year-btn').forEach(b => b.classList.remove('activo'));
    if(btn) btn.classList.add('activo');
    const grid = document.getElementById('grid-archivos');
    const filtrados = window.MIS_ARCHIVOS_BOVEDA.filter(i => i.año === año);
    grid.innerHTML = filtrados.map(item => {
        let defaultCover = "https://i.postimg.cc/zVD4mstP/Jazztabueno-(2).png";
        if(item.categoria.toUpperCase().includes("STUDIO")) defaultCover = "https://i.postimg.cc/NKMDbYJB/S79.png";
        else if(item.categoria.toUpperCase().includes("SALSA")) defaultCover = "https://i.postimg.cc/75fchgyt/Salsa-Brava.png";
        const esEspecial = item.titulo.toLowerCase().includes('especial');
        const icon = (idActual === item.url && !media.paused) ? SVG_PAUSE : SVG_PLAY;
        if(item.plataforma === 'mixcloud') { return `<div class="vault-card"><span style="color:var(--gold); font-size:9px; font-weight:bold; text-transform:uppercase;">${item.categoria}</span><h3 style="margin:5px 0;">${item.titulo}</h3><iframe width="100%" height="60" src="${item.url}" frameborder="0"></iframe></div>`; }
        else { return `<div class="vault-card ${esEspecial ? 'card-especial-v' : ''}"><span style="color:var(--gold); font-size:9px; font-weight:bold; text-transform:uppercase;">${item.categoria}</span><h3 style="margin:5px 0;">${item.titulo}</h3><div class="vintage-player"><img src="${defaultCover}" class="vp-cover"><button class="vp-btn" onclick="window.playVault('${item.url}', '${item.titulo}')">${icon}</button><span style="font-size:10px; color:var(--gold); font-weight:bold;">Reproductor VIP</span></div></div>`; }
    }).join('');
};

window.playVault = (url, tit) => {
    if (idActual === url) { media.paused ? media.play() : media.pause(); } 
    else { idActual = url; media.pause(); media.removeAttribute('crossorigin'); media.src = url; media.load(); media.play(); document.getElementById('p-title').innerText = tit; document.getElementById('global-player').style.display = 'block'; }
    const a = document.querySelector('.year-btn.activo'); if(a) window.mostrarPorAño(parseInt(a.innerText), a);
};

window.playItem = async (id, url, tit, img) => {
    if(idActual === id) { media.paused ? media.play() : media.pause(); } 
    else { idActual = id; media.pause(); media.removeAttribute('crossorigin'); media.src = url; media.load(); document.getElementById('p-title').innerText = tit; document.getElementById('p-vinyl').style.backgroundImage = `url('${img}')`; document.getElementById('global-player').style.display = 'block'; try { await media.play(); } catch(e) {} }
    render();
};

window.doToggle = () => { if(media.paused) media.play(); else media.pause(); render(); const a = document.querySelector('.year-btn.activo'); if(a) window.mostrarPorAño(parseInt(a.innerText), a); };
window.doClose = () => { media.pause(); document.getElementById('global-player').style.display='none'; idActual=null; render(); };
window.confirmarSalida = () => { if(confirm("¿Deseas detener la radio y salir?")) { media.pause(); document.getElementById('pantalla-salida').style.display='flex'; } };
window.setFilter = (cat, el) => { filtro = cat; document.querySelectorAll('.ch-item').forEach(i => i.classList.remove('active')); el.classList.add('active'); render(); };

onSnapshot(query(collection(db, "radio_programas"), orderBy("fecha", "desc")), (snap) => { programas = []; snap.forEach(d => programas.push({id: d.id, ...d.data()})); render(); });

function render() {
    const feed = document.getElementById('feed'); if(!feed) return; feed.innerHTML = "";
    const filtered = (filtro === 'Todo') ? programas : programas.filter(p => p.programa === filtro);
    filtered.forEach(p => {
        const isPlaying = idActual === p.id && !media.paused;
        const div = document.createElement('div'); div.className = `card ${isPlaying ? 'playing' : ''}`;
        div.innerHTML = `<div class="card-cover" style="background-image: url('${p.imagenUrl}')"><div class="card-overlay"><button class="btn-play" onclick="window.playItem('${p.id}','${p.mp3Url}','${p.titulo}','${p.imagenUrl}')">${isPlaying ? SVG_PAUSE : SVG_PLAY}</button></div></div><div class="info"><span style="color:var(--gold); font-size:9px; font-weight:900;">${p.programa}</span><h3 class="ep-title">${p.titulo}</h3><button class="btn-list" onclick="window.playItem('${p.id}','${p.mp3Url}','${p.titulo}','https://i.postimg.cc/zVD4mstP/Jazztabueno-(2).png')">ESCUCHAR AHORA</button></div>`;
        feed.appendChild(div);
    });
    document.getElementById('p-play-btn').innerHTML = media.paused ? SVG_PLAY : SVG_PAUSE;
}

media.ontimeupdate = () => { seekBar.value = media.currentTime; const fmt = (t) => isNaN(t) ? "00:00" : `${Math.floor(t/60)}:${Math.floor(t%60).toString().padStart(2,'0')}`; document.getElementById('p-time').innerText = `${fmt(media.currentTime)} / ${fmt(media.duration)}`; };
media.onloadedmetadata = () => { if(!isNaN(media.duration)) seekBar.max = media.duration; };
