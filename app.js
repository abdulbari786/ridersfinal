const KEY="riderflow_demo_v1";
const seed={riders:[
{id:"R001",name:"Ahmed Khan",phone:"9876543210",partner:"Shadowfax",store:"ABC Store",city:"Hyderabad",status:"Active"},
{id:"R002",name:"Sameer Ali",phone:"9876543211",partner:"Zippie",store:"City Mart",city:"Hyderabad",status:"Active"},
{id:"R003",name:"Imran Shaikh",phone:"9876543212",partner:"First Club",store:"Metro Store",city:"Secunderabad",status:"Active"},
{id:"R004",name:"Arif Ahmed",phone:"9876543213",partner:"Shadowfax",store:"Quick Mart",city:"Hyderabad",status:"Active"}],
attendance:[
{id:"a1",riderId:"R001",date:new Date().toISOString().slice(0,10),login:"09:02",logout:"18:01",hours:8.98,status:"Present"},
{id:"a2",riderId:"R002",date:new Date().toISOString().slice(0,10),login:"09:15",logout:"17:42",hours:8.45,status:"Present"}
]};
let db=JSON.parse(localStorage.getItem(KEY)||"null")||seed;
function save(){localStorage.setItem(KEY,JSON.stringify(db))}
function reloadDB(){
  const latest=JSON.parse(localStorage.getItem(KEY)||"null");
  if(latest) db=latest;
}
let currentView="admin";
let currentRiderId=null;
let autoRefreshTimer=null;
let lastRefreshTime=null;

