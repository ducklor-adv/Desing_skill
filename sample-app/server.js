/* TaskFlow backend — zero-dependency Node.js HTTP server
   - เสิร์ฟไฟล์ static (index.html, styles.css, app.js)
   - REST API สำหรับ tasks เก็บลงไฟล์ tasks.json
   รัน: node server.js   →   http://localhost:3000
*/
const http = require('http');
const fs   = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;
const ROOT = __dirname;
const DB   = path.join(ROOT, 'tasks.json');

// ---------- storage ----------
function readTasks(){
  try { return JSON.parse(fs.readFileSync(DB, 'utf8')); }
  catch (e) { return []; }
}
function writeTasks(tasks){
  fs.writeFileSync(DB, JSON.stringify(tasks, null, 2));
}
function uid(){ return Date.now() + '-' + Math.floor(Math.random()*1e6); }

// ---------- helpers ----------
function sendJson(res, code, data){
  const body = JSON.stringify(data);
  res.writeHead(code, { 'Content-Type':'application/json; charset=utf-8', 'Access-Control-Allow-Origin':'*' });
  res.end(body);
}
function readBody(req){
  return new Promise(resolve=>{
    let raw=''; req.on('data',c=>raw+=c);
    req.on('end',()=>{ try{ resolve(raw?JSON.parse(raw):{}); }catch(e){ resolve({}); } });
  });
}
const MIME = { '.html':'text/html; charset=utf-8', '.css':'text/css', '.js':'text/javascript', '.json':'application/json', '.ico':'image/x-icon' };
function serveStatic(req, res){
  let p = req.url.split('?')[0];
  if (p === '/') p = '/index.html';
  const file = path.join(ROOT, path.normalize(p).replace(/^(\.\.[\/\\])+/,''));
  if (!file.startsWith(ROOT) || !fs.existsSync(file) || fs.statSync(file).isDirectory()){
    res.writeHead(404, {'Content-Type':'text/plain'}); return res.end('Not found');
  }
  res.writeHead(200, { 'Content-Type': MIME[path.extname(file)] || 'application/octet-stream' });
  fs.createReadStream(file).pipe(res);
}

// ---------- API ----------
async function handleApi(req, res){
  const url = req.url.split('?')[0];
  const method = req.method;

  // CORS preflight
  if (method === 'OPTIONS'){
    res.writeHead(204, {
      'Access-Control-Allow-Origin':'*',
      'Access-Control-Allow-Methods':'GET,POST,PATCH,DELETE,OPTIONS',
      'Access-Control-Allow-Headers':'Content-Type'
    });
    return res.end();
  }

  // GET /api/tasks
  if (url === '/api/tasks' && method === 'GET'){
    return sendJson(res, 200, readTasks());
  }

  // POST /api/tasks   { title, priority }
  if (url === '/api/tasks' && method === 'POST'){
    const body = await readBody(req);
    const title = (body.title||'').trim();
    if (!title) return sendJson(res, 400, { error:'title is required' });
    const task = { id:uid(), title, priority: body.priority||'medium', done:false, createdAt: Date.now() };
    const tasks = readTasks(); tasks.unshift(task); writeTasks(tasks);
    return sendJson(res, 201, task);
  }

  // POST /api/tasks/clear-done
  if (url === '/api/tasks/clear-done' && method === 'POST'){
    const tasks = readTasks();
    const kept = tasks.filter(t=>!t.done);
    writeTasks(kept);
    return sendJson(res, 200, { removed: tasks.length - kept.length });
  }

  // /api/tasks/:id  (PATCH | DELETE)
  const m = url.match(/^\/api\/tasks\/([^\/]+)$/);
  if (m){
    const id = m[1];
    const tasks = readTasks();
    const idx = tasks.findIndex(t=>t.id===id);
    if (idx === -1) return sendJson(res, 404, { error:'task not found' });

    if (method === 'PATCH'){
      const body = await readBody(req);
      if ('done' in body)     tasks[idx].done = !!body.done;
      if ('title' in body)    tasks[idx].title = String(body.title);
      if ('priority' in body) tasks[idx].priority = body.priority;
      writeTasks(tasks);
      return sendJson(res, 200, tasks[idx]);
    }
    if (method === 'DELETE'){
      const [removed] = tasks.splice(idx,1);
      writeTasks(tasks);
      return sendJson(res, 200, removed);
    }
  }

  return sendJson(res, 404, { error:'unknown endpoint' });
}

// ---------- seed demo data (ครั้งแรกที่ยังไม่มี tasks.json) ----------
if (!fs.existsSync(DB)){
  const now = Date.now();
  writeTasks([
    { id:uid(), title:'ออกแบบหน้า Dashboard',        priority:'high',   done:false, createdAt: now-3600e3 },
    { id:uid(), title:'รีวิว Pull Request ของทีม',     priority:'medium', done:false, createdAt: now-7200e3 },
    { id:uid(), title:'อ่านเอกสาร API',               priority:'low',    done:true,  createdAt: now-86400e3 },
  ]);
}

// ---------- server ----------
http.createServer((req,res)=>{
  if (req.url.startsWith('/api/')) return handleApi(req,res).catch(e=>sendJson(res,500,{error:String(e)}));
  serveStatic(req,res);
}).listen(PORT, ()=>{
  console.log(`TaskFlow running →  http://localhost:${PORT}`);
});
