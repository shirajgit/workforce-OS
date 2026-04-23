// styles/globals.js - inject once at app root
export const injectGlobalStyles = () => {
    if (document.getElementById("wos-styles")) return;
    const style = document.createElement("style");
    style.id = "wos-styles";
    style.textContent = `
      @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,400&display=swap');
  
      *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  
      :root {
        --bg: #080808;
        --bg2: #0f0f13;
        --bg3: #141418;
        --surface: #1a1a22;
        --surface2: #22222c;
        --border: rgba(255,255,255,0.07);
        --border2: rgba(255,255,255,0.13);
        --text: #f0f0f5;
        --text2: #9898aa;
        --text3: #555568;
        --accent: #6c63ff;
        --accent2: #8b84ff;
        --accent-glow: rgba(108,99,255,0.2);
        --green: #1fd4a0;
        --green-dim: rgba(31,212,160,0.12);
        --amber: #f5a623;
        --amber-dim: rgba(245,166,35,0.12);
        --red: #f05a5a;
        --red-dim: rgba(240,90,90,0.12);
        --blue: #4a9eff;
        --blue-dim: rgba(74,158,255,0.12);
        --r: 12px;
        --r-sm: 8px;
      }
  
      html, body, #root { height: 100%; }
      body {
        background: var(--bg); color: var(--text);
        font-family: 'DM Sans', sans-serif; font-size: 14px; line-height: 1.6;
        -webkit-font-smoothing: antialiased;
      }
  
      ::-webkit-scrollbar { width: 4px; height: 4px; }
      ::-webkit-scrollbar-track { background: transparent; }
      ::-webkit-scrollbar-thumb { background: var(--surface2); border-radius: 4px; }
  
      @keyframes fadeUp { from { opacity:0; transform:translateY(14px); } to { opacity:1; transform:translateY(0); } }
      @keyframes fadeIn { from { opacity:0; } to { opacity:1; } }
      @keyframes spin { to { transform:rotate(360deg); } }
      @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.4} }
      @keyframes shimmer { from{background-position:-200% 0} to{background-position:200% 0} }
  
      .fade-up { animation: fadeUp 0.35s ease both; }
      .fade-in { animation: fadeIn 0.25s ease both; }
  
      /* ── LAYOUT ── */
      .app { display:flex; height:100vh; overflow:hidden; }
      .page-content { flex:1; overflow-y:auto; background:var(--bg); }
  
      /* ── SIDEBAR ── */
      .sidebar {
        width:232px; min-width:232px; background:var(--bg2);
        border-right:1px solid var(--border); display:flex; flex-direction:column;
        position:relative; overflow:hidden; z-index:10;
      }
      .sidebar::after {
        content:''; position:absolute; top:-100px; left:-60px;
        width:220px; height:220px; background:var(--accent-glow);
        border-radius:50%; filter:blur(80px); pointer-events:none;
      }
      .sb-logo {
        padding:22px 18px 18px; border-bottom:1px solid var(--border);
        display:flex; align-items:center; gap:10px; position:relative; z-index:1;
      }
      .sb-logo-icon {
        width:32px; height:32px; background:var(--accent); border-radius:8px;
        display:flex; align-items:center; justify-content:center;
        font-family:'Syne',sans-serif; font-weight:800; font-size:13px; color:#fff;
        flex-shrink:0;
      }
      .sb-logo-name { font-family:'Syne',sans-serif; font-weight:700; font-size:15px; }
      .sb-logo-sub { font-size:10px; color:var(--text3); letter-spacing:1px; text-transform:uppercase; }
  
      .sb-nav { padding:14px 10px; flex:1; overflow-y:auto; position:relative; z-index:1; }
      .sb-section-label {
        font-size:10px; text-transform:uppercase; letter-spacing:1.5px; color:var(--text3);
        font-weight:700; padding:8px 10px 6px; font-family:'Syne',sans-serif;
      }
      .sb-item {
        display:flex; align-items:center; gap:9px; padding:9px 12px;
        border-radius:var(--r-sm); color:var(--text2); cursor:pointer;
        transition:all 0.18s; font-size:13.5px; font-weight:500;
        margin-bottom:1px; border:none; background:none; width:100%; text-align:left;
      }
      .sb-item:hover { background:var(--surface); color:var(--text); }
      .sb-item.active { background:rgba(108,99,255,0.14); color:var(--accent2); }
      .sb-item.active::before {
        content:''; position:absolute; left:0; top:50%; transform:translateY(-50%);
        width:3px; height:55%; background:var(--accent); border-radius:0 3px 3px 0;
      }
      .sb-item { position:relative; }
      .sb-badge {
        margin-left:auto; background:var(--accent); color:#fff;
        font-size:10px; font-weight:700; padding:1px 6px;
        border-radius:20px; min-width:18px; text-align:center;
      }
  
      .sb-user {
        padding:14px 16px; border-top:1px solid var(--border);
        display:flex; align-items:center; gap:10px; position:relative; z-index:1;
      }
      .avatar {
        border-radius:50%; background:linear-gradient(135deg,var(--accent),var(--green));
        display:flex; align-items:center; justify-content:center;
        font-family:'Syne',sans-serif; font-weight:700; color:#fff; flex-shrink:0;
      }
      .avatar-sm { width:30px; height:30px; font-size:11px; }
      .avatar-md { width:36px; height:36px; font-size:13px; }
      .avatar-lg { width:44px; height:44px; font-size:16px; }
  
      /* ── PAGE HEADER ── */
      .ph { padding:22px 26px 0; display:flex; align-items:flex-start; justify-content:space-between; gap:16px; }
      .ph-left {}
      .ph-title { font-family:'Syne',sans-serif; font-size:21px; font-weight:700; }
      .ph-sub { color:var(--text2); font-size:13px; margin-top:2px; }
      .ph-actions { display:flex; align-items:center; gap:8px; flex-shrink:0; }
  
      /* ── CARDS ── */
      .card {
        background:var(--bg2); border:1px solid var(--border);
        border-radius:var(--r); padding:20px;
      }
      .card-sm { padding:16px; }
  
      /* ── STAT GRID ── */
      .stat-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(185px,1fr)); gap:14px; padding:18px 26px; }
      .stat-card {
        background:var(--bg2); border:1px solid var(--border); border-radius:var(--r);
        padding:18px 20px; animation:fadeUp 0.4s ease both;
        transition:border-color 0.2s;
      }
      .stat-card:hover { border-color:var(--border2); }
      .stat-icon { width:38px; height:38px; border-radius:10px; display:flex; align-items:center; justify-content:center; margin-bottom:14px; }
      .stat-val { font-family:'Syne',sans-serif; font-size:26px; font-weight:700; line-height:1; margin-bottom:4px; }
      .stat-lbl { color:var(--text2); font-size:12.5px; font-weight:500; }
      .stat-meta { font-size:11.5px; color:var(--text3); margin-top:4px; }
  
      /* ── BUTTONS ── */
      .btn {
        display:inline-flex; align-items:center; gap:6px;
        padding:8px 15px; border-radius:var(--r-sm);
        font-family:'DM Sans',sans-serif; font-size:13.5px; font-weight:500;
        cursor:pointer; transition:all 0.18s; border:none; white-space:nowrap;
      }
      .btn:disabled { opacity:0.45; cursor:not-allowed; pointer-events:none; }
      .btn-primary { background:var(--accent); color:#fff; }
      .btn-primary:hover { background:var(--accent2); box-shadow:0 4px 18px var(--accent-glow); }
      .btn-ghost { background:transparent; color:var(--text2); border:1px solid var(--border); }
      .btn-ghost:hover { background:var(--surface); color:var(--text); border-color:var(--border2); }
      .btn-danger { background:var(--red-dim); color:var(--red); border:1px solid rgba(240,90,90,0.2); }
      .btn-danger:hover { background:var(--red); color:#fff; }
      .btn-success { background:var(--green-dim); color:var(--green); border:1px solid rgba(31,212,160,0.2); }
      .btn-success:hover { background:var(--green); color:#fff; }
      .btn-sm { padding:5px 11px; font-size:12px; }
      .btn-icon { padding:7px; border-radius:var(--r-sm); }
  
      /* ── TABLE ── */
      .tbl-wrap { overflow-x:auto; }
      table { width:100%; border-collapse:collapse; }
      thead th {
        padding:9px 14px; text-align:left;
        font-size:10.5px; text-transform:uppercase; letter-spacing:1px;
        color:var(--text3); font-weight:700; font-family:'Syne',sans-serif;
        border-bottom:1px solid var(--border); white-space:nowrap;
      }
      tbody td { padding:12px 14px; border-bottom:1px solid var(--border); color:var(--text2); font-size:13.5px; }
      tbody tr { transition:background 0.12s; }
      tbody tr:hover { background:var(--surface); }
      tbody tr:last-child td { border-bottom:none; }
      td.strong { color:var(--text); font-weight:600; }
  
      /* ── BADGES ── */
      .badge {
        display:inline-flex; align-items:center; gap:4px;
        padding:2px 8px; border-radius:20px;
        font-size:11px; font-weight:600; text-transform:capitalize; white-space:nowrap;
      }
      .badge::before { content:''; width:5px; height:5px; border-radius:50%; background:currentColor; }
      .badge-green { background:var(--green-dim); color:var(--green); }
      .badge-amber { background:var(--amber-dim); color:var(--amber); }
      .badge-red { background:var(--red-dim); color:var(--red); }
      .badge-blue { background:var(--blue-dim); color:var(--blue); }
      .badge-purple { background:rgba(108,99,255,0.14); color:var(--accent2); }
      .badge-gray { background:var(--surface); color:var(--text2); }
  
      /* ── FORMS ── */
      .form-group { display:flex; flex-direction:column; gap:5px; margin-bottom:14px; }
      .form-label { font-size:11.5px; font-weight:700; color:var(--text2); text-transform:uppercase; letter-spacing:0.5px; }
      .form-input {
        background:var(--bg3); border:1px solid var(--border); border-radius:var(--r-sm);
        padding:9px 13px; color:var(--text); font-family:'DM Sans',sans-serif; font-size:13.5px;
        transition:border-color 0.18s; outline:none; width:100%;
      }
      .form-input:focus { border-color:var(--accent); box-shadow:0 0 0 3px var(--accent-glow); }
      .form-input::placeholder { color:var(--text3); }
      select.form-input { cursor:pointer; appearance:none; }
      textarea.form-input { resize:vertical; min-height:76px; }
      .form-row { display:grid; grid-template-columns:1fr 1fr; gap:12px; }
  
      /* ── MODAL ── */
      .modal-overlay {
        position:fixed; inset:0; background:rgba(0,0,0,0.72);
        display:flex; align-items:center; justify-content:center;
        z-index:1000; animation:fadeIn 0.2s ease; backdrop-filter:blur(6px);
      }
      .modal {
        background:var(--bg2); border:1px solid var(--border2); border-radius:16px;
        padding:26px; width:92%; max-width:460px; animation:fadeUp 0.28s ease;
        max-height:90vh; overflow-y:auto;
      }
      .modal-lg { max-width:600px; }
      .modal-hd { display:flex; align-items:center; justify-content:space-between; margin-bottom:22px; }
      .modal-title { font-family:'Syne',sans-serif; font-size:17px; font-weight:700; }
  
      /* ── ALERTS ── */
      .alert {
        padding:10px 14px; border-radius:var(--r-sm);
        display:flex; align-items:center; gap:9px;
        font-size:13px; margin-bottom:14px;
      }
      .alert-error { background:var(--red-dim); color:var(--red); border:1px solid rgba(240,90,90,0.2); }
      .alert-success { background:var(--green-dim); color:var(--green); border:1px solid rgba(31,212,160,0.2); }
      .alert-info { background:var(--blue-dim); color:var(--blue); border:1px solid rgba(74,158,255,0.2); }
  
      /* ── SECTION ── */
      .section { padding:16px 26px; }
      .section-hd { display:flex; align-items:center; justify-content:space-between; margin-bottom:14px; }
      .section-title { font-family:'Syne',sans-serif; font-size:14.5px; font-weight:700; }
  
      /* ── LOADING ── */
      .spinner { width:18px; height:18px; border:2px solid var(--border2); border-top-color:var(--accent); border-radius:50%; animation:spin 0.55s linear infinite; flex-shrink:0; }
      .spinner-lg { width:32px; height:32px; border-width:3px; }
      .loading-center { display:flex; align-items:center; justify-content:center; padding:56px; }
      .skeleton { background:linear-gradient(90deg,var(--surface) 25%,var(--surface2) 50%,var(--surface) 75%); background-size:200% 100%; animation:shimmer 1.4s ease infinite; border-radius:6px; }
  
      /* ── EMPTY STATE ── */
      .empty { text-align:center; padding:44px 20px; color:var(--text3); }
      .empty-title { font-family:'Syne',sans-serif; font-size:14.5px; font-weight:700; color:var(--text2); margin:10px 0 4px; }
  
      /* ── KANBAN ── */
      .kanban { display:grid; grid-template-columns:repeat(4,1fr); gap:14px; padding:0 26px 26px; }
      .kb-col { background:var(--bg2); border:1px solid var(--border); border-radius:var(--r); overflow:hidden; }
      .kb-hd { padding:12px 14px; border-bottom:1px solid var(--border); display:flex; align-items:center; justify-content:space-between; }
      .kb-title { font-family:'Syne',sans-serif; font-size:12px; font-weight:700; text-transform:uppercase; letter-spacing:0.8px; }
      .kb-count { font-size:11px; color:var(--text3); background:var(--surface); padding:1px 7px; border-radius:10px; }
      .kb-body { padding:10px; display:flex; flex-direction:column; gap:8px; min-height:180px; }
      .task-card {
        background:var(--bg3); border:1px solid var(--border); border-radius:var(--r-sm);
        padding:11px; cursor:pointer; transition:all 0.18s;
      }
      .task-card:hover { border-color:var(--border2); transform:translateY(-1px); }
      .task-card-title { font-weight:600; font-size:13px; margin-bottom:5px; color:var(--text); }
      .task-card-desc { font-size:12px; color:var(--text3); margin-bottom:8px; line-height:1.4; }
      .task-card-meta { display:flex; align-items:center; gap:6px; font-size:11px; color:var(--text3); flex-wrap:wrap; }
  
      /* ── CHAT ── */
      .chat-wrap { display:flex; height:100%; overflow:hidden; }
      .chat-sidebar { width:250px; min-width:250px; border-right:1px solid var(--border); overflow-y:auto; background:var(--bg2); }
      .chat-sidebar-hd { padding:14px 16px; border-bottom:1px solid var(--border); font-family:'Syne',sans-serif; font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:1px; color:var(--text3); }
      .contact-item { padding:12px 14px; border-bottom:1px solid var(--border); cursor:pointer; transition:background 0.12s; display:flex; align-items:center; gap:10px; }
      .contact-item:hover,.contact-item.active { background:var(--surface); }
      .contact-name { font-weight:600; font-size:13px; }
      .contact-role { font-size:11px; color:var(--text3); text-transform:capitalize; }
      .contact-preview { font-size:12px; color:var(--text3); margin-top:1px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:160px; }
      .chat-main { flex:1; display:flex; flex-direction:column; overflow:hidden; }
      .chat-hd { padding:14px 18px; border-bottom:1px solid var(--border); display:flex; align-items:center; gap:12px; background:var(--bg2); }
      .chat-msgs { flex:1; overflow-y:auto; padding:18px; display:flex; flex-direction:column; gap:10px; }
      .msg { max-width:68%; }
      .msg.sent { align-self:flex-end; }
      .msg.recv { align-self:flex-start; }
      .msg-bubble { padding:9px 13px; border-radius:12px; font-size:13.5px; line-height:1.5; word-break:break-word; }
      .msg.sent .msg-bubble { background:var(--accent); color:#fff; border-bottom-right-radius:3px; }
      .msg.recv .msg-bubble { background:var(--surface); color:var(--text); border-bottom-left-radius:3px; }
      .msg-time { font-size:10px; color:var(--text3); margin-top:3px; padding:0 2px; }
      .msg.sent .msg-time { text-align:right; }
      .chat-input-row { padding:14px 18px; border-top:1px solid var(--border); display:flex; gap:10px; background:var(--bg2); }
      .chat-input {
        flex:1; background:var(--bg3); border:1px solid var(--border); border-radius:var(--r-sm);
        padding:9px 13px; color:var(--text); font-family:'DM Sans',sans-serif; font-size:13.5px; outline:none;
      }
      .chat-input:focus { border-color:var(--accent); }
  
      /* ── PIPELINE ── */
      .pipeline-stages { display:flex; gap:4px; align-items:center; padding:16px; overflow-x:auto; }
      .ps-step { flex-shrink:0; text-align:center; }
      .ps-dot {
        width:26px; height:26px; border-radius:50%; display:flex; align-items:center; justify-content:center;
        font-size:10px; font-weight:700; margin:0 auto 4px; color:#fff;
      }
      .ps-line { width:24px; height:2px; background:var(--border); margin-bottom:18px; flex-shrink:0; }
      .ps-label { font-size:9px; color:var(--text3); width:52px; line-height:1.3; }
  
      /* ── PROGRESS ── */
      .progress { height:5px; background:var(--surface); border-radius:3px; overflow:hidden; }
      .progress-bar { height:100%; border-radius:3px; transition:width 0.5s ease; }
  
      /* ── INFO ROWS ── */
      .info-row { display:flex; align-items:center; justify-content:space-between; padding:9px 0; border-bottom:1px solid var(--border); }
      .info-row:last-child { border-bottom:none; padding-bottom:0; }
      .info-key { color:var(--text3); font-size:12px; }
      .info-val { font-weight:600; font-size:13px; }
  
      /* ── TOAST ── */
      .toast {
        position:fixed; bottom:22px; right:22px; z-index:9999;
        padding:11px 16px; border-radius:10px; display:flex; align-items:center; gap:9px;
        font-size:13px; font-weight:500; animation:fadeUp 0.3s ease;
        max-width:310px; box-shadow:0 8px 32px rgba(0,0,0,0.5);
      }
      .toast-success { background:var(--green-dim); color:var(--green); border:1px solid rgba(31,212,160,0.25); }
      .toast-error { background:var(--red-dim); color:var(--red); border:1px solid rgba(240,90,90,0.25); }
  
      /* ── CHART ── */
      .bar-chart { display:flex; align-items:flex-end; gap:5px; height:72px; }
      .bar { flex:1; border-radius:3px 3px 0 0; transition:opacity 0.15s; min-width:7px; cursor:pointer; }
      .bar:hover { opacity:0.8; }
      .bar-labels { display:flex; justify-content:space-between; margin-top:5px; }
      .bar-label { flex:1; font-size:10px; color:var(--text3); text-align:center; }
  
      /* ── LOGIN ── */
      .login-page { min-height:100vh; display:flex; align-items:center; justify-content:center; background:var(--bg); position:relative; overflow:hidden; }
      .login-blob1 { position:absolute; top:-180px; right:-180px; width:480px; height:480px; background:rgba(108,99,255,0.12); border-radius:50%; filter:blur(100px); pointer-events:none; }
      .login-blob2 { position:absolute; bottom:-180px; left:-180px; width:480px; height:480px; background:rgba(31,212,160,0.07); border-radius:50%; filter:blur(100px); pointer-events:none; }
      .login-card {
        background:var(--bg2); border:1px solid var(--border2); border-radius:20px;
        padding:38px; width:400px; max-width:92vw; position:relative; z-index:1;
        animation:fadeUp 0.45s ease;
      }
  
      /* ── MISC ── */
      .divider { height:1px; background:var(--border); margin:16px 0; }
      .text-muted { color:var(--text3); }
      .text-accent { color:var(--accent2); }
      .text-green { color:var(--green); }
      .text-red { color:var(--red); }
      .text-amber { color:var(--amber); }
      .font-syne { font-family:'Syne',sans-serif; }
      .fw-700 { font-weight:700; }
      .flex { display:flex; }
      .items-center { align-items:center; }
      .gap-8 { gap:8px; }
      .gap-10 { gap:10px; }
      .mt-auto { margin-top:auto; }
      .ml-auto { margin-left:auto; }
      .w-full { width:100%; }
      .relative { position:relative; }
  
      @media(max-width:900px){
        .sidebar{display:none;}
        .kanban{grid-template-columns:repeat(2,1fr);}
      }
      @media(max-width:600px){
        .kanban{grid-template-columns:1fr;}
        .stat-grid{grid-template-columns:repeat(2,1fr);}
        .form-row{grid-template-columns:1fr;}
      }
    `;
    document.head.appendChild(style);
  };