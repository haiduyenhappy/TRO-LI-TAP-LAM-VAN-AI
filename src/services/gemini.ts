import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import { IdeaMapResult, FeedbackResult, ChatMessage } from "../types";

const API_KEY = process.env.GEMINI_API_KEY || "";
const genAI = new GoogleGenAI({ apiKey: API_KEY });

export const generateIdeaMap = async (
  prompt: string,
  grade: string,
  essayType: string,
  extra: string,
  images: string[] = []
): Promise<IdeaMapResult> => {
  const model = genAI.models.generateContent({
    model: "gemini-3.8-flash",
    contents: [
      {
        parts: [
          {
            text: `Bạn là một giáo viên dạy văn (xưng là "cô") giỏi, thân thiện. Hãy giúp học sinh lập dàn ý cho đề bài sau:
            Đề bài: ${prompt}
            Lớp: ${grade}
            Dạng bài: ${essayType}
            Yêu cầu thêm: ${extra}
            
            Quy tắc giao tiếp quan trọng:
            1. KHÔNG dùng tên riêng (như Cô Mai), chỉ xưng là "cô".
            2. Điều chỉnh độ khó, từ vựng và độ dài bài phù hợp với trình độ của học sinh lớp ${grade}:
               - Lớp 1-2: Từ vựng rất đơn giản, cực ngắn, 2-3 ý chính.
               - Lớp 3-5: Cấu trúc rõ ràng, giải thích đơn giản, 3-4 ý chính.
               - Lớp 6-9: Ý tưởng chi tiết hơn, phân tích cơ bản, 4-5 ý chính.
               - Lớp 10-12: Tư duy phân tích, cấu trúc lập luận, ví dụ dẫn chứng sâu sắc.
            3. Trình bày các gợi ý trong dàn ý rõ ràng, ngắn gọn.
            
            Lưu ý về dạng bài:
            - Nếu là Văn kể chuyện/tự sự: Tập trung vào cốt truyện, các sự việc chính, nhân vật và diễn biến tâm lý.
            - Nếu là Văn miêu tả: Tập trung vào quan sát, hình ảnh sinh động, so sánh, nhân hóa và cảm nhận qua các giác quan.
            - Nếu là Văn nghị luận: Tập trung vào luận điểm rõ ràng, luận cứ thuyết phục và dẫn chứng cụ thể.
            - Nếu là Văn thuyết minh/thông tin: Tập trung vào tính chính xác, khách quan, cung cấp thông tin rõ ràng và logic.
            - Nếu là Văn biểu cảm: Tập trung vào cảm xúc chân thành, suy nghĩ sâu sắc về đối tượng.

            Hãy trả về kết quả dưới dạng JSON với cấu trúc sau:
            {
              "analysis": {
                "type": "Dạng bài",
                "topic": "Chủ đề chính",
                "requirements": "Các yêu cầu cụ thể",
                "emotion": "Cảm xúc hoặc thông điệp"
              },
              "outline": {
                "intro": ["Ý 1 cho mở bài", "Ý 2 cho mở bài"],
                "body": ["Ý 1 cho thân bài", "Ý 2 cho thân bài", "Ý 3 cho thân bài", "Ý 4 cho thân bài"],
                "conclusion": ["Ý 1 cho kết bài", "Ý 2 cho kết bài"]
              },
              "support": {
                "vocabulary": ["từ hay 1", "từ hay 2"],
                "imagery": ["hình ảnh miêu tả 1", "hình ảnh miêu tả 2"],
                "examples": ["câu mở bài mẫu 1", "câu mở bài mẫu 2"]
              }
            }
            Lưu ý: Ngôn ngữ phải gần gũi, khích lệ. Hãy đảm bảo JSON hợp lệ.`
          },
          ...images.map(img => ({
            inlineData: {
              data: img.split(',')[1],
              mimeType: "image/png"
            }
          }))
        ]
      }
    ],
    config: {
      responseMimeType: "application/json"
    }
  });

  const response = await model;
  return JSON.parse(response.text || "{}");
};

