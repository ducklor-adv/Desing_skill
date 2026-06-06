# Design Skill — สเปกและ Flow ฉบับเต็ม

> **Design Skill** = "สกิล" (ชุดความสามารถ + คู่มือสำหรับ AI + เครื่องมือ) ที่แจกให้โปรแกรมเมอร์
> เพื่อให้ **AI ไปอ่าน/ตรวจ UI ของแอปจริง → สร้างหน้าเลียนแบบบนกระดานออกแบบ → ให้คนลากวางรีดีไซน์ → บันทึกเป็นเวอร์ชัน (แบบ GitHub) → แล้ว AI อ่านไฟล์ดีไซน์กลับไปแก้โค้ดหน้าเว็บจริง**

---

## 1. ปัญหาที่แก้
การรีดีไซน์ UI ของแอปที่มีอยู่แล้วเป็นเรื่องยาก เพราะ:
- ดีไซน์เนอร์ทำใน Figma → ส่งต่อโปรแกรมเมอร์ → แปลงเป็นโค้ดด้วยมือ → หลุดจาก backend/logic เดิม
- ไม่มี "สะพาน" ที่ผูกชิ้นงานออกแบบกับ element จริงในโค้ดที่ต่อ backend อยู่

**Design Skill เชื่อม 3 โลกเข้าด้วยกัน:** กระดานออกแบบ ↔ UI จริง ↔ backend
ผ่านฟิลด์ `mapsTo` (selector ชี้กลับไป DOM จริง) ที่ติดไปกับทุก element

---

## 2. องค์ประกอบของสกิล
| ส่วน | ไฟล์ | หน้าที่ |
|------|------|---------|
| **คู่มือ AI** | `SKILL.md` | สอน AI ว่าจะ "สแกนแอป → สร้าง mimic → แก้โค้ดกลับ" อย่างไร (ใช้ Chrome DevTools MCP) |
| **เครื่องมือ** | `sample-app/design-board.html` | กระดาน Drag & Drop ให้คนรีดีไซน์ (โมเดลเลือกแบบ Figma) |
| **สัญญาข้อมูล** | `schema/element.schema.json` | นิยาม element schema (สิ่งที่ทุกฝ่ายพึ่งพา) |
| **ตัวอย่าง** | `sample-app/` (= `examples/taskflow/`) | แอปตัวอย่าง (TaskFlow) + ดีไซน์ที่ map แล้ว |

---

## 3. Data Contract (สัญญาข้อมูลกลาง — ห้ามแก้พล่อยๆ)

### 3.1 Element schema
```jsonc
{
  "id": "el_7",                 // ไอดีเฉพาะตัวบนกระดาน
  "type": "input",              // heading|text|button|input|image|card|box
  "name": "Task input",         // ชื่อที่คนตั้ง (โชว์ใน Layers)
  "x": 54, "y": 150,            // ตำแหน่งบน canvas
  "w": 461, "h": 41,            // ขนาด
  "text": "",                   // ข้อความ (ถ้ามี)
  "style": {                    // รายละเอียดดีไซน์ทั้งหมด
    "fontSize": 15, "fontWeight": 400, "color": "#1f2430",
    "bg": "#ffffff", "radius": 10, "padding": 11,
    "border": "1px solid #e6e9f0", "align": "left",
    "placeholder": "เพิ่มงานใหม่..."
  },
  "mapsTo": "#taskInput",       // ★ selector ชี้กลับ DOM จริง (กุญแจการ "สวมกลับ")
  "locked": false,              // ล็อก = กันเลือก/ขยับบน canvas
  "hidden": false               // ซ่อนจาก canvas
}
```

### 3.2 Page / Version
```jsonc
// pages (localStorage: tfPages)
{
  "active": "pg_home",
  "list": [{ "id": "pg_home", "name": "TaskFlow", "route": "/" }],
  "data": { "pg_home": { "els": [/* element[] */], "seq": 18 } }
}

// version (localStorage: tfVersions) — แยกต่อหน้า
{ "v": 1, "page": "pg_home", "pageName": "TaskFlow",
  "label": "map จาก TaskFlow UI", "ts": "2026-06-06T...", "els": [/* snapshot */] }
```

> **กฎทอง:** `id` และ `mapsTo` คือจุดผูก — ถ้าจะแก้ ต้องอธิบายผลกระทบและขออนุญาตเจ้าของก่อนเสมอ

---

## 4. Flow หลัก (End-to-End)

```
┌─────────────┐   1. SCAN      ┌──────────────┐   2. MIMIC     ┌────────────────┐
│  แอปจริง    │ ─────────────▶ │  AI + MCP     │ ─────────────▶ │ design-board   │
│ (รันอยู่)   │  อ่าน DOM/หน้า │ (DevTools)    │  สร้าง els+map │  (mimic ทุกหน้า)│
└─────────────┘                └──────────────┘                └────────┬───────┘
                                                                         │ 3. REDESIGN
                                                                         ▼ (คนลากวาง)
┌─────────────┐   6. APPLY     ┌──────────────┐   4. SAVE      ┌────────────────┐
│  แอปจริง    │ ◀───────────── │  AI อ่านไฟล์  │ ◀───────────── │  เวอร์ชัน/หน้า  │
│ (แก้โค้ด)   │  ผ่าน mapsTo   │  design.json  │   (แบบ GitHub) │  ที่พอใจแล้ว    │
└─────────────┘                └──────────────┘                └────────────────┘
                                       │ 5. DIFF/REVIEW
                                       ▼ (เทียบ before/after ต่อ element)
```