function startAutoRefresh(){
  stopAutoRefresh();
  autoRefreshTimer=setInterval(()=>{
    if(currentView==="admin"){
      reloadDB();
      admin(true);
    } else if(currentView==="rider" && currentRiderId){
      reloadDB();
      rider(currentRiderId,true);
    }
  },5000);
}
function stopAutoRefresh(){
  if(autoRefreshTimer){clearInterval(autoRefreshTimer);autoRefreshTimer=null}
}
function manualRefresh(){
  reloadDB();
  lastRefreshTime=new Date();
  if(currentView==="admin") admin(true);
  else if(currentView==="rider" && currentRiderId) rider(currentRiderId,true);
}
window.addEventListener("storage",e=>{
  if(e.key===KEY){
    reloadDB();
    if(currentView==="admin") admin(true);
    else if(currentView==="rider" && currentRiderId) rider(currentRiderId,true);
  }
});
function today(){return new Date().toISOString().slice(0,10)}
function dateOffset(days){
  const d=new Date();
  d.setDate(d.getDate()+days);
  return d.toISOString().slice(0,10);
}
function resetTodayAttendance(){
  if(!confirm("Reset TODAY'S attendance only? Yesterday and all previous attendance history will be kept.")) return;
  const d=today();
  db.attendance=db.attendance.filter(a=>a.date!==d);
  save();
  lastRefreshTime=new Date();
  admin();
}
function now(){return new Date().toLocaleTimeString([], {hour:"2-digit",minute:"2-digit",hour12:false})}
function mins(t){let [h,m]=t.split(":").map(Number);return h*60+m}
function fmtHours(h){return h==null?"—":h.toFixed(2)+" h"}
function esc(s){return String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
function render(){
  document.getElementById("app").innerHTML=`<div class="top"><div class="brand">RiderFlow</div><div class="pill">Client Demo • Attendance Platform</div></div><div class="wrap"><div id="view"></div></div>`;
  roleSelection();
}
function roleSelection(){
  currentView="roles"; currentRiderId=null; stopAutoRefresh();
  view.innerHTML=`<div class="hero"><h1>Select Role</h1><div class="muted">Choose how you want to access RiderFlow</div></div>
  <div class="grid section">
    <div class="card role-card"><div class="role-icon">👤</div><h2>Admin</h2><p class="muted">Full rider management, create IDs, attendance, history and reports.</p><button class="bigbtn primary" onclick="admin()">Continue as Admin</button></div>
    <div class="card role-card"><div class="role-icon">🪪</div><h2>Team Lead</h2><p class="muted">Authorized to create new Rider IDs for onboarding.</p><button class="bigbtn" onclick="teamLead()">Continue as Team Lead</button></div>
    <div class="card role-card"><div class="role-icon">🤝</div><h2>Partner</h2><p class="muted">Access rider attendance and check-in/check-out using Rider IDs.</p><button class="bigbtn" onclick="riderLogin()">Continue as Partner</button></div>
  </div>`;
}
function teamLead(){
  currentView="teamLead"; currentRiderId=null; stopAutoRefresh(); reloadDB();
  view.innerHTML=`<div class="row"><div><h1>Team Lead</h1><div class="muted">Rider onboarding authority</div></div><button class="btn" onclick="roleSelection()">← Role Selection</button></div>
  <div class="card section"><h2>Create Rider IDs</h2><p class="muted">Team Lead access is restricted to rider ID creation in this MVP.</p><button class="bigbtn primary" onclick="openCreateRiderForTeamLead()">+ Create Rider ID</button></div>`;
}
function openCreateRiderForTeamLead(){
  openCreateRider();
  currentView="teamLeadCreate";
  const back=[...view.querySelectorAll("button")].find(x=>x.textContent.includes("Back to Admin"));
  if(back){back.textContent="← Back to Team Lead";back.onclick=teamLead;}
}
function admin(auto=false){
currentView="admin"; currentRiderId=null; reloadDB();
if(!auto) lastRefreshTime=new Date();
let d=today(), rows=db.riders.map(r=>{let a=db.attendance.find(x=>x.riderId===r.id&&x.date===d);return {r,a}});let present=rows.filter(x=>x.a?.login).length;let hours=rows.reduce((s,x)=>s+(x.a?.hours||0),0);
view.innerHTML=`<div class="row"><div><h1>Admin Dashboard</h1><div class="muted">Live operational overview • ${d} • Auto-refresh every 5 sec</div><div class="refresh-note">Last refreshed: ${lastRefreshTime?lastRefreshTime.toLocaleTimeString():"just now"}</div></div><div class="controls"><button class="btn" onclick="roleSelection()">← Roles</button><button class="btn primary" onclick="openCreateRider()">+ Create Rider ID</button><button class="btn refresh" onclick="manualRefresh()">↻ Refresh Attendance</button><button class="btn danger-outline" onclick="resetTodayAttendance()">Reset Today's Attendance</button><button class="btn primary" onclick="exportCSV()">Export Excel</button></div></div>
<div class="grid section"><div class="card"><div class="label">Total Riders</div><div class="value">${db.riders.length}</div></div><div class="card"><div class="label">Present Today</div><div class="value">${present}</div></div><div class="card"><div class="label">Attendance %</div><div class="value">${db.riders.length?Math.round(present/db.riders.length*100):0}%</div></div><div class="card"><div class="label">Working Hours</div><div class="value">${hours.toFixed(1)}</div></div></div>
<div class="card section"><div class="row"><h2>Rider Attendance</h2><div class="controls"><input class="input" id="search" placeholder="Search rider / ID / phone" oninput="filterRows()"><select class="input" id="partner" onchange="filterRows()"><option value="">All partners</option><option>Shadowfax</option><option>Zippie</option><option>First Club</option></select></div></div><div id="table"></div></div>
<div class="card section"><div class="row"><div><h2>Attendance History</h2><div class="muted">Previous days remain saved even when today's attendance is reset.</div></div><div class="controls"><input class="input" type="date" id="historyDate" onchange="renderHistory(this.value)"><button class="btn" onclick="showYesterday()">Yesterday</button></div></div><div id="historyTable"></div></div>
<div class="card section"><h2>Demo capabilities</h2><div class="muted">Rider management • Partner/store/city visibility • Daily attendance • Login/logout time • Working hours • Attendance percentage • CSV/Excel-compatible export</div></div>`;
filterRows(); setTimeout(()=>{const el=document.getElementById("historyDate"); if(el){el.value=dateOffset(-1); renderHistory(el.value)}},0)}
function filterRows(){let q=(document.getElementById("search")?.value||"").toLowerCase(),p=document.getElementById("partner")?.value||"";let rows=db.riders.filter(r=>(!p||r.partner===p)&&(!q||[r.id,r.name,r.phone,r.store,r.city].join(" ").toLowerCase().includes(q)));table.innerHTML=`<table class="table"><thead><tr><th>Rider ID</th><th>Name</th><th>Phone</th><th>Partner</th><th>Store</th><th>City</th><th>Login</th><th>Logout</th><th>Hours</th><th>Status</th></tr></thead><tbody>${rows.map(r=>{let a=db.attendance.find(x=>x.riderId===r.id&&x.date===today());return `<tr><td><b>${r.id}</b></td><td>${esc(r.name)}</td><td>${esc(r.phone)}</td><td>${esc(r.partner)}</td><td>${esc(r.store)}</td><td>${esc(r.city)}</td><td>${a?.login||"—"}</td><td>${a?.logout||"—"}</td><td>${fmtHours(a?.hours)}</td><td><span class="status ${a?.login?"present":"absent"}">${a?.login?"Present":"Absent"}</span></td></tr>`}).join("")}</tbody></table>`}
function showYesterday(){
  const d=dateOffset(-1);
  const el=document.getElementById("historyDate");
  if(el) el.value=d;
  renderHistory(d);
}
function renderHistory(date){
  const target=date||dateOffset(-1);
  const records=db.attendance.filter(a=>a.date===target);
  const present=new Set(records.filter(a=>a.login).map(a=>a.riderId)).size;
  const pct=db.riders.length?Math.round(present/db.riders.length*100):0;
  const hrs=records.reduce((s,a)=>s+(a.hours||0),0);
  const el=document.getElementById("historyTable");
  if(!el) return;
  el.innerHTML=`<div class="history-summary"><span><b>${present}</b> present</span><span><b>${pct}%</b> attendance</span><span><b>${hrs.toFixed(1)}</b> hours</span></div><table class="table"><thead><tr><th>Rider ID</th><th>Name</th><th>Partner</th><th>Store</th><th>Login</th><th>Logout</th><th>Hours</th><th>Status</th></tr></thead><tbody>${db.riders.map(r=>{const a=records.find(x=>x.riderId===r.id);return `<tr><td><b>${r.id}</b></td><td>${esc(r.name)}</td><td>${esc(r.partner)}</td><td>${esc(r.store)}</td><td>${a?.login||"—"}</td><td>${a?.logout||"—"}</td><td>${fmtHours(a?.hours)}</td><td><span class="status ${a?.login?"present":"absent"}">${a?.login?"Present":"Absent"}</span></td></tr>`}).join("")}</tbody></table>`;
}
function nextRiderId(){
  const nums=db.riders.map(r=>parseInt(String(r.id||"").replace(/\D/g,""),10)).filter(Number.isFinite);
  return "R"+String((nums.length?Math.max(...nums):0)+1).padStart(3,"0");
}
function openCreateRider(){
  currentView="createRider"; currentRiderId=null; reloadDB();
  const suggested=nextRiderId();
  view.innerHTML=`<div class="row"><div><h1>Create Rider ID</h1><div class="muted">Add a rider to the existing RiderFlow system</div></div><button class="btn" onclick="admin()">← Back to Admin</button></div>
  <div class="card section"><div class="profile">
    <div class="info">Generated Rider ID<b id="newRiderId">${suggested}</b></div>
    <div class="info">Status<b>Active</b></div>
  </div>
  <div class="section" style="display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px">
    <div><div class="label">Rider Name *</div><input class="input" id="newName" style="width:100%" placeholder="Enter rider name"></div>
    <div><div class="label">Phone *</div><input class="input" id="newPhone" style="width:100%" placeholder="Enter phone number"></div>
    <div><div class="label">Partner *</div><select class="input" id="newPartner" style="width:100%"><option>Shadowfax</option><option>Zippie</option><option>First Club</option><option>Other</option></select></div>
    <div><div class="label">Store *</div><input class="input" id="newStore" style="width:100%" placeholder="Enter store"></div>
    <div><div class="label">City *</div><input class="input" id="newCity" style="width:100%" placeholder="Enter city"></div>
  </div>
  <button class="bigbtn primary" id="createRiderBtn" onclick="createRiderFromAdmin()">Create Rider ID</button>
  <div id="createRiderResult"></div></div>`;
}
function createRiderFromAdmin(){
  reloadDB();
  const name=document.getElementById("newName")?.value.trim();
  const phone=document.getElementById("newPhone")?.value.trim();
  const partner=document.getElementById("newPartner")?.value;
  const store=document.getElementById("newStore")?.value.trim();
  const city=document.getElementById("newCity")?.value.trim();
  const result=document.getElementById("createRiderResult");
  if(!name||!phone||!partner||!store||!city){
    result.innerHTML=`<div class="refresh-note" style="margin-top:12px;color:#b42318">Please complete all fields.</div>`;
    return;
  }
  const id=nextRiderId();
  db.riders.push({id,name,phone,partner,store,city,status:"Active"});
  save();
  result.innerHTML=`<div class="card section"><b>✓ Rider created successfully</b><div class="value" style="margin-top:8px">${id}</div><div class="muted">The rider is now available in the Rider Portal and can check in/out.</div><div class="controls" style="margin-top:12px"><button class="btn primary" onclick="admin()">View in Admin Dashboard</button><button class="btn" onclick="rider('${id}')">Open Rider Portal</button><button class="btn" onclick="openCreateRider()">Create Another</button></div></div>`;
  const btn=document.getElementById("createRiderBtn");
  if(btn) btn.disabled=true;
}
function riderLogin(){currentView="riderLogin"; currentRiderId=null; reloadDB(); view.innerHTML=`<div class="loginbox"><div class="hero"><h1>Rider Portal</h1><div class="muted">Demo login — choose a rider</div></div><div class="card"><select class="input" id="rid" style="width:100%">${db.riders.map(r=>`<option value="${r.id}">${r.id} — ${r.name}</option>`).join("")}</select><button class="bigbtn primary" onclick="rider(document.getElementById('rid').value)">Login as Rider</button><button class="bigbtn" onclick="roleSelection()">← Role Selection</button></div></div>`}
function rider(id,auto=false){currentView="rider"; currentRiderId=id; reloadDB(); let r=db.riders.find(x=>x.id===id);let a=db.attendance.find(x=>x.riderId===id&&x.date===today());view.innerHTML=`<div class="row"><div><h1>Welcome, ${esc(r.name)}</h1><div class="muted">Rider Portal • ${today()}</div></div><button class="btn" onclick="riderLogin()">Switch Rider</button></div><div class="card section"><div class="profile"><div class="info">Rider ID<b>${r.id}</b></div><div class="info">Partner<b>${r.partner}</b></div><div class="info">Store<b>${r.store}</b></div><div class="info">City<b>${r.city}</b></div><div class="info">Phone<b>${r.phone}</b></div><div class="info">Today's status<b>${a?.login?"Present":"Not checked in"}</b></div></div>${!a?.login?`<button class="bigbtn green" onclick="checkIn('${r.id}')">✓ Check In</button>`:!a.logout?`<button class="bigbtn red" onclick="checkOut('${r.id}')">Log Out</button>`:`<div class="card section"><b>Today's shift completed</b><p class="muted">Login ${a.login} • Logout ${a.logout} • ${fmtHours(a.hours)}</p></div>`}</div><div class="card section"><h2>My Attendance History</h2><table class="table"><thead><tr><th>Date</th><th>Login</th><th>Logout</th><th>Hours</th><th>Status</th></tr></thead><tbody>${db.attendance.filter(x=>x.riderId===id).sort((a,b)=>b.date.localeCompare(a.date)).map(x=>`<tr><td>${x.date}</td><td>${x.login||"—"}</td><td>${x.logout||"—"}</td><td>${fmtHours(x.hours)}</td><td>${x.status}</td></tr>`).join("")}</tbody></table></div>`}
function checkIn(id){let a={id:"a"+Date.now(),riderId:id,date:today(),login:now(),logout:null,hours:null,status:"Present"};db.attendance=db.attendance.filter(x=>!(x.riderId===id&&x.date===today()));db.attendance.push(a);save();rider(id)}
function checkOut(id){let a=db.attendance.find(x=>x.riderId===id&&x.date===today());a.logout=now();a.hours=Math.max(0,(mins(a.logout)-mins(a.login))/60);save();rider(id)}
function exportCSV(){let rows=[["Date","Rider ID","Name","Phone","Partner","Store","City","Login","Logout","Working Hours","Attendance"]];db.attendance.forEach(a=>{let r=db.riders.find(x=>x.id===a.riderId);rows.push([a.date,r.id,r.name,r.phone,r.partner,r.store,r.city,a.login||"",a.logout||"",a.hours||"",a.status])});let csv=rows.map(r=>r.map(v=>`"${String(v).replaceAll('"','""')}"`).join(",")).join("\n");let blob=new Blob([csv],{type:"text/csv"}),u=URL.createObjectURL(blob),a=document.createElement("a");a.href=u;a.download="rider-attendance-report.csv";a.click();URL.revokeObjectURL(u)}
render();
startAutoRefresh();