# ร่วมพัฒนา Design Skill

ขอบคุณที่อยากช่วยพัฒนา! โปรเจกต์นี้ตั้งใจให้คนอื่นมาต่อยอด/อัปเดตได้ง่าย

## หลักการที่ห้ามพัง (Data Contract)
สิ่งเหล่านี้คือ "สัญญา" ที่ทุกส่วนพึ่งพา — แก้ได้แต่ต้อง **ขึ้นเวอร์ชัน + เขียนผลกระทบใน PR**:
1. **Element schema** (`schema/element.schema.json`) — โครง `{id,type,name,x,y,w,h,text,style,mapsTo,locked,hidden}`
2. **`mapsTo`** — ความหมาย "selector ชี้กลับ DOM จริง" ห้ามเปลี่ยน
3. **localStorage keys** (`tfPages`,`tfBoard`,`tfVersions`,`tfTemplates`,`tfSettings`) — ถ้าเปลี่ยนต้องมี migration
4. โมเดลการเลือกแบบ Figma (คลิก/ดับเบิลคลิก/Ctrl+คลิก/Shift+คลิก/Esc)

> มี migration เสมอเมื่อเปลี่ยนรูปแบบข้อมูลที่ผู้ใช้เก่าอาจมีอยู่ใน localStorage

## โครงโค้ดของเครื่องมือ (`design-board.html` — ไฟล์เดียว)
แบ่งเป็นชั้นๆ ใน `<script>`:
| ส่วน | หน้าที่ |
|------|---------|
| `CATALOG` | ต้นแบบของแต่ละ element type |
| `state` / `save` / `load` | สถานะ + persistence (อย่าแก้ key) |
| `buildTree` + helper | อนุมานพ่อ-ลูกจากเรขาคณิต (`outermostOf`, `descendantsOf`, `drillTarget`) |
| `attachDrag` | เลือก/ลาก/resize แบบ Figma |
| `renderEl` / `renderElementList` / `renderInspector` | วาดกระดาน / Layers / Properties |
| `settings` + `snapV` | grid/snap |
| Pages (`tfPages`) | หลายหน้า + สลับ |
| Version History (`tfVersions`) | snapshot ต่อหน้า |
| Undo/Redo | wrap `save()` เก็บประวัติ |

## วิธีเพิ่มของ (ตัวอย่าง)
- **เพิ่ม element type:** เติมใน `CATALOG` (icon/label/ขนาด/style เริ่มต้น) — palette + Layers จะรู้จักอัตโนมัติ
- **เพิ่มปุ่ม toolbar:** เติมปุ่มใน `#topbar` แล้ว wire `onclick`
- **เพิ่ม property ใน Inspector:** เติมช่องใน `renderInspector` ผ่าน helper `f(...)`

## ทดสอบ
ทุก feature ควรตรวจด้วย **Chrome DevTools MCP** (เปิดไฟล์จริง + `evaluate_script` ยืนยันพฤติกรรม)
ก่อนส่ง PR ให้รัน syntax check:
```bash
node -e "const h=require('fs').readFileSync('examples/taskflow/design-board.html','utf8');new Function(h.match(/<script>([\s\S]*)<\/script>/)[1]);console.log('OK')"
```

## ขั้นตอน PR
1. branch ใหม่ จาก main
2. แก้ + เพิ่ม UAT (เขียนว่าทดสอบ use case อะไรด้วย MCP)
3. ถ้าแตะ Data Contract → เขียน "ผลกระทบ + migration" ใน PR
4. ขอ review

## โค้ดสไตล์
- ภาษาไทยในคอมเมนต์/UI ได้ (กลุ่มผู้ใช้หลักเป็นไทย)
- ไฟล์เดียว self-contained — ไม่เพิ่ม dependency โดยไม่จำเป็น
