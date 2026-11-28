// Native Home Assistant panel. No external libraries or remote assets.
const escapeHtml = value => String(value ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const metrics = [
  {key:"ph", name:"pH-Wert", unit:"pH", icon:"◉", color:"#42d6d0", digits:2},
  {key:"temperature", name:"Wassertemperatur", unit:"°C", icon:"♨", color:"#70abff", digits:1},
  {key:"tds", name:"TDS", unit:"ppm", icon:"◇", color:"#baafff", digits:0},
];

// BEGIN AQUARIUM DESIGN
const AQUARIUM_DESIGN_CSS = "/* Aquarium Studio 0.2.0. Layout and device behavior stay with each component. */\n:host {\n  --aq-background:#f3f7f8;--aq-surface:#ffffff;--aq-text:#17323a;--aq-muted:#526970;\n  --aq-accent:#087b85;--aq-on-accent:#ffffff;--aq-border:#d4e1e5;\n  --aq-success:#176b50;--aq-warning:#805000;--aq-danger:#b52e43;\n  color-scheme:light;\n}\n@media(prefers-color-scheme:dark){:host(:not([data-aquarium-theme=\"light\"])) {\n  --aq-background:#0b151b;--aq-surface:#12232c;--aq-text:#eaf3f5;--aq-muted:#a1b4bc;\n  --aq-accent:#59d6cf;--aq-on-accent:#0b151b;--aq-border:#34505c;\n  --aq-success:#76d5b0;--aq-warning:#f5c56b;--aq-danger:#ff9bab;color-scheme:dark;\n}}\n:host([data-aquarium-theme=\"dark\"]) {\n  --aq-background:#0b151b;--aq-surface:#12232c;--aq-text:#eaf3f5;--aq-muted:#a1b4bc;\n  --aq-accent:#59d6cf;--aq-on-accent:#0b151b;--aq-border:#34505c;\n  --aq-success:#76d5b0;--aq-warning:#f5c56b;--aq-danger:#ff9bab;color-scheme:dark;\n}\n:host {\n  --aq-bg:var(--primary-background-color,var(--aq-background));\n  --aq-card:var(--card-background-color,var(--aq-surface));\n  --aq-fg:var(--primary-text-color,var(--aq-text));\n  --aq-secondary:var(--secondary-text-color,var(--aq-muted));\n  --reef:var(--aq-accent);--ink:var(--aq-fg);--text:var(--aq-fg);\n  --muted:var(--aq-secondary);--sub:var(--aq-secondary);--blue:var(--aq-accent);\n  --line:var(--aq-border);--card:var(--aq-card);\n  display:block;color:var(--aq-fg);background:var(--aq-bg);\n  font:400 16px/1.5 -apple-system,BlinkMacSystemFont,\"Segoe UI\",sans-serif;\n}\n*{box-sizing:border-box}\n.app,main{background:var(--aq-bg)}\nheader,.head{background:var(--aq-bg);border-color:var(--aq-border);color:var(--aq-fg)}\nmain{max-width:1280px;margin-inline:auto}\nh1{font-size:clamp(30px,4vw,44px);line-height:1.15;letter-spacing:-.035em;font-weight:650}\nh2,.card h2,.box h2,.panel h2{font-size:18px;line-height:1.35;letter-spacing:-.015em;font-weight:650}\nh3{font-size:15px}.eyebrow,.brand small{color:var(--aq-accent);font-size:13px;letter-spacing:.1em}\np,small,footer,.muted,.subtle,.intro,.section-note,.hero-caption,\n.metric small,.metric-head,.metric-foot,.value small,.metric .value small,\n.toolbar label,.field,.range,.range-label,.active-scene,.chart h3 small,\n.dial small,.dial-inner small,.range-row small,.mode-note span,.firmware-lamp dt{\n  color:var(--aq-secondary);font-size:13px;line-height:1.5;\n}\n.card,.panel,.box,.metric,.editor,article,ha-card,.control-tile,.summary,.transfer-card{\n  color:var(--aq-fg);background:var(--aq-card);border:1px solid var(--aq-border);\n  border-radius:16px;box-shadow:none;backdrop-filter:none;\n}\n.metric:before{background:var(--aq-accent)}\n.value,.aq-value,.dial b,.dial-value,.summary-number{color:var(--aq-fg);font-variant-numeric:tabular-nums;font-weight:650}\n.value{font-size:36px;letter-spacing:-.025em}.summary .eyebrow{color:var(--aq-accent)}.summary .subtle{color:var(--aq-secondary)}\nbutton,select,input:not([type=range]):not([type=checkbox]):not([type=radio]){\n  min-height:44px;border:1px solid var(--aq-border);border-radius:10px;\n  background:var(--aq-card);color:var(--aq-fg);font:inherit;padding:10px 14px;\n}\nbutton{font-size:14px;font-weight:600;box-shadow:none}\nbutton:hover:enabled{background:var(--aq-bg);border-color:var(--aq-accent);transform:none}\nbutton.primary,.tabs button[aria-pressed=true],.tabs .selected,.period .active{\n  color:var(--aq-on-accent);background:var(--aq-accent);border-color:var(--aq-accent);box-shadow:none;\n}\nbutton.primary:hover:enabled{color:var(--aq-on-accent);background:var(--aq-accent)}\n.secondary,.tabs,.period{background:var(--aq-bg);border-color:var(--aq-border)}\n.tabs button{color:var(--aq-secondary);background:transparent}\n.tabs button[aria-pressed=true],.tabs button.selected{color:var(--aq-on-accent);background:var(--aq-accent)}\nnav{border-color:var(--aq-border)}nav .active{color:var(--aq-accent);border-color:var(--aq-accent)}\n.point-list button[aria-pressed=true]{background:var(--aq-bg);color:var(--aq-accent);border-color:var(--aq-accent)}\nbutton:disabled,select:disabled,input:disabled{opacity:.55;cursor:not-allowed}\n:focus-visible,input:focus-visible,select:focus-visible,button:focus-visible,summary:focus-visible{\n  outline:3px solid var(--aq-accent);outline-offset:3px;\n}\ninput[type=range]{accent-color:var(--c,var(--aq-accent));min-height:44px}\n:host(jebao-studio-panel) input[type=range]{height:44px;background:transparent}\n:host(jebao-studio-panel) input[type=range]::-webkit-slider-runnable-track{height:5px;border-radius:8px;background:linear-gradient(90deg,var(--aq-accent) var(--value),var(--aq-border) var(--value))}\n:host(jebao-studio-panel) input[type=range]::-webkit-slider-thumb{margin-top:-7.5px}\n:host(jebao-studio-panel) input[type=range]::-moz-range-track{height:5px;border-radius:8px;background:var(--aq-border)}\ninput[type=checkbox],input[type=radio]{accent-color:var(--aq-accent)}\n.control-label,.range-label,.mode-picker{color:var(--aq-fg)}\n.control-label output,.control-label>span:last-child{color:var(--aq-accent)}\n.pill,.tag,.badge,.status,.mode-note,.studio-item,.metric,.entity-code,details,.group-member{\n  background:var(--aq-card);border-color:var(--aq-border);color:var(--aq-fg);\n}\n.pill.live,.status,.mode-note strong,.entity-code{color:var(--aq-accent)}\n.group-member:has(:checked){background:var(--aq-bg);border-color:var(--aq-accent)}\n.notice,.offline-note,.update-note,.empty{background:var(--aq-bg);border-color:var(--aq-border);color:var(--aq-secondary)}\n.notice:not(:empty){background:var(--aq-bg);border-color:var(--aq-warning);color:var(--aq-warning)}\n.danger,.destructive,.error,.notice.error,.log .error{background:var(--aq-card);color:var(--aq-danger);border-color:var(--aq-danger)}\n.disabled-note,.log .warning{color:var(--aq-warning)!important}\n.dial{background:conic-gradient(from 225deg,var(--aq-accent) calc(var(--level)*2.7deg),var(--aq-border) 0deg,var(--aq-border) 270deg,transparent 270deg)}\n.dial:before{background:var(--aq-card)}.track{background:var(--aq-border)}\n.grid line{stroke:var(--aq-border)}.grid text,.axis text{fill:var(--aq-secondary)}\n.range,.legend,.log time,.firmware-lamp summary small{font-size:13px;color:var(--aq-secondary)}\n.log,.log li,.control-area,.mode-picker,.chart,.edit-grid,.slider,.save-actions,.firmware-lamp .fw-detail{border-color:var(--aq-border)}\n.transfer-overlay{background:color-mix(in srgb,var(--aq-background) 88%,transparent)}\n.transfer-card p{color:var(--aq-secondary)}.transfer-spinner{border-color:var(--aq-border);border-top-color:var(--aq-accent)}\n.empty-chart,.bottom p,.bottom small,.wave-note,footer,.field,.check,.device label,.toolbar label{font-size:13px}\nsummary{min-height:44px;align-content:center;color:var(--aq-fg)}\ndetails.actions{display:block}\n@media(max-width:599px){main{padding-inline:16px}.card,.panel,.box,.metric,.editor,article{padding:16px;border-radius:16px}.form-grid{grid-template-columns:minmax(0,1fr)}}\n@media(prefers-reduced-motion:reduce){*,*:before,*:after{animation:none!important;transition:none!important;scroll-behavior:auto!important}}\n";
function aquariumTheme(host, hass) {
  if (typeof hass?.themes?.darkMode === 'boolean') {
    host.setAttribute?.('data-aquarium-theme', hass.themes.darkMode ? 'dark' : 'light');
  } else {
    host.removeAttribute?.('data-aquarium-theme');
  }
}
// END AQUARIUM DESIGN

class CaperPlusAquarium extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({mode:"open"});
    this._devices = []; this._entities = []; this._selected = "";
    this._history = {}; this._hours = 24; this._tab = "overview";
    this._busy = false; this._message = ""; this._historyError = "";
    this._request = 0;
  }
  set hass(value) {aquariumTheme(this, value);
    this._hass = value;
    if (!this._loading && !this._loaded) this.loadDevices();
    // Preserve focus and form inputs while Home Assistant updates its states.
    if (this.shadowRoot.activeElement) return;
    this.render();
  }
  connectedCallback() {
    this._timer = setInterval(() => { if (this._hass && this._selected) this.loadHistory(); }, 60000);
    this.render();
  }
  disconnectedCallback() { clearInterval(this._timer); this._request++; }
  async loadDevices() {
    this._loading = true;
    try {
      const [devices, entities] = await Promise.all([
        this._hass.callWS({type:"config/device_registry/list"}),
        this._hass.callWS({type:"config/entity_registry/list"}),
      ]);
      this._devices = devices.filter(d => d.identifiers.some(i => i[0] === "caperplus"));
      this._entities = entities.filter(e => e.platform === "caperplus");
      if (!this._devices.some(d => d.id === this._selected)) this._selected = this._devices[0]?.id || "";
      this._loaded = true;
      if (this._selected) await this.loadHistory();
    } catch (e) { this._message = `Geräte konnten nicht geladen werden: ${e.message || e}`; }
    finally { this._loading = false; this.render(); }
  }
  entity(key) {
    return this._entities.find(e => e.device_id === this._selected && e.unique_id?.endsWith(`_${key}`));
  }
  state(key) { return this._hass?.states[this.entity(key)?.entity_id]; }
  value(key) {
    const state = this.state(key)?.state;
    return state && !["unknown", "unavailable"].includes(state) && Number.isFinite(Number(state)) ? Number(state) : null;
  }
  unit(metric) { return this.state(metric.key)?.attributes.unit_of_measurement || metric.unit; }
  async loadHistory() {
    const request = ++this._request;
    const ids = metrics.map(m => this.entity(m.key)?.entity_id).filter(Boolean);
    if (!ids.length) return;
    const start = new Date(Date.now() - this._hours * 3600000).toISOString();
    try {
      const result = await this._hass.callApi("GET", `history/period/${start}?filter_entity_id=${encodeURIComponent(ids.join(","))}&minimal_response&no_attributes`);
      if (request !== this._request) return;
      this._history = Object.fromEntries(result.filter(rows => rows.length).map(rows => [rows[0].entity_id, rows]));
      this._historyError = "";
    } catch (e) { if (request === this._request) this._historyError = "Verlauf nicht verfügbar. Aktiviere History/Recorder und die Aufzeichnung dieser Sensoren."; }
    this.render();
  }
  chart(metric) {
    const rows = this._history[this.entity(metric.key)?.entity_id] || [];
    const end = Date.now(), start = end - this._hours * 3600000;
    const points = rows.map(r => ({x:new Date(r.last_changed || r.last_updated).getTime(), y:Number(r.state), valid:!['unknown','unavailable',''].includes(r.state)}));
    const valid = points.filter(p => p.valid && Number.isFinite(p.y) && Number.isFinite(p.x));
    if (!valid.length) return '<div class="empty-chart">Noch keine aufgezeichneten Werte</div>';
    let low = Math.min(...valid.map(p => p.y)), high = Math.max(...valid.map(p => p.y));
    const margin = Math.max((high-low)*0.15, metric.key === 'ph' ? 0.02 : 0.1);
    low -= margin; high += margin;
    let path = "", open = false;
    for (const p of points) {
      if (!p.valid || !Number.isFinite(p.y) || !Number.isFinite(p.x)) {open = false; continue;}
      const x = 52 + Math.max(0, Math.min(1,(p.x-start)/(end-start)))*640;
      const y = 154 - (p.y-low)/(high-low)*126;
      path += `${open ? 'L':'M'}${x.toFixed(1)},${y.toFixed(1)} `; open = true;
    }
    const ticks = [0,1,2].map(i => {
      const y=28+i*63, val=high-i*(high-low)/2;
      return `<line x1="52" y1="${y}" x2="692" y2="${y}"/><text x="42" y="${y+4}" text-anchor="end">${val.toFixed(metric.digits)}</text>`;
    }).join('');
    const time = t => new Date(t).toLocaleString('de-DE',{hour:'2-digit',minute:'2-digit', ...(this._hours > 24 ? {day:'2-digit',month:'2-digit'} : {})});
    return `<svg viewBox="0 0 720 194" role="img" aria-label="${metric.name}: Verlauf über ${this._hours} Stunden"><g class="grid">${ticks}</g><path d="${path}" fill="none" stroke="${metric.color}" stroke-width="2.5"/><g class="axis"><text x="52" y="184">${time(start)}</text><text x="692" y="184" text-anchor="end">${time(end)}</text></g></svg><div class="range">Minimum ${Math.min(...valid.map(p=>p.y)).toFixed(metric.digits)} · Maximum ${Math.max(...valid.map(p=>p.y)).toFixed(metric.digits)} ${escapeHtml(this.unit(metric))}</div>`;
  }
  async calibrate() {
    if (this._busy) return;
    const target = Number(this.shadowRoot.querySelector('#buffer').value);
    const confirmed = this.shadowRoot.querySelector('#ready').checked;
    if (!confirmed) { this._message = 'Bitte bestätige, dass die Sonde stabil in der passenden Pufferlösung steht.'; this.render(); return; }
    this._busy = true; this._message = 'Kalibrierung läuft. Sonde in der Pufferlösung lassen. Die Gerätebestätigung kann bis zu 180 Sekunden dauern.'; this.render();
    try {
      // return_response waits for the service handler to complete, rather than
      // treating delivery of the start command as a successful calibration.
      await this._hass.callWS({type:"call_service", domain:"caperplus", service:"calibrate_ph", service_data:{device_id:this._selected,target_ph:target}, return_response:true});
      this._message = 'Der Q2 hat die Kalibrierung bestätigt. Sonde spülen und den Messwert mit der Pufferlösung prüfen.';
    } catch (e) { this._message = `Kalibrierung nicht bestätigt: ${e.message || e}. Nicht automatisch erneut starten; Gerätestatus in der CaperPlus-App prüfen.`; }
    finally { this._busy = false; this.render(); }
  }
  render() {
    const device = this._devices.find(d => d.id === this._selected);
    const ready = metrics.some(m => this.value(m.key) !== null);
    const updated = this.state('ph')?.last_updated;
    const overview = this._tab === 'overview';
    this.shadowRoot.innerHTML = `<style>${styles}${AQUARIUM_DESIGN_CSS}</style><div class="app">
      <header><ha-menu-button></ha-menu-button><img src="/caperplus-static/logo.svg" width="42" height="42" alt="CaperPlus Aquarium"><span class="brand">CAPERPLUS <small>REEF CONTROL</small></span><span class="badge">Q2 · CLOUD</span></header>
      <main><div class="intro"><div><div class="eyebrow">DEIN MEERWASSER-AQUARIUM</div><h1>Wasser im Blick.</h1><p>Ein ruhiger Überblick über dein Riff.</p></div><div class="device"><label for="device">MESSGERÄT</label><select id="device" ${this._busy?'disabled':''}>${this._devices.map(d=>`<option value="${escapeHtml(d.id)}" ${d.id===this._selected?'selected':''}>${escapeHtml(d.name_by_user || d.name || 'CaperPlus Q2')}</option>`).join('')}</select></div></div>
      <nav><button data-tab="overview" class="${overview?'active':''}">Übersicht</button><button data-tab="calibration" class="${!overview?'active':''}">pH-Kalibrierung</button></nav>
      ${this._message?`<div class="notice" role="status">${escapeHtml(this._message)}</div>`:''}
      ${!device?`<section class="panel"><h2>${this._loading?'Geräte werden geladen …':'Kein Q2 verfügbar'}</h2><p>Füge unter Einstellungen → Geräte & Dienste die CaperPlus Cloud Integration hinzu.</p><button id="reload">Geräte neu laden</button></section>`:overview?`
      <div class="cards">${metrics.map(m=>`<section class="metric" style="--accent:${m.color}"><div class="metric-head"><span>${m.name}</span><span class="symbol">${m.icon}</span></div><div class="value">${this.value(m.key)===null?'—':this.value(m.key).toFixed(m.digits)} <small>${escapeHtml(this.unit(m))}</small></div><div class="metric-foot">${m.key==='tds'?'TDS ist kein Salinitätsmesswert':'Aktueller Cloud-Messwert'}</div><button class="detail" data-detail="${m.key}">Details & Verlauf ↗</button></section>`).join('')}</div>
      <section class="panel"><div class="section-head"><div><div class="eyebrow">ENTWICKLUNG</div><h2>Dein Riff im Verlauf</h2></div><div class="period">${[6,24,168].map(h=>`<button data-hours="${h}" class="${this._hours===h?'active':''}">${h===168?'7 Tage':h+' h'}</button>`).join('')}</div></div>${this._historyError?`<p role="status">${escapeHtml(this._historyError)}</p>`:''}${metrics.map(m=>`<article class="chart"><h3><span class="dot" style="background:${m.color}"></span>${m.name}<small>${escapeHtml(this.unit(m))}</small></h3>${this.chart(m)}</article>`).join('')}</section>
      <div class="bottom"><section class="panel"><h2>Verbindung</h2><p><span class="dot" style="background:${ready?'#42d6d0':'#e8ad63'}"></span>${ready?'Messwerte verfügbar':'Keine aktuellen Werte'}</p><p>Letzte Zustandsaktualisierung: ${updated?escapeHtml(new Date(updated).toLocaleString('de-DE')):'—'}</p><p>WLAN-Signal: ${this.value('rssi')??'—'} / 7 · Cloud-Abfrage ca. 60 s</p><p class="muted">Zeitstempel zeigt den HA-Zustand. Cloud-Werte können älter sein.</p></section><section class="panel"><h2>Für dein Meerwasserbecken</h2><p>Beobachte besonders den Tagesgang von pH und Temperatur.</p><p class="muted">Der Q2-TDS-Wert ersetzt keine Salinitätsmessung. Salzgehalt separat mit einem geeigneten Meerwasser-Messgerät bestimmen.</p></section></div>`:`
      <section class="panel calibration"><div class="eyebrow">SONDENPFLEGE</div><h2>pH-Sonde kalibrieren</h2><p>Ein Pufferpunkt pro Durchlauf. Verwende frische Pufferlösung und den aufgedruckten Wert bei der Lösungstemperatur.</p><ol><li>Sonde spülen und vorsichtig abtupfen.</li><li>In die Pufferlösung stellen und auf einen stabilen Messwert warten.</li><li>Puffer auswählen, Vorbereitung bestätigen und starten.</li></ol><label for="buffer">pH der Pufferlösung</label><select id="buffer" ${this._busy?'disabled':''}>${['4.00','6.86','7.00','9.18','9.21','10.00'].map(p=>`<option value="${p}" ${p==='6.86'?'selected':''}>pH ${p}</option>`).join('')}</select><label class="check"><input type="checkbox" id="ready" ${this._busy?'disabled':''}> Die Sonde steht stabil in der ausgewählten Pufferlösung.</label><button class="primary" id="calibrate" ${this._busy?'disabled':''}>${this._busy?'Kalibrierung läuft …':'Kalibrierung starten'}</button><p class="muted">Experimenteller Cloud-Ablauf. Bestätigung bis zu 180 Sekunden. Sonde währenddessen in der Lösung lassen. Bei Zeitüberschreitung Status in der Hersteller-App prüfen.</p></section>`}
      <footer>CaperPlus Q2 <span>Meerwasser · Monitoring & Sondenpflege</span></footer></main></div>`;
    const root=this.shadowRoot;
    const menu=root.querySelector('ha-menu-button'); if(menu) menu.hass=this._hass;
    root.querySelectorAll('[data-tab]').forEach(b=>b.onclick=()=>{this._tab=b.dataset.tab;this.render();});
    root.querySelectorAll('[data-hours]').forEach(b=>b.onclick=()=>{this._hours=Number(b.dataset.hours);this.loadHistory();this.render();});
    root.querySelectorAll('[data-detail]').forEach(b=>b.onclick=()=>{const id=this.entity(b.dataset.detail)?.entity_id;if(id)this.dispatchEvent(new CustomEvent('hass-more-info',{detail:{entityId:id},bubbles:true,composed:true}));});
    const select=root.querySelector('#device');if(select)select.onchange=()=>{this._selected=select.value;this._history={};this.loadHistory();this.render();};
    const start=root.querySelector('#calibrate');if(start)start.onclick=()=>this.calibrate();
    const reload=root.querySelector('#reload');if(reload)reload.onclick=()=>this.loadDevices();
  }
}

