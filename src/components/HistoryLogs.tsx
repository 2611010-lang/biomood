import React from "react";
import { DailyLog } from "../types";
import { Calendar, Trash2, ShieldAlert, Award, Footprints } from "lucide-react";

interface HistoryLogsProps {
  logs: DailyLog[];
  onDeleteLog: (id: string) => void;
}

export default function HistoryLogs({ logs, onDeleteLog }: HistoryLogsProps) {
  const getMoodEmoji = (stress: number, happiness: number) => {
    if (stress > 7) return "😰";
    if (happiness > 7) return "🌟";
    if (stress < 4) return "😇";
    return "📝";
  };

  const sortedLogs = [...logs].sort((a, b) => b.date.localeCompare(a.date));

  return (
    <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-100 shadow-sm" id="history-component">
      <div className="flex items-center justify-between mb-6 border-b border-slate-100 pb-4">
        <div>
          <span className="text-xs font-semibold px-2.5 py-1 bg-indigo-50 text-indigo-700 rounded-full">
            데이터 누적 스택 ({logs.length}일 완료)
          </span>
          <h2 className="text-xl md:text-2xl font-bold text-slate-800 mt-1.5 flex items-center gap-2">
            <Calendar className="text-indigo-600 w-5 h-5" /> 누적 감정-생활 습관 일기장
          </h2>
        </div>
        <div className="text-sm text-slate-400 font-mono">
          History Ledger
        </div>
      </div>

      {sortedLogs.length === 0 ? (
        <div className="text-center py-16 space-y-4 bg-slate-50 rounded-2xl border border-dashed border-slate-250">
          <div className="text-4xl text-slate-300">💭</div>
          <p className="text-slate-500 max-w-sm mx-auto text-sm leading-relaxed font-semibold">
            아직 누적된 일일 생체 로그가 없습니다.<br />
            <strong>오늘의 감정 및 생체 로그</strong> 탭에서 첫 기록을 채워보세요!
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {sortedLogs.map((log) => {
            const hasMeals = log.meals.breakfast || log.meals.lunch || log.meals.dinner;
            const mealsMet = [
              log.meals.breakfast ? "조식" : null,
              log.meals.lunch ? "중식" : null,
              log.meals.dinner ? "석식" : null
            ].filter(Boolean).join(", ");

            return (
              <div
                key={log.id}
                className="p-5 border border-slate-100 rounded-2xl hover:border-slate-200 hover:shadow-xs transition-all relative bg-slate-50/40"
              >
                {/* Delete Button */}
                <button
                  type="button"
                  onClick={() => onDeleteLog(log.id)}
                  title="기록 지우기"
                  className="absolute top-4 right-4 p-2 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-slate-100 transition-all cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl w-10 h-10 flex items-center justify-center bg-white rounded-xl shadow-xs border border-slate-100">
                      {getMoodEmoji(log.stressScore, log.happinessScore)}
                    </span>
                    <div>
                      <h4 className="text-sm font-bold text-slate-800">{log.date}</h4>
                      <p className="text-xs text-slate-400 font-mono">LOG_ID: {log.id.slice(-6)}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-semibold px-2 py-1 bg-rose-50 text-rose-700 rounded-lg border border-rose-100">
                      스트레스 지수 {log.stressScore}/10
                    </span>
                    <span className="text-xs font-semibold px-2 py-1 bg-amber-50 text-amber-700 rounded-lg border border-amber-100">
                      불안 {log.anxietyScore}/10
                    </span>
                    <span className="text-xs font-semibold px-2 py-1 bg-indigo-50 text-indigo-700 rounded-lg border border-indigo-100">
                      행복 {log.happinessScore}/10
                    </span>
                    <span className="text-xs font-semibold px-2 py-1 bg-slate-100 text-slate-700 rounded-lg border border-slate-200">
                      우울 {log.depressionScore}/10
                    </span>
                  </div>
                </div>

                {/* Journal block */}
                {log.journal && (
                  <div className="mb-4 p-3.5 bg-white border border-slate-150 rounded-xl shadow-2xs">
                    <p className="text-xs font-extrabold text-slate-400 uppercase tracking-wider mb-1">성찰 일지</p>
                    <p className="text-sm text-slate-750 whitespace-pre-line leading-relaxed italic font-medium">
                      &ldquo;{log.journal}&rdquo;
                    </p>
                  </div>
                )}

                {/* Technical Biometrics Stats bar */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-slate-100 text-xs text-slate-600">
                  <div className="flex items-center gap-1.5">
                    <span className="text-base">😴</span>
                    <div>
                      <p className="text-[10px] text-slate-400 font-semibold">수면 시간</p>
                      <p className="font-bold text-slate-800 font-mono">{log.sleepHours}시간</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span className="text-base">🏃</span>
                    <div>
                      <p className="text-[10px] text-slate-400 font-semibold">운동량</p>
                      <p className="font-bold text-slate-800 font-mono">{log.exerciseMinutes}분</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span className="text-base">🍽️</span>
                    <div>
                      <p className="text-[10px] text-slate-400 font-semibold">식사 충족</p>
                      <p className="font-bold text-slate-800 truncate" title={mealsMet}>
                        {hasMeals ? `${mealsMet}` : "전체 결식 ⚠️"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span className="text-base">☕</span>
                    <div>
                      <p className="text-[10px] text-slate-400 font-semibold">카페인</p>
                      <p className={`font-bold font-mono ${log.caffeineCups >= 3 ? 'text-rose-600' : 'text-slate-700'}`}>
                        {log.caffeineCups}잔
                      </p>
                    </div>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
