import React from 'react';
import { Link } from 'react-router-dom';
import { Lightbulb, GraduationCap, ArrowRight, Star, Trophy, Clock, Pencil, Book, Sparkles } from 'lucide-react';
import { Card, Button, cn } from '../components/UI';
import { motion } from 'motion/react';

const DAILY_CHALLENGES = [
  { id: 1, title: "Tả người thân yêu nhất của con", category: "Miêu tả", points: 50 },
  { id: 2, title: "Kể về một kỷ niệm đáng nhớ", category: "Tự sự", points: 50 },
  { id: 3, title: "Nghị luận về lòng biết ơn", category: "Nghị luận", points: 100 },
];

const FloatingIcon = ({ icon: Icon, className, delay = 0 }: { icon: any, className: string, delay?: number }) => (
  <motion.div
    initial={{ y: 0 }}
    animate={{ y: [-10, 10, -10] }}
    transition={{ duration: 4, repeat: Infinity, delay, ease: "easeInOut" }}
    className={cn("absolute text-white/40 pointer-events-none", className)}
  >
    <Icon className="w-12 h-12" />
  </motion.div>
);

export const Home = () => {
  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-[48px] bg-gradient-to-br from-[#FF9ACF] to-[#C8B6FF] p-12 md:p-20 text-center text-white shadow-2xl shadow-pink-200/50">
        <FloatingIcon icon={Pencil} className="top-10 left-10" delay={0} />
        <FloatingIcon icon={Book} className="bottom-10 right-10" delay={1} />
        <FloatingIcon icon={Lightbulb} className="top-20 right-20" delay={2} />
        <FloatingIcon icon={Star} className="bottom-20 left-20" delay={3} />
        
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="relative z-10 space-y-8"
        >
          <div className="inline-flex items-center gap-2 px-6 py-2 bg-white/20 backdrop-blur-md rounded-full border border-white/30 text-white font-display font-black text-sm uppercase tracking-widest">
            <Sparkles className="w-4 h-4" /> Chào mừng con yêu!
          </div>
          
          <h2 className="text-4xl md:text-6xl lg:text-7xl font-display font-black leading-tight drop-shadow-md">
            Chào con! Hôm nay mình <br />
            <span className="text-brand-yellow">viết văn</span> về điều gì nhỉ?
          </h2>
          
          <p className="text-xl md:text-2xl text-white/90 max-w-3xl mx-auto font-display font-bold">
            Trợ lí AI giúp con lập dàn ý và viết văn hay hơn mỗi ngày. ✨
          </p>

          <div className="flex flex-wrap justify-center gap-4 pt-4">
            <Link to="/idea-map">
              <Button variant="yellow" size="lg" className="px-12">Bắt đầu ngay thôi!</Button>
            </Link>
          </div>
        </motion.div>

        {/* Friendly Illustration Placeholder */}
        <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-full max-w-md opacity-20 pointer-events-none">
          <GraduationCap className="w-64 h-64 mx-auto" />
        </div>
      </section>

      {/* Feature Cards */}
      <div className="grid md:grid-cols-2 gap-10">
        <motion.div whileHover={{ scale: 1.05 }} className="group">
          <Link to="/idea-map">
            <Card className="h-full flex flex-col items-center text-center gap-8 p-12 bg-gradient-to-br from-[#FFB7D5] to-[#FFC8DD] border-none shadow-2xl shadow-pink-100/50">
              <div className="w-32 h-32 bg-white rounded-[40px] flex items-center justify-center text-[#FF9ACF] shadow-xl group-hover:rotate-6 transition-all duration-500">
                <Lightbulb className="w-16 h-16" />
              </div>
              <div className="space-y-4">
                <h3 className="text-4xl font-display font-black text-white drop-shadow-sm">Bản Đồ Ý Tưởng</h3>
                <p className="text-white/90 text-lg font-display font-bold">
                  Giúp con phân tích đề bài và tạo một dàn ý chi tiết trước khi bắt đầu viết.
                </p>
              </div>
              <Button variant="pink" className="mt-auto w-full text-xl py-6 animate-glow">
                Bắt đầu lập dàn ý <ArrowRight className="w-6 h-6" />
              </Button>
            </Card>
          </Link>
        </motion.div>

        <motion.div whileHover={{ scale: 1.05 }} className="group">
          <Link to="/feedback">
            <Card className="h-full flex flex-col items-center text-center gap-8 p-12 bg-gradient-to-br from-[#C8B6FF] to-[#BDE0FE] border-none shadow-2xl shadow-purple-100/50">
              <div className="w-32 h-32 bg-white rounded-[40px] flex items-center justify-center text-[#C8B6FF] shadow-xl group-hover:-rotate-6 transition-all duration-500">
                <GraduationCap className="w-16 h-16" />
              </div>
              <div className="space-y-4">
                <h3 className="text-4xl font-display font-black text-white drop-shadow-sm">Cô Góp Ý Bài Văn</h3>
                <p className="text-white/90 text-lg font-display font-bold">
                  Gửi bài văn con đã viết để AI nhận xét, sửa lỗi và giúp con viết hay hơn.
                </p>
              </div>
              <Button variant="purple" className="mt-auto w-full text-xl py-6 animate-glow">
                Nhận góp ý ngay <ArrowRight className="w-6 h-6" />
              </Button>
            </Card>
          </Link>
        </motion.div>
      </div>

      {/* Daily Challenges */}
      <section className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h4 className="text-3xl font-display font-black text-slate-800 flex items-center gap-3">
            <Trophy className="w-10 h-10 text-brand-yellow" /> Thử thách viết mỗi ngày
          </h4>
          <span className="px-6 py-2 bg-yellow-100 text-yellow-700 font-display font-black rounded-full text-sm">
            Hoàn thành để nhận thêm huy hiệu! 🏆
          </span>
        </div>
        <div className="grid sm:grid-cols-3 gap-6">
          {DAILY_CHALLENGES.map((challenge) => (
            <Card key={challenge.id} className="p-8 border-none bg-white hover:shadow-2xl transition-all group relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-brand-yellow/10 rounded-bl-full -mr-10 -mt-10 group-hover:scale-150 transition-transform" />
              <div className="flex justify-between items-start mb-6">
                <span className="px-4 py-1 bg-pink-100 text-brand-pink text-xs font-black rounded-full uppercase tracking-widest">{challenge.category}</span>
                <span className="text-brand-yellow font-black text-lg">+{challenge.points}đ</span>
              </div>
              <h5 className="text-xl font-display font-black text-slate-800 mb-6 group-hover:text-brand-pink transition-colors leading-snug">{challenge.title}</h5>
              <Link to="/idea-map" state={{ prompt: challenge.title }}>
                <Button variant="ghost" className="w-full text-brand-pink hover:bg-pink-50 border-2 border-pink-100">Tham gia ngay</Button>
              </Link>
            </Card>
          ))}
        </div>
      </section>

      {/* Stats */}
      <section className="space-y-8">
        <div className="flex items-center justify-between">
          <h4 className="text-3xl font-display font-black text-slate-800">Hành trình của con</h4>
          <Link to="/dashboard" className="text-brand-pink font-black text-lg hover:underline flex items-center gap-2">
            Xem tất cả <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <StatCard icon={<Trophy className="text-brand-yellow w-8 h-8" />} label="Bài văn đã viết" value="12" color="bg-yellow-50" />
          <StatCard icon={<Star className="text-brand-pink w-8 h-8" />} label="Điểm trung bình" value="8.5" color="bg-pink-50" />
          <StatCard icon={<Clock className="text-brand-blue w-8 h-8" />} label="Giờ học tập" value="24h" color="bg-blue-50" />
        </div>
      </section>
    </div>
  );
};

const StatCard = ({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string; color: string }) => (
  <Card className={cn("flex items-center gap-6 p-8 border-none shadow-xl", color)}>
    <div className="p-5 bg-white rounded-3xl shadow-lg">
      {icon}
    </div>
    <div>
      <p className="text-sm text-slate-500 font-black uppercase tracking-widest mb-1">{label}</p>
      <p className="text-4xl font-display font-black text-slate-800">{value}</p>
    </div>
  </Card>
);
