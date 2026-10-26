import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Book, Search, GraduationCap, ArrowRight, Star } from 'lucide-react';
import { Card, Button, cn } from '../components/UI';
import { motion } from 'motion/react';

const PROMPTS = [
  { id: 1, grade: 3, title: 'Tả con vật em yêu thích', description: 'Tả một con vật nuôi trong nhà hoặc con vật em quan sát được.' },
  { id: 2, grade: 3, title: 'Kể về một người thân', description: 'Kể về bố, mẹ, ông bà hoặc anh chị em của em.' },
  { id: 3, grade: 4, title: 'Tả cây cối', description: 'Tả một loài cây che bóng mát, cây ăn quả hoặc cây hoa.' },
  { id: 4, grade: 4, title: 'Kể lại một câu chuyện cổ tích', description: 'Kể lại một câu chuyện em đã được nghe hoặc đọc.' },
  { id: 5, grade: 5, title: 'Tả cảnh đẹp quê hương', description: 'Tả một cảnh đẹp ở địa phương em hoặc nơi em đã đi du lịch.' },
  { id: 6, grade: 5, title: 'Kể về một kỷ niệm đáng nhớ', description: 'Kể lại một sự việc làm em nhớ mãi trong thời gian đi học.' },
  { id: 7, grade: 6, title: 'Kể về một tấm gương vượt khó', description: 'Viết bài văn kể về một người bạn hoặc người hàng xóm vượt qua khó khăn.' },
  { id: 8, grade: 7, title: 'Biểu cảm về một loài cây', description: 'Viết bài văn biểu cảm về loài cây em yêu thích (cây tre, cây sen...).' },
  { id: 9, grade: 8, title: 'Nghị luận về lòng hiếu thảo', description: 'Trình bày suy nghĩ của em về đạo làm con trong gia đình.' },
  { id: 10, grade: 9, title: 'Nghị luận về rác thải nhựa', description: 'Bàn về vấn đề ô nhiễm môi trường do rác thải nhựa gây ra.' },
];

export const Library = () => {
  const navigate = useNavigate();
  const [selectedGrade, setSelectedGrade] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredPrompts = PROMPTS.filter(p => {
    const matchesGrade = selectedGrade ? p.grade === selectedGrade : true;
    const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesGrade && matchesSearch;
  });

  const handleStartIdeaMap = (prompt: string) => {
    navigate('/idea-map', { state: { initialPrompt: prompt } });
  };

  return (
    <div className="max-w-5xl mx-auto space-y-10 pb-20">
      <header className="text-center space-y-6 py-10">
        <motion.div 
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="w-24 h-24 bg-gradient-to-br from-brand-pink to-brand-pink-light rounded-[40px] flex items-center justify-center text-white mx-auto shadow-xl shadow-pink-200"
        >
          <Book className="w-12 h-12" />
        </motion.div>
        <div className="space-y-2">
          <h2 className="text-5xl font-display font-black text-slate-800">
            Thư Viện Đề Văn
          </h2>
          <p className="text-xl text-slate-500 font-display font-bold">Hàng trăm đề văn hay được chọn lọc cho từng khối lớp.</p>
        </div>
      </header>

      <div className="flex flex-col md:flex-row gap-6 items-center justify-between bg-white p-6 rounded-[32px] shadow-xl shadow-pink-100/30 border-4 border-white">
        <div className="flex flex-wrap gap-3 justify-center">
          <button
            onClick={() => setSelectedGrade(null)}
            className={cn(
              "px-6 py-3 rounded-2xl font-display font-black transition-all text-lg shadow-sm",
              selectedGrade === null 
                ? "bg-brand-pink text-white shadow-pink-200 scale-105" 
                : "bg-brand-bg text-slate-500 hover:bg-pink-50"
            )}
          >
            Tất cả
          </button>
          {[3, 4, 5, 6, 7, 8, 9].map(grade => (
            <button
              key={grade}
              onClick={() => setSelectedGrade(grade)}
              className={cn(
                "px-6 py-3 rounded-2xl font-display font-black transition-all text-lg shadow-sm",
                selectedGrade === grade 
                  ? "bg-brand-purple text-white shadow-purple-200 scale-105" 
                  : "bg-brand-bg text-slate-500 hover:bg-purple-50"
              )}
            >
              Lớp {grade}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-80">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-slate-400" />
          <input
            type="text"
            placeholder="Tìm đề văn..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="ed-input pl-12 py-4 text-lg font-display font-bold"
          />
        </div>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredPrompts.map((p, idx) => (
          <motion.div
            key={p.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            whileHover={{ y: -10 }}
          >
            <Card className="h-full flex flex-col gap-6 p-8 border-none shadow-xl hover:shadow-2xl transition-all group rounded-[40px]">
              <div className="flex items-center justify-between">
                <span className={cn(
                  "px-4 py-2 text-sm font-black rounded-2xl uppercase tracking-widest shadow-sm",
                  p.grade <= 5 ? "bg-pink-50 text-brand-pink" : "bg-purple-50 text-brand-purple"
                )}>
                  Lớp {p.grade}
                </span>
                <div className="w-10 h-10 bg-yellow-50 rounded-2xl flex items-center justify-center text-brand-yellow shadow-sm">
                  <Star className="w-6 h-6 fill-current" />
                </div>
              </div>
              <div className="space-y-3 flex-1">
                <h4 className="text-2xl font-display font-black text-slate-800 leading-tight group-hover:text-brand-pink transition-colors">
                  {p.title}
                </h4>
                <p className="text-lg text-slate-500 font-display font-bold line-clamp-3 leading-relaxed">
                  {p.description}
                </p>
              </div>
              <Button
                variant={p.grade <= 5 ? "pink" : "purple"}
                onClick={() => handleStartIdeaMap(p.title)}
                className="w-full py-4 text-lg flex items-center justify-center gap-3 rounded-2xl"
              >
                Lập Dàn Ý Ngay <ArrowRight className="w-5 h-5" />
              </Button>
            </Card>
          </motion.div>
        ))}
      </div>

      {filteredPrompts.length === 0 && (
        <div className="text-center py-32 space-y-6 bg-white rounded-[48px] shadow-xl border-4 border-white">
          <motion.div 
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="w-32 h-32 bg-slate-50 rounded-[40px] flex items-center justify-center mx-auto text-slate-200 shadow-inner"
          >
            <Search className="w-16 h-16" />
          </motion.div>
          <div className="space-y-2">
            <p className="text-2xl font-display font-black text-slate-400">Hic! Không tìm thấy đề văn nào...</p>
            <p className="text-slate-300 font-display font-bold">Con thử tìm bằng từ khóa khác xem sao nhé!</p>
          </div>
        </div>
      )}
    </div>
  );
};
