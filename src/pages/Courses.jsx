import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";

import "../styles/Courses.css";
import SiteHeader from "../components/SiteHeader";
import SiteFooter from "../components/SiteFooter";
import useLanguage from "../lib/useLanguage";

// ---------------------------------------------------------------
// 1) ตั้งค่า route ปลายทางของปุ่ม (แก้ให้ตรงกับ router ของคุณ)
// ---------------------------------------------------------------
const ROUTES = {
  trial: "/book-trial", // ปุ่ม Book a Trial Class
  enroll: "/book-class", // ปุ่ม Enroll Now
};

// ---------------------------------------------------------------
// 2) ข้อมูลคอร์ส (ภาษาที่เป็นชื่อแบรนด์เก็บเป็น name ตัวเดียว)
//    image: ใส่ path รูปใน /public/images/courses/ ได้เลย
//    ถ้าไม่ใส่ จะแสดงกรอบสีแทน
//    icon: ชื่อไอคอนที่มีใน ICONS ด้านล่าง
// ---------------------------------------------------------------
const COURSES = [
  {
    id: "matata",
    name: "Matata",
    group: "explorers",
    ageLabel: "3+",
    ageMin: 3,
    ageMax: 6,
    interests: ["basics"],
    format: "private",
    students: 1,
    sessions: 8,
    minutes: 45,
    price: 4000,
    icon: "blocks",
    image: "",
  },
  {
    id: "scratch",
    name: "Scratch & Game Design",
    group: "builders",
    ageLabel: "6+",
    ageMin: 6,
    ageMax: 9,
    interests: ["basics", "games"],
    format: "group",
    students: 6,
    sessions: 8,
    minutes: 90,
    price: 6000,
    icon: "gamepad",
    image: "",
  },
  {
    id: "procreate",
    name: "Procreate",
    group: "builders",
    ageLabel: "6+",
    ageMin: 6,
    ageMax: 9,
    interests: ["art"],
    format: "group",
    students: 4,
    sessions: 8,
    minutes: 90,
    price: 6000,
    icon: "brush",
    image: "",
  },
  {
    id: "spike-essential",
    name: "LEGO SPIKE Essential",
    group: "builders",
    ageLabel: "6+",
    ageMin: 6,
    ageMax: 9,
    interests: ["robotics"],
    format: "group",
    students: 6,
    sessions: 8,
    minutes: 90,
    price: 6000,
    icon: "robot",
    image: "",
  },
  {
    id: "roblox",
    name: "Roblox Game Maker",
    group: "makers",
    ageLabel: "8+",
    ageMin: 8,
    ageMax: 99,
    interests: ["games"],
    format: "group",
    students: 8,
    sessions: 12,
    minutes: 120,
    price: 10000,
    icon: "cube",
    image: "",
  },
  {
    id: "python",
    name: "Python Programming",
    group: "makers",
    ageLabel: "10+",
    ageMin: 10,
    ageMax: 99,
    interests: ["coding"],
    format: "group",
    students: 4,
    sessions: 8,
    minutes: 90,
    price: 10000,
    icon: "code",
    image: "",
  },
  {
    id: "spike-prime",
    name: "LEGO SPIKE Prime",
    group: "makers",
    ageLabel: "10+",
    ageMin: 10,
    ageMax: 99,
    interests: ["robotics"],
    format: "group",
    students: 6,
    sessions: 8,
    minutes: 120,
    price: 7500,
    icon: "robot",
    image: "",
  },
];

// กลุ่มหัวข้อด้านบนของการ์ด
const GROUPS = [
  { id: "explorers", tone: "blue" },
  { id: "builders", tone: "yellow" },
  { id: "makers", tone: "purple" },
];

// ตัวกรองอายุ: เด็กอายุอยู่ในช่วง [from, to] → แสดงคอร์สที่ช่วงอายุทับกัน
const AGE_FILTERS = [
  { id: "all" },
  { id: "3+", from: 3, to: 5 },
  { id: "4-6", from: 4, to: 6 },
  { id: "6+", from: 6, to: 9 },
  { id: "10+", from: 10, to: 99 },
];

