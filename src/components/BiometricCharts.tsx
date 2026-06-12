import React, { useState } from "react";
import { DailyLog } from "../types";
import { TrendingUp, AlertCircle, Info, Coffee, HelpCircle, Moon } from "lucide-react";

interface BiometricChartsProps {
  logs: DailyLog[];
}

export default function BiometricCharts({ logs }: BiometricChartsProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // Sort logs by date ascending for chronologically drawing
  const sortedLogs = [...logs]
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(-7); // View last 7 records for elegant density on screen

  const maxLogValue = 10; // since scores are 1-10, sleep is 3-12, caffeine is 0-4

  // Chart Dimensions
  const padding = 50;
  const chartWidth = 700;
  const chartHeight = 280;

  // Render variables helper
  const getX = (index: number) => {
    if (sortedLogs.length <= 1) return padding;
    return padding + (index * (chartWidth - padding * 2)) / (sortedLogs.length - 1);
  };

  // Convert value to Y SVG coordinates (invert because 0 is at top)
  const getY = (val: number, max: number = 10) => {
    const minVal = 0;
    const ratio = (val - minVal) / (max - minVal);
    return chartHeight - padding - ratio * (chartHeight - padding * 2);
  };

  // SVG Line paths builder
  const buildSvgPath = (dataFunc: (log: DailyLog) => number, maxVal: number = 10) => {
    if (sortedLogs.length === 0) return "";
    let d = `M ${getX(0)} ${getY(dataFunc(sortedLogs[0]), maxVal)}`;
    for (let i = 1; i < sortedLogs.length; i++) {
      d += ` L ${getX(i)} ${getY(dataFunc(sortedLogs[i]), maxVal)}`;
    }
    return d;
  };

  // SVG Area path helper (closes back at bottom axis)
  const buildSvgAreaPath = (dataFunc: (log: DailyLog) => number, maxVal: number = 10) => {
    if (sortedLogs.length === 0) return "";
    let d = `M ${getX(0)} ${getY(0, maxVal)}`;
    for (let i = 0; i < sortedLogs.length; i++) {
      d += ` L ${getX(i)} ${getY(dataFunc(sortedLogs[i]), maxVal)}`;
    }
    d += ` L ${getX(sortedLogs.length - 1)} ${getY(0, maxVal)} Z`;
    return d;
  };

  return (
    <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-100 shadow-sm" id="charts-component">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 border-b border-slate-100 pb-4">
        <div>
          <span className="text-xs font-semibold px-2.5 py-1 bg-indigo-50 text-indigo-700 rounded-full">
            생체-정서 복합 동향 시각화
          </span>
          <h2 className="text-xl md:text-2xl font-bold text-slate-800 mt-1.5 flex items-center gap-2">
            <TrendingUp className="text-indigo-600 w-5 h-5" /> 감정 점수 및 생체 인자 오버레이 그래프
          </h2>
        </div>
        <div className="text-xs text-slate-400 font-mono">
          Interactive Overlay (Max 7 records)
        </div>
      </div>

      {sortedLogs.length < 2 ? (
        <div className="text-center py-16 space-y-4 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
          <HelpCircle className="w-10 h-10 text-slate-300 mx-auto" />
          <div className="max-w-md mx-auto space-y-1">
            <p className="text-slate-700 font-bold text-sm">트렌드를 로드하기에 아직 데이터가 충분하지 않아요.</p>
            <p className="text-slate-450 text-xs leading-relaxed">
              최소 2일 이상의 일기를 오늘의 일기 입력 인터페이스에 기록해 주세요.<br />
              수험생의 실제 행동(수면, 아침 식사, 커피량)과 두통/스트레스 지표의 연동 변화를 직관적으로 분석합니다.
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Chart Legends & Highlighters */}
          <div className="flex flex-wrap items-center gap-4 text-xs font-semibold p-3.5 bg-slate-50 rounded-2xl justify-center sm:justify-start border border-slate-100">
            <div className="flex items-center gap-2">
              <span className="w-3.5 h-1 bg-rose-500 rounded-full inline-block"></span>
              <span className="text-slate-600">스트레스 수치 (1-10)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3.5 h-1 bg-indigo-600 rounded-full inline-block"></span>
              <span className="text-slate-600">수면 시간 (시간, 0-12배율)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3.5 h-1 bg-amber-500 inline-block rounded-full"></span>
              <span className="text-slate-600">카페인 섭취 (컵, 0-5배율)</span>
            </div>
            <div className="text-[10px] text-slate-400 hidden lg:block ml-auto flex items-center gap-1 font-medium">
              <Info className="w-3 h-3 text-indigo-500" /> 차트 점 위에 마우스를 올리시면 세부 정보가 출력됩니다.
            </div>
          </div>

          {/* SVG Canvas Container */}
          <div className="overflow-x-auto w-full">
            <div className="min-w-[700px] bg-slate-50/30 p-2 rounded-2xl border border-slate-100">
              <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-auto overflow-visible font-sans">
                {/* Horizontal Grid lines */}
                {[0, 2.5, 5, 7.5, 10].map((grid, idx) => (
                  <g key={idx}>
                    <line
                      x1={padding}
                      y1={getY(grid, 10)}
                      x2={chartWidth - padding}
                      y2={getY(grid, 10)}
                      stroke="#f1f5f9"
                      strokeWidth="1.5"
                    />
                    <text
                      x={padding - 12}
                      y={getY(grid, 10) + 4}
                      fill="#94a3b8"
                      className="text-[10px] font-mono text-right"
                      textAnchor="end"
                    >
                      {grid}
                    </text>
                  </g>
                ))}

                {/* 6-hour Sleep Threshold Alert Line (Yellow Zone) */}
                <line
                  x1={padding}
                  y1={getY(6, 12)} // 6 hours on 12 scale
                  x2={chartWidth - padding}
                  y2={getY(6, 12)}
                  stroke="#818cf8"
                  strokeWidth="1"
                  strokeDasharray="4 4"
                  opacity="0.6"
                />
                <text
                  x={chartWidth - padding - 4}
                  y={getY(6, 12) - 6}
                  fill="#4f46e5"
                  className="text-[9px] font-bold text-right"
                  textAnchor="end"
                  opacity="0.8"
                >
                  수면 부채 임계선 (6시간)
                </text>

                {/* Draw Areas */}
                {/* Sleep Area */}
                <path
                  d={buildSvgAreaPath((log) => log.sleepHours, 12)}
                  fill="url(#sleep-grad)"
                  opacity="0.08"
                />

                {/* Draw Paths */}
                {/* Sleep Line */}
                <path
                  d={buildSvgPath((log) => log.sleepHours, 12)}
                  fill="none"
                  stroke="#4f46e5"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                {/* Caffeine Line */}
                <path
                  d={buildSvgPath((log) => log.caffeineCups, 5)}
                  fill="none"
                  stroke="#d97706"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  opacity="0.85"
                />

                {/* Stress Line */}
                <path
                  d={buildSvgPath((log) => log.stressScore, 10)}
                  fill="none"
                  stroke="#e11d48"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                {/* Draw interactive dots & date texts on Bottom Axis */}
                {sortedLogs.map((log, idx) => {
                  const isHovered = hoveredIndex === idx;
                  const xPos = getX(idx);

                  return (
                    <g key={log.id} onMouseEnter={() => setHoveredIndex(idx)} onMouseLeave={() => setHoveredIndex(null)}>
                      {/* Vertical line trigger */}
                      <line
                        x1={xPos}
                        y1={padding}
                        x2={xPos}
                        y2={chartHeight - padding}
                        stroke={isHovered ? "#6366f1" : "transparent"}
                        strokeWidth="1.5"
                        strokeDasharray="2 2"
                      />

                      {/* Stress Dots */}
                      <circle
                        cx={xPos}
                        cy={getY(log.stressScore, 10)}
                        r={isHovered ? 6 : 4}
                        fill="#e11d48"
                        stroke="white"
                        strokeWidth="2"
                        className="transition-all cursor-pointer"
                      />

                      {/* Sleep Dots */}
                      <circle
                        cx={xPos}
                        cy={getY(log.sleepHours, 12)}
                        r={isHovered ? 6 : 4}
                        fill="#4f46e5"
                        stroke="white"
                        strokeWidth="2"
                        className="transition-all cursor-pointer"
                      />

                      {/* Caffeine Dots */}
                      <circle
                        cx={xPos}
                        cy={getY(log.caffeineCups, 5)}
                        r={isHovered ? 5 : 3.5}
                        fill="#d97706"
                        stroke="white"
                        strokeWidth="2.5"
                        className="transition-all cursor-pointer"
                      />

                      {/* X axis Date Label */}
                      <text
                        x={xPos}
                        y={chartHeight - padding + 18}
                        className="text-[9px] font-bold text-slate-400 font-mono"
                        textAnchor="middle"
                        fill="#64748b"
                      >
                        {log.date.slice(5)} {/* MM-DD format */}
                      </text>
                    </g>
                  );
                })}

                {/* Color Gradients Header */}
                <defs>
                  <linearGradient id="sleep-grad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#4f46e5" />
                    <stop offset="100%" stopColor="#4f46e5" stopOpacity="0" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
          </div>

          {/* Detailed analysis info based on the currently hovered/selected log or general summary */}
          <div className="p-4 bg-indigo-50/60 rounded-2xl border border-indigo-100 flex items-start gap-3">
            <Info className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
            <div className="text-xs text-indigo-900 leading-relaxed font-medium">
              {hoveredIndex !== null ? (
                <div>
                  <strong>{sortedLogs[hoveredIndex].date} 세부 수치:</strong> 수면 {sortedLogs[hoveredIndex].sleepHours}시간, 카페인 {sortedLogs[hoveredIndex].caffeineCups}잔 섭취시 일일 스트레스가 <strong>{sortedLogs[hoveredIndex].stressScore}/10</strong>을 보였습니다.
                  {sortedLogs[hoveredIndex].sleepHours < 6 && sortedLogs[hoveredIndex].stressScore > 6 ? (
                    <span className="text-rose-700 block mt-1 font-bold">⚠️ 경고: 수면 시간이 부족했던 날의 스트레스 호르몬 증가가 시각적으로 증명되었습니다.</span>
                  ) : null}
                </div>
              ) : (
                <div>
                  <strong>💡 시각분석 요지:</strong> 수면 시간은 <strong className="text-indigo-700">보라색 영역</strong>으로, 카페인은 <strong className="text-amber-700">갈색 신선</strong>으로, 스트레스는 <strong className="text-rose-700">빨간색 선</strong>으로 표시됩니다. 수면 낙폭과 스트레스 돌출의 대조적 경향, 혹은 카페인 흡입 수량 상승선과 시험불안 피크의 비례 변화를 직접 시안 대조해 보세요.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
