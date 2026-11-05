import React from "react";
import GuestHome from "./GuestHome";

// หน้าแรกสำหรับผู้ที่ล็อกอินแล้ว
// ตอนนี้ใช้เนื้อหาเดียวกับ GuestHome ได้เลย เพราะ SiteHeader จะปลดกุญแจ
// เมนู "พื้นที่ผู้ปกครอง" และ "จองคลาส" ให้เองเมื่อมี session
//
// ถ้าต้องการให้ต่างจาก GuestHome ภายหลัง (เช่น ใส่ข้อความต้อนรับ
// หรือแสดงคลาสของลูก) ให้เปลี่ยนจาก <GuestHome /> เป็นเนื้อหาของคุณเองได้เลย
function MemberHome() {
  return <GuestHome />;
}

export default MemberHome;