const INTERESTS = ["all", "basics", "games", "robotics", "coding", "art"];

// ---------------------------------------------------------------
// 3) ข้อความ 4 ภาษา
// ---------------------------------------------------------------
const translations = {
  th: {
    eyebrow: "คอร์สเรียนและโปรแกรม",
    heroTitle: "ทุกความชอบ เริ่มต้นได้ที่นี่",
    heroText:
      "เลือกเส้นทางการเรียนรู้ที่เหมาะกับวัยของลูก ตั้งแต่ทำความรู้จักตรรกะผ่านการเล่น ไปจนถึงสร้างเกมและเขียนโค้ดจริง",
    trialBadge: "ยังไม่แน่ใจ? ลองเรียนฟรี",
    trialTitle: "ให้ครูช่วยเลือกคอร์สที่ใช่",
    trialText:
      "ทดลองเรียน 45 นาที พร้อมคุยกับครูเรื่องความสนใจและความพร้อมของลูก",
    trialBtn: "จองคลาสทดลองเรียน",
    ageRange: "ช่วงอายุ",
    interests: "ความสนใจ",
    all: "ทั้งหมด",
    allAges: "ทุกช่วงอายุ",
    ageOption: "อายุ {a}",
    resultCount: "{n} คอร์ส · เลือกให้เหมาะกับวัยและความสนใจ",
    priceNote: "ราคาแพ็กเกจตัวอย่าง • รวมอุปกรณ์แล้ว",
    emptyTitle: "ยังไม่มีคอร์สที่ตรงกับตัวกรอง",
    emptyText: "ลองเปลี่ยนช่วงอายุหรือความสนใจ หรือดูคอร์สทั้งหมด",
    resetFilters: "ล้างตัวกรอง",
    privateClass: "เรียนตัวต่อตัว",
    groupClass: "คลาสกลุ่ม · {n} คน",
    sessionsLine: "{s} ครั้ง × {m} นาที",
    perSessions: "/ {s} ครั้ง",
    agesBadge: "อายุ {a}",
    enroll: "สมัครเรียน",
    trial: "จองคลาสทดลองเรียน",
    noticeTitle: "เลือกคอร์สให้เหมาะกับวัยของลูก",
    noticeText:
      "หมวดด้านบนแสดงเส้นทางการเรียนโดยรวม โปรดดูช่วงอายุที่แนะนำในการ์ดแต่ละคอร์ส ครูสามารถช่วยประเมินความพร้อมของลูกก่อนสมัครได้",
    pkgEyebrow: "แพ็กเกจเดียว เข้าใจง่าย",
    pkgTitle: "แพ็กเกจชัดเจน วางแผนง่าย",
    pkgText:
      "ทุกคอร์สเป็นแพ็กเกจและไม่มีวันหมดอายุ ราคาและเงื่อนไขเป็นข้อมูลอ้างอิงเท่านั้น",
    feat1Title: "จัดตารางได้ยืดหยุ่น",
    feat1Text: "เลือกเวลาว่างจากตารางเรียน เลื่อนคลาสได้ล่วงหน้าอย่างน้อย 24 ชั่วโมง",
    feat2Title: "มีอุปกรณ์ให้ครบ",
    feat2Text: "คลาสที่โรงเรียนมีอุปกรณ์ให้ทั้งหมด ส่วนคลาสออนไลน์ต้องใช้คอมพิวเตอร์ของตัวเอง",
    feat3Title: "ติดตามพัฒนาการ",
    feat3Text: "ดูความเห็นครู ผลงานของลูก และจำนวนครั้งที่เหลือได้ในพอร์ทัลผู้ปกครอง",
    stepsTitle: "เริ่มง่าย ๆ ใน 3 ขั้นตอน",
    step1: "ทดลองเรียน",
    step2: "เลือกคอร์สและแพ็กเกจ",
    step3: "จองคลาสแรก",
    helpBtn: "ให้เราช่วยเลือกคอร์ส",
    groups: {
      explorers: { label: "อายุ 3–6 ปี · นักสำรวจตัวน้อย", title: "เริ่มเล่น เริ่มคิด" },
      builders: { label: "อายุ 6–8 ปี · นักสร้างสรรค์", title: "สร้างสิ่งที่จินตนาการ" },
      makers: { label: "อายุ 8 ปีขึ้นไป · นักสร้างแห่งอนาคต", title: "ก้าวไปอีกขั้นด้วยการเขียนโค้ด" },
    },
    interestNames: {
      basics: "พื้นฐานการเขียนโค้ด",
      games: "เกมและโลก 3 มิติ",
      robotics: "หุ่นยนต์",
      coding: "เขียนโค้ด",
      art: "ศิลปะและการออกแบบ",
    },
    courses: {
      matata: {
        tagline: "เรียนรู้การคิดเป็นขั้นตอนผ่านนิทานและการเล่น",
        topics: "การเรียงลำดับ · การแก้ปัญหา · ความคิดสร้างสรรค์",
      },
      scratch: {
        tagline: "เปลี่ยนไอเดียให้เป็นเกมแรกที่เล่นได้จริง",
        topics: "บล็อกโค้ด · ตรรกะและเงื่อนไข · การออกแบบเกม",
      },
      procreate: {
        tagline: "ปลุกจินตนาการให้มีชีวิตผ่านงานศิลปะดิจิทัล",
        topics: "วาดภาพดิจิทัล · สีและเลเยอร์ · งานภาพประกอบ",
      },
      "spike-essential": {
        tagline: "เรียนโค้ดและตรรกะผ่านการเล่นเลโก้",
        topics: "ต่อบล็อก · เขียนโค้ดเบื้องต้น · ทำงานเป็นทีม",
      },
      roblox: {
        tagline: "สร้างโลก 3 มิติและเรียนเขียนสคริปต์ Lua",
        topics: "ออกแบบ 3 มิติ · สคริปต์ Lua · ทดสอบเกม",
      },
      python: {
        tagline: "เรียนเขียนโค้ดจริงผ่านโปรเจกต์ที่ได้ลงมือทำ",
        topics: "Python · ตัวแปร · การคิดเชิงตรรกะ",
      },
      "spike-prime": {
        tagline: "สร้างหุ่นยนต์ คิดอย่างมีเหตุผล แก้ปัญหาได้จริง",
        topics: "ประกอบหุ่นยนต์ · เซนเซอร์ · เขียนโค้ดและทำงานเป็นทีม",
      },
    },
  },
  en: {
    eyebrow: "COURSES & PROGRAMS",
    heroTitle: "Every Passion Starts Somewhere",
    heroText:
      "Find the right learning path for your child's age, from exploring logic through play to creating games and writing real code.",
    trialBadge: "Not Sure Yet? Try a Free Class.",
    trialTitle: "Let Our Teachers Help You Find the Right Course.",
    trialText:
      "Enjoy a 45-minute trial class and discuss your child's interests and readiness with our teachers.",
    trialBtn: "Book a Trial Class",
    ageRange: "Age Range",
    interests: "Interests",
    all: "All",
    allAges: "All Ages",
    ageOption: "Ages {a}",
    resultCount: "{n} Courses · Find the Right Fit for Their Age and Interests.",
    priceNote: "Sample package prices • Equipment included",
    emptyTitle: "No courses match these filters",
    emptyText: "Try a different age range or interest, or view all courses.",
    resetFilters: "Clear filters",
    privateClass: "1-on-1 Learning",
    groupClass: "Group Class · {n} Students",
    sessionsLine: "{s} Sessions × {m} Minutes",
    perSessions: "/ {s} Sessions",
    agesBadge: "Ages {a}",
    enroll: "Enroll Now",
    trial: "Book a Trial Class",
    noticeTitle: "Choose a Course That Fits Your Child's Age.",
    noticeText:
      "The categories above show the overall learning paths. Please check each course card for the recommended age. Our teachers can help assess your child's readiness before enrollment.",
    pkgEyebrow: "ONE SIMPLE PACKAGE",
    pkgTitle: "Clear Packages. Easy Planning.",
    pkgText:
      "All courses come in session packages with no expiration date. Prices and terms are for reference only.",
    feat1Title: "Flexible Scheduling",
    feat1Text: "Book available time slots from the schedule. Reschedule at least 24 hours in advance.",
    feat2Title: "All Equipment Provided",
    feat2Text: "In-person classes include all equipment. Online students need their own computer.",
    feat3Title: "Track Learning Progress",
    feat3Text: "View teacher updates, student projects, and remaining sessions in your Parent Portal.",
    stepsTitle: "Get started in 3 easy steps",
    step1: "Try a class",
    step2: "Choose a course and package",
    step3: "Book your first class",
    helpBtn: "Help me choose a course",
    groups: {
      explorers: { label: "Ages 3–6 · Little explorers", title: "Start Playing. Start Thinking" },
      builders: { label: "Ages 6–8 · Creative builders", title: "Build What You Imagine" },
      makers: { label: "Ages 8+ · Future makers", title: "Take It Further with Coding" },
    },
    interestNames: {
      basics: "Coding Basics",
      games: "Games & 3D Worlds",
      robotics: "Robotics",
      coding: "Coding",
      art: "Art & Design",
    },
    courses: {
      matata: {
        tagline: "Learn to Think Step by Step Through Stories and Play.",
        topics: "Sequencing · Problem-Solving · Creativity",
      },
      scratch: {
        tagline: "Turn Ideas into a Playable First Game.",
        topics: "Code Blocks · Logic & Conditions · Game Design",
      },
      procreate: {
        tagline: "Bring Your Imagination to Life Through Digital Art.",
        topics: "Digital Drawing · Colors & Layers · Illustration",
      },
      "spike-essential": {
        tagline: "Learn Coding and Logic Through LEGO Play.",
        topics: "Building · Simple Coding · Teamwork",
      },
      roblox: {
        tagline: "Build 3D Worlds and Learn Lua Scripting.",
        topics: "3D Design · Lua Scripting · Game Testing",
      },
      python: {
        tagline: "Learn Real Coding Through Hands-On Projects.",
        topics: "Python · Variables · Logical Thinking",
      },
      "spike-prime": {
        tagline: "Build Robots. Think Logically. Solve Problems.",
        topics: "Building · Sensors · Coding & Teamwork",
      },
    },
  },
  zh: {
    eyebrow: "课程与项目",
    heroTitle: "每一种热爱，都从这里开始",
    heroText: "根据孩子的年龄选择合适的学习路径，从在游戏中探索逻辑，到创作游戏、编写真正的代码。",
    trialBadge: "还没想好？先免费试听。",
    trialTitle: "让老师帮您找到合适的课程。",
    trialText: "体验 45 分钟试听课，并与老师沟通孩子的兴趣和准备情况。",
    trialBtn: "预约试听课",
    ageRange: "年龄段",
    interests: "兴趣方向",
    all: "全部",
    allAges: "所有年龄",
    ageOption: "{a} 岁",
    resultCount: "共 {n} 门课程 · 按年龄和兴趣找到合适的课程",
    priceNote: "套餐价格仅供参考 • 含教具设备",
    emptyTitle: "没有符合筛选条件的课程",
    emptyText: "请尝试更换年龄段或兴趣，或查看全部课程。",
    resetFilters: "清除筛选",
    privateClass: "一对一教学",
    groupClass: "小组课 · {n} 名学生",
    sessionsLine: "{s} 节课 × {m} 分钟",
    perSessions: "/ {s} 节课",
    agesBadge: "{a} 岁",
    enroll: "立即报名",
    trial: "预约试听课",
    noticeTitle: "请选择适合孩子年龄的课程。",
    noticeText: "上方分类展示整体学习路径，请查看每张课程卡片上的建议年龄。报名前，老师可以帮助评估孩子的准备情况。",
    pkgEyebrow: "简单明了的套餐",
    pkgTitle: "套餐清晰，规划轻松。",
    pkgText: "所有课程均为课时套餐，无有效期限制。价格与条款仅供参考。",
    feat1Title: "灵活排课",
    feat1Text: "从课表中选择可用时间。需至少提前 24 小时改期。",
    feat2Title: "提供全部设备",
    feat2Text: "线下课程提供所有设备，线上学员需自备电脑。",
    feat3Title: "跟踪学习进度",
    feat3Text: "在家长中心查看老师反馈、学生作品和剩余课时。",
    stepsTitle: "三步轻松开始",
    step1: "试听体验",
    step2: "选择课程和套餐",
    step3: "预约第一节课",
    helpBtn: "帮我选课程",
    groups: {
      explorers: { label: "3–6 岁 · 小小探索者", title: "边玩边思考" },
      builders: { label: "6–8 岁 · 创意建造者", title: "把想象变成作品" },
      makers: { label: "8 岁以上 · 未来创造者", title: "用编程走得更远" },
    },
    interestNames: {
      basics: "编程入门",
      games: "游戏与 3D 世界",
      robotics: "机器人",
      coding: "编程",
      art: "艺术与设计",
    },
    courses: {
      matata: { tagline: "通过故事和游戏，学会一步一步思考。", topics: "排序 · 解决问题 · 创造力" },
      scratch: { tagline: "把创意变成第一款可玩的游戏。", topics: "代码积木 · 逻辑与条件 · 游戏设计" },
      procreate: { tagline: "用数字艺术让想象力变成现实。", topics: "数字绘画 · 色彩与图层 · 插画" },
      "spike-essential": { tagline: "在乐高游戏中学习编程与逻辑。", topics: "搭建 · 基础编程 · 团队合作" },
      roblox: { tagline: "搭建 3D 世界，学习 Lua 脚本。", topics: "3D 设计 · Lua 脚本 · 游戏测试" },
      python: { tagline: "通过动手项目学习真正的编程。", topics: "Python · 变量 · 逻辑思维" },
      "spike-prime": { tagline: "制作机器人，逻辑思考，解决问题。", topics: "搭建 · 传感器 · 编程与团队合作" },
    },
  },
  ru: {
    eyebrow: "КУРСЫ И ПРОГРАММЫ",
    heroTitle: "Каждое увлечение с чего-то начинается",
    heroText:
      "Подберите программу по возрасту ребёнка: от знакомства с логикой в игре до создания игр и настоящего кода.",
    trialBadge: "Не уверены? Попробуйте бесплатно.",
    trialTitle: "Преподаватели помогут выбрать подходящий курс.",
    trialText:
      "Пробное занятие 45 минут и разговор с преподавателем об интересах и готовности ребёнка.",
    trialBtn: "Записаться на пробное",
    ageRange: "Возраст",
    interests: "Интересы",
    all: "Все",
    allAges: "Любой возраст",
    ageOption: "{a} лет",
    resultCount: "Курсов: {n} · Подберите по возрасту и интересам.",
    priceNote: "Цены пакетов ориентировочные • Оборудование включено",
    emptyTitle: "Нет курсов под эти фильтры",
    emptyText: "Измените возраст или интерес либо посмотрите все курсы.",
    resetFilters: "Сбросить фильтры",
    privateClass: "Индивидуально",
    groupClass: "Группа · {n} уч.",
    sessionsLine: "{s} занятий × {m} мин",
    perSessions: "/ {s} занятий",
    agesBadge: "{a} лет",
    enroll: "Записаться",
    trial: "Записаться на пробное",
    noticeTitle: "Выберите курс, подходящий по возрасту.",
    noticeText:
      "Категории выше показывают общие направления. Рекомендуемый возраст указан в карточке каждого курса. Перед записью преподаватели помогут оценить готовность ребёнка.",
    pkgEyebrow: "ПРОСТЫЕ ПАКЕТЫ",
    pkgTitle: "Понятные пакеты. Удобное планирование.",
    pkgText: "Все курсы продаются пакетами занятий без срока действия. Цены и условия ориентировочные.",
    feat1Title: "Гибкое расписание",
    feat1Text: "Выбирайте свободные слоты. Перенос занятия — не позднее чем за 24 часа.",
    feat2Title: "Всё оборудование включено",
    feat2Text: "На очных занятиях всё оборудование предоставляется. Онлайн-ученикам нужен свой компьютер.",
    feat3Title: "Следите за прогрессом",
    feat3Text: "Отзывы преподавателей, работы ребёнка и остаток занятий — в кабинете родителя.",
    stepsTitle: "Начните за 3 простых шага",
    step1: "Пробное занятие",
    step2: "Выбор курса и пакета",
    step3: "Запись на первое занятие",
    helpBtn: "Помогите выбрать курс",
    groups: {
      explorers: { label: "3–6 лет · Юные исследователи", title: "Играем и думаем" },
      builders: { label: "6–8 лет · Творцы", title: "Создайте то, что придумали" },
      makers: { label: "8+ лет · Создатели будущего", title: "Шаг вперёд с программированием" },
    },
    interestNames: {
      basics: "Основы кода",
      games: "Игры и 3D-миры",
      robotics: "Робототехника",
      coding: "Программирование",
      art: "Искусство и дизайн",
    },
    courses: {
      matata: { tagline: "Учимся мыслить шаг за шагом через истории и игру.", topics: "Последовательности · Решение задач · Творчество" },
      scratch: { tagline: "Превратите идею в свою первую игру.", topics: "Блоки кода · Логика и условия · Дизайн игр" },
      procreate: { tagline: "Оживите воображение с помощью цифрового искусства.", topics: "Цифровой рисунок · Цвета и слои · Иллюстрация" },
      "spike-essential": { tagline: "Учим код и логику через игру с LEGO.", topics: "Сборка · Простой код · Командная работа" },
      roblox: { tagline: "Создавайте 3D-миры и изучайте скрипты Lua.", topics: "3D-дизайн · Скрипты Lua · Тестирование игр" },
      python: { tagline: "Настоящий код через практические проекты.", topics: "Python · Переменные · Логическое мышление" },
      "spike-prime": { tagline: "Стройте роботов, мыслите логично, решайте задачи.", topics: "Сборка · Датчики · Код и командная работа" },
    },
  },
};

