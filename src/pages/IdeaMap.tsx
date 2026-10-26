import React, { useState, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { Image as ImageIcon, X, Upload, Sparkles, Book, FileText, MessageSquare, Lightbulb, PenTool, Send, ArrowRight, GraduationCap, ChevronDown, Flower2, Star, AlertCircle } from 'lucide-react';
import { Card, Button, cn } from '../components/UI';
import { FormattedAIResponse } from '../components/FormattedAIResponse';
import { generateIdeaMap, refineIdeas, getIdeaSuggestion } from '../services/gemini';
import { IdeaMapResult, HistoryItem, ChatMessage } from '../types';
import { motion, AnimatePresence } from 'motion/react';

const GRADES = Array.from({ length: 12 }, (_, i) => `Lớp ${i + 1}`);

interface EssayType {
  id: string;
  title: string;
  description: string;
}

const ESSAY_TYPES: Record<'primary' | 'middle' | 'high', EssayType[]> = {
  primary: [
    { id: 'narrative_primary', title: 'Tập làm văn kể chuyện', description: 'Kể lại câu chuyện đã nghe, đã đọc; kể chuyện đời thường như chuyện bản thân, gia đình, nhà trường' },
    { id: 'descriptive_primary', title: 'Tập làm văn miêu tả', description: 'Tả đồ vật, cây cối, loài vật, cảnh vật, tả người' },
    { id: 'applied_primary', title: 'Văn bản ứng dụng', description: 'Viết thư, báo cáo, nhật ký, điền vào giấy tờ in sẵn' },
  ],
  middle: [
    { id: 'narrative_middle', title: 'Văn tự sự (kể chuyện)', description: 'Kể chuyện đời thường, kể chuyện tưởng tượng, kể chuyện có yếu tố miêu tả nội tâm' },
    { id: 'descriptive_middle', title: 'Văn miêu tả', description: 'Miêu tả cảnh, người, cảnh vật kết hợp biểu cảm' },
    { id: 'expressive_middle', title: 'Văn biểu cảm', description: 'Phát biểu cảm nghĩ về tác phẩm văn học, sự việc, con người' },
    { id: 'explanatory_middle', title: 'Văn thuyết minh', description: 'Giới thiệu về đồ vật, loài vật, danh lam thắng cảnh, thể loại văn học' },
    { id: 'argumentative_middle', title: 'Văn nghị luận cơ bản', description: 'Nghị luận xã hội hoặc nghị luận văn học ở mức cơ bản' },
  ],
  high: [
    { id: 'social_argumentative_high', title: 'Văn nghị luận xã hội', description: 'Trình bày ý kiến về tư tưởng đạo lý hoặc hiện tượng đời sống' },
    { id: 'literary_argumentative_high', title: 'Văn nghị luận văn học', description: 'Phân tích tác phẩm, cảm nhận thơ, so sánh tác phẩm, đánh giá nhân vật' },
    { id: 'explanatory_high', title: 'Văn bản thuyết minh / văn bản thông tin', description: 'Thuyết minh về hiện tượng tự nhiên, xã hội, quy trình' },
    { id: 'multimodal_high', title: 'Văn bản đa phương thức', description: 'Kết hợp văn bản với hình ảnh, biểu đồ hoặc thông tin trực quan' },
  ]
};

const getGradeGroup = (grade: string): 'primary' | 'middle' | 'high' => {
  const gradeNum = parseInt(grade.replace('Lớp ', ''));
  if (gradeNum <= 5) return 'primary';
  if (gradeNum <= 9) return 'middle';
  return 'high';
};

export const IdeaMap = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const initialPrompt = location.state?.initialPrompt || '';
  
  const [prompt, setPrompt] = useState(initialPrompt);
  const [grade, setGrade] = useState('Lớp 1');
  const [essayType, setEssayType] = useState(ESSAY_TYPES.primary[0].title);
  const [isTypeDropdownOpen, setIsTypeDropdownOpen] = useState(false);
  const [extra, setExtra] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<IdeaMapResult | null>(null);
  
  // Interactive expansion state
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Auto-update essay type when grade changes
  React.useEffect(() => {
    const group = getGradeGroup(grade);
    const types = ESSAY_TYPES[group];
    if (!types.find(t => t.title === essayType)) {
      setEssayType(types[0].title);
    }
  }, [grade]);

  // Click outside handler
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsTypeDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleRefine = async (customInput?: string) => {
    const text = customInput || chatInput;
    if (!text.trim() || !result) return;

    const userMsg: ChatMessage = { role: 'user', text };
    setChatHistory(prev => [...prev, userMsg]);
    setChatInput('');
    setChatLoading(true);

    try {
      const outlineStr = `Mở bài: ${result.outline.intro.join(', ')}\nThân bài: ${result.outline.body.join(', ')}\nKết bài: ${result.outline.conclusion.join(', ')}`;
      const response = await refineIdeas([...chatHistory, userMsg], outlineStr, prompt, grade);
      setChatHistory(prev => [...prev, { role: 'model', text: response }]);
    } catch (error) {
      console.error(error);
    } finally {
      setChatLoading(false);
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleGetSuggestion = async (type: 'opening' | 'description' | 'closing') => {
    if (!result) return;
    setChatLoading(true);
    try {
      const outlineStr = `Mở bài: ${result.outline.intro.join(', ')}\nThân bài: ${result.outline.body.join(', ')}\nKết bài: ${result.outline.conclusion.join(', ')}`;
      const response = await getIdeaSuggestion(type, prompt, grade, essayType, outlineStr);
      setChatHistory(prev => [...prev, { role: 'model', text: response }]);
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    } catch (error) {
      console.error(error);
    } finally {
      setChatLoading(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach((file: File) => {
      if (images.length >= 5) return;
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

  const handleGenerate = async () => {
    if (!prompt && images.length === 0) return;
    setLoading(true);
    setError(null);
    try {
      const data = await generateIdeaMap(prompt, grade, essayType, extra, images);
      setResult(data);
      const history: HistoryItem[] = JSON.parse(localStorage.getItem('writing_history') || '[]');
      history.unshift({ 
        id: Date.now(), 
        type: 'idea-map', 
        title: prompt || 'Đề bài từ ảnh', 
        date: new Date().toISOString(),
        data: data,
        prompt: prompt
      });
      localStorage.setItem('writing_history', JSON.stringify(history.slice(0, 20)));
    } catch (err: any) {
      console.error(err);
      setError(err?.message || "Đã xảy ra lỗi khi tạo dàn ý. Con hãy thử lại nhé!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <header className="text-center space-y-4">
        <h2 className="text-4xl text-brand-blue">Bản Đồ Ý Tưởng</h2>
        <p className="text-slate-500 font-medium">Cùng AI khám phá những ý tưởng tuyệt vời cho bài văn của con nhé!</p>
      </header>

      {!result ? (
        <Card className="p-10 space-y-10">
          <div className="space-y-8">
            <div className="space-y-4">
              <label className="text-2xl font-display font-black text-slate-700 flex items-center gap-2">
                <Lightbulb className="w-8 h-8 text-brand-yellow" /> Đề bài của con là gì?
              </label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Ví dụ: Em hãy tả lại một người thân mà em yêu quý nhất..."
                className="ed-input min-h-[160px] resize-none text-lg font-display font-bold"
              />
            </div>

            <div className="space-y-4">
              <label className="text-2xl font-display font-black text-slate-700 flex items-center gap-2">
                <ImageIcon className="w-8 h-8 text-brand-pink" /> Hoặc chụp ảnh đề bài
              </label>
              
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="upload-area cursor-pointer flex flex-col items-center justify-center gap-4 group"
              >
                <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center text-brand-pink shadow-lg group-hover:scale-110 transition-transform">
                  <Upload className="w-10 h-10" />
                </div>
                <div className="text-center">
                  <p className="text-xl font-display font-black text-slate-700">Kéo thả ảnh hoặc bấm để tải đề bài</p>
                  <p className="text-slate-400 font-display font-bold">Con có thể tải tối đa 5 ảnh nhé!</p>
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

            <div className="space-y-4">
              <label className="text-2xl font-display font-black text-slate-700 flex items-center gap-2">
                <GraduationCap className="w-8 h-8 text-brand-purple" /> Con đang học lớp mấy?
              </label>
              <div className="relative">
                <select
                  value={grade}
                  onChange={(e) => setGrade(e.target.value)}
                  className="ed-input appearance-none text-lg font-display font-bold pr-12 cursor-pointer"
                >
                  {GRADES.map((g) => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-6 h-6 text-slate-400 pointer-events-none" />
              </div>
              <p className="text-slate-400 font-display font-bold text-sm">
                AI sẽ điều chỉnh độ khó, từ vựng và độ dài bài phù hợp với lớp của con.
              </p>
            </div>

            <div className="space-y-4">
              <label className="text-2xl font-display font-black text-slate-700 flex items-center gap-2">
                <PenTool className="w-8 h-8 text-brand-pink" /> Dạng bài con muốn viết
              </label>
              <div className="relative" ref={dropdownRef}>
                <div 
                  onClick={() => setIsTypeDropdownOpen(!isTypeDropdownOpen)}
                  className="ed-input flex items-center justify-between cursor-pointer min-h-[64px] py-3"
                >
                  <div className="flex flex-col">
                    <span className="text-lg font-display font-black text-slate-800">{essayType}</span>
                    <span className="text-xs text-slate-400 font-display font-bold">
                      {ESSAY_TYPES[getGradeGroup(grade)].find(t => t.title === essayType)?.description}
                    </span>
                  </div>
                  <ChevronDown className={cn("w-6 h-6 text-slate-400 transition-transform", isTypeDropdownOpen && "rotate-180")} />
                </div>

                <AnimatePresence>
                  {isTypeDropdownOpen && (
                    <motion.div 
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute z-50 left-0 right-0 mt-2 bg-white rounded-[32px] shadow-2xl border-4 border-white overflow-hidden"
                    >
                      <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                        {ESSAY_TYPES[getGradeGroup(grade)].map((type) => (
                          <div 
                            key={type.id}
                            onClick={() => {
                              setEssayType(type.title);
                              setIsTypeDropdownOpen(false);
                            }}
                            className={cn(
                              "p-6 hover:bg-brand-bg cursor-pointer transition-colors border-b border-slate-50 last:border-none",
                              essayType === type.title && "bg-pink-50"
                            )}
                          >
                            <p className="text-lg font-display font-black text-slate-800 mb-1">{type.title}</p>
                            <p className="text-sm text-slate-400 font-display font-bold leading-relaxed">
                              {type.description}
                            </p>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            <div className="space-y-4">
              <label className="text-2xl font-display font-black text-slate-700 flex items-center gap-2">
                <Sparkles className="w-8 h-8 text-brand-blue" /> Yêu cầu thêm (nếu có)
              </label>
              <input
                type="text"
                value={extra}
                onChange={(e) => setExtra(e.target.value)}
                placeholder="Ví dụ: Viết khoảng 200 chữ, dùng nhiều từ láy..."
                className="ed-input text-lg font-display font-bold"
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
            onClick={handleGenerate}
            disabled={loading || (!prompt && images.length === 0)}
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
                Tạo Bản Đồ Ý Tưởng
              </>
            )}
          </Button>
        </Card>
      ) : (
        <div className="space-y-10">
          <Button variant="ghost" onClick={() => setResult(null)} className="flex items-center gap-3 text-brand-pink font-black text-lg">
            <X className="w-6 h-6" /> Làm đề bài khác
          </Button>

          <Card className="bg-yellow-50 border-none shadow-xl shadow-yellow-100/50 p-10">
            <div className="flex items-start gap-6">
              <div className="p-5 bg-white rounded-3xl text-brand-yellow shadow-lg">
                <Book className="w-10 h-10" />
              </div>
              <div className="space-y-6">
                <h3 className="text-3xl font-display font-black text-brand-yellow">Phân tích đề bài</h3>
                <div className="space-y-3">
                  <p className="text-xl text-slate-700 font-display font-bold flex items-start gap-3">
                    <span className="mt-2 w-2 h-2 rounded-full bg-brand-yellow shrink-0" />
                    <span className="text-slate-400">Dạng bài:</span> {result.analysis.type}
                  </p>
                  <p className="text-xl text-slate-700 font-display font-bold flex items-start gap-3">
                    <span className="mt-2 w-2 h-2 rounded-full bg-brand-yellow shrink-0" />
                    <span className="text-slate-400">Chủ đề chính:</span> {result.analysis.topic}
                  </p>
                  <p className="text-xl text-slate-700 font-display font-bold flex items-start gap-3">
                    <span className="mt-2 w-2 h-2 rounded-full bg-brand-yellow shrink-0" />
                    <span className="text-slate-400">Yêu cầu của đề:</span> {result.analysis.requirements}
                  </p>
                  <p className="text-xl text-slate-700 font-display font-bold flex items-start gap-3">
                    <span className="mt-2 w-2 h-2 rounded-full bg-brand-yellow shrink-0" />
                    <span className="text-slate-400">Cảm xúc/Thông điệp:</span> {result.analysis.emotion}
                  </p>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-10 space-y-10 border-none shadow-2xl">
            <h3 className="text-3xl font-display font-black text-slate-800 flex items-center gap-4">
              <FileText className="w-10 h-10 text-brand-pink" />
              Dàn ý chi tiết
            </h3>
            
            <div className="space-y-8">
              <OutlineSection title="MỞ BÀI" content={result.outline.intro} color="border-brand-pink" bgColor="bg-pink-50/50" />
              <OutlineSection title="THÂN BÀI" content={result.outline.body} color="border-brand-purple" bgColor="bg-purple-50/50" />
              <OutlineSection title="KẾT BÀI" content={result.outline.conclusion} color="border-brand-blue" bgColor="bg-blue-50/50" />
            </div>
          </Card>

          {/* AI Idea Support Buttons */}
          <Card className="p-8 bg-gradient-to-br from-pink-50 to-purple-50 border-none shadow-xl rounded-[40px]">
            <div className="grid md:grid-cols-3 gap-4">
              <Button 
                variant="pink" 
                onClick={() => handleGetSuggestion('opening')}
                className="py-6 text-lg rounded-2xl shadow-lg shadow-pink-100 font-display font-black"
              >
                <Sparkles className="w-5 h-5 mr-2" /> Gợi ý mở bài hay
              </Button>
              <Button 
                variant="purple" 
                onClick={() => handleGetSuggestion('description')}
                className="py-6 text-lg rounded-2xl shadow-lg shadow-purple-100 font-display font-black"
              >
                <Flower2 className="w-5 h-5 mr-2" /> Gợi ý miêu tả sinh động
              </Button>
              <Button 
                variant="purple" 
                onClick={() => handleGetSuggestion('closing')}
                className="py-6 text-lg rounded-2xl shadow-lg shadow-blue-100 font-display font-black bg-gradient-to-r from-purple-500 to-blue-500"
              >
                <Star className="w-5 h-5 mr-2" /> Gợi ý câu kết ấn tượng
              </Button>
            </div>
          </Card>

          <div className="grid md:grid-cols-3 gap-8">
            <SupportCard title="Từ hay" icon={<MessageSquare className="text-brand-pink w-8 h-8" />} items={result.support.vocabulary} color="bg-pink-50" />
            <SupportCard title="Hình ảnh" icon={<ImageIcon className="text-brand-blue w-8 h-8" />} items={result.support.imagery} color="bg-blue-50" />
            <SupportCard title="Câu mẫu" icon={<PenTool className="text-brand-yellow w-8 h-8" />} items={result.support.examples} color="bg-yellow-50" />
          </div>

          <div className="flex gap-4">
            <Button 
              variant="ghost" 
              onClick={() => handleRefine("Gợi ý thêm cho con một vài ý tưởng sáng tạo khác nhé!")}
              className="flex-1 bg-white border-2 border-pink-100 text-brand-pink hover:bg-pink-50 rounded-2xl py-4 font-display font-black"
            >
              <Lightbulb className="w-5 h-5 mr-2" /> Gợi ý thêm ý tưởng
            </Button>
            <Button 
              variant="ghost" 
              onClick={() => handleRefine("Cô ơi, cô gợi ý cho con một vài ví dụ sinh động để bài văn hay hơn được không ạ?")}
              className="flex-1 bg-white border-2 border-purple-100 text-brand-purple hover:bg-purple-50 rounded-2xl py-4 font-display font-black"
            >
              <Sparkles className="w-5 h-5 mr-2" /> Bổ sung ví dụ sinh động
            </Button>
          </div>

          {/* Interactive Idea Expansion Section */}
          <Card className="p-10 space-y-8 border-none shadow-2xl rounded-[48px] bg-white">
            <div className="space-y-2">
              <h3 className="text-3xl font-display font-black text-slate-800 flex items-center gap-4">
                <MessageSquare className="w-10 h-10 text-brand-purple" />
                Góc Sáng Tạo Ý Tưởng
              </h3>
              <p className="text-lg text-slate-500 font-display font-bold">
                Con có thể hỏi thêm, bổ sung ý tưởng hoặc chia sẻ suy nghĩ của mình trước khi bắt đầu viết.
              </p>
            </div>

            <div className="space-y-6 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
              {chatHistory.map((msg, idx) => (
                <div key={idx} className={cn("flex", msg.role === 'user' ? "justify-end" : "justify-start")}>
                  <div className={cn(
                    "max-w-[85%] p-6 rounded-[32px] shadow-md",
                    msg.role === 'user' 
                      ? "bg-brand-purple text-white rounded-tr-none font-display font-bold text-lg leading-relaxed" 
                      : "bg-brand-bg text-slate-700 rounded-tl-none border-4 border-white"
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
                  <div className="bg-brand-bg p-6 rounded-[32px] rounded-tl-none border-4 border-white flex gap-2">
                    <motion.div animate={{ opacity: [0, 1, 0] }} transition={{ repeat: Infinity, duration: 1 }} className="w-3 h-3 bg-brand-purple rounded-full" />
                    <motion.div animate={{ opacity: [0, 1, 0] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }} className="w-3 h-3 bg-brand-purple rounded-full" />
                    <motion.div animate={{ opacity: [0, 1, 0] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4 }} className="w-3 h-3 bg-brand-purple rounded-full" />
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            <div className="space-y-4">
              <textarea
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Con muốn bổ sung ý tưởng nào không?&#10;Hay con muốn hỏi cô thêm gợi ý?"
                className="ed-input min-h-[120px] resize-none text-lg font-display font-bold p-6"
              />
              <Button 
                variant="pink" 
                onClick={() => handleRefine()}
                disabled={chatLoading || !chatInput.trim()}
                className="w-full py-6 text-xl rounded-3xl shadow-xl shadow-pink-200"
              >
                <Sparkles className="w-6 h-6 mr-2" /> Nhờ Cô Gợi Ý Thêm
              </Button>
            </div>
          </Card>

          <div className="pt-6">
            <Button 
              variant="purple" 
              onClick={() => navigate('/feedback', { state: { initialEssay: '', prompt: prompt } })}
              className="w-full py-8 text-2xl rounded-[32px] shadow-2xl shadow-purple-200 animate-glow"
            >
              Bắt đầu viết bài <ArrowRight className="w-8 h-8 ml-3" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

const OutlineSection = ({ title, content, color, bgColor }: { title: string; content: string[]; color: string; bgColor: string; key?: any }) => (
  <div className={cn("pl-8 border-l-8 py-6 px-8 rounded-r-[32px] transition-all hover:translate-x-2", color, bgColor)}>
    <h4 className="text-2xl font-display font-black text-slate-800 mb-4">{title}</h4>
    <div className="space-y-3">
      {content.map((item, idx) => (
        <p key={idx} className="text-lg text-slate-600 font-display font-bold leading-relaxed flex items-start gap-3">
          <span className="mt-2 w-2 h-2 rounded-full bg-slate-300 shrink-0" />
          {item}
        </p>
      ))}
    </div>
  </div>
);

const SupportCard = ({ title, icon, items, color }: { title: string; icon: React.ReactNode; items: string[]; color: string }) => (
  <Card className={cn("p-6 border-none shadow-none space-y-4", color)}>
    <div className="flex items-center gap-3">
      <div className="p-2 bg-white rounded-xl shadow-sm">{icon}</div>
      <h4 className="text-lg text-slate-800">{title}</h4>
    </div>
    <ul className="space-y-2">
      {items.map((item, idx) => (
        <li key={idx} className="text-sm text-slate-600 font-bold bg-white/50 px-3 py-2 rounded-xl">
          • {item}
        </li>
      ))}
    </ul>
  </Card>
);
