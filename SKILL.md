---
name: design-skill
description: Mirror a running web app's UI into a drag-and-drop design board, let a human redesign it, then apply the new design back to the real code without breaking backend bindings. Use when a user wants to redesign/restyle an existing app's pages, map a live UI into editable elements, or apply a saved board design back into code.
---

# Design Skill — คู่มือสำหรับ AI

คุณคือผู้ช่วยที่ใช้ Chrome DevTools MCP สแกน UI จริง สร้างหน้าเลียนแบบบนกระดานออกแบบ และสวมดีไซน์กลับโค้ด
**หลักการสำคัญ:** แก้แค่ "ลุค" (CSS/markup) — ห้ามแตะ `id`/binding/handler ที่ผูก backend

---

## 🟢 ACTIVATION — สิ่งที่ต้องทำทันทีเมื่ออ่าน skill นี้จบ

เมื่อ agent ตัวใดก็ตามถูกชี้ให้มาอ่านสกิลนี้ และอ่าน/เข้าใจครบทุกส่วนแล้ว
(README.md, Design_skill.md, SKILL.md, schema/element.schema.json)
**ต้องพิมพ์ข้อความนี้กลับไปหา user แบบเป๊ะๆ ก่อนทำอย่างอื่น:**

> **"ผมเข้าใจ skill นี้ทั้งหมดแล้ว คุณต้องการให้ผม ดำเนินการ Mapping UI ทุกอย่างเพื่อใช้ Skill นี้ออกแบบหรือ ไม่"**

จากนั้น**รอคำตอบจาก user**:

- ถ้า user ตอบด้วยคำใดที่แปลว่า "ทำเลย / ตกลง / ยินยอม"
  (เช่น: `ทำเลย`, `เอาเลย`, `จัดไป`, `ได้`, `ตกลง`, `โอเค`, `ok`, `yes`, `go`, `do it`, `proceed`, `ลุยเลย`, `เริ่มได้เลย`)
  → **เริ่มทำ Mapping ทันที**: รัน PHASE 1 (SCAN) → PHASE 2 (MIMIC) ให้ครบ **ทุกหน้า/ทุก route** ของแอป
  แล้วรายงานผล + บอกให้ user เปิด Dashboard (`design-board.html`) ไปรีดีไซน์ต่อ

- ถ้า user ตอบปฏิเสธ/ยังไม่พร้อม/ถามต่อ → **ห้ามเริ่ม mapping** ตอบคำถามหรือรอคำสั่งก่อน

> หมายเหตุ: ถ้ายังไม่รู้ว่าแอปอยู่ที่ไหน/มี route อะไรบ้าง ให้ถาม URL หรือที่อยู่โปรเจกต์ก่อนเริ่มสแกน
> แต่ยัง**ต้องพิมพ์ประโยค ACTIVATION ข้างบนก่อนเสมอ**

---

## เมื่อไรให้ใช้สกิลนี้
- ผู้ใช้ขอ "รีดีไซน์/เปลี่ยนหน้าตา" ของแอปที่มีอยู่
- ผู้ใช้ขอ map UI จริงเป็น element ที่แก้ได้
- ผู้ใช้ขอเอาดีไซน์จากกระดานไปใส่โค้ดจริง

---

## PHASE 1 — SCAN (สแกนแอปจริง)
1. หา route ทั้งหมดของแอป: ดู router config, sitemap, ลิงก์ในเมนู nav, หรือถามผู้ใช้
2. รันแอป (เช่น `node server.js`) แล้ว `navigate_page` ไปแต่ละ route
3. `evaluate_script` เก็บข้อมูลทุก element สำคัญ:
   ```js
   () => {
     const root = document.querySelector('.app, #root, body').getBoundingClientRect();
     const pick = el => {
       const r = el.getBoundingClientRect();
       const cs = getComputedStyle(el);
       return { sel: cssSelector(el),           // selector ที่เสถียร (ดูข้อ 4)
         x:Math.round(r.left-root.left), y:Math.round(r.top-root.top),
         w:Math.round(r.width), h:Math.round(r.height),
         text:(el.innerText||'').trim().slice(0,40),
         color:cs.color, bg:cs.backgroundColor, fontSize:parseInt(cs.fontSize),
         fontWeight:cs.fontWeight, radius:parseInt(cs.borderRadius), border:cs.border };
     };
     // เลือก node ที่มี id / data-* / role / เป็น control (button,input,a,h1..h3,img)
     return [...document.querySelectorAll('[id],[data-el],button,input,select,a,h1,h2,h3,img,[role]')].map(pick);
   }
   ```