// ---------------------------------------------------------------
// 4) ไอคอน SVG (ไม่ใช้อีโมจิ เพื่อไม่ให้เจอกล่องดำเวลาฟอนต์ไม่รองรับ)
// ---------------------------------------------------------------
const ICONS = {
  blocks: "M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM17.5 14l3.5 7h-7z",
  gamepad: "M6 8h12a4 4 0 0 1 4 4v2a3 3 0 0 1-5.2 2L15 14H9l-1.8 2A3 3 0 0 1 2 14v-2a4 4 0 0 1 4-4zM8 10v3M6.5 11.5h3M16 11h.01M18 13h.01",
  brush: "M18 3l3 3-9 9-3-3zM9 12c-2.5 0-4 1.5-4 4 0 2-1 3-2 4 4 1 8 0 8-4",
  robot: "M5 8h14v10H5zM12 4v4M9 13h.01M15 13h.01M2 12v3M22 12v3",
  cube: "M12 2l9 5v10l-9 5-9-5V7zM12 12l9-5M12 12v10M12 12L3 7",
  code: "M8 7l-5 5 5 5M16 7l5 5-5 5M14 4l-4 16",
  info: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 11v5M12 8h.01",
  calendar: "M4 6h16v14H4zM4 10h16M8 3v5M16 3v5",
  backpack: "M7 8a5 5 0 0 1 10 0v12H7zM7 14h10M10 12h4",
  chart: "M4 20V10M10 20V4M16 20v-7M22 20H2",
  arrow: "M7 17L17 7M8 7h9v9",
};

