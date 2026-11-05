import React, { useState } from "react";
import "../styles/GuestHome.css";

import SiteHeader from "../components/SiteHeader";
import SiteFooter from "../components/SiteFooter";
import useLanguage from "../lib/useLanguage";

// ================= ICONS =================

const stroke = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.9,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  "aria-hidden": true,
};

const IconUsers = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" {...stroke}>
    <circle cx="9" cy="8" r="3.5" />
    <path d="M2 20c0-3.5 3-6 7-6s7 2.5 7 6" />
    <path d="M17 5a3.5 3.5 0 010 7M22 20c0-3-2-5-5-5.5" />
  </svg>
);
const IconHeart = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" {...stroke}>
    <path d="M12 20s-8-5-8-11a4.5 4.5 0 018-2.5A4.5 4.5 0 0120 9c0 6-8 11-8 11z" />
  </svg>
);
const IconSpark = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" {...stroke}>
    <path d="M12 3l2 5 5 2-5 2-2 5-2-5-5-2 5-2z" />
  </svg>
);
const IconChat = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" {...stroke}>
    <path d="M21 12a8 8 0 01-11.5 7.2L4 21l1.8-5.5A8 8 0 1121 12z" />
  </svg>
);
const IconCheck = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" {...stroke} strokeWidth={2}>
    <circle cx="12" cy="12" r="10" />
    <path d="M8 12l3 3 5-6" />
  </svg>
);
const IconUser = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" {...stroke} strokeWidth={2}>
    <circle cx="12" cy="8" r="4" />
    <path d="M4 21c0-4 4-6 8-6s8 2 8 6" />
  </svg>
);
const IconBlocks = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" {...stroke} strokeWidth={1.8}>
    <rect x="3" y="3" width="8" height="8" rx="1.5" />
    <rect x="13" y="13" width="8" height="8" rx="1.5" />
    <rect x="13" y="3" width="8" height="8" rx="4" />
  </svg>
);
const IconPad = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" {...stroke} strokeWidth={1.8}>
    <rect x="2" y="6" width="20" height="13" rx="4" />
    <path d="M7 10v5M4.5 12.5h5" />
  </svg>
);
const IconRobot = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" {...stroke} strokeWidth={1.8}>
    <rect x="4" y="8" width="16" height="12" rx="3" />
    <path d="M12 8V4M9 13h.01M15 13h.01" />
  </svg>
);

// ================= STATIC (language-independent) =================

const featureIcons = [<IconUsers />, <IconHeart />, <IconSpark />, <IconChat />];
const courseMeta = [
  { icon: <IconBlocks />, pill: "", price: "฿6,000" },
  { icon: <IconPad />, pill: "gh-pill--lav", price: "฿7,500" },
  { icon: <IconRobot />, pill: "gh-pill--sun", price: "฿10,000" },
];
const courseTitles = ["LEGO SPIKE Essential", "LEGO SPIKE Prime", "Roblox Game Maker"];
const stageMods = ["", "gh-stage--sun", "gh-stage--lav"];
const workTags = ["LEGO Robotics", "Scratch & Game Design", "Roblox"];

// ================= TRANSLATIONS =================
// (header/footer text lives in lib/siteText.js)

