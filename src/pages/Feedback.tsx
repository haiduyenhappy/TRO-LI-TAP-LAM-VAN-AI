import React, { useState, useRef, useEffect } from 'react';
import { Upload, X, Sparkles, MessageCircle, AlertCircle, CheckCircle2, Heart, Lightbulb, HelpCircle, Send, Mail, Check, Wand2, MessageSquare, PenTool, Star } from 'lucide-react';
import { Card, Button, cn } from '../components/UI';
import { FormattedAIResponse } from '../components/FormattedAIResponse';
import { analyzeEssay, chatWithTeacher, improveSentence } from '../services/gemini';
import { FeedbackResult, ChatMessage, HistoryItem } from '../types';
import { motion, AnimatePresence } from 'motion/react';

export const Feedback = () => {
  const [essay, setEssay] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<FeedbackResult | null>(null);
  const [grade, setGrade] = useState('Lớp 6');
  
  // Chat state
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Sentence improver state
  const [improvingId, setImprovingId] = useState<number | null>(null);
  const [improvement, setImprovement] = useState<{ original: string; improved: string; explanation: string } | null>(null);

  // Email state
  const [teacherEmail, setTeacherEmail] = useState('');
  const [sendingEmail, setSendingEmail] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach((file: File) => {
      if (images.length >= 10) return;
      const reader = new FileReader();
      reader.onloadend = () => {
        setImages(prev => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleAnalyze = async () => {
    if (!essay && images.length === 0) return;
    setLoading(true);
    setError(null);
    try {
      const data = await analyzeEssay(essay, grade, images);
      setResult(data);
      
      const history: HistoryItem[] = JSON.parse(localStorage.getItem('writing_history') || '[]');
      history.unshift({ 
        id: Date.now(), 
        type: 'feedback', 
        title: essay.slice(0, 30) || 'Bài văn từ ảnh', 
        date: new Date().toISOString(),
        data: data,
        content: essay
      });
      localStorage.setItem('writing_history', JSON.stringify(history.slice(0, 20)));
      
      // Initial teacher message
      setChatHistory([{ role: 'model', text: `Chào con! Cô đã xem qua bài văn của con rồi. Con có muốn cô giải thích thêm phần nào không?` }]);
    } catch (err: any) {
      console.error(err);
      setError(err?.message || "Đã xảy ra lỗi khi chấm bài. Con hãy thử lại nhé!");
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!chatInput.trim() || !result) return;
    
    const userMsg: ChatMessage = { role: 'user', text: chatInput };
    setChatHistory(prev => [...prev, userMsg]);
    setChatInput('');
    setChatLoading(true);

    try {
      const context = `Bài văn: ${result.essayContent}\n\nNhận xét của cô: ${JSON.stringify(result.teacherFeedback)}\nLỗi: ${JSON.stringify(result.errors)}`;
      const response = await chatWithTeacher([...chatHistory, userMsg], context, grade);
      setChatHistory(prev => [...prev, { role: 'model', text: response }]);
    } catch (error) {
      console.error(error);
    } finally {
      setChatLoading(false);
    }
  };

  const handleImproveSentence = async (paragraph: string, index: number) => {
    setImprovingId(index);
    setImprovement(null);
    try {
      const data = await improveSentence(paragraph, grade);
      setImprovement(data);
    } catch (error) {
      console.error(error);
    } finally {
      setImprovingId(null);
    }
  };

  const handleSendEmail = async () => {
    if (!teacherEmail || !result) return;
    setSendingEmail(true);
    try {
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: teacherEmail,
          studentName: "Học sinh",
          prompt: "Bài tập làm văn",
          essay: result.essayContent,
          feedback: result.teacherFeedback,
          improvement: result.evaluation.improvement
        })
      });
      if (response.ok) {
        setEmailSent(true);
        setTimeout(() => setEmailSent(false), 3000);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setSendingEmail(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-10 pb-20">
      <header className="text-center space-y-6 py-10">
        <motion.div 
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="w-24 h-24 bg-gradient-to-br from-brand-pink to-brand-pink-light rounded-[40px] flex items-center justify-center text-white mx-auto shadow-xl shadow-pink-200"
        >
          <PenTool className="w-12 h-12" />
        </motion.div>
        <div className="space-y-2">
          <h2 className="text-5xl font-display font-black text-slate-800">
            Cô Góp Ý Bài Văn
          </h2>
          <p className="text-xl text-slate-500 font-display font-bold">Gửi bài văn của con để Cô xem và góp ý cho con tiến bộ hơn nhé!</p>
        </div>

        <div className="flex flex-wrap gap-2 justify-center max-w-2xl mx-auto">
          {['Lớp 1', 'Lớp 2', 'Lớp 3', 'Lớp 4', 'Lớp 5', 'Lớp 6', 'Lớp 7', 'Lớp 8', 'Lớp 9', 'Lớp 10', 'Lớp 11', 'Lớp 12'].map((g) => (
            <button
              key={g}
              onClick={() => setGrade(g)}
              className={cn(
                "px-4 py-2 rounded-xl font-display font-bold transition-all text-sm",
                grade === g 
                  ? "bg-brand-pink text-white shadow-lg scale-105" 
                  : "bg-white text-slate-500 hover:bg-pink-50 border-2 border-slate-100"
              )}
            >
              {g}
            </button>
          ))}
        </div>
      </header>

      {!result ? (
        <Card className="p-10 space-y-10 border-none shadow-2xl shadow-pink-100/50">
          <div className="space-y-8">
            <div className="space-y-4">
              <label className="text-2xl font-display font-black text-slate-700 flex items-center gap-3">
                <PenTool className="w-8 h-8 text-brand-pink" /> Con hãy dán bài văn vào đây...
              </label>
              <textarea
                value={essay}
                onChange={(e) => setEssay(e.target.value)}
                placeholder="Dán bài văn của con tại đây..."
                className="ed-input min-h-[300px] resize-none text-lg font-display font-bold"
              />
            </div>

            <div className="space-y-4">
              <label className="text-2xl font-display font-black text-slate-700 flex items-center gap-3">
                <Upload className="w-8 h-8 text-brand-purple" /> Hoặc tải ảnh bài viết tay
              </label>
              
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="upload-area cursor-pointer flex flex-col items-center justify-center gap-4 group"
              >
                <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center text-brand-purple shadow-lg group-hover:scale-110 transition-transform">
                  <Upload className="w-10 h-10" />
                </div>
                <div className="text-center">
                  <p className="text-xl font-display font-black text-slate-700">Kéo thả ảnh hoặc bấm để tải bài viết</p>
                  <p className="text-slate-400 font-display font-bold">Con có thể tải tối đa 10 ảnh nhé!</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-4 mt-6">
                {images.map((img, idx) => (
                  <motion.div 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    key={idx} 
                    className="relative w-28 h-28 rounded-3xl overflow-hidden border-4 border-white shadow-xl"
                  >
                    <img src={img} alt="upload" className="w-full h-full object-cover" />
                    <button
                      onClick={(e) => { e.stopPropagation(); removeImage(idx); }}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-2xl p-2 shadow-lg hover:scale-110 transition-transform"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </motion.div>
                ))}
              </div>
              
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageUpload}
                accept="image/*"
                multiple
                className="hidden"
              />
            </div>
          </div>

          {error && (
            <div className="p-4 bg-red-50 border-2 border-red-200 rounded-2xl flex items-center gap-3 text-red-600 font-display font-bold">
              <AlertCircle className="w-6 h-6 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <Button
            variant="purple"
            onClick={handleAnalyze}
            disabled={loading || (!essay && images.length === 0)}
            className="w-full py-8 text-2xl animate-glow"
          >
            {loading ? (
              <>
                <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin" />
                Cô đang đọc bài của con...
              </>
            ) : (
              <>
                <Sparkles className="w-8 h-8" />
                Nhận Góp Ý Từ Cô
              </>
            )}
          </Button>
        </Card>
      ) : (
        <div className="space-y-10">
          <Button variant="ghost" onClick={() => setResult(null)} className="flex items-center gap-3 text-brand-pink font-black text-lg bg-white shadow-md hover:bg-pink-50 rounded-2xl px-6 py-3">
            <X className="w-6 h-6" /> Kiểm tra bài khác
          </Button>

          {/* Essay Content with Sentence Improver */}
          <Card className="p-10 space-y-8 border-none shadow-2xl">
            <h3 className="text-3xl font-display font-black text-slate-800 flex items-center gap-4">
              <PenTool className="w-10 h-10 text-brand-pink" /> 
              Bài văn của con
            </h3>
            <div className="space-y-10">
              {result.essayContent.split('\n').filter(p => p.trim()).map((para, idx) => (
                <div key={idx} className="space-y-4 group">
                  <p className="text-xl text-slate-700 leading-relaxed font-display font-bold">{para}</p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleImproveSentence(para, idx)}
                    className="text-brand-pink flex items-center gap-2 bg-pink-50 hover:bg-pink-100 border-2 border-pink-100 rounded-2xl"
                  >
                    <Wand2 className="w-5 h-5" /> AI giúp con sửa câu
                  </Button>
                  
                  <AnimatePresence>
                    {improvingId === idx && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
                        <div className="p-6 bg-brand-bg rounded-[32px] border-4 border-dashed border-brand-pink/20 flex items-center justify-center font-display font-black text-brand-pink">
                          <div className="w-6 h-6 border-4 border-brand-pink border-t-transparent rounded-full animate-spin mr-3" />
                          Cô đang suy nghĩ cách sửa hay hơn...
                        </div>
                      </motion.div>
                    )}
                    {improvement && !improvingId && idx === result.essayContent.split('\n').filter(p => p.trim()).indexOf(improvement.original) && (
                      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-8 bg-pink-50 rounded-[32px] border-4 border-white shadow-xl space-y-6">
                        <div className="space-y-2">
                          <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Câu gốc của con</p>
                          <p className="text-slate-500 line-through text-lg font-display font-bold">{improvement.original}</p>
                        </div>
                        <div className="space-y-2">
                          <p className="text-xs font-black text-brand-pink uppercase tracking-widest">Cô gợi ý viết thế này</p>
                          <p className="text-brand-pink font-black text-2xl leading-tight">{improvement.improved}</p>
                        </div>
                        <div className="p-5 bg-white rounded-2xl text-lg text-slate-600 italic border-2 border-pink-100">
                          <FormattedAIResponse content={`💡 ${improvement.explanation}`} />
                        </div>
                        <div className="flex gap-4">
                          <Button variant="pink" size="md" onClick={() => {
                            const paragraphs = result.essayContent.split('\n');
                            const targetIdx = paragraphs.indexOf(improvement.original);
                            if (targetIdx !== -1) {
                              paragraphs[targetIdx] = improvement.improved;
                              setResult({ ...result, essayContent: paragraphs.join('\n') });
                            }
                            setImprovement(null);
                          }}>Chấp nhận</Button>
                          <Button variant="ghost" size="md" className="border-2 border-pink-200" onClick={() => setImprovement(null)}>Bỏ qua</Button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          </Card>

          {/* Teacher's Note */}
          <Card className="bg-yellow-50 border-none shadow-2xl shadow-yellow-100/50 p-10">
            <div className="flex items-start gap-8">
              <div className="w-24 h-24 bg-white rounded-[40px] flex items-center justify-center text-brand-yellow shadow-xl flex-shrink-0">
                <MessageCircle className="w-12 h-12" />
              </div>
              <div className="space-y-6 flex-1">
                <h3 className="text-3xl font-display font-black text-brand-yellow">Nhận xét của Cô</h3>
                <div className="grid gap-6">
                  <FeedbackItem title="Nội dung" content={result.teacherFeedback.content} />
                  <FeedbackItem title="Bố cục" content={result.teacherFeedback.structure} />
                  <FeedbackItem title="Cảm xúc" content={result.teacherFeedback.emotion} />
                </div>
              </div>
            </div>
          </Card>

          {/* Strong Sentences Section */}
          {result.strongSentences && result.strongSentences.length > 0 && (
            <Card className="bg-[#FFFBEB] border-none shadow-2xl shadow-yellow-100/30 p-10 rounded-[48px]">
              <div className="space-y-8">
                <h3 className="text-3xl font-display font-black text-slate-800 flex items-center gap-4">
                  <Star className="w-10 h-10 text-brand-yellow fill-current" />
                  Câu văn hay của con
                </h3>
                <div className="space-y-6">
                  {result.strongSentences.map((item, idx) => (
                    <motion.div 
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      key={idx} 
                      className="bg-white p-8 rounded-[32px] border-4 border-white shadow-lg space-y-4"
                    >
                      <div className="space-y-2">
                        <p className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                          <Star className="w-4 h-4 text-brand-yellow fill-current" /> Câu văn nổi bật
                        </p>
                        <p className="text-slate-800 text-xl font-display font-black italic leading-relaxed">
                          "{item.text}"
                        </p>
                      </div>
                      <div className="pt-4 border-t-2 border-slate-50">
                        <p className="text-xs font-black text-brand-pink uppercase tracking-widest flex items-center gap-2 mb-2">
                          <CheckCircle2 className="w-4 h-4" /> Nhận xét của cô
                        </p>
                        <p className="text-slate-600 text-lg flex items-center gap-3">
                          <FormattedAIResponse content={`👏 ${item.praise}`} />
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </Card>
          )}

          {/* Errors Section */}
          <div className="grid md:grid-cols-2 gap-8">
            <Card className="p-8 border-none bg-pink-50 shadow-xl shadow-pink-100/50">
              <h4 className="text-2xl font-display font-black text-brand-pink flex items-center gap-3 mb-6">
                <AlertCircle className="w-8 h-8" /> Phát hiện lỗi
              </h4>
              <div className="space-y-6">
                <ErrorList title="Chính tả" errors={result.errors.spelling} />
                <ErrorList title="Dùng từ" errors={result.errors.vocabulary} />
                <ErrorList title="Đặt câu" errors={result.errors.sentences} />
              </div>
            </Card>

            <Card className="p-8 border-none bg-purple-50 shadow-xl shadow-purple-100/50">
              <h4 className="text-2xl font-display font-black text-brand-purple flex items-center gap-3 mb-6">
                <CheckCircle2 className="w-8 h-8" /> Đánh giá & Cải thiện
              </h4>
              <div className="space-y-6">
                <div className="bg-white p-6 rounded-3xl shadow-sm border-2 border-purple-100">
                  <p className="text-xs font-black text-brand-purple uppercase mb-2 tracking-widest">Đánh giá chung</p>
                  <FormattedAIResponse content={result.evaluation.overall} />
                </div>
                <div className="bg-white p-6 rounded-3xl shadow-sm border-2 border-purple-100">
                  <p className="text-xs font-black text-brand-purple uppercase mb-2 tracking-widest">Hướng cải thiện</p>
                  <FormattedAIResponse content={result.evaluation.improvement} />
                </div>
              </div>
            </Card>
          </div>

          {/* Chat Section */}
          <Card className="p-0 overflow-hidden border-none shadow-2xl flex flex-col h-[600px] rounded-[48px]">
            <div className="bg-gradient-to-r from-brand-purple to-brand-blue p-8 text-white flex items-center gap-4">
              <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md">
                <MessageSquare className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-display font-black">Góc Trò Chuyện Cùng Cô</h3>
            </div>
            <div className="flex-1 overflow-y-auto p-8 space-y-6 bg-brand-bg/30">
              {chatHistory.map((msg, idx) => (
                <div key={idx} className={cn("flex", msg.role === 'user' ? "justify-end" : "justify-start")}>
                  <div className={cn(
                    "max-w-[85%] p-6 rounded-[32px] shadow-lg",
                    msg.role === 'user' 
                      ? "bg-brand-purple text-white rounded-tr-none font-display font-bold text-lg leading-relaxed" 
                      : "bg-white text-slate-700 rounded-tl-none border-4 border-white"
                  )}>
                    {msg.role === 'user' ? (
                      msg.text
                    ) : (
                      <FormattedAIResponse content={msg.text} />
                    )}
                  </div>
                </div>
              ))}
              {chatLoading && (
                <div className="flex justify-start">
                  <div className="bg-white p-6 rounded-[32px] rounded-tl-none border-4 border-white flex gap-2">
                    <motion.div animate={{ opacity: [0, 1, 0] }} transition={{ repeat: Infinity, duration: 1 }} className="w-3 h-3 bg-brand-purple rounded-full" />
                    <motion.div animate={{ opacity: [0, 1, 0] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }} className="w-3 h-3 bg-brand-purple rounded-full" />
                    <motion.div animate={{ opacity: [0, 1, 0] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4 }} className="w-3 h-3 bg-brand-purple rounded-full" />
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>
            <div className="p-8 bg-white border-t-4 border-brand-bg flex gap-4">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Con muốn hỏi cô điều gì thêm?"
                className="ed-input flex-1 text-lg font-display font-bold"
              />
              <Button onClick={handleSendMessage} variant="purple" className="p-5 rounded-2xl">
                <Send className="w-8 h-8" />
              </Button>
            </div>
          </Card>

          {/* Send to Teacher */}
          <Card className="p-10 border-none bg-white shadow-2xl rounded-[48px] space-y-6">
            <h3 className="text-3xl font-display font-black text-slate-800 flex items-center gap-4">
              <Mail className="w-10 h-10 text-brand-yellow" /> Gửi kết quả cho giáo viên
            </h3>
            <div className="flex flex-col sm:flex-row gap-6">
              <input
                type="email"
                value={teacherEmail}
                onChange={(e) => setTeacherEmail(e.target.value)}
                placeholder="Nhập email giáo viên"
                className="ed-input flex-1 text-lg font-display font-bold"
              />
              <Button variant="yellow" onClick={handleSendEmail} disabled={sendingEmail || emailSent} className="flex items-center gap-3 text-xl px-10">
                {sendingEmail ? "Đang gửi..." : emailSent ? <><Check className="w-6 h-6" /> Đã gửi</> : "Gửi kết quả"}
              </Button>
            </div>
          </Card>

          {/* Encouragement */}
          <Card className="bg-gradient-to-br from-[#FF9ACF] to-[#FFC7E8] border-none shadow-2xl p-12 text-center space-y-6 rounded-[48px] relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
              <Star className="w-24 h-24 absolute top-10 left-10 animate-float" />
              <Heart className="w-24 h-24 absolute bottom-10 right-10 animate-float" style={{ animationDelay: '1s' }} />
            </div>
            <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ repeat: Infinity, duration: 2 }}>
              <Heart className="w-20 h-20 text-white mx-auto fill-current drop-shadow-lg" />
            </motion.div>
            <h3 className="text-4xl font-display font-black text-white drop-shadow-sm">Lời nhắn gửi Con</h3>
            <div className="text-2xl text-white italic drop-shadow-sm">
              <FormattedAIResponse content={`"${result.message}"`} className="text-white" />
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

const FeedbackItem = ({ title, content }: { title: string; content: string }) => (
  <div className="bg-white/80 p-6 rounded-3xl shadow-sm border-2 border-yellow-100">
    <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">{title}</p>
    <FormattedAIResponse content={content} />
  </div>
);

const ErrorList = ({ title, errors }: { title: string; errors: any[] }) => {
  if (errors.length === 0) return null;
  return (
    <div className="space-y-3">
      <p className="text-sm font-black text-brand-pink uppercase tracking-widest">{title}</p>
      {errors.map((err, idx) => (
        <div key={idx} className="bg-white p-4 rounded-2xl shadow-sm border-2 border-pink-100 text-sm">
          <div className="flex items-center gap-2 mb-1">
            <span className="line-through text-slate-400 font-display font-bold">{err.original}</span>
            <span className="text-brand-pink font-black">→ {err.correction}</span>
          </div>
          <p className="text-slate-500 italic font-display font-bold">💡 {err.reason}</p>
        </div>
      ))}
    </div>
  );
};

