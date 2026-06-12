export interface DailyLog {
  id: string;
  date: string; // YYYY-MM-DD
  // Emotion Score (1-10 scale)
  stressScore: number;
  anxietyScore: number;
  happinessScore: number;
  depressionScore: number;
  journal: string;

  // Biometric Data
  sleepHours: number;
  exerciseMinutes: number;
  meals: {
    breakfast: boolean;
    lunch: boolean;
    dinner: boolean;
  };
  caffeineCups: number;
}

export interface AIAnalysisResult {
  relationshipSummary: string; // "수면 시간이 6시간 이하인 날에는 스트레스 점수가 평균 30% 높았습니다." 등
  scienceFeedback: string; // "수면 부족은 스트레스 호르몬인 코르티솔 분비를 증가시킬 수 있습니다..." 등
  generalRecommendations: string[];
  analyzedAt: string;
}
