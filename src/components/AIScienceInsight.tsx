import React, { useState } from "react";
import { DailyLog, AIAnalysisResult } from "../types";
import { Brain, Sparkles, Award, RotateCcw, AlertCircle, Quote, Compass } from "lucide-react";

interface AIScienceInsightProps {
  logs: DailyLog[];
}

export default function AIScienceInsight({ logs }: AIScienceInsightProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AIAnalysisResult | null>(null);
  const [lastAnalyzedLogsCount, setLastAnalyzedLogsCount] = useState(0);

  const triggerAnalysis = async () => {
    if (logs.length === 0) return;

    setLoading(true);
    setError(null);

    // Limit to last 14 logs to avoid token bloat and focus on recent trends
    const recentLogs = [...logs]
      .sort((a, b) => b.date.localeCompare(a.date))
      .slice(0, 14);

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ logs: recentLogs }),
      });

      const body = await response.json();
      if (!response.ok) {
        throw new Error(body.error || "분석을 처리하는 대 실패했습니다.");
      }

      setResult(body.data);
      setLastAnalyzedLogsCount(logs.length);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "통신 오류나 제미니 엔진 연결에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const getLoadingMessage = () => {
    return "생체 항상성 로그와 가역성 뇌파 매칭 중... 신경 호르몬 지도를 그리는 중입니다.";
  };

  return (
    <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-100 shadow-sm" id="science-insight">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 border-b border-slate-100 pb-4">
        <div>
          <span className="text-xs font-semibold px-2.5 py-1 bg-indigo-50 text-indigo-700 rounded-full">
            인공지능 대형언어모델 (Gemini 3.5 Flash) 제휴
          </span>
          <h2 className="text-xl md:text-2xl font-bold text-slate-800 mt-1.5 flex items-center gap-2">
            <Brain className="text-indigo-600 w-5 h-5 animate-pulse" /> 생명과학 기반 AI 호르몬 분석기
          </h2>
        </div>
        <div className="text-sm text-slate-400 font-medium">
          호르몬 분비 변화 과학 솔루션
        </div>
      </div>

      {logs.length === 0 ? (
        <div className="text-center py-16 space-y-4 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
          <div className="text-4xl text-slate-350">🔬</div>
          <p className="text-slate-500 text-sm max-w-md mx-auto leading-relaxed font-medium">
            데이터가 부족하여 생체-기분 영향도를 진단할 수 없습니다.<br />
            <strong>우선 하루 이상의 감정 및 생활습관 로그를 등록</strong>한 후 분석을 돌려보세요!
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Diagnostic Button Banner */}
          <div className="p-6 bg-indigo-50/55 rounded-3xl border border-indigo-100 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-1.5 text-center md:text-left">
              <h3 className="font-bold text-indigo-950 flex items-center justify-center md:justify-start gap-1.5">
                <Sparkles className="w-4 h-4 text-indigo-600 animate-spin" /> 수집된 {logs.length}일간의 누적 생체데이터 진단
              </h3>
              <p className="text-xs text-indigo-800 max-w-lg leading-relaxed font-medium">
                현재 누적된 수면 패턴, 카페인 부하량, 식사 규칙성 점수와 스트레스·불안 수치가 시냅스 가소성에 미치는 연계성을 분석합니다.
              </p>
            </div>

            <button
              onClick={triggerAnalysis}
              disabled={loading}
              className={`px-6 py-3.5 rounded-2xl font-bold text-sm tracking-wide shadow-md hover:shadow-lg transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
                loading
                  ? "bg-slate-300 text-slate-500 cursor-not-allowed"
                  : "bg-indigo-600 hover:bg-indigo-700 text-white font-bold"
              }`}
            >
              {loading ? (
                <>
                  <RotateCcw className="w-4 h-4 animate-spin" /> 분석 진행 중...
                </>
              ) : (
                <>
                  <Compass className="w-4 h-4" /> 생리학적 상관관계 분석하기
                </>
              )}
            </button>
          </div>

          {loading && (
            <div className="py-12 flex flex-col items-center justify-center space-y-4">
              <div className="relative">
                <div className="w-16 h-16 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
                <Brain className="w-6 h-6 text-indigo-600 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-bounce" />
              </div>
              <div className="text-center">
                <p className="text-sm font-bold text-slate-700">{getLoadingMessage()}</p>
                <p className="text-xs text-slate-400 mt-1">이 분석은 약 5초 정도 소요됩니다. 조금만 기다려주세요!</p>
              </div>
            </div>
          )}

          {error && (
            <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-sm">생체 분석 네트워크 지연</h4>
                <p className="text-xs mt-0.5 leading-relaxed font-medium">{error}</p>
              </div>
            </div>
          )}

          {/* ANALYSIS RESULTS VIEW */}
          {result && !loading && (
            <div className="space-y-6 animate-fade-in mt-6">
              {/* Box 1: Core Correlation Observation */}
              <div className="p-5 border border-indigo-100 rounded-2xl bg-indigo-50/10">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-lg">📊</span>
                  <p className="text-xs font-bold text-indigo-600 uppercase tracking-widest">① 행동지표-스트레스 상관 지배 구조</p>
                </div>
                <div className="p-4 bg-white border border-indigo-100/50 rounded-xl relative shadow-2xs">
                  <span className="absolute top-3 left-4 text-xs font-bold text-indigo-200 text-[60px] leading-none pointer-events-none">&ldquo;</span>
                  <p className="text-sm text-slate-800 font-medium pl-6 leading-relaxed relative z-10 whitespace-pre-line">
                    {result.relationshipSummary}
                  </p>
                </div>
              </div>

              {/* Box 2: biological Physiologic Feedback */}
              <div className="p-5 border border-indigo-200/60 rounded-2xl bg-indigo-50/5">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-lg">🧬</span>
                  <p className="text-xs font-bold text-indigo-800 uppercase tracking-widest">② 호르몬 및 교감신경 생리학적 피드백</p>
                </div>
                <div className="bg-white border border-indigo-150 rounded-xl p-5 shadow-2xs text-sm text-slate-700 space-y-4 leading-relaxed">
                  <div className="whitespace-pre-line text-slate-800">
                    {result.scienceFeedback}
                  </div>
                  <div className="p-3 bg-indigo-50/50 rounded-xl border border-indigo-100/40 text-xs text-indigo-850">
                    ℹ️ <strong>기억해보세요:</strong> 코르티솔 분비를 통제하는 가장 확실한 브레이크는 규칙적인 생체 외인성 시계 형성(일정한 기상/취침시간, 불빛 차단) 수립인 점이 현대 내분비학 연구의 일관된 기조입니다.
                  </div>
                </div>
              </div>

              {/* Box 3: Lifestyle advice prescriptions */}
              <div className="p-5 border border-slate-100 rounded-2xl bg-slate-50/50">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-lg">🩺</span>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">③ 생리학 기반 학생 행동 지침 처방</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {result.generalRecommendations.map((rec, i) => (
                    <div key={i} className="bg-white border border-slate-100 p-4 rounded-xl flex items-start gap-2.5 shadow-2xs">
                      <div className="w-6 h-6 flex items-center justify-center rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold shrink-0">
                        {i + 1}
                      </div>
                      <p className="text-xs text-slate-700 leading-relaxed font-semibold">
                        {rec}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="text-right text-[10px] text-slate-400">
                AI 의학과학 검증 분석 완료일 : {result.analyzedAt}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