function Icon({ name, size = 20 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={ICONS[name]} />
    </svg>
  );
}

const fill = (text, values) =>
  Object.entries(values).reduce(
    (result, [key, value]) => result.replace(`{${key}}`, value),
    text
  );

const formatBaht = (value) => `฿${value.toLocaleString("en-US")}`;

// ---------------------------------------------------------------
// 5) คอมโพเนนต์
// ---------------------------------------------------------------
function Chip({ active, onClick, children }) {
  return (
    <button
      type="button"
      className={`cs-chip${active ? " is-active" : ""}`}
      aria-pressed={active}
      onClick={onClick}
    >
      {children}
      {active ? " ✓" : ""}
    </button>
  );
}

function CourseCard({ course, t }) {
  const copy = t.courses[course.id];
  const groupTone = GROUPS.find((g) => g.id === course.group)?.tone;

  return (
    <article className="cs-card">
      <div className={`cs-card-media tone-${groupTone}`}>
        {course.image ? (
          <img src={course.image} alt={course.name} loading="lazy" />
        ) : (
          <span className="cs-card-media-icon">
            <Icon name={course.icon} size={44} />
          </span>
        )}
      </div>

      <div className="cs-card-body">
        <div className="cs-card-top">
          <span className={`cs-badge tone-${groupTone}`}>
            {fill(t.agesBadge, { a: course.ageLabel })}
          </span>
          <span className="cs-card-icon">
            <Icon name={course.icon} />
          </span>
        </div>

        <h3 className="cs-card-title">{course.name}</h3>
        <p className="cs-card-tagline">{copy.tagline}</p>

        <div className="cs-card-meta">
          <p className="cs-card-topics">{copy.topics}</p>
          <p>
            {course.format === "private"
              ? t.privateClass
              : fill(t.groupClass, { n: course.students })}
          </p>
          <p>
            {fill(t.sessionsLine, { s: course.sessions, m: course.minutes })}
          </p>
        </div>

        <div className="cs-card-price">
          <div>
            <strong>{formatBaht(course.price)}</strong>
            <span> {fill(t.perSessions, { s: course.sessions })}</span>
          </div>
          <Link
            className="cs-enroll"
            to={ROUTES.enroll}
            state={{ courseId: course.id }}
          >
            {t.enroll}
            <Icon name="arrow" size={14} />
          </Link>
        </div>

        <Link
          className="cs-outline-btn"
          to={ROUTES.trial}
          state={{ courseId: course.id }}
        >
          {t.trial}
        </Link>
      </div>
    </article>
  );
}