const styles = `
:host{display:block;height:100%;overflow:auto;color:#edf4fc;font-family:var(--paper-font-body1_-_font-family,Inter,Arial,sans-serif);background:#080f1c}*{box-sizing:border-box}button,select{font:inherit}button{cursor:pointer;color:inherit;border:1px solid #26394e;background:#152437;border-radius:10px;padding:10px 15px}button:focus-visible,select:focus-visible,input:focus-visible{outline:2px solid #42d6d0;outline-offset:4px}button:disabled{opacity:.5;cursor:wait}.app{background:radial-gradient(ellipse at 80% 0,#15314a77,transparent 45%);min-height:100%}header{height:72px;border-bottom:1px solid #23334a;display:flex;align-items:center;gap:18px;padding:0 28px}.brand{font-weight:750;letter-spacing:3px;font-size:15px}.brand small{display:block;font-size:8px;letter-spacing:4px;margin-top:5px;color:#7c99af}.badge{margin-left:auto;color:#8da8c1;font-size:10px;letter-spacing:2px;border:1px solid #2b4259;border-radius:20px;padding:8px 12px}main{max-width:1180px;margin:auto;padding:40px 32px}.intro{display:flex;justify-content:space-between;align-items:center;gap:25px}.eyebrow{font-size:10px;letter-spacing:2.5px;color:#42d6d0;font-weight:650}h1{font-size:38px;letter-spacing:-1.2px;margin:12px 0}p{font-size:14px;color:#a3b6cb;line-height:1.7}h2{font-size:20px;margin:8px 0 18px}h3{font-size:13px;font-weight:500;display:flex;align-items:center;gap:9px}label{display:block;font-size:12px;color:#abc0d5;margin:12px 0}.device label{font-size:9px;letter-spacing:2px}select{border:1px solid #2d445e;background:#142236;color:#edf4fc;padding:12px;border-radius:10px;min-width:180px}nav{display:flex;gap:24px;margin:24px 0 28px;border-bottom:1px solid #22334a}nav button{background:none;border:0;border-bottom:2px solid transparent;border-radius:0;color:#849db5;padding:14px 0}nav .active{color:#42d6d0;border-color:#42d6d0}.cards{display:grid;grid-template-columns:repeat(3,1fr);gap:18px}.metric{border:1px solid #25374f;border-radius:18px;background:linear-gradient(135deg,#192b40,#111d2e);padding:23px;position:relative;overflow:hidden}.metric:before{content:'';position:absolute;top:0;left:22px;right:22px;height:2px;background:var(--accent)}.metric-head{display:flex;justify-content:space-between;font-size:13px;color:#acc1d6}.symbol{color:var(--accent);font-size:24px}.value{font-size:45px;letter-spacing:-2px;font-variant-numeric:tabular-nums;margin:15px 0}.value small{font-size:14px;color:#869fb7;letter-spacing:0}.metric-foot{font-size:11px;color:#8ba4bd;min-height:25px}.detail{background:none;border:0;padding:8px 0 0;color:var(--accent);font-size:11px}.panel{border:1px solid #23364e;border-radius:18px;background:#101c2c;padding:26px;margin-top:22px}.section-head{display:flex;justify-content:space-between;gap:18px;align-items:center}.period{display:flex;gap:4px;background:#091322;border-radius:12px;padding:4px}.period button{background:none;border:none;font-size:11px;padding:8px 12px;color:#8da6c0}.period .active{background:#25445c;color:#d0f7f5}.chart{padding-top:8px;border-top:1px solid #223247;margin-top:18px}.chart h3 small{margin-left:auto;color:#728da6}svg{width:100%;height:auto;display:block}.grid line{stroke:#23354a;stroke-dasharray:3 5}.grid text,.axis text{fill:#8199b2;font-size:10px}.range{text-align:right;color:#7994ac;font-size:10px}.dot{display:inline-block;width:7px;height:7px;border-radius:50%;margin-right:5px}.bottom{display:grid;grid-template-columns:1fr 1fr;gap:20px}.bottom h2{font-size:16px}.bottom p{font-size:12px}.muted{color:#7d97b0;font-size:12px}.empty-chart{height:150px;display:grid;place-items:center;color:#839db7;font-size:13px}.notice{padding:16px 20px;background:#1a3548;border:1px solid #34607b;border-radius:12px;line-height:1.6;font-size:13px}.calibration{max-width:760px;margin:auto}.calibration li{padding:7px;color:#a3b6cb;font-size:14px;line-height:1.6}.check{display:flex;align-items:center;gap:12px;margin:24px 0;line-height:1.6}.check input{width:20px;height:20px;accent-color:#42d6d0}.primary{background:#42d6d0;color:#08232d;font-weight:700;border:0;padding:14px 22px}footer{display:flex;justify-content:space-between;color:#536c85;font-size:10px;letter-spacing:1px;margin-top:35px}@media(max-width:760px){main{padding:25px 18px}.intro{align-items:flex-start;flex-direction:column}h1{font-size:32px}.cards{grid-template-columns:1fr}.value{font-size:40px}.bottom{grid-template-columns:1fr;gap:0}.section-head{align-items:flex-start;flex-direction:column}.panel{padding:19px}header{padding:0 12px}.brand{font-size:12px}.badge{font-size:8px}.calibration ol{padding-left:20px}footer span{display:none}}`;
customElements.define('caperplus-aquarium', CaperPlusAquarium);
