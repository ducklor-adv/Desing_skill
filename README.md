# 🎨 Design Skill

เครื่องมือ + คู่มือ AI สำหรับ **รีดีไซน์ UI ของแอปที่มีอยู่แล้ว** แบบ Drag & Drop โดยยังผูกกับ backend เดิม

AI สแกน UI จริง → สร้างหน้าเลียนแบบบนกระดาน → คนลากวางรีดีไซน์ → บันทึกเป็นเวอร์ชัน (แบบ GitHub) → AI อ่านดีไซน์กลับไปแก้โค้ดจริงผ่าน `mapsTo`

> 🤖 **ถ้าคุณเป็น AI agent:** อ่าน **[SKILL.md](SKILL.md)** ให้ครบก่อน แล้วทำตามขั้น **🟢 ACTIVATION** (พิมพ์ประโยคยืนยันกับ user → ถ้า user สั่งให้ทำ ก็เริ่ม Mapping ทุกหน้าทันที)

---

## เริ่มเร็ว (Quick start)

### เปิดเครื่องมือ
```bash
# เปิดกระดานออกแบบในเบราว์เซอร์ (ไฟล์เดียว ไม่ต้อง build)
start sample-app/design-board.html      # Windows
# open sample-app/design-board.html      # macOS
```

### รันแอปตัวอย่าง (TaskFlow) เพื่อให้ AI สแกน
```bash
cd sample-app
$env:PORT=4100; node server.js   # PowerShell → http://localhost:4100
# PORT=4100 node server.js        # bash
```

---

## โครงรีโป
```
Design Skill/
├─ README.md              ← คุณอยู่ที่นี่
├─ Design_skill.md        ← สเปก + flow ฉบับเต็ม
├─ SKILL.md               ← คู่มือสำหรับ AI (scan → mimic → apply)
├─ CONTRIBUTING.md        ← วิธีร่วมพัฒนา/อัปเดต
├─ schema/
│   └─ element.schema.json   ← สัญญาข้อมูลของ element (JSON Schema)
└─ sample-app/            ← แอปตัวอย่าง (TaskFlow) + ดีไซน์ที่ map แล้ว
    ├─ index.html, styles.css, app.js, server.js   (แอปจริง + backend)
    ├─ design-board.html        (เครื่องมือ ที่โหลด mimic ของ TaskFlow)
    └─ design.taskflow.json     (ไฟล์ mapping ตัวอย่าง)
```
> หมายเหตุ: โฟลเดอร์ตัวอย่างปัจจุบันชื่อ `sample-app/` (ทำหน้าที่เป็น `examples/taskflow/` ตามสเปก) — เปลี่ยนชื่อให้ตรงสเปกได้ภายหลังเมื่อพร้อม

## แนวคิดหลัก
| คำ | ความหมาย |
|----|----------|
| **Element schema** | โครงข้อมูลของชิ้น UI 1 ชิ้น (type/ตำแหน่ง/สไตล์/`mapsTo`) |
| **`mapsTo`** | selector ที่ชี้กลับ DOM จริง — กุญแจของการ "สวมดีไซน์กลับโค้ด" |
| **Page** | หนึ่ง route ของแอป = หนึ่งหน้าบนกระดาน |
| **Version** | snapshot ของหน้า บันทึกแบบ GitHub (แยกต่อหน้า) |

## ใช้ยังไง (ภาพรวม)
1. AI สแกนแอปคุณ → สร้าง page ของแต่ละ route (ดู [SKILL.md](SKILL.md))
2. เปิดกระดาน เลือกหน้าจากเมนู **Pages** → รีดีไซน์
3. พอใจ → **📌 บันทึกเวอร์ชัน**
4. บอก AI ว่า "เอาเวอร์ชันล่าสุดไปแก้หน้าจริง" → AI อ่านดีไซน์ + แก้โค้ดผ่าน `mapsTo`

อ่านรายละเอียดทั้งหมดที่ [Design_skill.md](Design_skill.md)

## License
MIT (เสนอ) — แก้ได้ตามต้องการ
