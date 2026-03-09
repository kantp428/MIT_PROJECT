import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getPM25Constant } from "@/lib/utils";
import {
  Activity,
  ArrowUpRight,
  CircleAlert,
  Clock3,
  CloudSun,
  HeartPulse,
  Leaf,
  ShieldCheck,
  Wind,
} from "lucide-react";
import Link from "next/link";

const pmSources = [
  {
    name: "การจราจร",
    description:
      "ไอเสียจากรถยนต์โดยเฉพาะเครื่องยนต์ดีเซล และฝุ่นจากการสึกหรอของผ้าเบรกหรือยางรถ",
    average: "พบสูงใกล้ถนนและช่วงเวลาเร่งด่วน",
    unit: "แหล่งกำเนิดหลัก",
  },
  {
    name: "การเผาไหม้",
    description:
      "การเผาในที่โล่ง ไฟป่า การเผาเศษวัสดุเกษตร และการเผาไหม้เชื้อเพลิงในภาคครัวเรือน",
    average: "มีผลชัดในฤดูแล้งและวันที่อากาศนิ่ง",
    unit: "แหล่งกำเนิดหลัก",
  },
  {
    name: "อุตสาหกรรม",
    description:
      "กระบวนการผลิต การเผาเชื้อเพลิง และฝุ่นจากกิจกรรมหน้างานในโรงงานหรือไซต์ก่อสร้าง",
    average: "พบสูงในเขตเมืองและพื้นที่อุตสาหกรรม",
    unit: "แหล่งกำเนิดหลัก",
  },

];

const pmLevels = [
  {
    range: "0 - 15.0",
    value: 10,
    advice: "เหมาะสำหรับกิจกรรมกลางแจ้งและการใช้ชีวิตประจำวันตามปกติ",
  },
  {
    range: "15.1 - 25.0",
    value: 20,
    advice: "คุณภาพอากาศยังอยู่ในระดับปลอดภัย ทำกิจกรรมกลางแจ้งได้ตามปกติ",
  },
  {
    range: "25.1 - 37.5",
    value: 30,
    advice: "กลุ่มเสี่ยงควรลดเวลานอกอาคารหากเริ่มมีอาการไอ ระคายเคือง หรือหายใจไม่สะดวก",
  },
  {
    range: "37.6 - 75.0",
    value: 50,
    advice: "ควรลดกิจกรรมกลางแจ้ง ใช้หน้ากากป้องกัน และเฝ้าระวังอาการผิดปกติ",
  },
  {
    range: "75.1 ขึ้นไป",
    value: 120,
    advice: "หลีกเลี่ยงกิจกรรมกลางแจ้ง โดยเฉพาะเด็ก ผู้สูงอายุ และผู้ป่วยโรคหัวใจหรือปอด",
  },
];

const pmGuidelines = [
  {
    title: "ขนาดเล็กมาก",
    detail:
      "PM2.5 มีขนาดไม่เกิน 2.5 ไมครอน เล็กพอที่จะผ่านระบบกรองตามธรรมชาติของร่างกายและลงลึกถึงถุงลมปอด",
  },
  {
    title: "กระทบสุขภาพสะสม",
    detail:
      "การรับสัมผัสต่อเนื่องสัมพันธ์กับโรคระบบทางเดินหายใจ โรคหัวใจและหลอดเลือด รวมถึงอาการอักเสบเรื้อรัง",
  },
  {
    title: "มองไม่เห็นแต่เสี่ยงจริง",
    detail:
      "แม้อากาศจะไม่ได้ดูขมุกขมัวมากเสมอไป แต่ค่าฝุ่น PM2.5 อาจยังสูงได้ จึงควรอิงข้อมูลตรวจวัดเป็นหลัก",
  },
  {
    title: "ค่าที่นิยมติดตาม",
    detail:
      "โดยทั่วไปใช้ค่าเฉลี่ย 24 ชั่วโมงสำหรับการสื่อสารสถานการณ์รายวัน และใช้ร่วมกับ AQI ในหลายระบบ",
  },
];

