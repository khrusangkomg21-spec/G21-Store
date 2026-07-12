import { Metadata } from 'next';

const subjectDb: Record<string, any> = {
  sci: { title: 'วิทยาศาสตร์ สิ่งแวดล้อม และเทคโนโลยี', icon: '🔬', desc: 'แผนการสอนวิทยาศาสตร์ ประถม 1-6' },
  soc: { title: 'สังคมและความเป็นพลเมือง', icon: '🌾', desc: 'แผนการสอนสังคมศึกษา ประถม 1-6' },
  eco: { title: 'เศรษฐกิจและการเงิน', icon: '💰', desc: 'แผนการสอนวิชาเศรษฐกิจ ประถม 1-6' },
  hea: { title: 'สุขภาพกายและจิต', icon: '🩺', desc: 'แผนการสอนสุขศึกษา ประถม 1-6' },
  art: { title: 'ศิลปะและวัฒนธรรมเพื่อสุนทรียภาพ', icon: '🎨', desc: 'แผนการสอนศิลปะ ประถม 1-6' },
  eng: { title: 'ภาษาอังกฤษ (English)', icon: '🇬🇧', desc: 'แผนการสอนภาษาอังกฤษ ประถม 1-6' },
};

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const subject = subjectDb[id];
  
  if (!subject) {
    return {
      title: 'ไม่พบรายวิชา | G21 คลังสื่องานสอน'
    };
  }

  const pageTitle = `${subject.icon} ${subject.title} | G21 คลังสื่องานสอน`;

  return {
    title: pageTitle,
    description: subject.desc,
    openGraph: {
      title: pageTitle,
      description: subject.desc,
      images: [
        {
          url: `https://placehold.co/1200x630/1A4731/D4AF37?text=${encodeURIComponent(subject.title)}`,
          width: 1200,
          height: 630,
          alt: subject.title,
        },
      ],
    },
  };
}

export default function SubjectLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