export const getIdeaSuggestion = async (
  type: 'opening' | 'description' | 'closing',
  prompt: string,
  grade: string,
  essayType: string,
  outline: string
): Promise<string> => {
  const instructions = {
    opening: "Cô gợi ý cho phần Mở bài: Gợi ý một câu mở bài hay, sáng tạo và thu hút.",
    description: "Cô gợi ý cho phần Thân bài: Gợi ý các chi tiết miêu tả sinh động, so sánh hoặc liên tưởng thú vị.",
    closing: "Cô gợi ý cho phần Kết bài: Gợi ý một câu kết bài ấn tượng, giàu ý nghĩa hoặc thông điệp."
  };

  const model = genAI.models.generateContent({
    model: "gemini-3.8-flash",
    contents: [
      {
        parts: [
          {
            text: `Bạn là một giáo viên dạy văn (xưng là "cô"). Hãy giúp học sinh lớp ${grade} viết bài văn.
            Đề bài: ${prompt}
            Dạng bài: ${essayType}
            Dàn ý: ${outline}
            
            Nhiệm vụ: ${instructions[type]}
            
            Yêu cầu quan trọng:
            1. KHÔNG dùng tên riêng (như Cô Mai), chỉ xưng là "cô".
            2. Điều chỉnh độ dài và từ vựng theo lớp ${grade}:
               - Lớp 1-2: Từ rất đơn giản, cực ngắn, tối đa 2-3 gợi ý.
               - Lớp 3-5: Giải thích đơn giản, 3-4 gợi ý.
               - Lớp 6-9: Cấu trúc rõ ràng, 4-5 gợi ý.
               - Lớp 10-12: Gợi ý sâu sắc, mang tính phân tích, có thể dài hơn một chút.
            3. Trình bày rõ ràng bằng dấu gạch đầu dòng, mỗi ý một dòng.
            4. Giọng văn khích lệ, nhẹ nhàng.
            5. Xưng hô "cô" và "con".`
          }
        ]
      }
    ]
  });

  const response = await model;
  return response.text || "Cô đang suy nghĩ gợi ý cho con...";
};

export const refineIdeas = async (
  history: ChatMessage[],
  outline: string,
  prompt: string,
  grade: string = "Lớp 6"
): Promise<string> => {
  const model = genAI.models.generateContent({
    model: "gemini-3.8-flash",
    contents: [
      {
        parts: [
          {
            text: `Bạn là một giáo viên dạy văn (xưng là "cô") giỏi và tâm huyết. 
            Bạn đang giúp học sinh lớp ${grade} phát triển ý tưởng cho bài tập làm văn.
            
            Đề bài: ${prompt}
            Dàn ý hiện tại: ${outline}
            
            Nhiệm vụ của bạn:
            1. Nhận xét ý tưởng của học sinh một cách khích lệ.
            2. Xác định xem học sinh đang hỏi về phần nào (Mở bài, Thân bài, hay Kết bài) để gợi ý trúng đích.
            3. Gợi ý bổ sung các chi tiết sinh động hoặc cách sắp xếp ý.
            
            Quy tắc giao tiếp:
            - KHÔNG dùng tên riêng (như Cô Mai), chỉ xưng là "cô".
            - Trình bày ý tưởng rõ ràng bằng dấu gạch đầu dòng, mỗi ý một dòng. Tránh viết đoạn văn dài.
            - Điều chỉnh độ dài và từ vựng theo lớp ${grade}:
               - Lớp 1-2: Rất đơn giản, cực ngắn, 2-3 gợi ý.
               - Lớp 3-5: Đơn giản, 3-4 gợi ý.
               - Lớp 6-9: Rõ ràng, 4-5 gợi ý.
               - Lớp 10-12: Sâu sắc, phân tích, gợi ý đa dạng.
            - Xưng hô "cô" và "con".
            - Giọng văn ngọt ngào, gần gũi.`
          },
          ...history.map(msg => ({
            text: `${msg.role === 'user' ? 'Học sinh' : 'Cô'}: ${msg.text}`
          }))
        ]
      }
    ]
  });

  const response = await model;
  return response.text || "Cô đang suy nghĩ thêm ý tưởng cho con đây...";
};

export const analyzeEssay = async (
  essay: string,
  grade: string = "Lớp 6",
  images: string[] = []
): Promise<FeedbackResult> => {
  const model = genAI.models.generateContent({
    model: "gemini-3.8-flash",
    contents: [
      {
        parts: [
          {
            text: `Bạn là một giáo viên dạy văn (xưng là "cô") tâm huyết. Hãy chấm bài và góp ý cho bài văn của học sinh lớp ${grade} sau đây.
            Nếu có hình ảnh, hãy đọc văn bản từ hình ảnh đó.
            
            Nội dung bài văn: ${essay}
            
            Quy tắc giao tiếp:
            1. KHÔNG dùng tên riêng (như Cô Mai), chỉ xưng là "cô".
            2. Điều chỉnh độ dài nhận xét và từ vựng theo lớp ${grade}:
               - Lớp 1-2: Rất đơn giản, cực ngắn, khen ngợi nhiều.
               - Lớp 3-5: Đơn giản, dễ hiểu.
               - Lớp 6-9: Rõ ràng, cấu trúc tốt.
               - Lớp 10-12: Sâu sắc, phân tích kỹ.
            3. Trình bày các bí kíp (tips) và câu hỏi gợi mở (questions) bằng dấu gạch đầu dòng, mỗi ý một dòng.
            4. Luôn khích lệ và nhẹ nhàng.
            5. Xưng hô "cô" và "con".

            Hãy trả về kết quả dưới dạng JSON với cấu trúc sau:
            {
              "teacherFeedback": {
                "content": "Nhận xét về nội dung và ý tưởng",
                "structure": "Nhận xét về bố cục 3 phần",
                "emotion": "Nhận xét về cảm xúc và hình ảnh"
              },
              "errors": {
                "spelling": [{"original": "lỗi", "correction": "sửa", "reason": "tại sao"}],
                "vocabulary": [{"original": "từ chưa hay", "correction": "từ hay hơn", "reason": "tại sao"}],
                "sentences": [{"original": "câu lủng củng", "correction": "câu mượt hơn", "reason": "tại sao"}]
              },
              "evaluation": {
                "overall": "Đánh giá chung",
                "improvement": "Hướng cải thiện cụ thể",
                "scores": {
                  "spelling": 8,
                  "structure": 7,
                  "vocabulary": 8,
                  "emotion": 9
                }
              },
              "message": "Lời nhắn gửi yêu thương, khích lệ con",
              "tips": ["bí kíp 1", "bí kíp 2"],
              "questions": ["câu hỏi gợi mở 1", "câu hỏi gợi mở 2"],
              "strongSentences": [
                {
                  "text": "Trích dẫn nguyên văn câu văn hay của con",
                  "praise": "Lời khen ngợi ngọt ngào của cô"
                }
              ]
            }
            Lưu ý: Hãy đảm bảo JSON hợp lệ.`
          },
          ...images.map(img => ({
            inlineData: {
              data: img.split(',')[1],
              mimeType: "image/png"
            }
          }))
        ]
      }
    ],
    config: {
      responseMimeType: "application/json"
    }
  });

  const response = await model;
  const result = JSON.parse(response.text || "{}");
  return {
    ...result,
    essayContent: essay || "Nội dung từ hình ảnh"
  };
};

