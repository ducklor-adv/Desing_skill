# TaskFlow — sample app (Frontend + Backend)

เว็บ 1 หน้าพร้อมใช้งานจริง แยกอิสระจาก Design Board — ไว้ทดสอบว่า "พอเปลี่ยน UI แล้วยังผูกกับ backend ได้ไหม"

## รัน
```bash
cd "sample-app"
node server.js            # พอร์ตเริ่มต้น 3000
# หรือเลือกพอร์ตเอง (ถ้า 3000 ไม่ว่าง)
PORT=4100 node server.js  # → http://localhost:4100
```
ไม่ต้องติดตั้งอะไร (zero dependency, ใช้ Node http/fs ล้วน). ข้อมูลเก็บในไฟล์ `tasks.json` (สร้างอัตโนมัติพร้อม seed ครั้งแรก).

## สถาปัตยกรรม
```
index.html  → โครง UI (มี data-el="..." เป็น "จุดผูก" ของแต่ละส่วน)
styles.css  → ดีไซน์ทั้งหมด
app.js      → frontend logic: fetch() เรียก REST API
server.js   → backend: เสิร์ฟ static + REST API + เก็บ tasks.json
```

## REST API
| Method | Endpoint                  | Body                      | ผลลัพธ์ |
|--------|---------------------------|---------------------------|---------|
| GET    | `/api/tasks`              | —                         | รายการ task ทั้งหมด |
| POST   | `/api/tasks`              | `{title, priority}`       | task ที่สร้าง (201) |
| PATCH  | `/api/tasks/:id`          | `{done?, title?, priority?}` | task ที่แก้ |
| DELETE | `/api/tasks/:id`          | —                         | task ที่ลบ |
| POST   | `/api/tasks/clear-done`   | —                         | `{removed: n}` |

Task schema: `{ id, title, priority:'low'|'medium'|'high', done:boolean, createdAt:number }`

## จุดผูก UI ↔ logic (สำหรับ "สวม" UI ใหม่ทีหลัง)
ทุก element สำคัญมี `data-el` ใน HTML และ `app.js` อ้างผ่าน `id` เดิม
ถ้าจะเปลี่ยน UI ใหม่ ขอแค่คง **id / data-el เหล่านี้** ไว้ logic จะทำงานต่อได้ทันที:

| จุดผูก (id / data-el) | หน้าที่ |
|------------------------|---------|
| `taskInput`            | ช่องกรอกชื่องาน |
| `prioritySelect`       | เลือกความสำคัญ |
| `addBtn`               | ปุ่มเพิ่มงาน |
| `taskList`             | กล่องแสดงรายการ task |
| `emptyState`           | ข้อความตอนไม่มีงาน |
| `clearDone`            | ปุ่มล้างงานที่เสร็จ |
| `statTotal/statDone/statLeft` | ตัวเลขสรุป |
| `.chip[data-filter]`   | ปุ่มกรอง (all/active/done) |