function Courses() {
  const [language, setLanguage] = useLanguage();
  const t = translations[language] || translations.en;

  const [ageFilter, setAgeFilter] = useState("all");
  const [interestFilter, setInterestFilter] = useState("all");

  const visibleCourses = useMemo(() => {
    const age = AGE_FILTERS.find((a) => a.id === ageFilter);

    return COURSES.filter((course) => {
      const ageOk =
        !age || age.id === "all" || (course.ageMin <= age.to && course.ageMax >= age.from);
      const interestOk =
        interestFilter === "all" || course.interests.includes(interestFilter);
      return ageOk && interestOk;
    });
  }, [ageFilter, interestFilter]);

  const resetFilters = () => {
    setAgeFilter("all");
    setInterestFilter("all");
  };

  return (
    <div className="cs-page">
      <SiteHeader language={language} onLanguageChange={setLanguage} />

      <main>
        {/* Hero */}
        <section className="cs-hero">
          <div className="cs-container cs-hero-inner">
            <div className="cs-hero-text">
              <p className="cs-eyebrow">{t.eyebrow}</p>
              <h1>{t.heroTitle}</h1>
              <p className="cs-hero-sub">{t.heroText}</p>
            </div>

            <aside className="cs-hero-card">
              <span className="cs-pill">{t.trialBadge}</span>
              <h2>{t.trialTitle}</h2>
              <p>{t.trialText}</p>
              <Link className="cs-primary-btn" to={ROUTES.trial}>
                {t.trialBtn}
                <Icon name="arrow" size={16} />
              </Link>
            </aside>
          </div>
        </section>

        {/* Filters + courses */}
        <section className="cs-container cs-listing">
          <div className="cs-filters">
            <div className="cs-filter-row">
              <span className="cs-filter-label">{t.ageRange}</span>
              {AGE_FILTERS.map((age) => (
                <Chip
                  key={age.id}
                  active={ageFilter === age.id}
                  onClick={() => setAgeFilter(age.id)}
                >
                  {age.id === "all" ? t.allAges : fill(t.ageOption, { a: age.id })}
                </Chip>
              ))}
            </div>

            <div className="cs-filter-row">
              <span className="cs-filter-label">{t.interests}</span>
              {INTERESTS.map((interest) => (
                <Chip
                  key={interest}
                  active={interestFilter === interest}
                  onClick={() => setInterestFilter(interest)}
                >
                  {interest === "all" ? t.all : t.interestNames[interest]}
                </Chip>
              ))}
            </div>
          </div>

          <div className="cs-result-bar">
            <p className="cs-result-count" aria-live="polite">
              {fill(t.resultCount, { n: visibleCourses.length })}
            </p>
            <p className="cs-price-note">{t.priceNote}</p>
          </div>

          {visibleCourses.length === 0 ? (
            <div className="cs-empty" role="status">
              <strong>{t.emptyTitle}</strong>
              <p>{t.emptyText}</p>
              <button type="button" className="cs-outline-btn" onClick={resetFilters}>
                {t.resetFilters}
              </button>
            </div>
          ) : (
            <div className="cs-groups">
              {GROUPS.map((group) => {
                const items = visibleCourses.filter((c) => c.group === group.id);
                if (items.length === 0) return null;

                return (
                  <div className="cs-group" key={group.id}>
                    <header className={`cs-group-head tone-${group.tone}`}>
                      <span>{t.groups[group.id].label}</span>
                      <h2>{t.groups[group.id].title}</h2>
                    </header>

                    {items.map((course) => (
                      <CourseCard key={course.id} course={course} t={t} />
                    ))}
                  </div>
                );
              })}
            </div>
          )}

          <div className="cs-notice" role="note">
            <Icon name="info" />
            <div>
              <strong>{t.noticeTitle}</strong>
              <p>{t.noticeText}</p>
            </div>
          </div>
        </section>

        {/* Packages */}
        <section className="cs-packages">
          <div className="cs-container">
            <p className="cs-eyebrow">{t.pkgEyebrow}</p>
            <h2 className="cs-section-title">{t.pkgTitle}</h2>
            <p className="cs-section-text">{t.pkgText}</p>

            <div className="cs-features">
              {[
                { icon: "calendar", title: t.feat1Title, text: t.feat1Text },
                { icon: "backpack", title: t.feat2Title, text: t.feat2Text },
                { icon: "chart", title: t.feat3Title, text: t.feat3Text },
              ].map((feature) => (
                <div className="cs-feature" key={feature.title}>
                  <Icon name={feature.icon} size={28} />
                  <h3>{feature.title}</h3>
                  <p>{feature.text}</p>
                </div>
              ))}
            </div>

            <div className="cs-steps">
              <div>
                <h3>{t.stepsTitle}</h3>
                <p>
                  1 {t.step1} &nbsp;→&nbsp; 2 {t.step2} &nbsp;→&nbsp; 3 {t.step3}
                </p>
              </div>
              <Link className="cs-primary-btn" to={ROUTES.trial}>
                {t.helpBtn}
                <Icon name="arrow" size={16} />
              </Link>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter language={language} />
    </div>
  );
}

export default Courses;