export default function InformationPage() {
  return (
    <div className="space-y-8 pb-6">
      <section className="relative overflow-hidden rounded-[2rem] border border-border/60 bg-[linear-gradient(135deg,#f4ede3_0%,#fbf7f1_52%,#e6f2ee_100%)] px-6 py-8 shadow-sm md:px-10 md:py-12">
        <div className="absolute inset-y-0 right-0 hidden w-1/2 bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.20),transparent_50%),radial-gradient(circle_at_bottom_right,rgba(249,115,22,0.16),transparent_42%)] lg:block" />
        <div className="relative grid gap-8 lg:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)] lg:items-center">
          <div className="space-y-5">
            <Badge className="rounded-full bg-white/80 px-4 py-1 text-[11px] font-semibold uppercase tracking-[0.28em] text-primary shadow-sm">
              PM2.5 Information
            </Badge>
            <div className="space-y-3">
              <h1 className="max-w-3xl text-3xl font-semibold tracking-tight text-foreground md:text-5xl">
                เข้าใจ PM2.5 ให้ชัดก่อนดูค่าฝุ่นในแผนที่และรายงาน
              </h1>
              <p className="max-w-2xl text-sm leading-7 text-foreground/70 md:text-base">
                หน้านี้สรุปความหมายของฝุ่น PM2.5 แหล่งกำเนิดหลัก ผลกระทบต่อสุขภาพ
                และช่วงค่าความเข้มข้นที่ใช้ตีความสถานการณ์ในไทย
                เพื่อให้คุณอ่านค่าฝุ่นจากหน้าใช้งานจริงได้แม่นขึ้น
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button asChild size="lg" className="rounded-full px-6 shadow-sm">
                <Link href="/map">
                  ดูแผนที่คุณภาพอากาศ
                  <ArrowUpRight className="size-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="rounded-full bg-white/80 px-6">
                <a
                  href="http://air4thai.pcd.go.th/webV3/#/AQIInfo"
                  target="_blank"
                  rel="noreferrer"
                >
                  เปิดข้อมูลอ้างอิง Air4Thai
                </a>
              </Button>
            </div>
            <div className="grid gap-3 pt-2 sm:grid-cols-3">
              <div className="rounded-2xl border border-white/60 bg-white/75 p-4 backdrop-blur">
                <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                  <Wind className="size-4 text-primary" />
                  ขนาดอนุภาค
                </div>
                <p className="mt-2 text-2xl font-semibold">ไม่เกิน 2.5 µm</p>
              </div>
              <div className="rounded-2xl border border-white/60 bg-white/75 p-4 backdrop-blur">
                <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                  <Activity className="size-4 text-primary" />
                  ช่วงค่าหลัก
                </div>
                <p className="mt-2 text-2xl font-semibold">5 ระดับ</p>
              </div>
              <div className="rounded-2xl border border-white/60 bg-white/75 p-4 backdrop-blur">
                <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                  <Clock3 className="size-4 text-primary" />
                  ค่าอ้างอิงหลัก
                </div>
                <p className="mt-2 text-2xl font-semibold">เฉลี่ย 24 ชม.</p>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="rounded-[2rem] border border-white/70 bg-white/80 p-6 shadow-lg backdrop-blur">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground/60">คู่มืออ่านค่าแบบย่อ</p>
                  <h2 className="mt-1 text-2xl font-semibold">PM2.5 บอกอะไรเรา</h2>
                </div>
                <div className="rounded-2xl bg-primary/10 p-3 text-primary">
                  <CloudSun className="size-6" />
                </div>
              </div>
              <div className="mt-5 space-y-4">
                <div className="rounded-2xl bg-secondary/60 p-4">
                  <p className="text-sm font-medium text-foreground">PM2.5 คือฝุ่นละเอียดที่เล็กและอันตรายกว่าฝุ่นทั่วไป</p>
                  <p className="mt-1 text-sm leading-6 text-foreground/70">
                    อนุภาคมีขนาดเล็กมากจนเข้าสู่ปอดและกระแสเลือดได้ง่าย จึงเป็นตัวชี้วัดสำคัญที่ต้องติดตามในชีวิตประจำวัน
                  </p>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl border border-border/60 p-4">
                    <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">อ่านค่า</p>
                    <p className="mt-2 text-lg font-semibold">ค่ายิ่งสูง ยิ่งควรระวัง</p>
                    <p className="mt-1 text-sm leading-6 text-foreground/70">
                      เมื่อค่าฝุ่นเพิ่มขึ้น ความเสี่ยงต่อสุขภาพและข้อจำกัดการทำกิจกรรมกลางแจ้งจะเพิ่มตาม
                    </p>
                  </div>
                  <div className="rounded-2xl border border-border/60 p-4">
                    <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">กลุ่มเสี่ยง</p>
                    <p className="mt-2 text-lg font-semibold">ต้องระวังก่อน</p>
                    <p className="mt-1 text-sm leading-6 text-foreground/70">
                      เด็ก ผู้สูงอายุ หญิงตั้งครรภ์ และผู้ป่วยโรคหัวใจหรือปอดควรลดการสัมผัสก่อนคนทั่วไป
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
        <div className="rounded-[1.75rem] border bg-card p-6 shadow-sm md:p-8">
          <Badge variant="outline" className="rounded-full px-3 py-1">
            PM2.5 Basics
          </Badge>
          <h2 className="mt-4 text-2xl font-semibold tracking-tight">
            PM2.5 คือฝุ่นละอองขนาดเล็กมากที่ส่งผลต่อสุขภาพได้ชัดเจนแม้รับสัมผัสในชีวิตประจำวัน
          </h2>
          <p className="mt-4 text-sm leading-7 text-foreground/75">
            PM2.5 เป็นอนุภาคแขวนลอยในอากาศที่มีขนาดไม่เกิน 2.5 ไมครอน
            เกิดจากการเผาไหม้ การคมนาคม อุตสาหกรรม และการก่อตัวของมลพิษในบรรยากาศ
            เนื่องจากมีขนาดเล็กมาก จึงสามารถผ่านเข้าลึกสู่ระบบหายใจและก่อผลกระทบเชิงสะสมได้
          </p>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl bg-secondary/60 p-4">
              <div className="flex items-center gap-2 text-sm font-medium">
                <ShieldCheck className="size-4 text-primary" />
                จุดเด่น
              </div>
              <p className="mt-2 text-sm leading-6 text-foreground/70">
                เป็นค่าที่ใช้ติดตามสถานการณ์ฝุ่นรายวันและใช้ประเมินความเสี่ยงสุขภาพได้ตรงจุด
              </p>
            </div>
            <div className="rounded-2xl bg-secondary/60 p-4">
              <div className="flex items-center gap-2 text-sm font-medium">
                <CircleAlert className="size-4 text-primary" />
                สิ่งที่ควรรู้
              </div>
              <p className="mt-2 text-sm leading-6 text-foreground/70">
                แม้ค่าจะดูไม่สูงมาก แต่การรับสัมผัสต่อเนื่องหลายวันยังเพิ่มความเสี่ยงต่อสุขภาพได้
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-[1.75rem] border bg-card p-6 shadow-sm md:p-8">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-primary/10 p-3 text-primary">
              <HeartPulse className="size-5" />
            </div>
            <div>
              <h2 className="text-2xl font-semibold tracking-tight">ข้อสังเกตด้านสุขภาพ</h2>
              <p className="text-sm text-foreground/70">
                หากเริ่มมีอาการผิดปกติแม้ AQI ยังไม่สูงมาก ควรลดการสัมผัสและสังเกตร่างกาย
              </p>
            </div>
          </div>
          <div className="mt-5 space-y-3">
            {[
              "ไอ ระคายคอ แสบตา หรือหายใจไม่สะดวก เป็นสัญญาณเริ่มต้นที่พบบ่อย",
              "ผู้ที่มีโรคหอบหืด โรคปอดอุดกั้นเรื้อรัง หรือโรคหัวใจ ควรติดตามค่าอากาศอย่างสม่ำเสมอ",
              "ในวันที่ค่าฝุ่นสูง ควรลดกิจกรรมกลางแจ้งที่ใช้แรงมาก ปิดช่องเปิดอาคาร และใช้หน้ากากที่กรองฝุ่นได้",
            ].map((item) => (
              <div
                key={item}
                className="flex gap-3 rounded-2xl border border-border/60 p-4 text-sm leading-6 text-foreground/75"
              >
                <Leaf className="mt-0.5 size-4 shrink-0 text-primary" />
                <p>{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="rounded-[1.75rem] border bg-card p-6 shadow-sm md:p-8">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <Badge variant="outline" className="rounded-full px-3 py-1">
              PM2.5 Sources
            </Badge>
            <h2 className="mt-4 text-2xl font-semibold tracking-tight">
              แหล่งกำเนิดและลักษณะของ PM2.5
            </h2>
          </div>
          <p className="max-w-2xl text-sm leading-6 text-foreground/70">
            การเข้าใจว่าฝุ่นมาจากที่ใดช่วยให้วางแผนป้องกันได้แม่นขึ้น
            ทั้งในระดับบุคคล พื้นที่อยู่อาศัย และช่วงเวลาการทำกิจกรรมกลางแจ้ง
          </p>
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {pmSources.map((pollutant) => (
            <article
              key={pollutant.name}
              className="group rounded-[1.5rem] border border-border/60 bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(246,242,235,0.85))] p-5 transition-transform duration-200 hover:-translate-y-1"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold">{pollutant.name}</h3>
                <div className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                  {pollutant.unit}
                </div>
              </div>
              <p className="mt-3 text-sm leading-6 text-foreground/75">
                {pollutant.description}
              </p>
              <div className="mt-4 rounded-2xl bg-secondary/60 p-3 text-sm text-foreground/70">
                {pollutant.average}
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <div className="rounded-[1.75rem] border bg-card p-6 shadow-sm md:p-8">
          <Badge variant="outline" className="rounded-full px-3 py-1">
            PM2.5 Levels
          </Badge>
          <h2 className="mt-4 text-2xl font-semibold tracking-tight">
            ช่วงค่าฝุ่น PM2.5 และคำแนะนำเบื้องต้น
          </h2>
          <div className="mt-6 space-y-3">
            {pmLevels.map((level) => {
              const status = getPM25Constant(level.value);

              return (
                <div
                  key={level.range}
                  className="rounded-[1.5rem] border border-border/60 p-4"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">PM2.5 {level.range} µg/m3</p>
                      <h3 className="text-lg font-semibold">{status.labelTh}</h3>
                    </div>
                    <span
                      className="inline-flex w-fit rounded-full px-3 py-1 text-sm font-medium ring-1"
                      style={{
                        backgroundColor: status.color,
                        color: "#ffffff",
                        borderColor: status.color,
                      }}
                    >
                      {status.labelTh}
                    </span>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-foreground/75">{level.advice}</p>
                </div>
              );
            })}
          </div>
        </div>

        <div className="rounded-[1.75rem] border bg-card p-6 shadow-sm md:p-8">
          <Badge variant="outline" className="rounded-full px-3 py-1">
            PM2.5 Guide
          </Badge>
          <h2 className="mt-4 text-2xl font-semibold tracking-tight">
            สิ่งสำคัญที่ควรรู้เกี่ยวกับ PM2.5
          </h2>
          <p className="mt-3 text-sm leading-6 text-foreground/70">
            ใช้ชุดข้อมูลนี้เป็นกรอบคิดเวลาอ่านค่าฝุ่นในแอป ไม่ว่าจะดูจากแผนที่
            รายจังหวัด หรือรายสถานีตรวจวัด
          </p>
          <div className="mt-6 grid gap-3">
            {pmGuidelines.map((item) => (
              <div
                key={item.title}
                className="rounded-[1.5rem] border border-border/60 bg-secondary/20 p-4"
              >
                <h3 className="text-base font-semibold">{item.title}</h3>
                <p className="mt-2 text-sm leading-6 text-foreground/75">{item.detail}</p>
              </div>
            ))}
          </div>
          <p className="mt-4 text-xs leading-6 text-muted-foreground">
            หน่วยที่ใช้โดยทั่วไปของ PM2.5 คือ µg/m3 และในหลายระบบจะแสดงควบคู่กับค่า AQI เพื่อช่วยสื่อสารความเสี่ยง
          </p>
        </div>
      </section>

      <section className="rounded-[1.75rem] border border-border/60 bg-[linear-gradient(135deg,rgba(230,242,238,0.9),rgba(255,248,240,0.9))] p-6 shadow-sm md:p-8">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:items-center">
          <div>
            <Badge className="rounded-full bg-white/80 px-3 py-1 text-primary">
              Practical Tips
            </Badge>
            <h2 className="mt-4 text-2xl font-semibold tracking-tight">
              วิธีใช้หน้านี้ร่วมกับข้อมูลจริงในแอป
            </h2>
            <div className="mt-5 space-y-3 text-sm leading-7 text-foreground/75">
              <p>
                1. ดูค่า PM2.5 จากหน้าแผนที่หรือหน้ารายงาน แล้วเทียบระดับความเสี่ยงจากช่วงค่าด้านบน
              </p>
              <p>
                2. หากค่าฝุ่นสูงต่อเนื่องหลายวัน ให้ปรับกิจกรรมกลางแจ้งและจัดการอากาศภายในอาคารร่วมด้วย
              </p>
              <p>
                3. หากอยู่ในกลุ่มเสี่ยง ควรวางแผนกิจกรรมตามช่วงเวลาที่อากาศเหมาะสมกว่าและติดตามค่าซ้ำระหว่างวัน
              </p>
            </div>
          </div>
          <div className="rounded-[1.5rem] border border-white/70 bg-white/85 p-5 shadow-sm">
            <p className="text-sm font-medium text-foreground/60">แหล่งอ้างอิงเนื้อหา</p>
            <ul className="mt-3 space-y-3 text-sm leading-6 text-foreground/75">
              <li>ปรับเนื้อหาให้โฟกัส PM2.5 เป็นหลัก โดยใช้ช่วงค่าและผลกระทบสุขภาพที่สอดคล้องกับบริบทไทย</li>
              <li>แนวภาพรวมหน้าเว็บยังคงอิง landing page โทนสถาบันสุขภาพ: อบอุ่น สะอาด และอ่านง่าย</li>
              <li>เหมาะกับใช้เป็นหน้าความรู้ประกอบหน้าแผนที่และหน้ารายงานค่าฝุ่นของแอป</li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}
