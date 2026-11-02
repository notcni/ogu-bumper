// ==UserScript==
// @name         OGU BUMPS
// @namespace    http://tampermonkey.net/
// @version      13.17
// @description  Just a Bumper G
// @author       notcni
// @match        https://oguser.com/*
// @updateURL    https://raw.githubusercontent.com/notcni/ogu-bumper/main/ogpro.user.js
// @downloadURL  https://raw.githubusercontent.com/notcni/ogu-bumper/main/ogpro.user.js
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_xmlhttpRequest
// @grant        GM_info
// @connect      discord.com
// @connect      discordapp.com
// @connect      raw.githubusercontent.com
// ==/UserScript==

(function () {
    'use strict';

    if (window.top !== window.self) return;

    const ICONS = {
        skull: '<path fill="currentColor" stroke="none" d="M12 2a8 8 0 0 0-8 8c0 2.9 1.4 5 3.5 6.2V20h2v-2h1v2h3v-2h1v2h2v-3.8C18.6 15 20 12.9 20 10a8 8 0 0 0-8-8z"/><circle cx="9" cy="10.5" r="1.8" fill="#09090b" stroke="none"/><circle cx="15" cy="10.5" r="1.8" fill="#09090b" stroke="none"/>',
        discord: '<path fill="currentColor" stroke="none" d="M20.317 4.37a19.79 19.79 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.211.375-.445.865-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.74 19.74 0 0 0 3.677 4.37a.07.07 0 0 0-.032.028C.533 9.046-.32 13.58.099 18.058a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.042-.106 13.1 13.1 0 0 1-1.872-.892.077.077 0 0 1-.008-.128c.126-.094.252-.192.372-.291a.074.074 0 0 1 .078-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .079.009c.12.099.246.198.373.292a.077.077 0 0 1-.007.128 12.3 12.3 0 0 1-1.873.892.076.076 0 0 0-.04.106c.36.699.773 1.363 1.225 1.993a.077.077 0 0 0 .084.029 19.84 19.84 0 0 0 6.002-3.03.077.077 0 0 0 .031-.056c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>',
        spinner: '<circle cx="12" cy="12" r="9" opacity=".25"/><path d="M21 12a9 9 0 0 0-9-9"/>',
        crosshairs: '<circle cx="12" cy="12" r="7"/><path d="M12 2v4M12 18v4M2 12h4M18 12h4"/>',
        clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
        sliders: '<path d="M4 6h10M18 6h2M4 12h4M12 12h8M4 18h10M18 18h2"/><circle cx="16" cy="6" r="2"/><circle cx="10" cy="12" r="2"/><circle cx="16" cy="18" r="2"/>',
        microchip: '<rect x="7" y="7" width="10" height="10" rx="1"/><path d="M9 2v3M15 2v3M9 19v3M15 19v3M2 9h3M2 15h3M19 9h3M19 15h3"/>',
        bolt: '<path d="M13 2 4 14h7l-1 8 9-12h-7l1-8z"/>',
        trophy: '<path d="M8 4h8v5a4 4 0 0 1-8 0V4zM8 6H5v1a3 3 0 0 0 3 3M16 6h3v1a3 3 0 0 1-3 3M10 14h4v3h2v3H8v-3h2z"/>',
        layers: '<path d="M12 3 3 8l9 5 9-5-9-5zM3 13l9 5 9-5M3 17l9 5 9-5"/>',
        folder: '<path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>',
        folderPlus: '<path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><path d="M12 11v5M9.5 13.5h5"/>',
        trash: '<path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"/>',
        xmark: '<path d="M6 6l12 12M18 6 6 18"/>',
        plus: '<path d="M12 5v14M5 12h14"/>',
        floppy: '<path d="M5 3h11l3 3v15H5z"/><path d="M8 3v6h8V3M8 21v-7h8v7"/>',
        fileExport: '<path d="M14 3H6v18h12V7z"/><path d="M12 17V10M9 13l3-3 3 3"/>',
        fileImport: '<path d="M14 3H6v18h12V7z"/><path d="M12 10v7M9 14l3 3 3-3"/>',
        shuffle: '<path d="M16 3h5v5M4 20 21 3M21 16v5h-5M15 15l6 6M4 4l5 5"/>',
        rotateLeft: '<path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5"/>',
        check: '<path d="M5 12l5 5 9-10"/>',
        palette: '<circle cx="12" cy="12" r="9"/><circle cx="8" cy="10" r="1.2"/><circle cx="12" cy="7.5" r="1.2"/><circle cx="16" cy="10" r="1.2"/>',
        cloudUp: '<path d="M7 18a4 4 0 0 1-.5-8A6 6 0 0 1 18 9a4 4 0 0 1 0 9H7z"/><path d="M12 13v5M9.5 15.5 12 13l2.5 2.5"/>',
        upload: '<path d="M12 15V3M7 8l5-5 5 5M4 14v6h16v-6"/>',
        chevron: '<path d="M6 9l6 6 6-6"/>',
        ban: '<circle cx="12" cy="12" r="9"/><path d="M5.6 5.6l12.8 12.8"/>'
    };

    const Icon = (name, cls = '') =>
        `<svg class="og-ico ${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[name] || ''}</svg>`;

    const Auth = {
        URL: "https://raw.githubusercontent.com/notcni/ogu-bumper/refs/heads/main/key.json",
        GET_KEY_URL: "https://discord.gg/2YTWthB5BA",

        showScreen() {
            const style = document.createElement('style');
            style.textContent = `
                @keyframes ogSpin { to { transform:rotate(360deg); } }
                @keyframes ogAuthIn { from { opacity:0; transform:translateY(8px) scale(.96); } to { opacity:1; transform:translateY(0) scale(1); } }
                @keyframes ogAuthBg { from { opacity:0; } to { opacity:1; } }
                @keyframes ogShakeX { 0%,100%{transform:translateX(0)} 25%{transform:translateX(-4px)} 75%{transform:translateX(4px)} }
                @keyframes ogFadeUp { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }

                #ogpro-auth-container, #ogpro-auth-container * { box-sizing:border-box; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif; }
                #ogpro-auth-container { position:fixed; inset:0; z-index:9999999; display:flex; align-items:center; justify-content:center; }
                #ogpro-auth-container .ogp-overlay { position:absolute; inset:0; background:rgba(0,0,0,.85); backdrop-filter:blur(10px); animation:ogAuthBg .3s ease; }
                #ogpro-auth-container .og-ico { display:block; width:16px; height:16px; flex-shrink:0; }

                #ogpro-auth-container .ogp-card {
                    position:relative; width:400px; padding:34px 30px 28px;
                    background:rgba(9,9,11,.96); backdrop-filter:blur(14px);
                    border:1px solid #27272a; border-radius:14px; text-align:center; color:#fff;
                    box-shadow:0 25px 60px rgba(0,0,0,.85), 0 0 30px rgba(239,68,68,.12);
                    animation:ogAuthIn .35s cubic-bezier(.2,.8,.2,1);
                }
                #ogpro-auth-container .ogp-logo {
                    margin:0; display:flex; align-items:center; justify-content:center; gap:12px;
                    font-weight:900; font-size:24px; letter-spacing:2px; text-transform:uppercase; color:#ef4444;
                    text-shadow:0 0 12px rgba(239,68,68,.5);
                }
                #ogpro-auth-container .ogp-logo span { color:#fff; }
                #ogpro-auth-container .ogp-logo .og-ico { width:24px; height:24px; color:#ef4444; filter:drop-shadow(0 0 8px rgba(239,68,68,.6)); }
                #ogpro-auth-container .ogp-sub {
                    display:flex; align-items:center; justify-content:center; gap:10px; margin:12px 0 26px;
                    font-size:9px; font-weight:800; color:#71717a; text-transform:uppercase; letter-spacing:1.6px;
                }
                #ogpro-auth-container .ogp-sub::before, #ogpro-auth-container .ogp-sub::after { content:''; width:28px; height:1px; background:linear-gradient(90deg,transparent,#3f3f46); }
                #ogpro-auth-container .ogp-sub::after { background:linear-gradient(90deg,#3f3f46,transparent); }
                #ogpro-auth-container .ogp-label {
                    display:block; text-align:left; font-size:9px; color:#71717a; margin:0 0 7px;
                    font-weight:800; text-transform:uppercase; letter-spacing:1px;
                }
                #ogpro-auth-container #ogp-key {
                    display:block; width:100%; height:44px; padding:0 14px; margin:0 0 16px;
                    background:rgba(0,0,0,.5); border:1px solid #27272a; color:#fff; border-radius:7px; outline:none;
                    font-family:monospace; text-align:center; font-size:12px; letter-spacing:1px;
                    transition:border-color .25s, box-shadow .25s, background .25s;
                }
                #ogpro-auth-container #ogp-key::placeholder { color:#52525b; letter-spacing:.5px; }
                #ogpro-auth-container #ogp-key:hover { border-color:#3f3f46; }
                #ogpro-auth-container #ogp-key:focus { border-color:#ef4444; box-shadow:0 0 0 3px rgba(239,68,68,.12); background:rgba(0,0,0,.7); }
                #ogpro-auth-container #ogp-key.invalid { border-color:#ef4444; animation:ogShakeX .35s; }
                #ogpro-auth-container .ogp-btn {
                    width:100%; height:44px; display:flex; align-items:center; justify-content:center; gap:10px;
                    background:#ef4444; border:none; color:#fff; border-radius:7px; cursor:pointer;
                    font-size:11px; font-weight:900; text-transform:uppercase; letter-spacing:1.5px; line-height:1;
                    box-shadow:0 6px 18px rgba(239,68,68,.3); transition:background .2s, box-shadow .2s, transform .15s;
                }
                #ogpro-auth-container .ogp-btn:hover { background:#dc2626; box-shadow:0 8px 24px rgba(239,68,68,.45); transform:translateY(-1px); }
                #ogpro-auth-container .ogp-btn:active { transform:scale(.97); }
                #ogpro-auth-container .ogp-btn.loading { pointer-events:none; opacity:.8; }
                #ogpro-auth-container .ogp-btn .og-ico { width:14px; height:14px; }
                #ogpro-auth-container .ogp-btn .og-ico.og-spin { animation:ogSpin 1s linear infinite; }
                #ogpro-auth-container .ogp-btn-ghost {
                    width:100%; height:42px; margin-top:10px; display:flex; align-items:center; justify-content:center; gap:10px;
                    background:rgba(88,101,242,.08); border:1px solid rgba(88,101,242,.4); color:#c9ceff;
                    border-radius:7px; cursor:pointer; text-decoration:none;
                    font-size:10px; font-weight:800; text-transform:uppercase; letter-spacing:1.5px; line-height:1;
                    transition:background .25s, border-color .25s, box-shadow .25s, transform .15s, color .25s;
                }
                #ogpro-auth-container .ogp-btn-ghost .og-ico { width:16px; height:16px; color:#5865f2; transition:transform .3s cubic-bezier(.175,.885,.32,1.275), color .25s; }
                #ogpro-auth-container .ogp-btn-ghost:hover { background:#5865f2; border-color:#5865f2; color:#fff; box-shadow:0 6px 18px rgba(88,101,242,.4); transform:translateY(-1px); }
                #ogpro-auth-container .ogp-btn-ghost:hover .og-ico { color:#fff; transform:scale(1.15) rotate(-6deg); }
                #ogpro-auth-container .ogp-btn-ghost:active { transform:scale(.97); }
                #ogpro-auth-container .ogp-msg {
                    min-height:16px; margin-top:18px; font-size:10px; color:#ef4444; font-weight:800;
                    text-transform:uppercase; letter-spacing:1px; line-height:1.4;
                }
                #ogpro-auth-container .ogp-msg.show { animation:ogFadeUp .3s ease both; }
                #ogpro-auth-container .ogp-msg.ok { color:#4ade80; }
            `;
            document.head.appendChild(style);

            const div = document.createElement('div');
            div.id = 'ogpro-auth-container';
            div.innerHTML = `
                <div class="ogp-overlay"></div>
                <div class="ogp-card">
                    <h2 class="ogp-logo">${Icon('skull')}<span>OG</span> PRO</h2>
                    <div class="ogp-sub">License Authorization Required</div>

                    <label class="ogp-label" for="ogp-key">License Key</label>
                    <input type="text" id="ogp-key" placeholder="Enter License Key..." autocomplete="off" spellcheck="false">

                    <button id="ogp-btn" class="ogp-btn"><span class="ogp-btn-ico"></span><span class="ogp-btn-txt">Verify License</span></button>

                    <a id="ogp-getkey" class="ogp-btn-ghost" href="${this.GET_KEY_URL}" target="_blank" rel="noopener noreferrer">
                        ${Icon('discord')}<span>Get Key</span>
                    </a>

                    <div id="ogp-msg" class="ogp-msg"></div>
                </div>`;
            document.body.appendChild(div);

            const input = document.getElementById('ogp-key');
            const btn = document.getElementById('ogp-btn');
            const msg = document.getElementById('ogp-msg');
            const ico = btn.querySelector('.ogp-btn-ico');
            const label = btn.querySelector('.ogp-btn-txt');

            const setMsg = (t, ok = false) => {
                msg.textContent = t;
                msg.classList.toggle('ok', ok);
                msg.classList.remove('show'); void msg.offsetWidth; msg.classList.add('show');
            };
            const shakeInput = () => {
                input.classList.remove('invalid'); void input.offsetWidth; input.classList.add('invalid');
                setTimeout(() => input.classList.remove('invalid'), 400);
            };
            const setLoading = (on) => {
                btn.classList.toggle('loading', on);
                ico.innerHTML = on ? Icon('spinner', 'og-spin') : '';
                label.textContent = on ? 'Verifying...' : 'Verify License';
            };

            const verify = () => {
                const val = input.value.trim();
                if (!val) { shakeInput(); return setMsg('Introduce una key'); }
                setLoading(true);
                msg.textContent = '';
                GM_xmlhttpRequest({
                    method: 'GET', url: this.URL,
                    onload: (res) => {
                        try {
                            const data = JSON.parse(res.responseText);
                            if (data.includes(val)) {
                                setMsg('License verified', true);
                                GM_setValue('OG_PRO_AUTH', val);
                                div.style.transition = 'opacity .3s'; div.style.opacity = '0';
                                setTimeout(() => { div.remove(); InitApp(); }, 300);
                            } else { setLoading(false); shakeInput(); setMsg('Invalid or expired key.'); }
                        } catch (e) { setLoading(false); setMsg('Error connecting to server.'); }
                    },
                    onerror: () => { setLoading(false); setMsg('Network Error.'); }
                });
            };

            btn.addEventListener('click', verify);
            input.addEventListener('keydown', (e) => { if (e.key === 'Enter') verify(); });
            setTimeout(() => input.focus(), 350);
        },

        check() {
            const activeKey = GM_getValue('OG_PRO_AUTH', '');
            if (activeKey) {
                InitApp();
                GM_xmlhttpRequest({
                    method: 'GET', url: this.URL,
                    onload: (res) => {
                        try {
                            if (res.status === 200) {
                                const data = JSON.parse(res.responseText);
                                if (!data.includes(activeKey)) { GM_setValue('OG_PRO_AUTH', ''); location.reload(); }
                            }
                        } catch (e) {}
                    }
                });
            } else {
                this.showScreen();
            }
        }
    };

    const State = {
        count: 1,
        bumpMsg: 'grinding x{count}',
        awardNotifierActive: false,
        lastCheckedAwardTime: Date.now(),
        currentLang: 'en',
        theme: { bg: '#09090b', sidebar: '#121216', stroke: '#27272a', accent: '#ef4444', text: '#ffffff' },
        cfg: { bumpCycle: '60m', bumpMin: '30s', bumpMax: '60s', eventCycle: '60m', eventMin: '30s', eventMax: '60s', webhook: '' },
        data: { bumps: [], events: [], activeBumps: false, activeEvents: {}, nextBumpRun: 0, nextEventRuns: {}, completedBumps: [], completedEvents: {} },
        shuffle: { bumps: false, events: {} },
        removals: { bats: false, spider: false },
        queue: [],
        isProcessing: false,
        delayEndTime: 0,
        botStatusMsg: 'System IDLE. Ready to inject.',
        currentTab: 'links',
        currentTabLinks: 'bumps',
        isPanelOpen: false,
        activeIframe: null,
        updateAvailable: null,
        updateDismissed: false,

        load() {
            this.count = GM_getValue('OG_PRO_count', this.count);
            this.bumpMsg = GM_getValue('OG_PRO_bumpMsg', this.bumpMsg);
            this.awardNotifierActive = GM_getValue('OG_PRO_awardNotifier', this.awardNotifierActive);
            this.lastCheckedAwardTime = GM_getValue('OG_PRO_lastAwardCheck', this.lastCheckedAwardTime);
            this.currentLang = GM_getValue('OG_PRO_lang', this.currentLang);
            this.theme = Object.assign({}, this.theme, GM_getValue('OG_PRO_theme', {}));
            this.cfg = Object.assign({}, this.cfg, GM_getValue('OG_PRO_cfg', {}));
            this.data = Object.assign({}, this.data, GM_getValue('OG_PRO_state', {}));
            this.shuffle = Object.assign({}, this.shuffle, GM_getValue('OG_PRO_shuffle', {}));
            this.removals = Object.assign({}, this.removals, GM_getValue('OG_PRO_removals', {}));
            this.queue = GM_getValue('OG_PRO_queue', []);
        },
        save() {
            GM_setValue('OG_PRO_count', this.count);
            GM_setValue('OG_PRO_bumpMsg', this.bumpMsg);
            GM_setValue('OG_PRO_awardNotifier', this.awardNotifierActive);
            GM_setValue('OG_PRO_lastAwardCheck', this.lastCheckedAwardTime);
            GM_setValue('OG_PRO_lang', this.currentLang);
            GM_setValue('OG_PRO_theme', this.theme);
            GM_setValue('OG_PRO_cfg', this.cfg);
            GM_setValue('OG_PRO_state', this.data);
            GM_setValue('OG_PRO_shuffle', this.shuffle);
            GM_setValue('OG_PRO_removals', this.removals);
            GM_setValue('OG_PRO_queue', this.queue);
        },
        isRunning() {
            return this.data.activeBumps || Object.values(this.data.activeEvents).some(Boolean);
        },
        anyEventActive() {
            return Object.values(this.data.activeEvents).some(Boolean);
        }
    };

    const i18n = {
        dict: {
            en: {
                linksTab: 'Links', delayTab: 'Delay', settingsTab: 'Theme', botTab: 'Bot',
                bumpsSub: 'Global Bumps', eventsSub: 'Custom Events', addBump: 'Target URL', createFolder: 'New Folder',
                saveSettings: 'Save', saveTheme: 'Save Theme',
                fieldCycle: 'Cycle', fieldMin: 'Smooth min', fieldMax: 'Smooth max', resetDelay: 'Reset',
                globalBumps: 'GLOBAL BUMPS', awardNotifier: 'AWARD SCANNER', eventFolders: 'CUSTOM EVENTS',
                shuffle: 'Shuffle', shuffleOn: 'Shuffle enabled. Links will run in a random order each cycle.', shuffleOff: 'Shuffle disabled.',
                webhookSaved: 'Webhook Updated', settingsSaved: 'Config Saved',
                urlAlreadyBump: '⚠️ URL already injected.', urlAlreadyFolder: '⚠️ URL already in folder.',
                timeWarning: '⚠️ Max Smooth Time exceeds Cycle! Recommended Cycle: {rec}',
                conflict: 'Only one cycle engine can run at a time. Turn off BUMPS or the custom event first.',
                noEngines: 'No custom engines deployed.', noLinks: 'No targets yet.', ready: 'READY',
                running: 'ENGINE ACTIVE', idle: 'ENGINE IDLE', customMsg: 'Custom Message', count: 'Count',
                webhookTitle: 'Discord Webhook', injectionPanel: 'Injection Panel', language: 'Language', uiColors: 'UI Colors',
                bg: 'Background', sidebar: 'Sidebar', borders: 'Borders', accent: 'Accent',
                folderPh: 'Folder name...', urlPh: 'https://...', urlFolderPh: 'URL...', smoothDelay: 'Smooth Delay',
                updateAvail: 'New version available', updateBtn: 'Update', updateVer: 'v{v}',
                removalsTitle: 'Removals',
                exportBtn: 'Export', importBtn: 'Import',
                exportEmpty: 'No links to export.',
                importDone: '{n} links imported.', importDupes: '{n} duplicate links removed.',
                importNoneNew: 'All links in the file were duplicates.', importInvalid: 'The file does not contain a valid list of links.',
                bumpsEmpty: 'BUMPS list is empty and cannot start. Add your first link to begin.',
                eventEmpty: 'This folder has no links. Add one before starting it.'
            },
            es: {
                linksTab: 'Enlaces', delayTab: 'Tiempos', settingsTab: 'Tema', botTab: 'Bot',
                bumpsSub: 'Bumps Globales', eventsSub: 'Eventos', addBump: 'URL Destino', createFolder: 'Nueva Carpeta',
                saveSettings: 'Guardar', saveTheme: 'Guardar Tema',
                fieldCycle: 'Ciclo', fieldMin: 'Smooth mín', fieldMax: 'Smooth máx', resetDelay: 'Restablecer',
                globalBumps: 'BUMPS GLOBALES', awardNotifier: 'ESCÁNER AWARDS', eventFolders: 'EVENTOS CUSTOM',
                shuffle: 'Shuffle', shuffleOn: 'Shuffle activado. Los enlaces saldrán en orden aleatorio en cada ciclo.', shuffleOff: 'Shuffle desactivado.',
                webhookSaved: 'Webhook Actualizado', settingsSaved: 'Configuración Guardada',
                urlAlreadyBump: '⚠️ URL ya inyectada.', urlAlreadyFolder: '⚠️ URL ya en la carpeta.',
                timeWarning: '⚠️ ¡El Smooth Máximo supera el Ciclo! Ciclo Recomendado: {rec}',
                conflict: 'Solo puede haber un motor de ciclos activo. Apaga BUMPS o el evento personalizado primero.',
                noEngines: 'No hay motores personalizados.', noLinks: 'Sin destinos todavía.', ready: 'LISTO',
                running: 'MOTOR ACTIVO', idle: 'MOTOR INACTIVO', customMsg: 'Mensaje Personalizado', count: 'Contador',
                webhookTitle: 'Webhook de Discord', injectionPanel: 'Panel de Inyección', language: 'Idioma', uiColors: 'Colores UI',
                bg: 'Fondo', sidebar: 'Barra lateral', borders: 'Bordes', accent: 'Acento',
                folderPh: 'Nombre de carpeta...', urlPh: 'https://...', urlFolderPh: 'URL...', smoothDelay: 'Smooth Delay',
                updateAvail: 'Nueva versión disponible', updateBtn: 'Actualizar', updateVer: 'v{v}',
                removalsTitle: 'Eliminaciones',
                exportBtn: 'Exportar', importBtn: 'Importar',
                exportEmpty: 'No hay enlaces que exportar.',
                importDone: '{n} enlaces importados.', importDupes: '{n} enlaces duplicados eliminados.',
                importNoneNew: 'Todos los enlaces del archivo eran duplicados.', importInvalid: 'El archivo no contiene una lista de enlaces válida.',
                bumpsEmpty: 'La lista BUMPS está vacía y no se puede iniciar. Añade tu primer enlace para empezar.',
                eventEmpty: 'Esta carpeta no tiene enlaces. Añade uno antes de iniciarla.'
            },
            ru: {
                linksTab: 'Ссылки', delayTab: 'Тайминги', settingsTab: 'Тема', botTab: 'Бот',
                bumpsSub: 'Бампы', eventsSub: 'События', addBump: 'Целевой URL', createFolder: 'Новая папка',
                saveSettings: 'Сохранить', saveTheme: 'Сохранить тему',
                fieldCycle: 'Цикл', fieldMin: 'Мин. задержка', fieldMax: 'Макс. задержка', resetDelay: 'Сбросить',
                globalBumps: 'ГЛОБАЛЬНЫЕ BUMPS', awardNotifier: 'СКАНИРОВАТЬ AWARDS', eventFolders: 'СВОИ СОБЫТИЯ',
                shuffle: 'Shuffle', shuffleOn: 'Shuffle включен. Ссылки будут идти в случайном порядке в каждом цикле.', shuffleOff: 'Shuffle выключен.',
                webhookSaved: 'Вебхук обновлен', settingsSaved: 'Настройки сохранены',
                urlAlreadyBump: '⚠️ URL уже добавлен.', urlAlreadyFolder: '⚠️ URL уже в папке.',
                timeWarning: '⚠️ Макс. задержка превышает цикл! Рекомендуется: {rec}',
                conflict: 'Одновременно может работать только один движок циклов. Сначала выключите BUMPS или пользовательское событие.',
                noEngines: 'Нет пользовательских движков.', noLinks: 'Целей пока нет.', ready: 'ГОТОВО',
                running: 'ДВИЖОК АКТИВЕН', idle: 'ДВИЖОК ОСТАНОВЛЕН', customMsg: 'Пользовательское сообщение', count: 'Счетчик',
                webhookTitle: 'Discord Webhook', injectionPanel: 'Панель инъекций', language: 'Язык', uiColors: 'Цвета UI',
                bg: 'Фон', sidebar: 'Боковая панель', borders: 'Границы', accent: 'Акцент',
                folderPh: 'Название папки...', urlPh: 'https://...', urlFolderPh: 'URL...', smoothDelay: 'Smooth Delay',
                updateAvail: 'Доступна новая версия', updateBtn: 'Обновить', updateVer: 'v{v}',
                removalsTitle: 'Удаления',
                exportBtn: 'Экспорт', importBtn: 'Импорт',
                exportEmpty: 'Нет ссылок для экспорта.',
                importDone: 'Импортировано ссылок: {n}.', importDupes: 'Удалено дубликатов: {n}.',
                importNoneNew: 'Все ссылки из файла были дубликатами.', importInvalid: 'Файл не содержит корректного списка ссылок.',
                bumpsEmpty: 'Список BUMPS пуст, запуск невозможен. Добавьте первую ссылку, чтобы начать.',
                eventEmpty: 'В этой папке нет ссылок. Добавьте хотя бы одну, прежде чем запускать.'
            }
        },
        t(key) { return this.dict[State.currentLang]?.[key] || this.dict.en[key] || key; }
    };

    const Utils = {
        parseTimeToMs(str) {
            if (!str) return 60000;
            str = str.toString().trim().toLowerCase();
            const num = parseFloat(str);
            if (isNaN(num)) return 60000;
            if (str.endsWith('h')) return num * 3600000;
            if (str.endsWith('m')) return num * 60000;
            if (str.endsWith('s')) return num * 1000;
            return num * 60000;
        },
        msToStr(ms) {
            const m = Math.ceil(ms / 60000);
            return m > 60 ? Math.ceil(m / 60) + 'h' : m + 'm';
        },
        isValidUrl(s) {
            try { const u = new URL(s); return u.protocol === 'http:' || u.protocol === 'https:'; } catch (e) { return false; }
        },
        escape(s) {
            return String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
        },
        safeName(s) {
            return String(s).replace(/[^\w\-]+/g, '_').replace(/^_+|_+$/g, '') || 'folder';
        },
        shuffleArray(arr) {
            const a = arr.slice();
            for (let i = a.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [a[i], a[j]] = [a[j], a[i]];
            }
            return a;
        }
    };

    const Updater = {
        RAW_URL: 'https://raw.githubusercontent.com/notcni/og-pro/main/ogpro.user.js',
        INTERVAL_MS: 2 * 60 * 1000,
        checking: false,

        current() {
            try {
                return (typeof GM_info !== 'undefined' && GM_info.script && GM_info.script.version) || '0';
            } catch (e) { return '0'; }
        },

        isNewer(remote, local) {
            const a = String(remote).split('.').map(n => parseInt(n, 10) || 0);
            const b = String(local).split('.').map(n => parseInt(n, 10) || 0);
            const len = Math.max(a.length, b.length);
            for (let i = 0; i < len; i++) {
                const x = a[i] || 0, y = b[i] || 0;
                if (x > y) return true;
                if (x < y) return false;
            }
            return false;
        },

        check() {
            if (this.checking) return;
            this.checking = true;
            GM_xmlhttpRequest({
                method: 'GET',
                url: this.RAW_URL + '?t=' + Date.now(),
                headers: { 'Cache-Control': 'no-cache' },
                onload: (res) => {
                    this.checking = false;
                    if (res.status !== 200) return;
                    const m = res.responseText.match(/@version\s+([\d.]+)/);
                    if (!m) return;
                    const remote = m[1];
                    const newer = this.isNewer(remote, this.current());

                    if (newer) {
                        if (State.updateAvailable !== remote) {
                            State.updateAvailable = remote;
                            State.updateDismissed = false;
                            UI.renderMain();
                        }
                    } else if (State.updateAvailable) {
                        State.updateAvailable = null;
                        UI.renderMain();
                    }
                },
                onerror: () => { this.checking = false; },
                ontimeout: () => { this.checking = false; }
            });
        },

        install() {
            window.open(this.RAW_URL, '_blank', 'noopener');
        },

        start() {
            this.check();
            setInterval(() => this.check(), this.INTERVAL_MS);
            document.addEventListener('visibilitychange', () => {
                if (document.visibilityState === 'visible') this.check();
            });
            window.addEventListener('focus', () => this.check());
        }
    };

    const Removals = {
        DEFS: [
            { id: 'bats', name: 'BATS', kind: 'img', prefix: 'data:image/gif;base64,R0lGODlhMAAwAJECAAAAAEJCQv' },
            { id: 'spider', name: 'SPIDER WEBS', kind: 'sel', sel: '#spider-web-corners' }
        ],
        observer: null,

        matches(node, d) {
            if (!node || node.nodeType !== 1) return false;
            if (d.kind === 'img') {
                return node.tagName === 'IMG' && (node.getAttribute('src') || '').startsWith(d.prefix);
            }
            return typeof node.matches === 'function' && node.matches(d.sel);
        },

        handleNode(node) {
            if (!node || node.nodeType !== 1) return;
            const candidates = [node, ...node.querySelectorAll('*')];
            candidates.forEach(el => {
                this.DEFS.forEach(d => {
                    if (State.removals[d.id] && this.matches(el, d)) el.remove();
                });
            });
        },

        toggle(id) {
            State.removals[id] = !State.removals[id];
            State.save();
            if (State.removals[id]) this.handleNode(document.documentElement);
        },

        start() {
            this.handleNode(document.documentElement);
            this.observer = new MutationObserver((muts) => {
                muts.forEach(m => {
                    m.addedNodes.forEach(n => this.handleNode(n));
                    if (m.type === 'attributes') this.handleNode(m.target);
                });
            });
            this.observer.observe(document.documentElement, {
                childList: true, subtree: true, attributes: true, attributeFilter: ['src']
            });
        }
    };

    const Transfer = {
        pending: null,
        input: null,

        initInput() {
            this.input = document.createElement('input');
            this.input.type = 'file';
            this.input.accept = '.json,application/json';
            this.input.style.display = 'none';
            this.input.addEventListener('change', (e) => {
                const file = e.target.files && e.target.files[0];
                if (file) this.handleFile(file);
                e.target.value = '';
            });
            document.body.appendChild(this.input);
        },

        getList(type, fid) {
            if (type === 'bumps') return State.data.bumps;
            const f = State.data.events.find(x => x.id === fid);
            return f ? f.links : null;
        },

        getName(type, fid) {
            if (type === 'bumps') return 'bumps';
            const f = State.data.events.find(x => x.id === fid);
            return f ? Utils.safeName(f.name) : 'folder';
        },

        exportList(type, fid) {
            const links = this.getList(type, fid) || [];
            if (links.length === 0) return UI.showAlert(i18n.t('exportEmpty'));

            const payload = {
                app: 'OG Pro',
                type: type === 'bumps' ? 'bumps' : 'event',
                name: type === 'bumps' ? 'bumps' : (State.data.events.find(x => x.id === fid)?.name || ''),
                exportedAt: new Date().toISOString(),
                links: links.slice()
            };
            const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `og-pro-${this.getName(type, fid)}.json`;
            document.body.appendChild(a);
            a.click();
            a.remove();
            setTimeout(() => URL.revokeObjectURL(url), 1000);
        },

        openImport(type, fid) {
            this.pending = { type, fid };
            this.input.value = '';
            this.input.click();
        },

        handleFile(file) {
            const reader = new FileReader();
            reader.onload = () => {
                let data;
                try { data = JSON.parse(reader.result); } catch (e) { return UI.showAlert(i18n.t('importInvalid')); }

                let incoming = null;
                if (Array.isArray(data)) incoming = data;
                else if (data && Array.isArray(data.links)) incoming = data.links;
                if (!incoming) return UI.showAlert(i18n.t('importInvalid'));

                const { type, fid } = this.pending || {};
                const target = this.getList(type, fid);
                if (!target) return UI.showAlert(i18n.t('importInvalid'));

                const seen = new Set(target);
                let added = 0;
                let dupes = 0;

                incoming.forEach(raw => {
                    const url = String(raw || '').trim();
                    if (!Utils.isValidUrl(url)) return;
                    if (seen.has(url)) { dupes++; return; }
                    seen.add(url);
                    target.push(url);
                    added++;
                });

                if (added === 0 && dupes === 0) return UI.showAlert(i18n.t('importInvalid'));

                State.save();
                UI.renderMain();

                const parts = [];
                if (added > 0) parts.push(i18n.t('importDone').replace('{n}', added));
                if (dupes > 0) parts.push(i18n.t('importDupes').replace('{n}', dupes));
                if (added === 0 && dupes > 0) parts.push(i18n.t('importNoneNew'));
                UI.showAlert(parts.join(' · '));
            };
            reader.readAsText(file);
        }
    };

    const Delay = {
        KEYS: ['bumpCycle', 'bumpMin', 'bumpMax', 'eventCycle', 'eventMin', 'eventMax'],
        UNITS: { s: 600, m: 240, h: 24 },
        PRESETS: {
            cycle: ['15m', '30m', '1h', '2h', '6h'],
            smooth: ['5s', '15s', '30s', '1m', '2m']
        },
        draft: null,

        reset() {
            this.draft = {};
            this.KEYS.forEach(k => { this.draft[k] = State.cfg[k]; });
        },

        parse(str) {
            const m = String(str).trim().toLowerCase().match(/^(\d+(?:\.\d+)?)\s*([hms])?$/);
            if (!m) return { num: 1, unit: 'm' };
            return { num: Math.max(1, Math.round(parseFloat(m[1]))), unit: m[2] || 'm' };
        },

        toMs(str) { return Utils.parseTimeToMs(str); },

        human(ms) {
            let s = Math.round(ms / 1000);
            const h = Math.floor(s / 3600); s %= 3600;
            const m = Math.floor(s / 60); s %= 60;
            const parts = [];
            if (h) parts.push(h + 'h');
            if (m) parts.push(m + 'm');
            if (s || !parts.length) parts.push(s + 's');
            return parts.join(' ');
        },

        field(key, labelKey) {
            const val = this.draft[key];
            const { num, unit } = this.parse(val);
            const max = this.UNITS[unit];
            const presets = key.endsWith('Cycle') ? this.PRESETS.cycle : this.PRESETS.smooth;
            return `
                <div class="dl-field" data-key="${key}">
                    <div class="dl-header">
                        <span class="dl-label">${i18n.t(labelKey)}</span>
                        <span class="dl-preview">${this.human(this.toMs(val))}</span>
                    </div>
                    <div class="dl-main">
                        <div class="dl-input-group">
                            <input type="number" class="dl-num" min="1" value="${num}">
                            <div class="dl-units">
                                ${['s', 'm', 'h'].map(u => `<button class="dl-unit ${u === unit ? 'active' : ''}" data-unit="${u}">${u}</button>`).join('')}
                            </div>
                        </div>
                        <input type="range" class="dl-slider" min="1" max="${max}" value="${Math.min(num, max)}"
                            style="--p:${((Math.min(num, max) - 1) / (max - 1) * 100).toFixed(1)}%">
                    </div>
                    <div class="dl-presets">
                        ${presets.map(p => `<button class="dl-preset ${p === val ? 'active' : ''}" data-value="${p}">${p}</button>`).join('')}
                    </div>
                </div>`;
        },

        render() {
            if (!this.draft) this.reset();
            return `
                <div class="ogpro-title">${i18n.t('globalBumps')}</div>
                <div class="dl-grid">
                    ${this.field('bumpCycle', 'fieldCycle')}
                    <div class="dl-row-split">
                        ${this.field('bumpMin', 'fieldMin')}
                        ${this.field('bumpMax', 'fieldMax')}
                    </div>
                </div>
                <div id="warn-bumps" class="ogpro-warning"></div>

                <div class="ogpro-title" style="margin-top:16px;">${i18n.t('eventFolders')}</div>
                <div class="dl-grid">
                    ${this.field('eventCycle', 'fieldCycle')}
                    <div class="dl-row-split">
                        ${this.field('eventMin', 'fieldMin')}
                        ${this.field('eventMax', 'fieldMax')}
                    </div>
                </div>
                <div id="warn-events" class="ogpro-warning"></div>

                <div class="dl-actions">
                    <button id="btn-reset-delay" class="ogpro-action-btn" style="flex:0 0 120px;">${Icon('rotateLeft')}${i18n.t('resetDelay')}</button>
                    <button id="btn-save-delay" class="ogpro-btn">${Icon('check')} ${i18n.t('saveSettings')}</button>
                </div>`;
        },

        sync(field, skipNum = false) {
            const key = field.dataset.key;
            const val = this.draft[key];
            const { num, unit } = this.parse(val);
            const max = this.UNITS[unit];
            const shown = Math.min(num, max);

            const numEl = field.querySelector('.dl-num');
            if (!skipNum) numEl.value = num;

            const slider = field.querySelector('.dl-slider');
            slider.max = max;
            slider.value = shown;
            slider.style.setProperty('--p', ((shown - 1) / (max - 1) * 100).toFixed(1) + '%');

            field.querySelectorAll('.dl-unit').forEach(b => b.classList.toggle('active', b.dataset.unit === unit));
            field.querySelectorAll('.dl-preset').forEach(b => b.classList.toggle('active', b.dataset.value === val));
            field.querySelector('.dl-preview').textContent = this.human(this.toMs(val));

            UI.checkCycleWarnings();
        },

        onInput(e) {
            const field = e.target.closest && e.target.closest('.dl-field');
            if (!field) return;
            const key = field.dataset.key;
            const cur = this.parse(this.draft[key]);

            if (e.target.classList.contains('dl-num')) {
                cur.num = Math.max(1, parseInt(e.target.value, 10) || 1);
                this.draft[key] = `${cur.num}${cur.unit}`;
                this.sync(field, true);
            } else if (e.target.classList.contains('dl-slider')) {
                cur.num = parseInt(e.target.value, 10);
                this.draft[key] = `${cur.num}${cur.unit}`;
                this.sync(field);
            }
        },

        setUnit(field, unit) {
            const key = field.dataset.key;
            const { num } = this.parse(this.draft[key]);
            this.draft[key] = `${Math.min(num, this.UNITS[unit])}${unit}`;
            this.sync(field);
        },

        setPreset(field, value) {
            this.draft[field.dataset.key] = value;
            this.sync(field);
        },

        commit() {
            this.KEYS.forEach(k => { State.cfg[k] = this.draft[k]; });
            State.save();
            UI.checkCycleWarnings();
        }
    };

    const UI = {
        container: null,
        styleElement: null,
        toastTimer: null,

        init() {
            this.styleElement = document.createElement('style');
            document.head.appendChild(this.styleElement);
            this.container = document.createElement('div');
            this.container.id = 'ogpro-container';
            document.body.appendChild(this.container);
            Transfer.initInput();
            this.updateStyles();
            this.renderMain();
        },

        updateStyles() {
            const t = State.theme;
            this.styleElement.textContent = `
                :root {
                    --og-bg: ${t.bg};
                    --og-side: ${t.sidebar};
                    --og-stroke: ${t.stroke};
                    --og-acc: ${t.accent};
                    --og-glow: ${t.accent}55;
                    --og-txt: ${t.text};
                    --og-ease: cubic-bezier(.2,.8,.2,1);
                    --og-spring: cubic-bezier(.175,.885,.32,1.275);
                }
                #ogpro-container { position:fixed; bottom:30px; right:30px; z-index:999999; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif; box-sizing:border-box; }
                #ogpro-container *, #ogpro-container *::before, #ogpro-container *::after { box-sizing:border-box; }
                #ogpro-container button { font-family:inherit; }

                .og-ico { width:14px; height:14px; flex-shrink:0; display:block; }
                .og-ico.og-spin { animation:ogSpin 1s linear infinite; }
                @keyframes ogSpin { to { transform:rotate(360deg); } }

                #ogpro-toggle {
                    background:var(--og-bg); border:1px solid var(--og-stroke); color:var(--og-acc);
                    padding:12px 20px; cursor:pointer; display:flex; align-items:center; justify-content:center; gap:10px;
                    border-radius:10px; box-shadow:0 10px 30px rgba(0,0,0,.6); margin-left:auto; width:fit-content;
                    font-weight:900; font-size:13px; text-transform:uppercase; letter-spacing:1.5px;
                    transition:transform .25s var(--og-spring), border-color .25s, box-shadow .25s;
                    position:relative; overflow:hidden;
                }
                #ogpro-toggle .og-ico { width:16px; height:16px; }
                #ogpro-toggle::after { content:''; position:absolute; inset:0; background:linear-gradient(120deg,transparent,rgba(255,255,255,.08),transparent); transform:translateX(-100%); transition:transform .6s; }
                #ogpro-toggle:hover { border-color:var(--og-acc); box-shadow:0 0 18px var(--og-glow); transform:translateY(-3px); }
                #ogpro-toggle:hover::after { transform:translateX(100%); }
                #ogpro-toggle:active { transform:scale(.96); }
                #ogpro-toggle .og-live { width:7px; height:7px; border-radius:50%; background:#3f3f46; transition:background .3s; }
                #ogpro-toggle.running .og-live { background:#4ade80; box-shadow:0 0 8px #4ade80; animation:ogPulse 1.6s infinite; }
                #ogpro-toggle.has-update::before { content:''; position:absolute; top:6px; right:6px; width:8px; height:8px; border-radius:50%; background:var(--og-acc); box-shadow:0 0 8px var(--og-acc); animation:ogPulse 1.6s infinite; }
                @keyframes ogPulse { 0%{box-shadow:0 0 0 0 rgba(74,222,128,.6)} 70%{box-shadow:0 0 0 7px rgba(74,222,128,0)} 100%{box-shadow:0 0 0 0 rgba(74,222,128,0)} }

                #ogpro-panel {
                    position:relative; display:none;
                    width:580px; height:420px; overflow:hidden;
                    background:rgba(9,9,11,.96); backdrop-filter:blur(14px);
                    border:1px solid var(--og-stroke); border-radius:14px; margin-bottom:15px;
                    box-shadow:0 25px 60px rgba(0,0,0,.85);
                    opacity:0; transform:translateY(12px) scale(.96); transform-origin:bottom right;
                    transition:opacity .3s var(--og-ease), transform .35s var(--og-ease);
                }
                #ogpro-panel.show { display:block; opacity:1; transform:translateY(0) scale(1); }

                #ogpro-toast {
                    position:absolute; bottom:18px; left:50%; transform:translateX(-50%) translateY(60px);
                    background:var(--og-acc); color:#fff; padding:10px 20px; border-radius:8px; font-size:11px;
                    font-weight:900; text-transform:uppercase; letter-spacing:1px; opacity:0;
                    transition:transform .4s var(--og-spring), opacity .3s; pointer-events:none; z-index:1000;
                    box-shadow:0 8px 20px rgba(0,0,0,.5); white-space:nowrap; border:1px solid rgba(255,255,255,.2);
                    max-width:520px; overflow:hidden; text-overflow:ellipsis;
                }
                #ogpro-toast.show { transform:translateX(-50%) translateY(0); opacity:1; }

                .ogpro-sidebar {
                    position:absolute; top:0; left:0; bottom:0; width:150px;
                    background:var(--og-side); border-right:1px solid var(--og-stroke);
                    display:flex; flex-direction:column;
                }
                .ogpro-logo {
                    flex-shrink:0; height:94px; padding:22px 12px 16px; font-weight:900; color:var(--og-acc); font-size:19px;
                    text-transform:uppercase; letter-spacing:2px; text-align:center;
                    border-bottom:1px solid var(--og-stroke); text-shadow:0 0 12px var(--og-glow);
                }
                .ogpro-logo span { color:#fff; }
                .ogpro-logo-ver { display:block; margin-top:6px; font-size:9px; font-weight:800; letter-spacing:1px; color:#71717a; text-shadow:none; }
                .ogpro-nav { display:flex; flex-direction:column; padding:8px 0; flex:1; min-height:0; }
                .ogpro-nav-btn {
                    height:48px; flex-shrink:0; background:transparent; border:none; color:#71717a; padding:0 16px;
                    text-align:left; cursor:pointer; font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:1px;
                    display:flex; align-items:center; gap:10px; position:relative;
                    border-left:2px solid transparent;
                    transition:color .2s, background .2s, padding-left .25s var(--og-ease);
                }
                .ogpro-nav-btn .og-ico { width:14px; height:14px; transition:transform .25s var(--og-spring); }
                .ogpro-nav-btn:hover { color:#fff; background:rgba(255,255,255,.03); padding-left:20px; }
                .ogpro-nav-btn:hover .og-ico { transform:scale(1.15); }
                .ogpro-nav-btn.active { color:#fff; background:linear-gradient(90deg,rgba(239,68,68,.14),transparent); border-left-color:var(--og-acc); }
                .ogpro-nav-btn.active .og-ico { color:var(--og-acc); }
                .ogpro-sidebar-foot {
                    flex-shrink:0; height:40px; padding:0 16px; border-top:1px solid var(--og-stroke);
                    font-size:9px; font-weight:800; letter-spacing:1px; text-transform:uppercase; color:#52525b;
                    display:flex; align-items:center; gap:8px;
                }
                .ogpro-sidebar-foot .dot { width:7px; height:7px; border-radius:50%; background:#3f3f46; transition:background .3s, box-shadow .3s; flex-shrink:0; }
                .ogpro-sidebar-foot.on { color:#4ade80; }
                .ogpro-sidebar-foot.on .dot { background:#4ade80; box-shadow:0 0 8px #4ade80; animation:ogPulse 1.6s infinite; }

                .ogpro-content { position:absolute; top:0; right:0; bottom:0; left:150px; }
                .ogpro-scroll {
                    position:absolute; top:0; left:0; right:0; bottom:0;
                    overflow-y:auto; padding:22px 24px;
                }
                .ogpro-scroll.has-update { bottom:58px; }
                .ogpro-tab-content { display:none; }
                .ogpro-tab-content.active { display:block; animation:ogSlideIn .4s var(--og-ease); }
                @keyframes ogSlideIn { from { opacity:0; transform:translateX(14px); } to { opacity:1; transform:translateX(0); } }
                @keyframes ogItemIn { from { opacity:0; transform:translateY(8px) scale(.98); } to { opacity:1; transform:translateY(0) scale(1); } }

                .ogpro-update {
                    position:absolute; left:0; right:0; bottom:0; height:58px;
                    display:flex; align-items:center; justify-content:space-between; gap:10px;
                    padding:0 14px; border-top:1px solid rgba(239,68,68,.5);
                    background:linear-gradient(90deg,rgba(239,68,68,.22),rgba(239,68,68,.06));
                    animation:ogUpdateIn .45s var(--og-spring) both;
                }
                @keyframes ogUpdateIn { from { opacity:0; transform:translateY(100%); } to { opacity:1; transform:translateY(0); } }
                .ogpro-update-text { font-size:10px; font-weight:800; color:#fff; text-transform:uppercase; letter-spacing:1px; display:flex; align-items:center; gap:8px; min-width:0; }
                .ogpro-update-text .og-ico { color:var(--og-acc); animation:ogBob 1.6s ease-in-out infinite; }
                @keyframes ogBob { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-2px)} }
                .ogpro-update-actions { display:flex; gap:8px; align-items:center; flex-shrink:0; }
                .ogpro-update-btn {
                    height:30px; padding:0 14px; background:var(--og-acc); border:none; color:#fff; border-radius:6px; cursor:pointer;
                    font-size:10px; font-weight:900; text-transform:uppercase; letter-spacing:1px; line-height:1;
                    box-shadow:0 4px 12px var(--og-glow); transition:transform .15s, box-shadow .2s, filter .2s;
                }
                .ogpro-update-btn:hover { filter:brightness(1.1); box-shadow:0 6px 16px var(--og-glow); transform:translateY(-1px); }
                .ogpro-update-btn:active { transform:scale(.95); }
                .ogpro-update-close {
                    width:30px; height:30px; padding:0; border:1px solid transparent; background:transparent; color:#a1a1aa; cursor:pointer;
                    border-radius:6px; display:flex; align-items:center; justify-content:center;
                    transition:background .2s, color .2s, border-color .2s;
                }
                .ogpro-update-close .og-ico { width:12px; height:12px; }
                .ogpro-update-close:hover { background:rgba(255,255,255,.08); border-color:rgba(255,255,255,.1); color:#fff; }

                .ogpro-title { font-size:10px; color:var(--og-acc); border-bottom:1px solid var(--og-stroke); padding-bottom:5px; margin:0 0 10px; font-weight:800; letter-spacing:2px; text-transform:uppercase; display:flex; align-items:center; gap:8px; }
                .ogpro-title::before { content:''; width:3px; height:10px; background:var(--og-acc); border-radius:2px; box-shadow:0 0 6px var(--og-glow); }
                .ogpro-label { display:block; font-size:9px; color:#71717a; margin-bottom:7px; font-weight:800; text-transform:uppercase; letter-spacing:1px; }

                .ogpro-subtabs {
                    display:flex; position:relative; margin-bottom:18px; background:rgba(0,0,0,.5);
                    border:1px solid var(--og-stroke); border-radius:9px; padding:4px;
                }
                .ogpro-subtabs-indicator {
                    position:absolute; top:4px; bottom:4px; left:4px; border-radius:6px;
                    background:linear-gradient(180deg,rgba(239,68,68,.25),rgba(239,68,68,.1));
                    border:1px solid rgba(239,68,68,.4); box-shadow:0 0 14px var(--og-glow), inset 0 1px 0 rgba(255,255,255,.08);
                    transition:transform .4s var(--og-ease), width .4s var(--og-ease); pointer-events:none;
                }
                .ogpro-subtab-btn {
                    flex:1; position:relative; z-index:1; background:transparent; border:none; color:#71717a;
                    height:32px; padding:0 8px; cursor:pointer; font-size:9px; font-weight:800; text-transform:uppercase; letter-spacing:1px;
                    line-height:1; display:flex; align-items:center; justify-content:center; gap:6px;
                    border-radius:6px; transition:color .25s, transform .15s;
                }
                .ogpro-subtab-btn .og-ico { width:12px; height:12px; }
                .ogpro-subtab-btn:hover { color:#d4d4d8; }
                .ogpro-subtab-btn:active { transform:scale(.96); }
                .ogpro-subtab-btn.active { color:#fff; text-shadow:0 0 8px var(--og-glow); }

                .ogpro-input {
                    width:100%; background:rgba(0,0,0,.5); border:1px solid var(--og-stroke); color:#fff;
                    padding:10px 12px; margin-bottom:14px; outline:none; border-radius:7px; font-size:11px; font-family:monospace;
                    transition:border-color .25s, box-shadow .25s, background .25s;
                }
                .ogpro-input::placeholder { color:#52525b; }
                .ogpro-input:hover { border-color:#3f3f46; }
                .ogpro-input:focus { border-color:var(--og-acc); box-shadow:0 0 0 3px rgba(239,68,68,.12); background:rgba(0,0,0,.7); }
                .ogpro-input.invalid { border-color:#ef4444; animation:ogShakeX .35s; }
                @keyframes ogShakeX { 0%,100%{transform:translateX(0)} 25%{transform:translateX(-4px)} 75%{transform:translateX(4px)} }
                input[type=color].ogpro-input { padding:2px; cursor:pointer; }

                .ogpro-btn {
                    width:100%; background:rgba(255,255,255,.03); border:1px solid var(--og-stroke); color:#fff;
                    padding:12px; cursor:pointer; font-weight:800; border-radius:7px; text-transform:uppercase;
                    font-size:10px; letter-spacing:1.5px; display:flex; align-items:center; justify-content:center; gap:8px;
                    transition:background .25s, border-color .25s, box-shadow .25s, transform .15s;
                }
                .ogpro-btn .og-ico { width:12px; height:12px; }
                .ogpro-btn:hover { background:var(--og-acc); border-color:var(--og-acc); box-shadow:0 6px 18px var(--og-glow); transform:translateY(-1px); }
                .ogpro-btn:active { transform:scale(.97); }

                .ogpro-icon-btn {
                    width:34px; height:34px; min-width:34px; display:flex; justify-content:center; align-items:center; border-radius:7px;
                    cursor:pointer; border:1px solid var(--og-stroke); background:rgba(255,255,255,.03); color:#fff; padding:0;
                    transition:background .2s, border-color .2s, box-shadow .2s, transform .15s;
                }
                .ogpro-icon-btn .og-ico { width:14px; height:14px; }
                .ogpro-icon-btn:hover { background:var(--og-acc); border-color:var(--og-acc); box-shadow:0 4px 14px var(--og-glow); }
                .ogpro-icon-btn:active { transform:scale(.9); }
                .ogpro-icon-btn.ghost { border:none; background:transparent; width:26px; height:26px; min-width:26px; color:#71717a; }
                .ogpro-icon-btn.ghost .og-ico { width:12px; height:12px; }
                .ogpro-icon-btn.ghost:hover { background:rgba(239,68,68,.15); color:var(--og-acc); box-shadow:none; }

                .ogpro-actions { display:flex; gap:8px; margin:0 0 14px; }
                .ogpro-action-btn {
                    flex:1; height:32px; display:flex; align-items:center; justify-content:center; gap:8px;
                    background:rgba(255,255,255,.02); border:1px solid var(--og-stroke); color:#a1a1aa; border-radius:7px;
                    font-size:9px; font-weight:800; letter-spacing:1.2px; text-transform:uppercase; line-height:1;
                    cursor:pointer; transition:background .25s, border-color .25s, color .25s, box-shadow .25s, transform .15s;
                }
                .ogpro-action-btn .og-ico { width:12px; height:12px; transition:transform .3s var(--og-spring); }
                .ogpro-action-btn:hover { background:rgba(239,68,68,.12); border-color:rgba(239,68,68,.55); color:#fff; box-shadow:0 4px 14px var(--og-glow); transform:translateY(-1px); }
                .ogpro-action-btn:hover .og-ico { transform:translateY(-1px) scale(1.12); color:var(--og-acc); }
                .ogpro-action-btn:active { transform:scale(.96); }
                .ogpro-action-btn.on { background:rgba(239,68,68,.15); border-color:var(--og-acc); color:#fff; box-shadow:0 0 12px var(--og-glow); }

                .ogpro-row { display:flex; gap:10px; margin-bottom:4px; align-items:center; }
                .ogpro-row .ogpro-input { margin-bottom:0; }

                .dl-grid { display:flex; flex-direction:column; gap:14px; margin-bottom:12px; }
                .dl-row-split { display:grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap:12px; width:100%; }

                .dl-field {
                    background:rgba(255,255,255,.02); border:1px solid var(--og-stroke); border-radius:10px;
                    padding:12px 14px; display:flex; flex-direction:column; gap:10px; min-width:0;
                    transition:border-color .25s, box-shadow .25s, background .25s; animation:ogItemIn .3s var(--og-ease) both;
                }
                .dl-field:hover { border-color:#3f3f46; background:rgba(255,255,255,.03); }
                .dl-header { display:flex; justify-content:space-between; align-items:center; }
                .dl-label { font-size:9px; font-weight:800; color:#a1a1aa; text-transform:uppercase; letter-spacing:1px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
                .dl-preview {
                    font-family:monospace; font-size:10px; font-weight:800; color:var(--og-acc);
                    background:rgba(239,68,68,.1); padding:3px 7px; border-radius:5px; box-shadow:0 0 8px rgba(239,68,68,.15);
                    flex-shrink:0; margin-left:8px;
                }

                .dl-main { display:flex; flex-direction:column; gap:10px; min-width:0; }
                .dl-input-group { display:flex; gap:8px; align-items:center; min-width:0; width:100%; }
                .dl-num {
                    width:52px; height:30px; background:rgba(0,0,0,.5); border:1px solid var(--og-stroke); color:#fff;
                    border-radius:6px; text-align:center; font-family:monospace; font-size:12px; outline:none;
                    transition:border-color .2s, box-shadow .2s; -moz-appearance:textfield; font-weight:bold; flex-shrink:0; padding:0;
                }
                .dl-num::-webkit-inner-spin-button, .dl-num::-webkit-outer-spin-button { -webkit-appearance:none; margin:0; }
                .dl-num:focus { border-color:var(--og-acc); box-shadow:0 0 0 3px rgba(239,68,68,.12); }
                .dl-units {
                    display:flex; flex:1; min-width:0; background:rgba(0,0,0,.5); border:1px solid var(--og-stroke);
                    border-radius:6px; padding:2px; gap:2px; height:30px; align-items:center;
                }
                .dl-unit {
                    flex:1; min-width:0; height:100%; border:none; background:transparent; color:#71717a; font-size:10px; font-weight:900;
                    border-radius:4px; cursor:pointer; transition:background .2s, color .2s, transform .12s, box-shadow .2s;
                    display:flex; align-items:center; justify-content:center; padding:0; text-transform:uppercase;
                }
                .dl-unit:hover { color:#fff; }
                .dl-unit:active { transform:scale(.92); }
                .dl-unit.active { background:linear-gradient(180deg,rgba(239,68,68,.6),rgba(239,68,68,.2)); color:#fff; box-shadow:0 0 10px var(--og-glow); border:1px solid rgba(239,68,68,.5); }

                .dl-slider {
                    -webkit-appearance:none; appearance:none; width:100%; height:4px; border-radius:2px; margin:2px 0 4px;
                    background:linear-gradient(90deg,var(--og-acc) var(--p,0%),#27272a var(--p,0%)); outline:none; cursor:pointer; flex-shrink:0;
                }
                .dl-slider::-webkit-slider-thumb {
                    -webkit-appearance:none; width:14px; height:14px; border-radius:50%; background:#fff;
                    box-shadow:0 0 0 3px rgba(239,68,68,.4), 0 2px 6px rgba(0,0,0,.5); transition:transform .2s var(--og-spring);
                }
                .dl-slider::-webkit-slider-thumb:hover { transform:scale(1.3); }
                .dl-slider::-moz-range-thumb {
                    width:14px; height:14px; border:none; border-radius:50%; background:#fff;
                    box-shadow:0 0 0 3px rgba(239,68,68,.35), 0 2px 6px rgba(0,0,0,.5);
                }

                .dl-presets { display:flex; flex-wrap:wrap; gap:6px; min-width:0; width:100%; }
                .dl-preset {
                    flex:1 1 calc(33.333% - 6px); min-width:32px; height:26px; background:rgba(255,255,255,.03); border:1px solid var(--og-stroke);
                    color:#a1a1aa; border-radius:5px; font-size:9px; font-weight:800; font-family:monospace; cursor:pointer;
                    transition:background .2s, border-color .2s, color .2s, transform .12s, box-shadow .2s;
                    display:flex; align-items:center; justify-content:center; padding:0;
                }
                .dl-preset:hover { border-color:rgba(239,68,68,.55); color:#fff; }
                .dl-preset:active { transform:scale(.94); }
                .dl-preset.active { background:rgba(239,68,68,.15); border-color:var(--og-acc); color:#fff; box-shadow:0 0 8px var(--og-glow); }
                .dl-actions { display:flex; gap:8px; margin-top:6px; }
                .dl-actions .ogpro-btn { flex:1; }

                .ogpro-item {
                    background:rgba(255,255,255,.02); border:1px solid var(--og-stroke); border-left:2px solid var(--og-acc);
                    padding:10px 12px; margin-bottom:8px; border-radius:7px; display:flex; justify-content:space-between; align-items:center;
                    animation:ogItemIn .3s var(--og-ease) both; transition:background .2s, transform .2s;
                }
                .ogpro-item:hover { background:rgba(255,255,255,.04); transform:translateX(2px); }
                .ogpro-item-title { font-size:10px; font-family:monospace; color:#d4d4d8; word-break:break-all; margin-right:10px; }
                .ogpro-empty { color:#52525b; font-size:10px; font-style:italic; text-align:center; padding:18px 0; letter-spacing:.5px; }

                .ogpro-folder { background:rgba(0,0,0,.4); border:1px solid var(--og-stroke); border-radius:8px; margin-bottom:12px; overflow:hidden; animation:ogItemIn .3s var(--og-ease) both; }
                .ogpro-folder-head { background:rgba(255,255,255,.02); padding:12px; display:flex; justify-content:space-between; align-items:center; cursor:pointer; transition:background .2s; }
                .ogpro-folder-head:hover { background:rgba(255,255,255,.05); }
                .ogpro-folder-title { font-size:11px; font-weight:800; color:#fff; display:flex; align-items:center; gap:10px; text-transform:uppercase; }
                .ogpro-folder-title > .og-ico { width:14px; height:14px; color:var(--og-acc); }
                .ogpro-folder-title .chev { display:flex; color:#71717a; transition:transform .3s var(--og-ease); }
                .ogpro-folder-title .chev .og-ico { width:12px; height:12px; }
                .ogpro-folder.open .chev { transform:rotate(180deg); }
                .ogpro-badge { background:var(--og-acc); color:#fff; padding:2px 7px; border-radius:5px; font-size:9px; font-weight:900; box-shadow:0 0 8px var(--og-glow); }
                .ogpro-folder-body { max-height:0; opacity:0; padding:0 15px; border-top:1px solid transparent; background:rgba(0,0,0,.2); overflow:hidden; transition:max-height .4s var(--og-ease), opacity .3s, padding .3s, border-color .3s; }
                .ogpro-folder.open .ogpro-folder-body { max-height:600px; opacity:1; padding:15px; border-top-color:var(--og-stroke); overflow:visible; }

                .ogpro-toggle-row {
                    display:flex; justify-content:space-between; align-items:center; background:rgba(255,255,255,.02);
                    padding:13px 15px; margin-bottom:10px; border-radius:8px; border:1px solid var(--og-stroke);
                    transition:border-color .3s, box-shadow .3s, background .3s; animation:ogItemIn .3s var(--og-ease) both;
                }
                .ogpro-toggle-row.on { border-color:rgba(239,68,68,.5); box-shadow:0 0 14px rgba(239,68,68,.08); background:rgba(239,68,68,.04); }
                .ogpro-toggle-label { font-weight:800; font-size:11px; color:#fff; display:flex; align-items:center; gap:8px; letter-spacing:.5px; }
                .ogpro-toggle-label .og-ico { width:14px; height:14px; color:var(--og-acc); }
                .ogpro-switch {
                    width:42px; height:22px; background:rgba(255,255,255,.1); border-radius:11px; position:relative;
                    cursor:pointer; border:none; outline:none; transition:background .35s, box-shadow .35s; padding:0;
                }
                .ogpro-switch::after {
                    content:''; position:absolute; top:3px; left:3px; width:16px; height:16px; background:#fff; border-radius:50%;
                    transition:transform .35s var(--og-spring), width .2s; box-shadow:0 2px 4px rgba(0,0,0,.4);
                }
                .ogpro-switch:active::after { width:20px; }
                .ogpro-switch.on { background:var(--og-acc); box-shadow:0 0 12px var(--og-glow); }
                .ogpro-switch.on::after { transform:translateX(20px); }
                .ogpro-switch.on:active::after { transform:translateX(16px); }

                .ogpro-warning { background:rgba(239,68,68,.1); border:1px solid var(--og-acc); color:var(--og-acc); padding:10px; font-size:10px; font-weight:800; border-radius:7px; margin-bottom:15px; display:none; text-align:center; animation:ogItemIn .3s var(--og-ease); }
                #ogpro-status {
                    background:rgba(0,0,0,.8); border:1px solid var(--og-stroke); padding:15px; font-size:10px; color:#4ade80;
                    border-radius:8px; min-height:90px; word-break:break-all; margin-top:15px; font-family:monospace;
                    box-shadow:inset 0 0 12px rgba(0,0,0,.6); white-space:pre-wrap; line-height:1.5;
                }

                ::-webkit-scrollbar { width:4px; }
                ::-webkit-scrollbar-thumb { background:var(--og-stroke); border-radius:4px; }
                ::-webkit-scrollbar-thumb:hover { background:var(--og-acc); }
            `;
        },

        showAlert(msg) {
            let toast = document.getElementById('ogpro-toast');
            if (!toast) {
                toast = document.createElement('div');
                toast.id = 'ogpro-toast';
                document.getElementById('ogpro-panel')?.appendChild(toast);
            }
            toast.textContent = msg;
            toast.classList.add('show');
            clearTimeout(this.toastTimer);
            this.toastTimer = setTimeout(() => toast.classList.remove('show'), 3200);
        },

        actionRow(type, fid) {
            const t = (k) => i18n.t(k);
            const on = type === 'bumps' ? State.shuffle.bumps : !!State.shuffle.events[fid];
            const expCls = type === 'bumps' ? 'id="btn-export-bumps"' : 'class="ogpro-action-btn export-evt-btn"';
            const impCls = type === 'bumps' ? 'id="btn-import-bumps"' : 'class="ogpro-action-btn import-evt-btn"';
            const shfCls = type === 'bumps' ? 'id="btn-shuffle-bumps"' : 'class="ogpro-action-btn shuffle-evt-btn"';
            return `<div class="ogpro-actions" data-type="${type}" ${fid ? `data-fid="${fid}"` : ''}>
                <button ${expCls} class="ogpro-action-btn">${Icon('fileExport')}${t('exportBtn')}</button>
                <button ${impCls} class="ogpro-action-btn">${Icon('fileImport')}${t('importBtn')}</button>
                <button ${shfCls} class="ogpro-action-btn ${on ? 'on' : ''}">${Icon('shuffle')}${t('shuffle')}</button>
            </div>`;
        },

        renderUpdateBar() {
            if (!State.updateAvailable || State.updateDismissed) return '';
            const t = (k) => i18n.t(k);
            return `
                <div class="ogpro-update" id="ogpro-update">
                    <div class="ogpro-update-text">${Icon('upload')} ${t('updateAvail')} · ${t('updateVer').replace('{v}', Utils.escape(State.updateAvailable))}</div>
                    <div class="ogpro-update-actions">
                        <button class="ogpro-update-btn" data-action="update">${t('updateBtn')}</button>
                        <button class="ogpro-update-close" data-action="dismiss" title="×">${Icon('xmark')}</button>
                    </div>
                </div>`;
        },

        renderRemovalRows() {
            return Removals.DEFS.map((d, i) => `
                <div class="ogpro-toggle-row ${State.removals[d.id] ? 'on' : ''}" style="animation-delay:${i * 40}ms;">
                    <span class="ogpro-toggle-label">${Icon('ban')} ${Utils.escape(d.name)}</span>
                    <button class="ogpro-switch ${State.removals[d.id] ? 'on' : ''}" data-type="removal" data-rid="${d.id}" aria-label="${Utils.escape(d.name)}"></button>
                </div>`).join('');
        },

        renderMain() {
            const t = (k) => i18n.t(k);
            const subIdx = State.currentTabLinks === 'bumps' ? 0 : 1;
            const langs = ['en', 'es', 'ru'];
            const langIdx = langs.indexOf(State.currentLang);
            const hasUpdate = !!(State.updateAvailable && !State.updateDismissed);
            const curVer = Updater.current();

            this.container.innerHTML = `
                <div id="ogpro-panel" class="${State.isPanelOpen ? 'show' : ''}">
                    <div class="ogpro-sidebar">
                        <div class="ogpro-logo">OG<span>PRO</span><span class="ogpro-logo-ver">v${Utils.escape(curVer)}</span></div>
                        <nav class="ogpro-nav">
                            <button class="ogpro-nav-btn ${State.currentTab === 'links' ? 'active' : ''}" data-tab="links">${Icon('crosshairs')} ${t('linksTab')}</button>
                            <button class="ogpro-nav-btn ${State.currentTab === 'delay' ? 'active' : ''}" data-tab="delay">${Icon('clock')} ${t('delayTab')}</button>
                            <button class="ogpro-nav-btn ${State.currentTab === 'settings' ? 'active' : ''}" data-tab="settings">${Icon('sliders')} ${t('settingsTab')}</button>
                            <button class="ogpro-nav-btn ${State.currentTab === 'bot' ? 'active' : ''}" data-tab="bot">${Icon('microchip')} ${t('botTab')}</button>
                        </nav>
                        <div class="ogpro-sidebar-foot ${State.isRunning() ? 'on' : ''}" id="ogpro-sidefoot"><span class="dot"></span><span id="ogpro-sidetxt">${State.isRunning() ? t('running') : t('idle')}</span></div>
                    </div>

                    <div class="ogpro-content">
                        <div class="ogpro-scroll ${hasUpdate ? 'has-update' : ''}">

                            <div id="tab-links" class="ogpro-tab-content ${State.currentTab === 'links' ? 'active' : ''}">
                                <div class="ogpro-subtabs" data-idx="${subIdx}" data-count="2">
                                    <span class="ogpro-subtabs-indicator" style="width:calc(50% - 4px); transform:translateX(${subIdx * 100}%);"></span>
                                    <button class="ogpro-subtab-btn sub-btn ${State.currentTabLinks === 'bumps' ? 'active' : ''}" data-sub="bumps">${Icon('bolt')}${t('bumpsSub')}</button>
                                    <button class="ogpro-subtab-btn sub-btn ${State.currentTabLinks === 'events' ? 'active' : ''}" data-sub="events">${Icon('layers')}${t('eventsSub')}</button>
                                </div>

                                <div id="view-bumps" style="display:${State.currentTabLinks === 'bumps' ? 'block' : 'none'};">
                                    <div class="ogpro-row" style="margin-bottom:14px;">
                                        <input type="text" id="inp-bump-msg" class="ogpro-input" value="${Utils.escape(State.bumpMsg)}" title="${t('customMsg')}">
                                        <input type="number" id="inp-bump-count" class="ogpro-input" style="width:72px;" value="${State.count}" title="${t('count')}" min="1">
                                        <button id="btn-save-bump-cfg" class="ogpro-icon-btn" title="${t('saveSettings')}">${Icon('floppy')}</button>
                                    </div>
                                    <label class="ogpro-label">${t('addBump')}</label>
                                    <div class="ogpro-row">
                                        <input type="text" id="inp-bump" class="ogpro-input" placeholder="${t('urlPh')}">
                                        <button id="btn-add-bump" class="ogpro-icon-btn" title="${t('addBump')}">${Icon('plus')}</button>
                                    </div>
                                    ${this.actionRow('bumps')}
                                    <div id="list-bumps" style="margin-top:4px;"></div>
                                </div>

                                <div id="view-events" style="display:${State.currentTabLinks === 'events' ? 'block' : 'none'};">
                                    <label class="ogpro-label">${t('createFolder')}</label>
                                    <div class="ogpro-row">
                                        <input type="text" id="inp-folder" class="ogpro-input" placeholder="${t('folderPh')}">
                                        <button id="btn-add-folder" class="ogpro-icon-btn" title="${t('createFolder')}">${Icon('folderPlus')}</button>
                                    </div>
                                    <div id="list-folders" style="margin-top:10px;"></div>
                                </div>
                            </div>

                            <div id="tab-delay" class="ogpro-tab-content ${State.currentTab === 'delay' ? 'active' : ''}">
                                ${Delay.render()}
                            </div>

                            <div id="tab-settings" class="ogpro-tab-content ${State.currentTab === 'settings' ? 'active' : ''}">
                                <div class="ogpro-title">${t('language')}</div>
                                <div class="ogpro-subtabs" data-idx="${langIdx}" data-count="3" style="margin-bottom:22px;">
                                    <span class="ogpro-subtabs-indicator" style="width:calc(33.333% - 3px); transform:translateX(${langIdx * 100}%);"></span>
                                    <button class="ogpro-subtab-btn lang-btn ${State.currentLang === 'en' ? 'active' : ''}" data-lang="en">ENG</button>
                                    <button class="ogpro-subtab-btn lang-btn ${State.currentLang === 'es' ? 'active' : ''}" data-lang="es">ESP</button>
                                    <button class="ogpro-subtab-btn lang-btn ${State.currentLang === 'ru' ? 'active' : ''}" data-lang="ru">RUS</button>
                                </div>

                                <div class="ogpro-title">${t('uiColors')}</div>
                                <div style="display:grid; grid-template-columns:1fr 1fr; gap:14px; margin-bottom:18px;">
                                    <div><label class="ogpro-label">${t('bg')}</label><input type="color" id="theme-bg" class="ogpro-input" value="${State.theme.bg}" style="height:36px;"></div>
                                    <div><label class="ogpro-label">${t('sidebar')}</label><input type="color" id="theme-sidebar" class="ogpro-input" value="${State.theme.sidebar}" style="height:36px;"></div>
                                    <div><label class="ogpro-label">${t('borders')}</label><input type="color" id="theme-stroke" class="ogpro-input" value="${State.theme.stroke}" style="height:36px;"></div>
                                    <div><label class="ogpro-label">${t('accent')}</label><input type="color" id="theme-accent" class="ogpro-input" value="${State.theme.accent}" style="height:36px;"></div>
                                </div>
                                <button id="btn-save-theme" class="ogpro-btn">${Icon('palette')} ${t('saveTheme')}</button>

                                <div class="ogpro-title" style="margin-top:22px;">${t('removalsTitle')}</div>
                                <div id="removal-rows">${this.renderRemovalRows()}</div>
                            </div>

                            <div id="tab-bot" class="ogpro-tab-content ${State.currentTab === 'bot' ? 'active' : ''}">
                                <div class="ogpro-title">${t('injectionPanel')}</div>
                                <div id="bot-toggles-container"></div>

                                <div class="ogpro-title" style="margin-top:20px;">${t('webhookTitle')}</div>
                                <div class="ogpro-row">
                                    <input type="text" id="inp-webhook" class="ogpro-input" value="${Utils.escape(State.cfg.webhook)}" placeholder="https://discord.com/api/...">
                                    <button id="btn-save-webhook" class="ogpro-icon-btn" title="${t('saveSettings')}">${Icon('cloudUp')}</button>
                                </div>

                                <div id="ogpro-status">${Utils.escape(State.botStatusMsg)}</div>
                            </div>

                        </div>

                        ${this.renderUpdateBar()}
                    </div>
                </div>
                <div id="ogpro-toggle" class="${State.isRunning() ? 'running' : ''} ${hasUpdate ? 'has-update' : ''}"><span class="og-live"></span>${Icon('skull')} OG PRO</div>
            `;
            this.renderLinks();
            this.renderBotTab();
            this.checkCycleWarnings();
            Events.bind();
        },

        renderLinks() {
            const t = (k) => i18n.t(k);
            const bumpsEl = document.getElementById('list-bumps');
            const foldersEl = document.getElementById('list-folders');

            if (bumpsEl) {
                bumpsEl.innerHTML = State.data.bumps.length === 0
                    ? `<div class="ogpro-empty">${t('noLinks')}</div>`
                    : State.data.bumps.map((l, i) => {
                        const ready = State.data.completedBumps.includes(l);
                        return `
                        <div class="ogpro-item" style="border-left-color:${ready ? '#4ade80' : 'var(--og-acc)'}; animation-delay:${i * 30}ms;">
                            <span class="ogpro-item-title" style="color:${ready ? '#4ade80' : '#d4d4d8'}">${ready ? `<b>[${t('ready')}]</b> ` : ''}${Utils.escape(l)}</span>
                            <button class="ogpro-icon-btn ghost del-bump-btn" data-idx="${i}" title="Delete">${Icon('trash')}</button>
                        </div>`;
                    }).join('');
            }

            if (foldersEl) {
                foldersEl.innerHTML = State.data.events.length === 0
                    ? `<div class="ogpro-empty">${t('noEngines')}</div>`
                    : State.data.events.map((f, fi) => `
                    <div class="ogpro-folder ${f.isExpanded ? 'open' : ''}" data-fid="${f.id}" style="animation-delay:${fi * 40}ms;">
                        <div class="ogpro-folder-head">
                            <div class="ogpro-folder-title">
                                ${Icon('folder')} ${Utils.escape(f.name)}
                                <span class="ogpro-badge">${f.links.length}</span>
                            </div>
                            <div style="display:flex; align-items:center; gap:6px;">
                                <button class="ogpro-icon-btn ghost del-folder-btn" title="Delete">${Icon('trash')}</button>
                                <span class="chev">${Icon('chevron')}</span>
                            </div>
                        </div>
                        <div class="ogpro-folder-body">
                            <div class="ogpro-row" style="margin-bottom:10px;">
                                <input type="text" id="inp-evt-msg-${f.id}" class="ogpro-input" value="${Utils.escape(f.message || 'grinding x{count}')}" title="${t('customMsg')}">
                                <input type="number" id="inp-evt-count-${f.id}" class="ogpro-input" style="width:60px;" value="${f.count || 1}" min="1" title="${t('count')}">
                                <button class="ogpro-icon-btn save-evt-cfg-btn" title="${t('saveSettings')}">${Icon('floppy')}</button>
                            </div>
                            <div class="ogpro-row" style="margin-bottom:12px;">
                                <input type="text" id="inp-evt-${f.id}" class="ogpro-input" placeholder="${t('urlFolderPh')}">
                                <button class="ogpro-icon-btn add-evt-link-btn" title="${t('addBump')}">${Icon('plus')}</button>
                            </div>
                            ${this.actionRow('event', f.id)}
                            ${f.links.length === 0 ? `<div class="ogpro-empty">${t('noLinks')}</div>` : f.links.map((l, i) => {
                                const ready = (State.data.completedEvents[f.id] || []).includes(l);
                                return `
                                <div class="ogpro-item" style="padding:6px 10px; border-left-color:${ready ? '#4ade80' : '#52525b'}; animation-delay:${i * 30}ms;">
                                    <span class="ogpro-item-title" style="color:${ready ? '#4ade80' : '#a1a1aa'}; font-size:9px;">${Utils.escape(l)}</span>
                                    <button class="ogpro-icon-btn ghost del-evt-link-btn" data-idx="${i}" title="Delete">${Icon('xmark')}</button>
                                </div>`;
                            }).join('')}
                        </div>
                    </div>`).join('');
            }
        },

        renderBotTab() {
            const c = document.getElementById('bot-toggles-container');
            const t = (k) => i18n.t(k);
            if (!c) return;

            let html = `
                <div class="ogpro-toggle-row ${State.data.activeBumps ? 'on' : ''}" style="animation-delay:0ms;">
                    <span class="ogpro-toggle-label">${Icon('bolt')} ${t('globalBumps')}</span>
                    <button class="ogpro-switch ${State.data.activeBumps ? 'on' : ''}" data-type="global" aria-label="${t('globalBumps')}"></button>
                </div>
                <div class="ogpro-toggle-row ${State.awardNotifierActive ? 'on' : ''}" style="animation-delay:40ms;">
                    <span class="ogpro-toggle-label">${Icon('trophy')} ${t('awardNotifier')}</span>
                    <button class="ogpro-switch ${State.awardNotifierActive ? 'on' : ''}" data-type="award" aria-label="${t('awardNotifier')}"></button>
                </div>
                <div class="ogpro-title" style="margin-top:20px;">${t('eventFolders')}</div>
            `;

            if (State.data.events.length === 0) {
                html += `<div class="ogpro-empty">${t('noEngines')}</div>`;
            } else {
                State.data.events.forEach((f, i) => {
                    const on = !!State.data.activeEvents[f.id];
                    html += `
                    <div class="ogpro-toggle-row ${on ? 'on' : ''}" style="animation-delay:${(i + 2) * 40}ms;">
                        <span class="ogpro-toggle-label" style="color:#a1a1aa;">${Icon('folder')} ${Utils.escape(f.name)}</span>
                        <button class="ogpro-switch ${on ? 'on' : ''}" data-type="event" data-fid="${f.id}" aria-label="${Utils.escape(f.name)}"></button>
                    </div>`;
                });
            }
            c.innerHTML = html;
        },

        checkCycleWarnings() {
            const d = Delay.draft || State.cfg;
            const wBumps = document.getElementById('warn-bumps');
            const wEvents = document.getElementById('warn-events');
            if (wBumps) {
                const maxMs = Delay.toMs(d.bumpMax);
                const cycMs = Delay.toMs(d.bumpCycle);
                const totalMax = State.data.bumps.length * maxMs;
                if (totalMax > cycMs) {
                    wBumps.textContent = i18n.t('timeWarning').replace('{rec}', Utils.msToStr(totalMax + 60000));
                    wBumps.style.display = 'block';
                } else wBumps.style.display = 'none';
            }
            if (wEvents) {
                const maxMs = Delay.toMs(d.eventMax);
                const cycMs = Delay.toMs(d.eventCycle);
                const totalMax = State.data.events.reduce((acc, f) => acc + f.links.length * maxMs, 0);
                if (totalMax > cycMs && State.data.events.length > 0) {
                    wEvents.textContent = i18n.t('timeWarning').replace('{rec}', Utils.msToStr(totalMax + 60000));
                    wEvents.style.display = 'block';
                } else wEvents.style.display = 'none';
            }
        },

        updateStatus() {
            const el = document.getElementById('ogpro-status');
            if (el) el.textContent = State.botStatusMsg;
            const foot = document.getElementById('ogpro-sidefoot');
            if (foot) {
                const running = State.isRunning();
                foot.classList.toggle('on', running);
                const txt = document.getElementById('ogpro-sidetxt');
                if (txt) txt.textContent = running ? i18n.t('running') : i18n.t('idle');
                document.getElementById('ogpro-toggle')?.classList.toggle('running', running);
            }
        },

        togglePanel() {
            const p = document.getElementById('ogpro-panel');
            State.isPanelOpen = !State.isPanelOpen;
            p.classList.toggle('show', State.isPanelOpen);
        },

        shake(el) {
            if (!el) return;
            el.classList.remove('invalid'); void el.offsetWidth; el.classList.add('invalid');
            setTimeout(() => el.classList.remove('invalid'), 400);
        }
    };

    const Events = {
        bind() {
            UI.container.onclick = (e) => this.handleClick(e);
            UI.container.oninput = (e) => Delay.onInput(e);
        },

        toggleShuffle(type, fid) {
            const t = (k) => i18n.t(k);
            if (type === 'bumps') {
                State.shuffle.bumps = !State.shuffle.bumps;
                UI.showAlert(State.shuffle.bumps ? t('shuffleOn') : t('shuffleOff'));
            } else {
                State.shuffle.events[fid] = !State.shuffle.events[fid];
                UI.showAlert(State.shuffle.events[fid] ? t('shuffleOn') : t('shuffleOff'));
            }
            State.save();
            UI.renderMain();
        },

        handleClick(e) {
            const t = (k) => i18n.t(k);
            const target = e.target;

            if (target.closest('#ogpro-toggle')) return UI.togglePanel();

            const upd = target.closest('[data-action]');
            if (upd) {
                if (upd.dataset.action === 'update') return Updater.install();
                if (upd.dataset.action === 'dismiss') { State.updateDismissed = true; return UI.renderMain(); }
            }

            const tabBtn = target.closest('.ogpro-nav-btn');
            if (tabBtn) { State.currentTab = tabBtn.dataset.tab; Delay.draft = null; return UI.renderMain(); }

            const langBtn = target.closest('.lang-btn');
            if (langBtn) { State.currentLang = langBtn.dataset.lang; State.save(); return UI.renderMain(); }

            const subBtn = target.closest('.sub-btn');
            if (subBtn) {
                if (subBtn.dataset.sub === State.currentTabLinks) return;
                State.currentTabLinks = subBtn.dataset.sub;
                return UI.renderMain();
            }

            const unitBtn = target.closest('.dl-unit');
            if (unitBtn) return Delay.setUnit(unitBtn.closest('.dl-field'), unitBtn.dataset.unit);

            const presetBtn = target.closest('.dl-preset');
            if (presetBtn) return Delay.setPreset(presetBtn.closest('.dl-field'), presetBtn.dataset.value);

            if (target.closest('#btn-save-delay')) {
                Delay.commit();
                return UI.showAlert(t('settingsSaved'));
            }

            if (target.closest('#btn-reset-delay')) {
                Delay.reset();
                return UI.renderMain();
            }

            if (target.closest('#btn-export-bumps')) return Transfer.exportList('bumps');
            if (target.closest('#btn-import-bumps')) return Transfer.openImport('bumps');
            if (target.closest('#btn-shuffle-bumps')) return this.toggleShuffle('bumps');

            if (target.closest('#btn-save-bump-cfg')) {
                State.bumpMsg = document.getElementById('inp-bump-msg').value;
                State.count = parseInt(document.getElementById('inp-bump-count').value) || 1;
                State.save();
                return UI.showAlert(t('settingsSaved'));
            }

            if (target.closest('#btn-add-bump')) {
                const inp = document.getElementById('inp-bump');
                const val = inp.value.trim();
                if (!Utils.isValidUrl(val)) return UI.shake(inp);
                if (State.data.bumps.includes(val)) return UI.showAlert(t('urlAlreadyBump'));
                State.data.bumps.push(val);
                inp.value = '';
                State.save(); UI.renderMain();
                return;
            }

            const delBump = target.closest('.del-bump-btn');
            if (delBump) {
                State.data.bumps.splice(parseInt(delBump.dataset.idx), 1);
                State.save(); UI.renderMain();
                return;
            }

            if (target.closest('#btn-add-folder')) {
                const inp = document.getElementById('inp-folder');
                const val = inp.value.trim();
                if (!val) return UI.shake(inp);
                const id = 'evt_' + Date.now();
                State.data.events.push({ id, name: val, links: [], isExpanded: true, message: 'grinding x{count}', count: 1 });
                State.data.activeEvents[id] = false;
                State.data.nextEventRuns[id] = 0;
                State.data.completedEvents[id] = [];
                inp.value = '';
                State.save(); UI.renderMain();
                return;
            }

            const folderEl = target.closest('.ogpro-folder');
            if (folderEl) {
                const fid = folderEl.dataset.fid;
                const f = State.data.events.find(x => x.id === fid);
                if (!f) return;

                if (target.closest('.export-evt-btn')) return Transfer.exportList('event', fid);
                if (target.closest('.import-evt-btn')) return Transfer.openImport('event', fid);
                if (target.closest('.shuffle-evt-btn')) return this.toggleShuffle('event', fid);

                if (target.closest('.save-evt-cfg-btn')) {
                    f.message = document.getElementById(`inp-evt-msg-${fid}`).value;
                    f.count = parseInt(document.getElementById(`inp-evt-count-${fid}`).value) || 1;
                    State.save();
                    return UI.showAlert(t('settingsSaved'));
                }

                if (target.closest('.add-evt-link-btn')) {
                    const inp = document.getElementById(`inp-evt-${fid}`);
                    const val = inp.value.trim();
                    if (!Utils.isValidUrl(val)) return UI.shake(inp);
                    if (f.links.includes(val)) return UI.showAlert(t('urlAlreadyFolder'));
                    f.links.push(val); inp.value = '';
                    State.save(); UI.renderMain();
                    return;
                }

                if (target.closest('.del-folder-btn')) {
                    State.data.events = State.data.events.filter(x => x.id !== fid);
                    delete State.data.activeEvents[fid];
                    delete State.shuffle.events[fid];
                    State.queue = State.queue.filter(q => q.folderId !== fid);
                    State.save(); UI.renderMain();
                    return;
                }

                const delLink = target.closest('.del-evt-link-btn');
                if (delLink) {
                    f.links.splice(parseInt(delLink.dataset.idx), 1);
                    State.save(); UI.renderMain();
                    return;
                }

                if (target.closest('.ogpro-folder-head')) {
                    f.isExpanded = !f.isExpanded;
                    State.save();
                    folderEl.classList.toggle('open', f.isExpanded);
                    return;
                }
            }

            if (target.closest('#btn-save-theme')) {
                State.theme.bg = document.getElementById('theme-bg').value;
                State.theme.sidebar = document.getElementById('theme-sidebar').value;
                State.theme.stroke = document.getElementById('theme-stroke').value;
                State.theme.accent = document.getElementById('theme-accent').value;
                State.save();
                UI.updateStyles();
                return UI.showAlert(t('settingsSaved'));
            }

            if (target.closest('#btn-save-webhook')) {
                State.cfg.webhook = document.getElementById('inp-webhook').value.trim();
                State.save();
                return UI.showAlert(t('webhookSaved'));
            }

            const sw = target.closest('.ogpro-switch');
            if (sw) {
                const type = sw.dataset.type;

                if (type === 'removal') {
                    Removals.toggle(sw.dataset.rid);
                    UI.renderMain();
                    return;
                }

                if (type === 'global') {
                    if (!State.data.activeBumps) {
                        if (State.anyEventActive()) return UI.showAlert(t('conflict'));
                        if (State.data.bumps.length === 0) return UI.showAlert(t('bumpsEmpty'));
                    }
                    State.data.activeBumps = !State.data.activeBumps;
                    if (!State.data.activeBumps) {
                        State.queue = State.queue.filter(q => q.type !== 'bump');
                        if (State.activeIframe?.dataset.type === 'bump') {
                            State.activeIframe.remove(); State.activeIframe = null; State.isProcessing = false;
                        }
                    } else State.data.nextBumpRun = Date.now();
                } else if (type === 'award') {
                    State.awardNotifierActive = !State.awardNotifierActive;
                } else if (type === 'event') {
                    const fid = sw.dataset.fid;
                    const turningOn = !State.data.activeEvents[fid];
                    if (turningOn) {
                        if (State.data.activeBumps) return UI.showAlert(t('conflict'));
                        const f = State.data.events.find(x => x.id === fid);
                        if (!f || f.links.length === 0) return UI.showAlert(t('eventEmpty'));
                    }
                    State.data.activeEvents[fid] = turningOn;
                    if (!turningOn) {
                        State.queue = State.queue.filter(q => q.folderId !== fid);
                        if (State.activeIframe?.dataset.folderId === fid) {
                            State.activeIframe.remove(); State.activeIframe = null; State.isProcessing = false;
                        }
                    } else State.data.nextEventRuns[fid] = Date.now();
                }
                State.save();
                UI.renderBotTab();
                UI.updateStatus();
                return;
            }
        }
    };

    const Bot = {
        sendWebhook(title, desc, color) {
            if (!State.cfg.webhook) return;
            GM_xmlhttpRequest({
                method: 'POST', url: State.cfg.webhook,
                headers: { 'Content-Type': 'application/json' },
                data: JSON.stringify({ embeds: [{ title, description: desc, color }] })
            });
        },

        sendStartWebhook(title, links, nextMs) {
            const t = new Date(nextMs).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
            this.sendWebhook(
                `⚡ Cycle Started: ${title}`,
                `**Total Links:** ${links.length}\n**Next Cycle:** ${t}\n\n` + links.map((l, i) => `**${i + 1}.** ${l}`).join('\n'),
                16777215
            );
        },

        sendCompletionWebhook(item) {
            const title = item.type === 'bump' ? 'Bumps Completed' : `${item.name} Completed`;
            const comp = item.type === 'bump' ? State.data.completedBumps : (State.data.completedEvents[item.folderId] || []);
            const src = item.type === 'bump' ? State.data.bumps : (State.data.events.find(f => f.id === item.folderId)?.links || []);
            const desc = src.map((l, i) => `**${i + 1}.** ${l} ${comp.includes(l) ? '✅ `[READY]`' : '❌ `[ERROR]`'}`).join('\n');
            this.sendWebhook(`✔️ ${title}`, `**Pending / Failed:** ${src.length - comp.length}\n\n${desc}`, 4907106);
        },

        removeInvalidLink(item) {
            if (item.type === 'bump') {
                State.data.bumps = State.data.bumps.filter(l => l !== item.url);
            } else {
                const f = State.data.events.find(f => f.id === item.folderId);
                if (f) f.links = f.links.filter(l => l !== item.url);
            }
            State.save(); UI.renderMain();
            this.sendWebhook(
                '🚨 Enlace Removido (404/Invalid)',
                `El siguiente enlace ha sido eliminado por no existir o dar error:\n\n**${item.url}**\nDestino: ${item.name || 'Bumps'}`,
                16711680
            );
        },

        checkAwards() {
            if (!State.awardNotifierActive || !State.cfg.webhook) return;
            const parseDoc = (res) => {
                const doc = new DOMParser().parseFromString(res.responseText, 'text/html');
                doc.querySelectorAll('.inline_row, tr').forEach(row => {
                    const author = row.querySelector('.author, .subject_new a, a[href*="member.php"]')?.innerText.trim();
                    if (author !== 'OGU' && author !== 'OGU Bot') return;
                    const txt = row.innerText;
                    if (!txt.includes('received the') && !txt.includes('given the')) return;
                    const match = txt.match(/(?:received the|given the)\s+["'](.*?)["']\s+award/i) || txt.match(/\[b\](.*?)\[\/b\]/i);
                    const award = match ? match[1].replace(/["']/g, '').trim() : 'New Award';
                    const key = 'awd_' + (row.querySelector('a[href*="private.php?action=read"]')?.href || window.location.href);
                    if (!GM_getValue(key, false)) {
                        GM_setValue(key, true);
                        this.sendWebhook('🏆 New Award!', `**${award}**`, 16777215);
                    }
                });
            };
            GM_xmlhttpRequest({ method: 'GET', url: 'https://oguser.com/private.php', onload: parseDoc });
            GM_xmlhttpRequest({ method: 'GET', url: 'https://oguser.com/messages', onload: parseDoc });
        },

        processIframe(item) {
            return new Promise((resolve) => {
                const iframe = document.createElement('iframe');
                iframe.style.display = 'none';
                iframe.dataset.type = item.type;
                if (item.folderId) iframe.dataset.folderId = item.folderId;
                iframe.src = item.url;
                State.activeIframe = iframe;
                document.body.appendChild(iframe);

                const cleanup = () => {
                    if (document.body.contains(iframe)) iframe.remove();
                    State.activeIframe = null;
                };

                setTimeout(() => {
                    try {
                        if (!document.body.contains(iframe)) return resolve(false);
                        const doc = iframe.contentDocument || iframe.contentWindow.document;
                        const txt = doc.body?.innerText || '';

                        if (doc.title.includes('Just a moment') || doc.querySelector('.cf-browser-verification')) {
                            State.botStatusMsg = `⚠️ Cloudflare Block\n${item.url}`;
                            cleanup(); return resolve(false);
                        }

                        if (doc.title.includes('404') || doc.title.includes('Not Found') ||
                            txt.includes('The thread you specified is invalid') || txt.includes('Invalid Thread')) {
                            State.botStatusMsg = `🚨 404 Detected - Removing Link\n${item.url}`;
                            cleanup();
                            this.removeInvalidLink(item);
                            return resolve(false);
                        }

                        const textarea = doc.querySelector('textarea[name="message"]') || doc.querySelector('#message');
                        const submitBtn = doc.querySelector('input[name="submit"]') || doc.querySelector('#quick_reply_submit');

                        if (textarea && submitBtn) {
                            let msg = '';
                            let c = 1;
                            if (item.type === 'bump') {
                                c = GM_getValue('OG_PRO_count', 1);
                                State.count = c + 1;
                                GM_setValue('OG_PRO_count', State.count);
                                msg = State.bumpMsg.replace(/{count}/gi, c);
                                const inp = document.getElementById('inp-bump-count');
                                if (inp) inp.value = State.count;
                            } else {
                                const f = State.data.events.find(x => x.id === item.folderId);
                                if (f) {
                                    c = f.count || 1;
                                    f.count = c + 1;
                                    State.save();
                                    msg = (f.message || 'x{count}').replace(/{count}/gi, c);
                                    const inp = document.getElementById(`inp-evt-count-${f.id}`);
                                    if (inp) inp.value = f.count;
                                }
                            }
                            textarea.value = msg;
                            submitBtn.click();
                            State.botStatusMsg = `✅ INJECTED\nMsg: ${msg}\nTarget: ${item.name || 'Bumps'}`;
                            setTimeout(() => { cleanup(); resolve(true); }, 4000);
                        } else {
                            State.botStatusMsg = `❌ Error: Input not found\n${item.url}`;
                            cleanup(); resolve(false);
                        }
                    } catch (e) {
                        State.botStatusMsg = `❌ Load Error\n${item.url}`;
                        cleanup(); resolve(false);
                    }
                }, 6000);
            });
        },

        async processQueue() {
            if (State.isProcessing || State.queue.length === 0) return;
            const item = State.queue[0];
            const active = (item.type === 'bump' && State.data.activeBumps) ||
                           (item.type === 'event' && State.data.activeEvents[item.folderId]);
            if (!active) { State.queue.shift(); State.save(); return; }

            State.isProcessing = true;
            State.botStatusMsg = `⏳ Processing [${item.name || 'Bumps'}]\n${item.url}`;
            UI.updateStatus();

            const success = await this.processIframe(item);
            if (success) {
                if (item.type === 'bump') {
                    if (!State.data.completedBumps.includes(item.url)) State.data.completedBumps.push(item.url);
                } else {
                    State.data.completedEvents[item.folderId] = State.data.completedEvents[item.folderId] || [];
                    if (!State.data.completedEvents[item.folderId].includes(item.url)) State.data.completedEvents[item.folderId].push(item.url);
                }
                State.save(); UI.renderLinks();
            }

            State.queue.shift(); State.save();
            const remains = State.queue.filter(q => q.type === item.type && (item.type === 'bump' || q.folderId === item.folderId)).length;
            if (remains === 0) this.sendCompletionWebhook(item);

            if (State.queue.length > 0) {
                const minMs = Utils.parseTimeToMs(item.type === 'bump' ? State.cfg.bumpMin : State.cfg.eventMin);
                let maxMs = Utils.parseTimeToMs(item.type === 'bump' ? State.cfg.bumpMax : State.cfg.eventMax);
                if (minMs > maxMs) maxMs = minMs;
                const d = Math.floor(Math.random() * (maxMs - minMs + 1)) + minMs;
                State.delayEndTime = Date.now() + d;
                State.botStatusMsg += `\n\n⏱️ ${i18n.t('smoothDelay')}: ${(d / 1000).toFixed(1)}s`;
                UI.updateStatus();
                setTimeout(() => { State.isProcessing = false; }, d);
            } else {
                State.botStatusMsg = '✨ QUEUE EMPTY. Waiting for next cycle.';
                UI.updateStatus();
                State.isProcessing = false;
            }
        }
    };

    function buildCycle(links, shuffleOn) {
        return shuffleOn ? Utils.shuffleArray(links) : links.slice();
    }

    function StartLoop() {
        setInterval(() => {
            const now = Date.now();

            if (State.data.activeBumps && State.data.bumps.length > 0 && now >= State.data.nextBumpRun) {
                State.data.nextBumpRun = now + Utils.parseTimeToMs(State.cfg.bumpCycle);
                State.data.completedBumps = [];
                buildCycle(State.data.bumps, State.shuffle.bumps)
                    .forEach(u => State.queue.push({ type: 'bump', url: u, name: 'Global Bumps' }));
                State.save();
                Bot.sendStartWebhook('Global Bumps', State.data.bumps, State.data.nextBumpRun);
                UI.renderLinks();
            }

            State.data.events.forEach(f => {
                if (State.data.activeEvents[f.id] && f.links.length > 0 && now >= (State.data.nextEventRuns[f.id] || 0)) {
                    State.data.nextEventRuns[f.id] = now + Utils.parseTimeToMs(State.cfg.eventCycle);
                    State.data.completedEvents[f.id] = [];
                    buildCycle(f.links, !!State.shuffle.events[f.id])
                        .forEach(u => State.queue.push({ type: 'event', url: u, name: f.name, folderId: f.id }));
                    State.save();
                    Bot.sendStartWebhook(f.name, f.links, State.data.nextEventRuns[f.id]);
                    UI.renderLinks();
                }
            });

            if (State.awardNotifierActive && now - State.lastCheckedAwardTime > 120000) {
                State.lastCheckedAwardTime = now;
                State.save();
                Bot.checkAwards();
            }

            if (!State.isProcessing && State.queue.length > 0 && now >= State.delayEndTime) Bot.processQueue();
            if (!State.isProcessing) UI.updateStatus();
        }, 1000);
    }

    function InitApp() {
        State.load();
        UI.init();
        StartLoop();
        Updater.start();
        Removals.start();
    }

    Auth.check();
})();