4. **เลือก selector ที่เสถียร** (ลำดับความชอบ): `#id` > `[data-el="..."]` > class เชิงความหมาย (ไม่ใช่ utility เช่น `.mt-2`) > `tag:nth-of-type`
   → ค่านี้จะเป็น `mapsTo` (กุญแจสวมกลับ)

## PHASE 2 — MIMIC (สร้างหน้าเลียนแบบ)
1. แปลงผลสแกน → array ของ element schema (ดู `schema/element.schema.json`)
   - แม็ป tag → `type`: `h1..h3→heading`, `p/span→text`, `button→button`, `input/select→input`, `img→image`, container → `box`/`card`
   - ใส่ `mapsTo` = selector ที่เลือก, `locked:false`, `hidden:false`
2. เขียนเป็น **page** ลง `tfPages` (1 route = 1 page) หรือ export เป็น `pages/<route>.json`
3. ตรวจด้วยตา: เปิด `design-board.html` ดูว่าหน้าตาใกล้ของจริง (วาง/ขนาด/สีถูก)
4. รายงานผู้ใช้: "map แล้ว N หน้า, M element ต่อหน้า — เปิดกระดานรีดีไซน์ได้เลย"

## PHASE 3 — (คนทำ) REDESIGN
ผู้ใช้ลากวางบนกระดาน แล้วกด **บันทึกเวอร์ชัน**. คุณไม่ต้องทำอะไรในเฟสนี้ นอกจากช่วยถ้าถูกถาม

## PHASE 4 — APPLY (สวมดีไซน์กลับโค้ดจริง)
1. อ่านเวอร์ชันล่าสุดของหน้าที่ผู้ใช้ระบุ (จาก `tfVersions` ที่ export, หรือไฟล์ design JSON ที่ผู้ใช้ให้)
2. สำหรับแต่ละ element เทียบ "ของจริง vs ดีไซน์ใหม่" — ดู diff ของ `style`, `x/y/w/h`, `text`
3. ไปที่โค้ดจริง หา node ตาม `mapsTo` แล้วแก้ **เฉพาะลุค**:
   - สี/ฟอนต์/radius/padding/border → แก้ CSS ของ selector นั้น
   - ข้อความ → แก้ markup (ระวังข้อความที่มาจาก data/i18n — ยืนยันกับผู้ใช้ก่อน)
   - layout/ตำแหน่ง → ปรับ CSS layout ให้สอดคล้อง (อาจต้องใช้ fl/ grid ไม่ใช่ absolute)
4. **ห้ามแก้:** `id`, `data-*` ที่ใช้ผูก JS, event handler, การเรียก API, ค่าที่ผูก state
5. ตรวจซ้ำด้วย MCP: เปิดแอปจริงหลังแก้ → screenshot เทียบกับดีไซน์
6. รายงานเป็นรายการ: element ไหนเปลี่ยนอะไร, ไฟล์/บรรทัดที่แก้

---

## กฎความปลอดภัย (ต้องทำตาม)
- **ยืนยันก่อนแก้โค้ดจริง** ทุกครั้ง — แสดง diff ที่จะทำก่อน
- ถ้า `mapsTo` หา node ไม่เจอในโค้ดจริง (เช่น UI เปลี่ยนไปแล้ว) → หยุดและถามผู้ใช้ อย่าเดา
- แก้ทีละหน้า/ทีละชุด commit ได้ ย้อนได้
- อย่าแก้ logic/binding — ถ้าดีไซน์ต้องการเปลี่ยนโครงสร้างที่กระทบ JS ให้แจ้งผู้ใช้แยกต่างหาก

## ข้อมูลอ้างอิง
- Element schema: `schema/element.schema.json`
- สเปก + flow เต็ม: `Design_skill.md`
- ตัวอย่างที่ map เสร็จแล้ว: `sample-app/design.taskflow.json` (เครื่องมือ: `sample-app/design-board.html`)
