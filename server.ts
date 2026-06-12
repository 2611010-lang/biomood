import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

// Enable JSON parsing
app.use(express.json());

// Initialize Gemini API
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

// API endpoint for analysis
app.post("/api/analyze", async (req, res) => {
  try {
    const { logs } = req.body;

    if (!logs || !Array.isArray(logs) || logs.length === 0) {
      return res.status(400).json({ error: "분석할 데이터가 없습니다. 먼저 일기를 몇 개 기록해주세요!" });
    }

    // Format logs into readable string for Gemini
    const logsDescription = logs.map((log: any) => {
      const mealStr = `아침:${log.meals?.breakfast ? "O" : "X"}, 점심:${log.meals?.lunch ? "O" : "X"}, 저녁:${log.meals?.dinner ? "O" : "X"}`;
      return `- 날짜: ${log.date} | [기분] 스트레스: ${log.stressScore}/10, 불안: ${log.anxietyScore}/10, 우울: ${log.depressionScore}/10, 행복: ${log.happinessScore}/10 | [생체] 수면: ${log.sleepHours}시간, 운동: ${log.exerciseMinutes}분, 식사: (${mealStr}), 카페인: ${log.caffeineCups}잔 | [일기] ${log.journal || "기록 없음"}`;
    }).join("\n");

    const prompt = `
당신은 대한민국 청소년과 수험생을 위한 스트레스·생명과학 전문 분석 AI 어드바이저입니다.
최근 학생이 기록한 일일 감정 상태와 생활습관 데이터를 바탕으로 상관관계를 과학적이고 따뜻하게 분석해 다정한 조언을 해주세요.

[학생 수집 데이터]
${logsDescription}

[분석 요구사항]
1. 데이터 간 상관관계 분석 (relationshipSummary): 
- 기록된 실제 데이터(수면시간, 운동, caffeine, 식사 여부 등)와 감정 점수(스트레스, 불안, 우울, 행복 등)를 면밀히 살피세요.
- 예: "수면 시간이 6시간 이하인 날에는 스트레스 점수가 평소보다 평균 30% 높았고, 카페인을 2잔 이상 마신 날에는 불안 수치가 급격히 치솟는 현상이 관찰되었습니다." 처럼 입증 가능한 구체적 연관성을 1~2개 도출하세요.
- 데이터가 적은 경우, 현재 기록을 기반으로 앞으로 추이를 지켜봐야 할 요소를 짚어주세요.

2. 생명과학 기반 생리학적 피드백 (scienceFeedback):
- 과학적 사실에 명확히 근거하되, 학생 눈높이에 맞게 설명하세요.
- Cortisol(코르티솔 - 스트레스 호르몬), Serotonin(세로토닌 - 기분 개선 및 정서 안정), Melatonin(멜라토닌 - 수면 제어), Adenosine(아데노신 - 수면 압력 방해와 카페인 수용체 차단) 등 실제 신경전달물질과 호르몬의 생리적 작용 경로를 포함하여, 위 현상이 일어나는 이유를 서술해 주세요.
- 예: "7시간 미만의 수면은 뇌의 시상하부를 자극하여 부신피질에서 스트레스 대항 호르몬인 코르티솔 분비를 비정상적으로 유도하여 예민해지기 쉽습니다. 또한 카페인은 도파민 분비를 단기 촉진해 각성을 주지만 아데노신 수용체를 차단하여 신체적 긴장과 교감신경 흥분을 지속시켜 예기치 못한 심장 두근거림과 불안을 낳습니다."

3. 맞춤형 추천 솔루션 (generalRecommendations):
- 이 학생이 가볍게 실생활에 실천할 수 있는 3가지 생화학 기반 정서 팁을 제안하세요. (예: 햇빛 쬐어 세로토닌 합성, 수면 전 블루라이트 차단으로 멜라토닌 확보 등)
`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction: "You represent a warm, knowledgeable life scientist and high-school consultant counselor. Respond entirely in Korean. Utilize standard medical/lifescience facts.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            relationshipSummary: {
              type: Type.STRING,
              description: "감정과 생체 리듬의 결합 분석 요약. 수험생 맞춤 한국어"
            },
            scienceFeedback: {
              type: Type.STRING,
              description: "생명과학 기반의 호르몬, 신경전달물질 설명과 피드백. 아주 자세하고 전문적이지만 친근한 한국어 설명"
            },
            generalRecommendations: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "그 학생이 정서 조절을 위해 바로 할 수 있는 행동 처방 리스트 (Korean)"
            }
          },
          required: ["relationshipSummary", "scienceFeedback", "generalRecommendations"]
        }
      }
    });

    const parsedData = JSON.parse(response.text || "{}");
    res.json({
      success: true,
      data: {
        relationshipSummary: parsedData.relationshipSummary || "충분한 기록 데이터를 모아 다음 분석에서 만나보세요!",
        scienceFeedback: parsedData.scienceFeedback || "수면부족, 불규칙 식사 등은 뇌신경 세포의 정상 대사를 방해할 수 있습니다. 규칙적 리듬이 곧 정서입니다.",
        generalRecommendations: parsedData.generalRecommendations || [
          "매일 아침 가벼운 산책으로 세로토닌 촉진하기.",
          "수면 전 스마트폰을 멀리하여 수면 유도 호르몬 멜라토닌 분비 지키기.",
          "오후 시간대 고카페인 섭취 자제 체계 구축."
        ],
        analyzedAt: new Date().toLocaleDateString("ko-KR", { hour: '2-digit', minute: '2-digit' })
      }
    });

  } catch (err: any) {
    console.error("AI Analysis Error:", err);
    res.status(500).json({ error: "AI 분석 가동 중 일시적 지연이 발생했거나 열쇠가 등록되지 않았습니다: " + err.message });
  }
});

// Server client files
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Express Backend Server] Running perfectly at http://localhost:${PORT}`);
  });
}

startServer();
