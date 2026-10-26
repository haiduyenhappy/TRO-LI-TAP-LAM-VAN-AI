import React, { useEffect, useState } from 'react';
import { Trophy, Star, Clock, BookOpen, PenTool, ChevronRight, Calendar, Award, TrendingUp, CheckCircle2, AlertCircle } from 'lucide-react';
import { Card, cn, Modal, Button } from '../components/UI';
import { HistoryItem, FeedbackResult, IdeaMapResult } from '../types';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';
import { motion } from 'motion/react';

const BADGES = [
  { id: 'first-essay', name: 'Người Khởi Đầu', icon: '🌱', description: 'Hoàn thành bài văn đầu tiên' },
  { id: 'streak-3', name: 'Chăm Chỉ', icon: '🔥', description: 'Viết văn 3 ngày liên tiếp' },
  { id: 'high-score', name: 'Cây Bút Vàng', icon: '✍️', description: 'Đạt điểm trung bình trên 9.0' },
  { id: 'vocabulary-master', name: 'Bậc Thầy Từ Vựng', icon: '📚', description: 'Sử dụng hơn 50 từ hay' },
];

export const Dashboard = () => {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<HistoryItem | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('writing_history');
    if (saved) {
      setHistory(JSON.parse(saved));
    }
  }, []);

  const feedbackHistory = history.filter(h => h.type === 'feedback');
  
  const stats = {
    totalEssays: feedbackHistory.length,
    avgScore: feedbackHistory.length > 0 
      ? feedbackHistory.reduce((acc, curr) => {
          const data = curr.data as FeedbackResult;
          const avg = (data.evaluation.scores.spelling + data.evaluation.scores.structure + data.evaluation.scores.vocabulary + data.evaluation.scores.emotion) / 4;
          return acc + avg;
        }, 0) / feedbackHistory.length 
      : 0,
    totalTime: history.length * 30, // 30 mins per activity
  };

  const chartData = feedbackHistory.slice().reverse().map((h, i) => {
    const data = h.data as FeedbackResult;
    return {
      name: `Bài ${i + 1}`,
      score: ((data.evaluation.scores.spelling + data.evaluation.scores.structure + data.evaluation.scores.vocabulary + data.evaluation.scores.emotion) / 4).toFixed(1),
      spelling: data.evaluation.scores.spelling,
      structure: data.evaluation.scores.structure,
      vocabulary: data.evaluation.scores.vocabulary,
    };
  });

  const skillData = feedbackHistory.length > 0 ? [
    { name: 'Chính tả', value: feedbackHistory.reduce((acc, curr) => acc + (curr.data as FeedbackResult).evaluation.scores.spelling, 0) / feedbackHistory.length },
    { name: 'Bố cục', value: feedbackHistory.reduce((acc, curr) => acc + (curr.data as FeedbackResult).evaluation.scores.structure, 0) / feedbackHistory.length },
    { name: 'Từ vựng', value: feedbackHistory.reduce((acc, curr) => acc + (curr.data as FeedbackResult).evaluation.scores.vocabulary, 0) / feedbackHistory.length },
    { name: 'Cảm xúc', value: feedbackHistory.reduce((acc, curr) => acc + (curr.data as FeedbackResult).evaluation.scores.emotion, 0) / feedbackHistory.length },
  ] : [];

  const COLORS = ['#4F46E5', '#10B981', '#F59E0B', '#EC4899'];

  return (
    <div className="max-w-5xl mx-auto space-y-12 pb-20">
      <header className="text-center space-y-6 py-10">
        <motion.div 
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="w-24 h-24 bg-gradient-to-br from-brand-purple to-brand-blue rounded-[40px] flex items-center justify-center text-white mx-auto shadow-xl shadow-purple-200"
        >
          <Trophy className="w-12 h-12" />
        </motion.div>
        <div className="space-y-2">
          <h2 className="text-5xl font-display font-black text-slate-800">
            Hành Trình Của Con
          </h2>
          <p className="text-xl text-slate-500 font-display font-bold italic">"Mỗi bài văn là một bước chân đưa con đến gần hơn với ước mơ!"</p>
        </div>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
        <StatCard 
          icon={<Trophy className="w-8 h-8" />} 
          value={stats.totalEssays.toString()} 
          label="Bài văn hoàn thành" 
          gradient="from-[#FF9ACF] to-[#FFC7E8]" 
        />
        <StatCard 
          icon={<Star className="w-8 h-8" />} 
          value={stats.avgScore.toFixed(1)} 
          label="Điểm trung bình" 
          gradient="from-[#C8B6FF] to-[#A0E9FF]" 
        />
        <StatCard 
          icon={<Clock className="w-8 h-8" />} 
          value={`${Math.floor(stats.totalTime / 60)}h ${stats.totalTime % 60}m`} 
          label="Thời gian học tập" 
          gradient="from-[#FFD166] to-[#FFE4A1]"
          textColor="text-slate-800"
        />
      </div>

      {/* Charts Section */}
      <div className="grid lg:grid-cols-2 gap-10">
        <Card className="p-10 space-y-8 border-none shadow-2xl shadow-blue-100/50 rounded-[48px]">
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-display font-black text-slate-800 flex items-center gap-3">
              <TrendingUp className="w-8 h-8 text-brand-blue" /> Tiến bộ của con
            </h3>
            <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Điểm số qua các bài</span>
          </div>
          <div className="h-[350px] w-full">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" hide />
                  <YAxis domain={[0, 10]} stroke="#94a3b8" fontSize={14} fontWeight="bold" />
                  <Tooltip 
                    contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', padding: '16px' }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="score" 
                    stroke="#4F46E5" 
                    strokeWidth={6} 
                    dot={{ r: 8, fill: '#4F46E5', strokeWidth: 4, stroke: '#fff' }} 
                    activeDot={{ r: 10 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-300 italic gap-4">
                <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center">
                  <TrendingUp className="w-10 h-10" />
                </div>
                <p className="font-display font-bold">Viết thêm bài để xem biểu đồ nhé!</p>
              </div>
            )}
          </div>
        </Card>

        <Card className="p-10 space-y-8 border-none shadow-2xl shadow-green-100/50 rounded-[48px]">
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-display font-black text-slate-800 flex items-center gap-3">
              <Award className="w-8 h-8 text-brand-green" /> Kỹ năng của con
            </h3>
            <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Điểm trung bình kỹ năng</span>
          </div>
          <div className="h-[350px] w-full">
            {skillData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={skillData} layout="vertical" margin={{ left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                  <XAxis type="number" domain={[0, 10]} hide />
                  <YAxis dataKey="name" type="category" stroke="#64748b" fontSize={14} fontWeight="bold" width={80} />
                  <Tooltip cursor={{ fill: 'transparent' }} />
                  <Bar dataKey="value" radius={[0, 20, 20, 0]} barSize={40}>
                    {skillData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-300 italic gap-4">
                <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center">
                  <Award className="w-10 h-10" />
                </div>
                <p className="font-display font-bold">Đang phân tích kỹ năng...</p>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Badges Section */}
      <section className="space-y-8">
        <h3 className="text-3xl font-display font-black text-slate-800 flex items-center gap-4">
          <Trophy className="w-10 h-10 text-brand-yellow" /> Huy hiệu đã đạt được
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
          {BADGES.map((badge) => {
            const isUnlocked = (badge.id === 'first-essay' && stats.totalEssays >= 1) ||
                              (badge.id === 'high-score' && stats.avgScore >= 8.5) ||
                              (badge.id === 'vocabulary-master' && stats.totalEssays >= 5);
            return (
              <Card key={badge.id} className={cn(
                "p-8 text-center space-y-4 transition-all duration-500 border-none rounded-[40px] shadow-xl",
                isUnlocked ? "bg-white shadow-yellow-100/50 scale-105" : "bg-slate-50 opacity-40 grayscale"
              )}>
                <div className="text-6xl drop-shadow-md">{badge.icon}</div>
                <div className="space-y-1">
                  <h4 className="font-display font-black text-slate-800 text-lg">{badge.name}</h4>
                  <p className="text-xs text-slate-500 font-display font-bold leading-tight">{badge.description}</p>
                </div>
                {isUnlocked && (
                  <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-yellow-100 text-yellow-700 rounded-full text-xs font-black uppercase tracking-widest">
                    <CheckCircle2 className="w-3 h-3" /> Đã đạt
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      </section>

      {/* History Section */}
      <section className="space-y-8">
        <h3 className="text-3xl font-display font-black text-slate-800">Lịch sử học tập</h3>
        <div className="grid gap-6">
          {history.length > 0 ? (
            history.map((item) => (
              <Card 
                key={item.id} 
                onClick={() => setSelectedItem(item)}
                className="p-6 flex items-center justify-between border-none shadow-xl hover:shadow-2xl group cursor-pointer transition-all hover:-translate-y-1 rounded-[32px] bg-white"
              >
                <div className="flex items-center gap-6">
                  <div className={cn(
                    "w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg",
                    item.type === 'idea-map' ? "bg-blue-50 text-brand-blue" : "bg-pink-50 text-brand-pink"
                  )}>
                    {item.type === 'idea-map' ? <BookOpen className="w-8 h-8" /> : <PenTool className="w-8 h-8" />}
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-xl font-display font-black text-slate-800 group-hover:text-brand-pink transition-colors">
                      {item.title}
                    </h4>
                    <div className="flex items-center gap-3 text-sm text-slate-400 font-display font-bold">
                      <Calendar className="w-4 h-4" />
                      {new Date(item.date).toLocaleDateString('vi-VN')}
                    </div>
                  </div>
                </div>
                <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-300 group-hover:bg-pink-50 group-hover:text-brand-pink transition-all">
                  <ChevronRight className="w-6 h-6" />
                </div>
              </Card>
            ))
          ) : (
            <Card className="p-20 text-center border-4 border-dashed border-slate-100 bg-white rounded-[48px] shadow-xl">
              <div className="w-24 h-24 bg-slate-50 rounded-[40px] flex items-center justify-center mx-auto mb-6 text-slate-200 shadow-inner">
                <BookOpen className="w-12 h-12" />
              </div>
              <div className="space-y-2">
                <p className="text-2xl font-display font-black text-slate-400">Con chưa có hoạt động nào...</p>
                <p className="text-slate-300 font-display font-bold">Hãy bắt đầu viết văn để lưu lại hành trình nhé!</p>
              </div>
            </Card>
          )}
        </div>
      </section>

      {/* History Detail Modal */}
      <Modal 
        isOpen={!!selectedItem} 
        onClose={() => setSelectedItem(null)} 
        title={selectedItem?.title || "Chi tiết bài học"}
      >
        {selectedItem && (
          <div className="space-y-8 p-2">
            <div className="flex items-center gap-3 text-slate-400 font-display font-bold">
              <Calendar className="w-5 h-5 text-brand-pink" />
              {new Date(selectedItem.date).toLocaleString('vi-VN')}
            </div>

            {selectedItem.type === 'feedback' ? (
              <div className="space-y-8">
                <div className="p-8 bg-brand-bg rounded-[32px] border-4 border-white shadow-inner">
                  <h5 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Bài văn của con</h5>
                  <p className="text-slate-700 leading-relaxed whitespace-pre-wrap font-display font-bold text-lg">{selectedItem.content}</p>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <ScoreItem label="Chính tả" score={(selectedItem.data as FeedbackResult).evaluation.scores.spelling} />
                  <ScoreItem label="Bố cục" score={(selectedItem.data as FeedbackResult).evaluation.scores.structure} />
                  <ScoreItem label="Từ vựng" score={(selectedItem.data as FeedbackResult).evaluation.scores.vocabulary} />
                  <ScoreItem label="Cảm xúc" score={(selectedItem.data as FeedbackResult).evaluation.scores.emotion} />
                </div>

                <div className="p-8 bg-green-50 rounded-[32px] border-none shadow-lg">
                  <h5 className="text-xl font-display font-black text-brand-green flex items-center gap-3 mb-4">
                    <CheckCircle2 className="w-6 h-6" /> Nhận xét của Cô
                  </h5>
                  <p className="text-slate-600 font-display font-bold text-lg leading-relaxed">{(selectedItem.data as FeedbackResult).teacherFeedback.content}</p>
                </div>

                {(selectedItem.data as FeedbackResult).strongSentences && (selectedItem.data as FeedbackResult).strongSentences!.length > 0 && (
                  <div className="p-8 bg-yellow-50 rounded-[32px] border-none shadow-lg space-y-6">
                    <h5 className="text-xl font-display font-black text-brand-yellow flex items-center gap-3">
                      <Star className="w-6 h-6 fill-current" /> Câu văn hay của con
                    </h5>
                    <div className="space-y-4">
                      {(selectedItem.data as FeedbackResult).strongSentences!.map((item, i) => (
                        <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border-2 border-yellow-100">
                          <p className="text-slate-800 font-display font-black italic mb-2">"{item.text}"</p>
                          <p className="text-slate-500 text-sm font-display font-bold">👏 {item.praise}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="p-8 bg-red-50 rounded-[32px] border-none shadow-lg">
                  <h5 className="text-xl font-display font-black text-red-500 flex items-center gap-3 mb-4">
                    <AlertCircle className="w-6 h-6" /> Các lỗi cần lưu ý
                  </h5>
                  <div className="space-y-3">
                    {(selectedItem.data as FeedbackResult).errors.spelling.slice(0, 3).map((err, i) => (
                      <div key={i} className="text-lg p-4 bg-white rounded-2xl text-slate-700 font-display font-bold border-2 border-red-100 shadow-sm">
                        Lỗi chính tả: <span className="line-through text-slate-400">{err.original}</span> → <b className="text-red-500">{err.correction}</b>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-8">
                <div className="p-8 bg-blue-50 rounded-[32px] border-none shadow-lg">
                  <h5 className="text-xs font-black text-brand-blue uppercase tracking-widest mb-4">Phân tích đề bài</h5>
                  <div className="space-y-2">
                    <p className="text-slate-700 font-display font-bold text-lg"><span className="text-brand-blue">Dạng bài:</span> {(selectedItem.data as IdeaMapResult).analysis.type}</p>
                    <p className="text-slate-700 font-display font-bold text-lg"><span className="text-brand-blue">Chủ đề:</span> {(selectedItem.data as IdeaMapResult).analysis.topic}</p>
                    <p className="text-slate-700 font-display font-bold text-lg"><span className="text-brand-blue">Yêu cầu:</span> {(selectedItem.data as IdeaMapResult).analysis.requirements}</p>
                    <p className="text-slate-700 font-display font-bold text-lg"><span className="text-brand-blue">Cảm xúc:</span> {(selectedItem.data as IdeaMapResult).analysis.emotion}</p>
                  </div>
                </div>
                
                <div className="space-y-6">
                  <h5 className="text-2xl font-display font-black text-slate-800">Dàn ý gợi ý</h5>
                  <div className="space-y-4">
                    <OutlineItem title="MỞ BÀI" content={(selectedItem.data as IdeaMapResult).outline.intro} />
                    <OutlineItem title="THÂN BÀI" content={(selectedItem.data as IdeaMapResult).outline.body} />
                    <OutlineItem title="KẾT BÀI" content={(selectedItem.data as IdeaMapResult).outline.conclusion} />
                  </div>
                </div>
              </div>
            )}

            <Button variant="pink" className="w-full py-6 text-xl rounded-3xl" onClick={() => setSelectedItem(null)}>Đóng lại</Button>
          </div>
        )}
      </Modal>
    </div>
  );
};

const StatCard = ({ icon, value, label, gradient, textColor = "text-white" }: { icon: React.ReactNode; value: string; label: string; gradient: string; textColor?: string }) => (
  <Card className={cn("bg-gradient-to-br", gradient, textColor, "border-none p-10 flex flex-col items-center gap-6 shadow-2xl rounded-[48px] relative overflow-hidden group")}>
    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700" />
    <div className="w-20 h-20 bg-white/20 rounded-[32px] flex items-center justify-center backdrop-blur-md shadow-lg">
      {icon}
    </div>
    <div className="text-center space-y-2">
      <p className="text-6xl font-display font-black drop-shadow-sm">{value}</p>
      <p className="text-sm font-black opacity-80 uppercase tracking-widest">{label}</p>
    </div>
  </Card>
);

const ScoreItem = ({ label, score }: { label: string; score: number }) => (
  <div className="bg-white p-5 rounded-3xl shadow-sm border-2 border-slate-50">
    <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">{label}</p>
    <div className="flex items-center justify-between gap-4">
      <div className="h-4 flex-1 bg-slate-100 rounded-full overflow-hidden shadow-inner">
        <motion.div 
          initial={{ width: 0 }} 
          animate={{ width: `${score * 10}%` }} 
          className={cn("h-full rounded-full shadow-lg", score >= 8 ? "bg-brand-green" : score >= 5 ? "bg-brand-yellow" : "bg-red-400")} 
        />
      </div>
      <span className="text-xl font-display font-black text-slate-700">{score}</span>
    </div>
  </div>
);

const OutlineItem = ({ title, content }: { title: string; content: string[] }) => (
  <div className="bg-white p-6 rounded-3xl border-4 border-white shadow-lg flex gap-4 items-start">
    <div className="w-3 h-3 bg-brand-blue rounded-full mt-2 flex-shrink-0 shadow-lg shadow-blue-200" />
    <div className="space-y-3">
      <h6 className="text-lg font-display font-black text-brand-blue">{title}</h6>
      <div className="space-y-1">
        {content.map((item, idx) => (
          <p key={idx} className="text-slate-600 font-display font-bold leading-relaxed flex items-start gap-2">
            <span className="mt-2 w-1.5 h-1.5 rounded-full bg-slate-300 shrink-0" />
            {item}
          </p>
        ))}
      </div>
    </div>
  </div>
);
