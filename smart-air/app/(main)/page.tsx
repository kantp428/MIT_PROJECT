import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, MapPinned, ShieldCheck, Sparkles } from "lucide-react";
import Link from "next/link";

const HERO_IMAGE =
  "https://media.discordapp.net/attachments/1348993034758652006/1480587515986706633/104904158_pam_4674.jpg?ex=69b03813&is=69aee693&hm=21a9d496829ee15b6a4c7a90d954606774cebba356a07e0236311f9f53ae586f&=&format=webp&width=1000&height=666";

const featureItems = [
  {
    title: "Calm Design",
    description: "หน้าแรกแบบนิ่ง สะอาด และอ่านง่ายก่อนพาไปดูข้อมูลจริง",
  },
  {
    title: "Air Map",
    description: "เข้าแผนที่คุณภาพอากาศต่อได้ทันทีจาก CTA หลัก",
  },
  {
    title: "PM2.5 Guide",
    description: "อ่านคำอธิบายเรื่องฝุ่นและผลกระทบต่อสุขภาพได้ต่อเนื่อง",
  },
];

export default function HomePage() {
  return (
    <main className="mx-auto max-w-7xl space-y-10 p-6">
      <section className="relative overflow-hidden rounded-[2.5rem] border border-border/50 bg-[#e9e1d3] shadow-sm">
        <div className="absolute inset-0">
          <img
            src={HERO_IMAGE}
            alt="Hero background"
            className="h-full w-full object-cover object-center md:object-[center_35%]"
          />
        </div>
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(32,26,20,0.10)_0%,rgba(231,222,208,0.24)_24%,rgba(233,225,211,0.68)_62%,rgba(233,225,211,0.88)_100%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.16),transparent_38%)]" />

        <div className="relative mx-auto flex min-h-[620px] max-w-4xl flex-col items-center justify-center px-6 py-18 text-center md:px-10">
          <Badge className="rounded-full border border-white/60 bg-white/75 px-8 py-3 text-lg font-semibold tracking-[0.18em] text-foreground/85 uppercase md:text-2xl">
            Welcome to Smart Air
          </Badge>
          <h1 className="mt-7 text-5xl font-semibold tracking-[0.18em] text-foreground md:text-7xl">
            SMART AIR
          </h1>
          <h2 className="mt-4 text-sm font-medium tracking-[0.42em] text-foreground/70 uppercase md:text-xl">
            THAILAND PM2.5 MONITOR
          </h2>
          <h3 className="mt-5 max-w-2xl text-base leading-8 text-foreground/75 md:text-xl">
            ระบบทำนายค่าฝุ่น PM 2.5 ของประเทศเเละคุณภาพอากาศ
          </h3>

          <div className="mt-10">
            <Button
              asChild
              size="lg"
              className="h-13 rounded-full px-10 text-sm tracking-[0.2em] uppercase md:text-base"
            >
              <Link href="/map">
                ตรวจสอบเเผนที่
                <ArrowRight />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </main>
  );
}
