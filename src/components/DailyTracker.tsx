import React, { useState } from "react";
import { DailyLog } from "../types";
import { Smile, Frown, Coffee, Zap, Moon, Dumbbell, Heart, CheckCircle2, AlertTriangle, PenTool } from "lucide-react";

interface DailyTrackerProps {
  onAddLog: (log: DailyLog) => void;
  existingLogs: DailyLog[];
}

export default function DailyTracker({ onAddLog, existingLogs }: DailyTrackerProps) {
  const getTodayString = () => {
    const today = new Date();
    const offset = today.getTimezoneOffset();
    const localToday = new Date(today.getTime() - (offset * 60 * 1000));
    return localToday.toISOString().split('T')[0];
  };

  const [date, setDate] = useState(getTodayString());
  const [stressScore, setStressScore] = useState(5);
  const [anxietyScore, setAnxietyScore] = useState(5);
  const [happinessScore, setHappinessScore] = useState(6);
  const [depressionScore, setDepressionScore] = useState(4);
  const [journal, setJournal] = useState("");

  const [sleepHours, setSleepHours] = useState(7);
  const [exerciseMinutes, setExerciseMinutes] = useState(30);
  const [breakfast, setBreakfast] = useState(true);
  const [lunch, setLunch] = useState(true);
  const [dinner, setDinner] = useState(true);
  const [caffeineCups, setCaffeineCups] = useState(1);

  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newLog: DailyLog = {
      id: date + "_" + Date.now(),
      date,
      stressScore,
      anxietyScore,
      happinessScore,
      depressionScore,
      journal,
      sleepHours,
      exerciseMinutes,
      meals: {
        breakfast,
        lunch,
        dinner
      },
      caffeineCups
    };

    onAddLog(newLog);
    setSavedSuccess(true);
    setJournal("");
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  // Quick advice or warning warnings in real-time as student fills sliders
  const getDynamicTips = () => {
    const tips: string[] = [];
    if (sleepHours < 6) {
      tips.push("😴 수면 6시간 미만: 시상하부가 억눌려 코르티솔 분비량이 가속화될 위험 구역입니다.");
    }
    if (caffeineCups > 2) {
      tips.push("☕ 고카페인 (3잔 이상): 아데노신 결합 방해로 교감신경계가 항진되어 심근 자극과 불필요한 시험불안을 유도해요.");
    }
    if (exerciseMinutes < 15) {
      tips.push("🏃 가벼운 전신 수축 운동은 마이오카인 및 엔도르핀을 생성하여 뇌 혈류와 수험 집중력을 폭발시킵니다.");
    }
    if (!breakfast || !lunch || !dinner) {
      tips.push("🥗 한 끼 이상의 결식은 혈당 급등락(Insulin Spike & Crash)을 일으켜 뇌 고에너지 소모와 정서 기복의 주범이 됩니다.");
    }
    return tips;
  };

  return (
    <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-100 shadow-sm transition-all" id="tracker-component">
      <div className="flex items-center justify-between mb-6 border-b border-slate-100 pb-4">
        <div>
          <span className="text-xs font-semibold px-2.5 py-1 bg-indigo-50 text-indigo-700 rounded-full">
            생리학(Physiology) 기반 추정 엔진
          </span>
          <h2 className="text-xl md:text-2xl font-bold text-slate-800 mt-1.5 flex items-center gap-2">
            <PenTool className="text-indigo-600 w-5 h-5" /> 오늘의 감정 및 생체 로그
          </h2>
        </div>
        <div className="text-sm font-medium text-slate-400 hidden sm:block">
          수험생 스트레스 예방 과학
        </div>
      </div>

      {savedSuccess && (
        <div className="mb-6 p-4 bg-indigo-50 border border-indigo-100 text-indigo-900 rounded-2xl flex items-center gap-3 animate-fade-in">
          <CheckCircle2 className="w-5 h-5 text-indigo-600 shrink-0" />
          <div className="text-sm">
            <strong>오늘의 로그 저장 완료!</strong> 입력한 생체 및 정서 데이터가 기록되었습니다. AI 분석 탭을 통해 두 지표 사이의 생화학적 상관관계를 알아보세요!
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Date Selector */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
          <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
            📅 기록할 기준 날짜
          </label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="px-4 py-2 bg-white border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-indigo-500 outline-none text-slate-700 shadow-sm"
            required
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* LEFT: EMOTIONS LOGGING */}
          <div className="space-y-6">
            <h3 className="text-base font-bold text-slate-800 flex items-center gap-2 pb-2 border-b border-slate-100">
              <Smile className="w-5 h-5 text-indigo-600" /> ① 정신 & 정서 상태 기록 (Emotional State)
            </h3>

            {/* Stress (Target) */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-sm font-medium">
                <span className="text-slate-700 flex items-center gap-1.5">⚡ <strong>스트레스 지수 (Stress)</strong></span>
                <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${stressScore > 7 ? 'bg-indigo-100 text-indigo-800' : 'bg-slate-100 text-slate-700'}`}>
                  {stressScore} / 10
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                value={stressScore}
                onChange={(e) => setStressScore(Number(e.target.value))}
                className="w-full accent-indigo-600 h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-xs text-slate-400">
                <span>평온함 (1)</span>
                <span>불안정 (5)</span>
                <span>극도의 압박 (10)</span>
              </div>
            </div>

            {/* Anxiety */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-sm font-medium">
                <span className="text-slate-700 flex items-center gap-1.5">🛡️ <strong>학업/시험불안 (Anxiety)</strong></span>
                <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${anxietyScore > 7 ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-700'}`}>
                  {anxietyScore} / 10
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                value={anxietyScore}
                onChange={(e) => setAnxietyScore(Number(e.target.value))}
                className="w-full accent-amber-600 h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-xs text-slate-400">
                <span>이완됨</span>
                <span>두근거림</span>
                <span>집중 불능/패닉</span>
              </div>
            </div>

            {/* Depression / Melancholy */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-sm font-medium">
                <span className="text-slate-700 flex items-center gap-1.5 font-bold">💧 무기력·우울도 (Depression)</span>
                <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${depressionScore > 7 ? 'bg-indigo-900 text-white' : 'bg-slate-100 text-slate-700'}`}>
                  {depressionScore} / 10
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                value={depressionScore}
                onChange={(e) => setDepressionScore(Number(e.target.value))}
                className="w-full accent-indigo-950 h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-xs text-slate-400">
                <span>에너지 활기</span>
                <span>감정 저하</span>
                <span>극도의 번아웃</span>
              </div>
            </div>

            {/* Happiness */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-sm font-medium">
                <span className="text-slate-700 flex items-center gap-1.5 font-bold">🌸 성취감·행복 (Happiness)</span>
                <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${happinessScore < 4 ? 'bg-slate-100 text-slate-500' : 'bg-indigo-50 text-indigo-700'}`}>
                  {happinessScore} / 10
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                value={happinessScore}
                onChange={(e) => setHappinessScore(Number(e.target.value))}
                className="w-full accent-indigo-500 h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-xs text-slate-400">
                <span>공허함</span>
                <span>보통 소소함</span>
                <span>최고의 자신감</span>
              </div>
            </div>

            {/* Journal Diary */}
            <div className="space-y-2">
              <label className="block text-sm font-bold text-slate-700">✍️ 오늘의 일기 (오늘 하루를 짧게 성찰하며)</label>
              <textarea
                value={journal}
                onChange={(e) => setJournal(e.target.value)}
                placeholder="오늘 공부 내용, 스트레스 받았던 일, 감사했던 점 등 자유롭게 일기를 한 줄 이상 작성해 보세요. 입력 내용이 유익한 AI 생명과학 진단의 기초가 됩니다..."
                maxLength={500}
                className="w-full h-24 p-3 border border-slate-200 rounded-2xl shadow-sm text-sm focus:ring-2 focus:ring-indigo-500 outline-none text-slate-800 placeholder-slate-400 font-sans"
              />
              <div className="text-right text-xs text-slate-400 font-medium">
                {journal.length}/500자
              </div>
            </div>
          </div>

          {/* RIGHT: BIOMETRIC LOGGING */}
          <div className="space-y-6">
            <h3 className="text-base font-bold text-slate-800 flex items-center gap-2 pb-2 border-b border-slate-100">
              <Moon className="w-5 h-5 text-indigo-600" /> ② 생체리듬 & 생활습관 (Physiological Logs)
            </h3>

            {/* Sleep HOURS */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-sm font-medium">
                <span className="text-slate-700 flex items-center gap-1.5">😴 <strong>수면 시간 (Sleep Hours)</strong></span>
                <span className="px-2 py-0.5 bg-slate-100 rounded-full text-xs font-bold font-mono text-indigo-600">
                  {sleepHours}시간
                </span>
              </div>
              <input
                type="range"
                min="3"
                max="12"
                step="0.5"
                value={sleepHours}
                onChange={(e) => setSleepHours(Number(e.target.value))}
                className="w-full accent-indigo-600 h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-xs text-slate-400">
                <span>3시간 (극심한 빚)</span>
                <span>7-8시간 (이상적)</span>
                <span>12시간 (과다)</span>
              </div>
            </div>

            {/* Exercise Minutes */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-sm font-medium">
                <span className="text-slate-700 flex items-center gap-1.5">🏃 <strong>운동 시간 (Exercise)</strong></span>
                <span className="px-2 py-0.5 bg-slate-100 rounded-full text-xs font-bold font-mono text-indigo-600">
                  {exerciseMinutes}분
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="120"
                step="5"
                value={exerciseMinutes}
                onChange={(e) => setExerciseMinutes(Number(e.target.value))}
                className="w-full accent-indigo-500 h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-xs text-slate-400">
                <span>0분 (좌식 위주)</span>
                <span>30분 (활성화)</span>
                <span>120분 이상</span>
              </div>
            </div>

            {/* Meal Tracker */}
            <div className="space-y-2">
              <label className="block text-sm font-bold text-slate-700 mb-1">🥗 식사 여부 (정기적 당 공급)</label>
              <div className="grid grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setBreakfast(!breakfast)}
                  className={`p-3 rounded-2xl border text-sm font-semibold flex flex-col items-center gap-1 transition-all ${breakfast ? 'bg-indigo-50 border-indigo-300 text-indigo-800 shadow-sm' : 'bg-white border-slate-200 text-slate-600'}`}
                >
                  <span className="text-lg">🍳</span>
                  아침 식사 {breakfast ? "완료" : "결식"}
                </button>
                <button
                  type="button"
                  onClick={() => setLunch(!lunch)}
                  className={`p-3 rounded-2xl border text-sm font-semibold flex flex-col items-center gap-1 transition-all ${lunch ? 'bg-indigo-50 border-indigo-300 text-indigo-800 shadow-sm' : 'bg-white border-slate-200 text-slate-600'}`}
                >
                  <span className="text-lg">🍱</span>
                  점심 식사 {lunch ? "완료" : "결식"}
                </button>
                <button
                  type="button"
                  onClick={() => setDinner(!dinner)}
                  className={`p-3 rounded-2xl border text-sm font-semibold flex flex-col items-center gap-1 transition-all ${dinner ? 'bg-indigo-50 border-indigo-300 text-indigo-800 shadow-sm' : 'bg-white border-slate-200 text-slate-600'}`}
                >
                  <span className="text-lg">🍲</span>
                  저녁 식사 {dinner ? "완료" : "결식"}
                </button>
              </div>
            </div>

            {/* Caffeine Intake */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-sm font-medium">
                <span className="text-slate-700 flex items-center gap-1.5">☕ <strong>카페인 섭취량 (Caffeine)</strong></span>
                <span className={`px-2 py-0.5 rounded-full text-xs font-bold font-mono ${caffeineCups >= 3 ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-600'}`}>
                  {caffeineCups}잔 / 하루
                </span>
              </div>
              <div className="flex gap-2">
                {[0, 1, 2, 3, 4].map((cups) => (
                  <button
                    key={cups}
                    type="button"
                    onClick={() => setCaffeineCups(cups)}
                    className={`flex-1 py-2 text-xs font-bold rounded-xl border transition-all ${caffeineCups === cups ? 'bg-indigo-600 border-indigo-600 text-white shadow-sm' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                  >
                    {cups === 0 ? "섭취 없음" : `${cups}잔`}
                  </button>
                ))}
              </div>
              <p className="text-[11px] text-slate-450 leading-relaxed font-medium">
                * 청소년 하루 카페인 권장 최대량은 몸무게 1kg당 2.5mg (평균 150mg 이하, 캔커피 약 1.5개)
              </p>
            </div>
          </div>
        </div>

        {/* Realtime physiological safety assessment banner */}
        <div className="p-4 bg-amber-50/70 rounded-2xl border border-amber-100 text-xs space-y-2 text-amber-900 shadow-2xs">
          <div className="font-bold flex items-center gap-1 text-sm text-amber-800 mb-1">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" /> 실시간 생체 리듬 어드바이스
          </div>
          <ul className="list-disc pl-4 space-y-1 font-medium">
            {getDynamicTips().length > 0 ? (
              getDynamicTips().map((tip, idx) => <li key={idx}>{tip}</li>)
            ) : (
              <li>✨ 최상의 항상성(Homeostasis) 유지 구역입니다! 완벽한 수면 확보, 무카페인 정리가 뇌신경 세포를 최고 수준으로 보정합니다.</li>
            )}
          </ul>
        </div>

        {/* Submit */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            className="px-8 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl transition-all shadow-md hover:shadow-lg flex items-center gap-2 cursor-pointer w-full sm:w-auto justify-center"
          >
            <Heart className="w-5 h-5 fill-white" /> 오늘의 학생 생체 기록 저장하기
          </button>
        </div>
      </form>
    </div>
  );
}