const translations = {
  th: {
    badge: "Small Ideas, Big Possibilities",
    heroTitle: "จินตนาการ\nเขียนโค้ด\nสร้างสรรค์",
    heroLead: "ไอเดียของเขา โลกของเขา",
    heroText:
      "โรงเรียนสอนโค้ดดิ้งที่ช่วยให้เด็ก ๆ เปลี่ยนจินตนาการเป็นผลงานจริง ผ่านการเขียนโค้ด หุ่นยนต์ การออกแบบเกม และ AI",
    bookTrial: "จองทดลองเรียนฟรี",
    explore: "สำรวจคอร์สเรียน",
    heroNote: "ทดลองเรียนฟรี 1 คลาส • 45 นาที • ไม่มีข้อผูกมัด",
    floatTitle: "คลาสเล็ก ไอเดียใหญ่",
    floatText: "กลุ่มเล็ก ทุกไอเดียมีความหมาย",
    features: [
      { title: "นักเรียน 4–8 คนต่อกลุ่ม", text: "เด็กทุกคนได้ลงมือสร้างสรรค์" },
      { title: "ครูที่เข้าใจเด็ก", text: "ชวนคิดและค้นหาคำตอบ ไม่ใช่แค่บอกคำตอบ" },
      { title: "เล่นเพื่อเรียนรู้ เรียนรู้ด้วยการลงมือทำ", text: "เลื่อนจอน้อยลง สร้างสรรค์มากขึ้น" },
      { title: "รายงานความก้าวหน้าสำหรับผู้ปกครอง", text: "สรุปพัฒนาการการเรียนรู้" },
    ],
    introEyebrow: "HELLO, LITTLE THINKERS",
    introTitle: "ที่ที่ความอยากรู้อยากเห็นสร้างความเป็นไปได้",
    introText:
      "DigiWorld คือโรงเรียนที่ไอเดียยิ่งใหญ่เริ่มต้นจากคำถามง่าย ๆ ว่า “ถ้า…แล้วจะเป็นอย่างไร?” ผ่านการเขียนโค้ด เกม และโปรเจกต์ที่ลงมือทำจริง เด็ก ๆ ได้ฝึกคิดวิเคราะห์ สื่อสารไอเดีย และสร้างผลงานของตัวเองให้เกิดขึ้นจริง",
    pills: ["ไม่ต้องมีพื้นฐาน", "เรียนตามจังหวะของตัวเอง", "สร้างผลงานจริง"],
    coursesEyebrow: "FIND THEIR FIRST SPARK",
    coursesTitle: "เริ่มจากสิ่งที่เขารัก",
    coursesSub: "คอร์สยอดนิยมสำหรับเด็กช่างสงสัย",
    viewAllCourses: "ดูทั้ง 7 คอร์ส",
    viewCourse: "ดูรายละเอียดคอร์ส",
    coursesNote: "ตัวอย่างราคาสำหรับ 8 คลาส · เกณฑ์อายุแตกต่างกันตามคอร์ส",
    courseList: [
      { age: "อายุ 4 ปีขึ้นไป", desc: "สำรวจ ต่อ และค้นพบพื้นฐานการเขียนโค้ดและการคิดเชิงตรรกะผ่านโปรเจกต์ LEGO สนุก ๆ", sessions: "8 คลาส" },
      { age: "อายุ 7 ปีขึ้นไป", desc: "ต่อและเขียนโปรแกรมหุ่นยนต์ พร้อมพัฒนาการคิดเชิงตรรกะและการแก้ปัญหา", sessions: "8 คลาส" },
      { age: "อายุ 8 ปีขึ้นไป", desc: "สร้างเกม Roblox ของตัวเอง พร้อมเรียนรู้การเขียนโค้ด การออกแบบเกม และการแก้ปัญหา", sessions: "12 คลาส" },
    ],
    playEyebrow: "PLAY → THINK → CREATE",
    playTitle: "การเรียนรู้เริ่มจากการเล่น",
    playSub: "กิจกรรมที่ออกแบบให้เหมาะกับช่วงความสนใจและพัฒนาการของแต่ละช่วงวัย",
    steps: [
      { title: "เริ่มอยากรู้", text: "เริ่มด้วยเรื่องเล่า ปริศนา และคำถามที่จุดประกายความอยากรู้ ชวนเด็ก ๆ ออกสำรวจการเขียนโค้ด" },
      { title: "ลอง ทดสอบ และเรียนรู้", text: "ครูชวนคิดด้วยคำถาม ให้เด็กกล้าทดลอง เรียนรู้จากความผิดพลาด และหาวิธีแก้ปัญหาด้วยตัวเอง" },
      { title: "สร้างและแบ่งปัน", text: "ทำโปรเจกต์ขนาดเล็ก แล้วนำเสนอไอเดียและอธิบายว่าผลงานทำงานอย่างไร" },
    ],
    stagesEyebrow: "GROW AT THEIR OWN PACE",
    stagesTitle: "เติบโตในทุกช่วงวัย",
    stagesSub: "เริ่มจากการคิดเชิงตรรกะ แล้วต่อยอดสู่การพัฒนาเกม หุ่นยนต์ และภาษาโปรแกรม",
    stages: [
      { age: "อายุ 3+", title: "นักสำรวจตัวน้อย", text: "Coding for Kids · คณิตศาสตร์และตรรกะ" },
      { age: "อายุ 4+", title: "นักสร้างสรรค์", text: "LEGO Robotics · Scratch และการออกแบบเกม" },
      { age: "อายุ 8+", title: "นักสร้างแห่งอนาคต", text: "Roblox Game Maker · เขียนโปรแกรม Python" },
    ],
    workEyebrow: "MADE BY LITTLE BIG MINDS",
    workTitle: "ดูสิว่าเขาสร้างอะไรได้บ้าง!",
    workSub: "จาก “ทำได้ไหมนะ?” สู่ “หนูทำเองได้!”",
    viewAllWork: "ชมผลงานทั้งหมด ↗",
    works: [
      { who: "มะลิ • 5 ปี", title: "หุ่นยนต์ส่งของจิ๋ว" },
      { who: "ปุณณ์ • 9 ปี", title: "เจ้ากระต่ายเก็บดาว" },
      { who: "นานา • 7 ปี", title: "Obby" },
    ],
    reviewsEyebrow: "PARENTS SEE THE DIFFERENCE",
    reviewsTitle: "ความมั่นใจเล็ก ๆ ที่พ่อแม่มองเห็น",
    reviewsSub: "เสียงจากครอบครัว Little Loop • รีวิวตัวอย่างสำหรับเว็บไซต์แนวคิด",
    reviews: [
      { quote: "จากที่ไม่กล้าเล่าไอเดีย ตอนนี้มะลิกลับมาอธิบายให้แม่ฟังว่าทำไมผึ้งต้องเลี้ยวซ้าย ภูมิใจมากค่ะ", name: "คุณแอน • คุณแม่ของมะลิ", meta: "Coding for Kids · 5 ปี" },
      { quote: "ลูกตั้งตารอวันเสาร์ เพราะได้ทำเกมของตัวเอง ครูไม่ได้ให้แค่คำตอบ แต่ช่วยให้เขาคิดหาวิธีใหม่", name: "คุณต้น • คุณพ่อของปุณณ์", meta: "Scratch & Game Design · 9 ปี" },
      { quote: "คลาสกลุ่มเล็กทำให้ครูดูแลทั่วถึง ชอบที่รู้ว่าลูกเรียนอะไร และจองรอบเรียนได้สะดวกค่ะ", name: "คุณฝน • คุณแม่ของนานา", meta: "LEGO Robotics · 7 ปี" },
    ],
    faqEyebrow: "A LITTLE CLARITY",
    faqTitle: "ผู้ปกครองถาม เราตอบ",
    faqSub: "เริ่มต้นอย่างมั่นใจ ค้นพบโลกของการเขียนโค้ด",
    talkToTeam: "คุยกับทีมงาน",
    faqs: [
      {
        q: "ลูกเรียนโค้ดได้ไหม ถ้ายังอ่านหนังสือไม่คล่อง?",
        a: "ได้ค่ะ! คอร์สสำหรับอายุ 4–6 ปีใช้ภาพ การเล่าเรื่อง และกิจกรรมที่ไม่ใช้หน้าจอ เพื่อแนะนำแนวคิดการเขียนโค้ด เด็กไม่ต้องอ่านคล่องหรือมีประสบการณ์ใช้คอมพิวเตอร์มาก่อน",
      },
      { q: "ต้องเตรียมอะไรสำหรับคลาสทดลองเรียน?", a: "[ใส่คำตอบ]" },
      { q: "เปลี่ยนหรือยกเลิกการจองได้ไหม?", a: "[ใส่คำตอบ]" },
      { q: "ผู้ปกครองติดตามความก้าวหน้าของลูกได้อย่างไร?", a: "[ใส่คำตอบ]" },
    ],
    ctaEyebrow: "THEIR NEXT BIG IDEA STARTS HERE",
    ctaTitle: "ให้ความอยากรู้พาเขาไปได้ไกลกว่าเดิม",
    ctaText: "“เล่น สำรวจ และทำความรู้จักครูของเรา” ทดลองเรียนฟรี 45 นาที",
    ctaNote: "ฟรีทั้งหมด · ไม่มีข้อผูกมัด",
  },

  en: {
    badge: "Small Ideas, Big Possibilities",
    heroTitle: "Imagine\nCode\nInnovate",
    heroLead: "Their Ideas, Their World",
    heroText:
      "A coding school where kids turn imagination into real creations through Coding, Robotics, Game Design, and AI.",
    bookTrial: "Book a Free Trial",
    explore: "Explore Our Courses",
    heroNote: "1 Free Trial Class • 45 Minutes • No Commitment",
    floatTitle: "Small class. Big ideas.",
    floatText: "Small Groups, Every Idea Matters.",
    features: [
      { title: "4–8 Students per Group", text: "Every Child Gets a Chance to Create" },
      { title: "Teachers Who Understand", text: "Guiding Young Minds, Not Just Giving Answers" },
      { title: "Play to Learn, Learn by Doing", text: "Less Scrolling, More Creating" },
      { title: "Progress Updates for Parents", text: "Learning Progress Reports" },
    ],
    introEyebrow: "HELLO, LITTLE THINKERS",
    introTitle: "A place where curiosity creates possibilities",
    introText:
      "DigiWorld is a learning school where big ideas begin with a simple question: “What if?” Through coding, games, and hands-on projects, children learn to think critically, express their ideas, and bring their own creations to life.",
    pills: ["No Experience Needed", "Learn at Their Own Pace", "Create Something Real"],
    coursesEyebrow: "FIND THEIR FIRST SPARK",
    coursesTitle: "Start with What They Love",
    coursesSub: "Popular Courses for Curious Minds",
    viewAllCourses: "View All 7 Courses",
    viewCourse: "View Course",
    coursesNote: "Sample pricing for 8 classes · Age requirements vary by course",
    courseList: [
      { age: "For Ages 4 and Up", desc: "Explore, build, and discover the basics of coding and logical thinking through playful LEGO projects", sessions: "8 Sessions" },
      { age: "For Ages 7 and Up", desc: "Build and program robots while developing logical thinking and problem-solving skills", sessions: "8 Sessions" },
      { age: "For Ages 8 and Up", desc: "Create your own Roblox games while learning coding, game design, and problem-solving", sessions: "12 Sessions" },
    ],
    playEyebrow: "PLAY → THINK → CREATE",
    playTitle: "Learning Starts with Play",
    playSub: "Activities tailored to each age group’s attention span and developmental stage",
    steps: [
      { title: "Get Curious", text: "Start with stories, puzzles, and questions that spark curiosity and inspire kids to explore coding" },
      { title: "Try, Test & Learn", text: "Teachers guide with questions, encouraging kids to experiment, learn from mistakes, and find their own solutions." },
      { title: "Create & Share", text: "Build a mini project, then share the idea and explain how it works to others." },
    ],
    stagesEyebrow: "GROW AT THEIR OWN PACE",
    stagesTitle: "Grow at Every Stage",
    stagesSub: "Begin with logical thinking, then explore game development, robotics, and programming languages.",
    stages: [
      { age: "Ages 3+", title: "Little explorers", text: "Coding for Kids · Math & Logic" },
      { age: "Ages 4+", title: "Creative builders", text: "LEGO Robotics · Scratch & Game Design" },
      { age: "Ages 8+", title: "Future makers", text: "Roblox Game Maker · Python Programming" },
    ],
    workEyebrow: "MADE BY LITTLE BIG MINDS",
    workTitle: "Look What They Can Make!",
    workSub: "From “Can I do it?” to “I did it myself!”",
    viewAllWork: "View All Creations ↗",
    works: [
      { who: "Mali • 5 yrs", title: "Tiny Delivery Robot" },
      { who: "Punn • 9 yrs", title: "The Bunny Who Collects Stars" },
      { who: "Nana • 7 yrs", title: "Obby" },
    ],
    reviewsEyebrow: "PARENTS SEE THE DIFFERENCE",
    reviewsTitle: "The Small Confidence Parents Notice",
    reviewsSub: "Voices from Little Loop families • Sample reviews for a concept website",
    reviews: [
      { quote: "Mali used to be shy about sharing ideas. Now Mali comes home and explains why the bee has to turn left. So proud!", name: "Ann • Mali’s mom", meta: "Coding for Kids · 5 yrs" },
      { quote: "My child looks forward to Saturdays because they get to make their own game. The teacher doesn’t just give answers — they help find new ways.", name: "Ton • Punn’s dad", meta: "Scratch & Game Design · 9 yrs" },
      { quote: "The small class means the teacher can look after everyone. I like knowing what my child is learning, and booking sessions is easy.", name: "Fon • Nana’s mom", meta: "LEGO Robotics · 7 yrs" },
    ],
    faqEyebrow: "A LITTLE CLARITY",
    faqTitle: "Parents Ask, We Answer",
    faqSub: "Start with Confidence, Discover the World of Coding.",
    talkToTeam: "Talk to Our Team",
    faqs: [
      {
        q: "Can My Child Learn Coding Before They Can Read Fluently?",
        a: "Yes! Our courses for ages 4–6 use visuals, storytelling, and screen-free activities to introduce coding concepts. Children don’t need to read fluently or have any computer experience to get started.",
      },
      { q: "What Should We Prepare for a Trial Class?", a: "[Add answer]" },
      { q: "Can We Change or Cancel a Booking?", a: "[Add answer]" },
      { q: "How Can Parents Track Their Child’s Progress?", a: "[Add answer]" },
    ],
    ctaEyebrow: "THEIR NEXT BIG IDEA STARTS HERE",
    ctaTitle: "Let Curiosity Take Them Further",
    ctaText: "“Play, Explore, and Get to Know Our Teachers.” Enjoy a Free 45-Minute Trial Class",
    ctaNote: "Completely Free · No Commitment",
  },

  zh: {
    badge: "Small Ideas, Big Possibilities",
    heroTitle: "想象\n编程\n创新",
    heroLead: "他们的创意，他们的世界",
    heroText: "一所让孩子通过编程、机器人、游戏设计和 AI，把想象变成真实作品的编程学校。",
    bookTrial: "预约免费试听",
    explore: "探索课程",
    heroNote: "免费试听 1 节 • 45 分钟 • 无需承诺",
    floatTitle: "小班教学，大创意",
    floatText: "小组学习，每个想法都被重视",
    features: [
      { title: "每组 4–8 名学生", text: "每个孩子都有创作机会" },
      { title: "懂孩子的老师", text: "引导思考，而不只是给出答案" },
      { title: "在玩中学，在做中学", text: "少刷屏幕，多动手创作" },
      { title: "家长学习进度反馈", text: "学习进度报告" },
    ],
    introEyebrow: "HELLO, LITTLE THINKERS",
    introTitle: "好奇心创造无限可能的地方",
    introText:
      "DigiWorld 是一所学习型学校，伟大的想法始于一个简单的问题：“如果……会怎样？”通过编程、游戏和动手项目，孩子们学会批判性思考、表达想法，并让自己的创作变为现实。",
    pills: ["无需基础", "按自己的节奏学习", "创造真实作品"],
    coursesEyebrow: "FIND THEIR FIRST SPARK",
    coursesTitle: "从他们喜欢的开始",
    coursesSub: "为好奇的孩子精选的热门课程",
    viewAllCourses: "查看全部 7 门课程",
    viewCourse: "查看课程",
    coursesNote: "8 节课示例价格 · 各课程年龄要求不同",
    courseList: [
      { age: "4 岁及以上", desc: "通过有趣的乐高项目，探索并学习编程和逻辑思维的基础", sessions: "8 节课" },
      { age: "7 岁及以上", desc: "搭建并编程机器人，同时培养逻辑思维和解决问题的能力", sessions: "8 节课" },
      { age: "8 岁及以上", desc: "制作你自己的 Roblox 游戏，同时学习编程、游戏设计和解决问题", sessions: "12 节课" },
    ],
    playEyebrow: "PLAY → THINK → CREATE",
    playTitle: "学习从玩开始",
    playSub: "活动根据各年龄段的注意力和发展阶段量身设计",
    steps: [
      { title: "激发好奇", text: "从故事、谜题和问题开始，点燃好奇心，激励孩子探索编程" },
      { title: "尝试、测试与学习", text: "老师用提问引导，鼓励孩子动手实验、从错误中学习并找到自己的解决办法。" },
      { title: "创作与分享", text: "完成一个小项目，然后向大家分享创意并讲解它是如何运作的。" },
    ],
    stagesEyebrow: "GROW AT THEIR OWN PACE",
    stagesTitle: "每个阶段都在成长",
    stagesSub: "从逻辑思维起步，再探索游戏开发、机器人和编程语言。",
    stages: [
      { age: "3 岁+", title: "小小探索家", text: "儿童编程 · 数学与逻辑" },
      { age: "4 岁+", title: "创意搭建师", text: "乐高机器人 · Scratch 与游戏设计" },
      { age: "8 岁+", title: "未来创客", text: "Roblox 游戏制作 · Python 编程" },
    ],
    workEyebrow: "MADE BY LITTLE BIG MINDS",
    workTitle: "看看他们能做出什么！",
    workSub: "从“我能做到吗？”到“我自己做到了！”",
    viewAllWork: "查看全部作品 ↗",
    works: [
      { who: "Mali • 5 岁", title: "迷你送货机器人" },
      { who: "Punn • 9 岁", title: "收集星星的小兔子" },
      { who: "Nana • 7 岁", title: "Obby" },
    ],
    reviewsEyebrow: "PARENTS SEE THE DIFFERENCE",
    reviewsTitle: "家长看得到的小小自信",
    reviewsSub: "来自 Little Loop 家庭的声音 • 概念网站示例评价",
    reviews: [
      { quote: "以前不敢分享想法，现在 Mali 会回来向妈妈解释为什么小蜜蜂要向左转，我太骄傲了。", name: "Ann • Mali 的妈妈", meta: "Coding for Kids · 5 岁" },
      { quote: "孩子每周六都在期待，因为能做自己的游戏。老师不只是给答案，而是帮孩子想出新办法。", name: "Ton • Punn 的爸爸", meta: "Scratch & Game Design · 9 岁" },
      { quote: "小班让老师能照顾到每个孩子。我喜欢能知道孩子学了什么，预约课程也很方便。", name: "Fon • Nana 的妈妈", meta: "LEGO Robotics · 7 岁" },
    ],
    faqEyebrow: "A LITTLE CLARITY",
    faqTitle: "家长提问，我们解答",
    faqSub: "自信开始，探索编程世界。",
    talkToTeam: "联系我们的团队",
    faqs: [
      {
        q: "孩子还不能流利阅读，可以学编程吗？",
        a: "可以！我们面向 4–6 岁的课程使用图像、故事和无屏幕活动来介绍编程概念。孩子无需流利阅读，也无需任何电脑经验即可开始。",
      },
      { q: "试听课需要准备什么？", a: "[请填写回答]" },
      { q: "可以更改或取消预约吗？", a: "[请填写回答]" },
      { q: "家长如何跟踪孩子的学习进度？", a: "[请填写回答]" },
    ],
    ctaEyebrow: "THEIR NEXT BIG IDEA STARTS HERE",
    ctaTitle: "让好奇心带他们走得更远",
    ctaText: "“玩耍、探索，并认识我们的老师。”免费体验 45 分钟试听课",
    ctaNote: "完全免费 · 无需承诺",
  },

  ru: {
    badge: "Small Ideas, Big Possibilities",
    heroTitle: "Фантазируй\nПрограммируй\nСоздавай",
    heroLead: "Их идеи, их мир",
    heroText:
      "Школа программирования, где дети превращают воображение в настоящие проекты: кодинг, робототехника, геймдизайн и ИИ.",
    bookTrial: "Записаться на пробное занятие",
    explore: "Смотреть курсы",
    heroNote: "1 бесплатное занятие • 45 минут • Без обязательств",
    floatTitle: "Маленькая группа. Большие идеи.",
    floatText: "Малые группы, внимание к каждой идее",
    features: [
      { title: "4–8 учеников в группе", text: "Каждый ребёнок успевает творить" },
      { title: "Педагоги, которые понимают детей", text: "Направляют, а не просто дают ответы" },
      { title: "Учимся играя, учимся делая", text: "Меньше экрана, больше творчества" },
      { title: "Отчёты о прогрессе для родителей", text: "Отчёты об успехах в обучении" },
    ],
    introEyebrow: "HELLO, LITTLE THINKERS",
    introTitle: "Место, где любопытство открывает возможности",
    introText:
      "DigiWorld — школа, где большие идеи начинаются с простого вопроса: «А что, если?» Через программирование, игры и практические проекты дети учатся мыслить критически, выражать идеи и воплощать свои замыслы в жизнь.",
    pills: ["Опыт не нужен", "Учимся в своём темпе", "Создаём настоящее"],
    coursesEyebrow: "FIND THEIR FIRST SPARK",
    coursesTitle: "Начните с того, что им нравится",
    coursesSub: "Популярные курсы для любознательных",
    viewAllCourses: "Все 7 курсов",
    viewCourse: "О курсе",
    coursesNote: "Пример цены за 8 занятий · Возрастные ограничения зависят от курса",
    courseList: [
      { age: "От 4 лет", desc: "Изучайте, стройте и знакомьтесь с основами программирования и логики через увлекательные проекты LEGO", sessions: "8 занятий" },
      { age: "От 7 лет", desc: "Стройте и программируйте роботов, развивая логику и умение решать задачи", sessions: "8 занятий" },
      { age: "От 8 лет", desc: "Создавайте собственные игры в Roblox, изучая программирование, геймдизайн и решение задач", sessions: "12 занятий" },
    ],
    playEyebrow: "PLAY → THINK → CREATE",
    playTitle: "Обучение начинается с игры",
    playSub: "Занятия подобраны под внимание и этап развития каждого возраста",
    steps: [
      { title: "Пробуждаем любопытство", text: "Начинаем с историй, загадок и вопросов, которые будят интерес и вдохновляют исследовать программирование" },
      { title: "Пробуем, проверяем, учимся", text: "Педагоги направляют вопросами, поощряя эксперименты, учёбу на ошибках и поиск собственных решений." },
      { title: "Создаём и делимся", text: "Делаем мини-проект, затем рассказываем об идее и объясняем, как он работает." },
    ],
    stagesEyebrow: "GROW AT THEIR OWN PACE",
    stagesTitle: "Растём на каждом этапе",
    stagesSub: "Начинаем с логического мышления, затем осваиваем разработку игр, робототехнику и языки программирования.",
    stages: [
      { age: "3+ лет", title: "Маленькие исследователи", text: "Программирование для детей · Математика и логика" },
      { age: "4+ лет", title: "Юные конструкторы", text: "LEGO Robotics · Scratch и геймдизайн" },
      { age: "8+ лет", title: "Создатели будущего", text: "Roblox Game Maker · Python" },
    ],
    workEyebrow: "MADE BY LITTLE BIG MINDS",
    workTitle: "Смотрите, что они создали!",
    workSub: "От «Смогу ли я?» до «Я сделал сам!»",
    viewAllWork: "Все работы ↗",
    works: [
      { who: "Мали • 5 лет", title: "Маленький робот-курьер" },
      { who: "Пунн • 9 лет", title: "Заяц, собирающий звёзды" },
      { who: "Нана • 7 лет", title: "Obby" },
    ],
    reviewsEyebrow: "PARENTS SEE THE DIFFERENCE",
    reviewsTitle: "Маленькая уверенность, которую видят родители",
    reviewsSub: "Голоса семей Little Loop • примерные отзывы для концепт-сайта",
    reviews: [
      { quote: "Раньше было страшно делиться идеями, а теперь Мали приходит домой и объясняет, почему пчела должна повернуть налево. Очень горжусь!", name: "Энн • мама Мали", meta: "Coding for Kids · 5 лет" },
      { quote: "Ребёнок ждёт субботы, ведь он делает собственную игру. Педагог не просто даёт ответы, а помогает найти новый путь.", name: "Тон • папа Пунна", meta: "Scratch и геймдизайн · 9 лет" },
      { quote: "В маленькой группе педагог успевает уделить внимание каждому. Нравится, что я знаю, чему учится ребёнок, и записаться удобно.", name: "Фон • мама Наны", meta: "LEGO Robotics · 7 лет" },
    ],
    faqEyebrow: "A LITTLE CLARITY",
    faqTitle: "Родители спрашивают — мы отвечаем",
    faqSub: "Начните уверенно и откройте мир программирования.",
    talkToTeam: "Связаться с командой",
    faqs: [
      {
        q: "Может ли ребёнок учиться программированию, если ещё не читает бегло?",
        a: "Да! В курсах для детей 4–6 лет мы знакомим с понятиями программирования через картинки, истории и занятия без экрана. Бегло читать и иметь опыт работы с компьютером не нужно.",
      },
      { q: "Что подготовить к пробному занятию?", a: "[Добавьте ответ]" },
      { q: "Можно ли изменить или отменить запись?", a: "[Добавьте ответ]" },
      { q: "Как родители могут следить за прогрессом ребёнка?", a: "[Добавьте ответ]" },
    ],
    ctaEyebrow: "THEIR NEXT BIG IDEA STARTS HERE",
    ctaTitle: "Пусть любопытство ведёт их дальше",
    ctaText: "«Играйте, исследуйте и познакомьтесь с нашими педагогами». Бесплатное пробное занятие — 45 минут",
    ctaNote: "Совершенно бесплатно · Без обязательств",
  },
};