export const chatWithTeacher = async (
  history: ChatMessage[],
  context: string,
  grade: string = "Lớp 6"
): Promise<string> => {
  const model = genAI.models.generateContent({
    model: "gemini-3.8-flash",
    contents: [
      {
        parts: [
          {
            text: `Bạn là một giáo viên dạy văn (xưng là "cô") cực kỳ hiền hậu, vui vẻ và tâm huyết. 
            Bạn đang trò chuyện với học sinh lớp ${grade} về bài văn của con.
            
            Ngữ cảnh bài văn và nhận xét trước đó:
            ${context}
            
            Quy tắc giao tiếp:
            1. KHÔNG dùng tên riêng (như Cô Mai), chỉ xưng là "cô".
            2. Xác định phần bài văn học sinh đang hỏi (Mở bài, Thân bài, Kết bài) để hướng dẫn cụ thể.
            3. Trình bày gợi ý bằng dấu gạch đầu dòng, mỗi ý một dòng. Tránh viết đoạn văn dài.
            4. Điều chỉnh ngôn ngữ theo lớp ${grade}:
               - Lớp 1-2: Rất đơn giản, cực ngắn, 2-3 ý.
               - Lớp 3-5: Đơn giản, 3-4 ý.
               - Lớp 6-9: Rõ ràng, cấu trúc tốt, 4-5 ý.
               - Lớp 10-12: Sâu sắc, phân tích kỹ.
            5. Xưng hô "cô" và "con".
            6. Luôn khích lệ và nhẹ nhàng.`
          },
          ...history.map(msg => ({
            text: `${msg.role === 'user' ? 'Học sinh' : 'Cô'}: ${msg.text}`
          }))
        ]
      }
    ]
  });

  const response = await model;
  return response.text || "Cô đang suy nghĩ, con đợi cô một chút nhé!";
};

export const improveSentence = async (
  paragraph: string,
  grade: string = "Lớp 6"
): Promise<{ original: string; improved: string; explanation: string }> => {
  const model = genAI.models.generateContent({
    model: "gemini-3.8-flash",
    contents: [
      {
        parts: [
          {
            text: `Bạn là một chuyên gia ngôn ngữ (xưng là "cô"). Hãy giúp học sinh lớp ${grade} cải thiện đoạn văn/câu văn sau để nó hay hơn, giàu hình ảnh và cảm xúc hơn.
            
            Đoạn văn: ${paragraph}
            
            Quy tắc:
            1. KHÔNG dùng tên riêng (như Cô Mai), chỉ xưng là "cô".
            2. Điều chỉnh độ khó theo lớp ${grade}.
            3. Giải thích ngắn gọn, khích lệ.
            4. Trình bày giải thích bằng dấu gạch đầu dòng nếu có nhiều ý.
            
            Hãy trả về kết quả dưới dạng JSON:
            {
              "original": "đoạn văn gốc",
              "improved": "đoạn văn đã cải thiện",
              "explanation": "giải thích tại sao cách sửa này lại hay hơn (ngắn gọn, dễ hiểu)"
            }
            Lưu ý: Giữ nguyên ý nghĩa gốc nhưng nâng cấp từ vựng và cấu trúc câu.`
          }
        ]
      }
    ],
    config: {
      responseMimeType: "application/json"
    }
  });

  const response = await model;
  return JSON.parse(response.text || "{}");
};
