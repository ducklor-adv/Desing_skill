/* TaskFlow — frontend bound to the backend REST API
   (เปลี่ยนจาก localStorage มาเรียก /api/tasks จริง) */

const API = '/api/tasks';
let tasks = [];
let filter = 'all';

// ---- elements (จุดผูก UI; ใช้ data-el เดียวกับใน HTML) ----
const els = {
  input:  document.getElementById('taskInput'),
  prio:   document.getElementById('prioritySelect'),
  addBtn: document.getElementById('addBtn'),
  list:   document.getElementById('taskList'),
  empty:  document.getElementById('emptyState'),
  clear:  document.getElementById('clearDone'),
  total:  document.getElementById('statTotal'),
  done:   document.getElementById('statDone'),
  left:   document.getElementById('statLeft'),
};

// ---- API calls ----
async function apiGet(){ const r=await fetch(API); return r.json(); }
async function apiAdd(title, priority){
  const r=await fetch(API,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({title,priority})});
  return r.json();
}
async function apiPatch(id, patch){
  const r=await fetch(`${API}/${id}`,{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify(patch)});
  return r.json();
}
async function apiDelete(id){ await fetch(`${API}/${id}`,{method:'DELETE'}); }
async function apiClearDone(){ await fetch(`${API}/clear-done`,{method:'POST'}); }

// ---- actions (sync local state with backend) ----
async function refresh(){ tasks = await apiGet(); render(); }
async function addTask(title, priority){
  title=(title||'').trim(); if(!title) return;
  await apiAdd(title, priority); await refresh();
}
async function toggleTask(id){
  const t=tasks.find(t=>t.id===id); if(!t) return;
  await apiPatch(id,{done:!t.done}); await refresh();
}
async function deleteTask(id){ await apiDelete(id); await refresh(); }
async function clearDone(){ await apiClearDone(); await refresh(); }

// ---- render ----
const PRIO_LABEL = { high:'สูง', medium:'กลาง', low:'ต่ำ' };

function visibleTasks(){
  if(filter==='active') return tasks.filter(t=>!t.done);
  if(filter==='done')   return tasks.filter(t=>t.done);
  return tasks;
}
function fmtTime(ts){
  const d=new Date(ts);
  return d.toLocaleDateString('th-TH',{day:'numeric',month:'short'})+' '+d.toLocaleTimeString('th-TH',{hour:'2-digit',minute:'2-digit'});
}
function escapeHtml(s){ return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }

function render(){
  els.total.textContent = tasks.length;
  els.done.textContent  = tasks.filter(t=>t.done).length;
  els.left.textContent  = tasks.filter(t=>!t.done).length;

  const items = visibleTasks();
  els.list.innerHTML = '';
  els.empty.classList.toggle('show', items.length===0);

  items.forEach(t=>{
    const row=document.createElement('div');
    row.className='task prio-'+t.priority+(t.done?' done':'');
    row.innerHTML=`
      <div class="checkbox ${t.done?'checked':''}" data-act="toggle">${t.done?'✓':''}</div>
      <div class="task-body">
        <div class="task-title">${escapeHtml(t.title)}</div>
        <div class="task-meta">
          <span class="badge ${t.priority}">${PRIO_LABEL[t.priority]||t.priority}</span>
          <span class="task-time">${fmtTime(t.createdAt)}</span>
        </div>
      </div>
      <button class="del-btn" data-act="del" title="ลบ">🗑</button>`;
    row.querySelector('[data-act="toggle"]').onclick=()=>toggleTask(t.id);
    row.querySelector('[data-act="del"]').onclick=()=>deleteTask(t.id);
    els.list.appendChild(row);
  });
}

// ---- events ----
els.addBtn.onclick = async ()=>{ await addTask(els.input.value, els.prio.value); els.input.value=''; els.input.focus(); };
els.input.addEventListener('keydown', async e=>{ if(e.key==='Enter'){ await addTask(els.input.value, els.prio.value); els.input.value=''; } });
els.clear.onclick = clearDone;

document.querySelectorAll('.chip[data-filter]').forEach(chip=>{
  chip.onclick=()=>{
    document.querySelectorAll('.chip[data-filter]').forEach(c=>c.classList.remove('active'));
    chip.classList.add('active');
    filter=chip.dataset.filter; render();
  };
});

// ---- boot ----
refresh().catch(err=>{
  console.error(err);
  els.empty.classList.add('show');
  els.empty.querySelector('p').textContent='เชื่อมต่อ backend ไม่ได้ — รัน "node server.js" แล้วเปิด http://localhost:3000';
});