// ================= HELPERS =================

const Lines = ({ text }) =>
  text.split("\n").map((line, index, all) => (
    <React.Fragment key={index}>
      {line}
      {index < all.length - 1 && <br />}
    </React.Fragment>
  ));

// ================= COMPONENT =================

function GuestHome() {
  const [language, setLanguage] = useLanguage();
  const t = translations[language];
  const [openFaq, setOpenFaq] = useState(0);

  return (
    <>
      <SiteHeader language={language} onLanguageChange={setLanguage} />

      <div className="gh" lang={language} id="top">
        {/* ================= HERO ================= */}

        <section className="gh-hero">
          <div className="gh-hero-copy">
            <span className="gh-hero-badge">{t.badge}</span>
            <h1 className="gh-hero-title"><Lines text={t.heroTitle} /></h1>
            <p className="gh-hero-lead">{t.heroLead}</p>
            <p className="gh-hero-text">{t.heroText}</p>
            <div className="gh-row">
              <a href="/booking" className="gh-btn gh-btn--primary">{t.bookTrial}</a>
              <a href="/courses" className="gh-btn">{t.explore}</a>
            </div>
            <div className="gh-hero-note">
              <IconCheck />
              <span>{t.heroNote}</span>
            </div>
          </div>

          <div className="gh-hero-media">
            <img className="gh-hero-img" src="https://placehold.co/608x484" alt="Digiworld Coding and Creative Learning" />
            <div className="gh-float">
              <div className="gh-float-icon"><IconSpark size={24} /></div>
              <div>
                <strong>{t.floatTitle}</strong>
                <span>{t.floatText}</span>
              </div>
            </div>
            <div className="gh-spark"><IconSpark size={28} /></div>
          </div>
        </section>

        {/* ================= FEATURE STRIP ================= */}

        <section className="gh-strip">
          {t.features.map((f, i) => (
            <div className="gh-strip-item" key={f.title}>
              <div className="gh-iconbox" style={{ color: "var(--blue)" }}>{featureIcons[i]}</div>
              <div>
                <strong>{f.title}</strong>
                <span>{f.text}</span>
              </div>
            </div>
          ))}
        </section>

        {/* ================= INTRO ================= */}

        <section className="gh-section gh-intro">
          <div className="gh-intro-head">
            <span className="gh-eyebrow">{t.introEyebrow}</span>
            <h2 className="gh-h2">{t.introTitle}</h2>
          </div>
          <div className="gh-intro-body">
            <p>{t.introText}</p>
            <div className="gh-row" style={{ gap: 10 }}>
              <span className="gh-pill">{t.pills[0]}</span>
              <span className="gh-pill gh-pill--mint">{t.pills[1]}</span>
              <span className="gh-pill gh-pill--sun">{t.pills[2]}</span>
            </div>
          </div>
        </section>

        {/* ================= COURSES ================= */}

        <section className="gh-section gh-courses" id="courses">
          <div className="gh-head">
            <div className="gh-head-text">
              <span className="gh-eyebrow">{t.coursesEyebrow}</span>
              <h2 className="gh-h2">{t.coursesTitle}</h2>
              <p className="gh-sub">{t.coursesSub}</p>
            </div>
            <a href="/courses" className="gh-btn">{t.viewAllCourses}</a>
          </div>

          <div className="gh-cards">
            {t.courseList.map((c, i) => (
              <article className="gh-card" key={courseTitles[i]}>
                <img className="gh-card-img" src="https://placehold.co/411x214" alt={courseTitles[i]} />
                <div className="gh-card-body">
                  <div className="gh-card-top">
                    <span className={`gh-pill ${courseMeta[i].pill}`}>{c.age}</span>
                    <span style={{ color: "var(--blue)", display: "flex" }}>{courseMeta[i].icon}</span>
                  </div>
                  <h3 className="gh-card-title">{courseTitles[i]}</h3>
                  <p className="gh-card-desc">{c.desc}</p>
                  <div className="gh-card-foot">
                    <div className="gh-price">
                      {courseMeta[i].price} <small>/ {c.sessions}</small>
                    </div>
                    <a href="/courses" className="gh-link">{t.viewCourse}</a>
                  </div>
                </div>
              </article>
            ))}
          </div>

          <p className="gh-footnote">{t.coursesNote}</p>
        </section>

        {/* ================= LEARNING STARTS WITH PLAY ================= */}

        <section className="gh-play">
          <img className="gh-play-img" src="https://placehold.co/550x470" alt={t.playTitle} />
          <div className="gh-play-body">
            <div className="gh-head-text">
              <span className="gh-eyebrow">{t.playEyebrow}</span>
              <h2 className="gh-h2">{t.playTitle}</h2>
              <p className="gh-sub">{t.playSub}</p>
            </div>
            {t.steps.map((s, i) => (
              <div className="gh-step" key={s.title}>
                <div className="gh-step-no">{`0${i + 1}`}</div>
                <div>
                  <strong>{s.title}</strong>
                  <p>{s.text}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ================= STAGES ================= */}

        <section className="gh-stages">
          <div className="gh-head-text">
            <span className="gh-eyebrow">{t.stagesEyebrow}</span>
            <h2 className="gh-h2">{t.stagesTitle}</h2>
            <p className="gh-sub">{t.stagesSub}</p>
          </div>
          <div className="gh-stage-row">
            {t.stages.map((s, i) => (
              <div className={`gh-stage ${stageMods[i]}`} key={s.title}>
                <small>{s.age}</small>
                <strong>{s.title}</strong>
                <span>{s.text}</span>
              </div>
            ))}
          </div>
        </section>

        {/* ================= STUDENT WORK ================= */}

        <section className="gh-work">
          <div className="gh-head">
            <div className="gh-head-text">
              <span className="gh-eyebrow">{t.workEyebrow}</span>
              <h2 className="gh-h2">{t.workTitle}</h2>
              <p className="gh-sub">{t.workSub}</p>
            </div>
            <a href="/gallery" className="gh-link">{t.viewAllWork}</a>
          </div>
          <div className="gh-cards">
            {t.works.map((w, i) => (
              <div className="gh-work-item" key={w.title}>
                <img className="gh-work-img" src="https://placehold.co/411x238" alt={w.title} />
                <div className="gh-work-meta">
                  <span className="gh-pill">{workTags[i]}</span>
                  <span>{w.who}</span>
                </div>
                <h3 className="gh-work-title">{w.title}</h3>
              </div>
            ))}
          </div>
        </section>

        {/* ================= REVIEWS ================= */}

        <section className="gh-section gh-reviews">
          <div className="gh-head-text">
            <span className="gh-eyebrow">{t.reviewsEyebrow}</span>
            <h2 className="gh-h2">{t.reviewsTitle}</h2>
            <p className="gh-sub">{t.reviewsSub}</p>
          </div>

          <div className="gh-cards">
            {t.reviews.map((r) => (
              <figure className="gh-review" key={r.name}>
                <div>
                  <div className="gh-stars" aria-label="5 stars">★★★★★</div>
                  <blockquote>{r.quote}</blockquote>
                </div>
                <figcaption>
                  <div className="gh-avatar" aria-hidden="true">
                    <IconUser />
                  </div>
                  <div>
                    <strong>{r.name}</strong>
                    <span>{r.meta}</span>
                  </div>
                </figcaption>
              </figure>
            ))}
          </div>
        </section>

        {/* ================= FAQ ================= */}

        <section className="gh-faq">
          <div className="gh-faq-side">
            <div className="gh-head-text">
              <span className="gh-eyebrow">{t.faqEyebrow}</span>
              <h2 className="gh-h2">{t.faqTitle}</h2>
              <p className="gh-sub">{t.faqSub}</p>
            </div>
            <a href="https://line.me/R/ti/p/@digiworldphuket" className="gh-btn">{t.talkToTeam}</a>
          </div>

          <div className="gh-faq-list">
            {t.faqs.map((f, i) => {
              const open = openFaq === i;
              return (
                <div className="gh-faq-item" key={i}>
                  <button
                    type="button"
                    className="gh-faq-q"
                    aria-expanded={open}
                    onClick={() => setOpenFaq(open ? -1 : i)}
                  >
                    <span style={{ flex: 1 }}>{f.q}</span>
                    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="#2864D7" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
                      <path d={open ? "M4 9h10" : "M4 9h10M9 4v10"} />
                    </svg>
                  </button>
                  {open && <p className="gh-faq-a">{f.a}</p>}
                </div>
              );
            })}
          </div>
        </section>

        {/* ================= CTA ================= */}

        <section className="gh-cta">
          <div className="gh-cta-text">
            <span className="gh-eyebrow">{t.ctaEyebrow}</span>
            <h2 className="gh-h2">{t.ctaTitle}</h2>
            <p className="gh-sub">{t.ctaText}</p>
          </div>
          <div className="gh-cta-action">
            <a href="/booking" className="gh-btn gh-btn--primary">{t.bookTrial}</a>
            <span>{t.ctaNote}</span>
          </div>
        </section>
      </div>

      <SiteFooter language={language} />
    </>
  );
}

export default GuestHome;