### Phase 1 — SCAN (AI ตรวจแอป)
AI ใช้ Chrome DevTools MCP:
1. `navigate_page` ไปแต่ละ route ของแอป (ดูจาก router/sitemap/เมนู)
2. `evaluate_script` วัด `getBoundingClientRect()` + อ่าน `computedStyle` ของ element สำคัญ (ที่มี `id`/`data-*`/`role`)
3. เก็บ selector ที่เสถียร (`#id`, `[data-el]`, class ที่ไม่ใช่ utility)

### Phase 2 — MIMIC (สร้างหน้าเลียนแบบ)
แปลงผลสแกน → element schema (แต่ละ DOM node = 1 element พร้อม `mapsTo`)
→ บันทึกเป็น **page** ใน `tfPages` (หนึ่ง route = หนึ่ง page)

### Phase 3 — REDESIGN (คนรีดีไซน์)
ใช้กระดาน: เลือกหน้าจากเมนู Pages → ลากวาง/ปรับขนาด/แก้สี-ข้อความ/จัดเรียง/เพิ่ม element ใหม่

### Phase 4 — SAVE (บันทึกแบบ GitHub)
กด **📌 บันทึกเวอร์ชัน** → snapshot ทั้งหน้า เก็บเป็น V1, V2, ... **แยกต่อหน้า**
(เหมือน commit ของแต่ละไฟล์/หน้า) — ดูย้อน/โหลดกลับได้จาก **🕘 ประวัติ**

### Phase 5 — REVIEW (เทียบ diff)
AI อ่านเวอร์ชันล่าสุด vs ของจริง → ทำรายการเปลี่ยนแปลงต่อ element (สี/ตำแหน่ง/ขนาด/ข้อความ)

### Phase 6 — APPLY (สวมกลับโค้ดจริง)
AI ไล่ทีละ element ที่ `mapsTo` ชี้ → แก้ CSS/markup ของ node นั้นในโค้ดจริง
**โดยไม่แตะ logic/handler ที่ผูก backend** (เพราะแก้แค่ลุค ไม่แตะ id/binding)

---

## 5. ความสามารถของเครื่องมือ (ที่มีแล้ว)
- **เลือกแบบ Figma:** คลิก=ทั้งก้อน · ดับเบิลคลิก=เจาะเข้า · Ctrl+คลิก=ชิ้นในสุด · Shift+คลิก=หลายชิ้น · Esc=ถอย
- **ลากครอบ (marquee)** + ลากย้ายทั้งกลุ่ม (container พาลูกไปด้วย)
- **Layers panel** เป็น tree + ไอคอน 👁 ซ่อน / 🔒 ล็อก ต่อชั้น + เปลี่ยนชื่อ (ดับเบิลคลิก)
- **เพิ่ม element ด้วย Drag & Drop** จาก palette ลงจุดที่ปล่อย
- **Align/Distribute** สำหรับหลายชิ้น
- **แก้ข้อความ inline** (ดับเบิลคลิก text)
- **คีย์ลัด:** ลูกศรเลื่อน, Ctrl+D/C/V/A, Ctrl+Z/Y (undo/redo ไม่จำกัดขั้น)
- **Settings ในหน้า:** snap to grid, ขนาดกริด, แสดงกริด, กว้างกระดาน
- **Pages:** เมนูเลือก/เพิ่ม/ลบหน้าของแอป + **version history แยกต่อหน้า**
- **Export/Import JSON** + autosave (localStorage)

---

## 6. โครงเก็บข้อมูล (localStorage keys)
| key | เก็บอะไร |
|-----|----------|
| `tfPages` | ทุกหน้า + els ของแต่ละหน้า |
| `tfBoard` | บัฟเฟอร์หน้าที่กำลังแก้ |
| `tfVersions` | เวอร์ชันทั้งหมด (มี field `page`) |
| `tfTemplates` | ต้นแบบที่ผู้ใช้บันทึกเอง |
| `tfSettings` | snap/grid/แสดงกริด/กว้างกระดาน |

> หมายเหตุ: เวอร์ชันปัจจุบันเก็บใน localStorage (ฝั่ง browser). ขั้นถัดไป (roadmap) จะ **export เป็นไฟล์ `pages/<route>.json` ในรีโป** เพื่อให้ AI อ่านตรงๆ และทำ version control ด้วย git จริง

---

## 7. Roadmap
- [ ] Export ทุกหน้า/เวอร์ชันเป็นไฟล์ `pages/*.json` ในรีโป (ให้ git diff เห็น)
- [ ] โหมด "SCAN" ในตัวเครื่องมือ: ใส่ URL แล้วให้ AI สแกนสร้าง page อัตโนมัติ
- [ ] โหมด "APPLY": gen patch (CSS/JSX) จาก diff ของเวอร์ชัน
- [ ] รองรับ element type เพิ่ม (list, avatar, badge, icon, toggle)
- [ ] Zoom/Pan, group/ungroup ชัดเจน, theme tokens (สีกลาง)

---

ดู [README.md](README.md) สำหรับวิธีเริ่มใช้ · [SKILL.md](SKILL.md) สำหรับคู่มือ AI · [CONTRIBUTING.md](CONTRIBUTING.md) สำหรับการร่วมพัฒนา
