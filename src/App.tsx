/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { DailyLog } from "./types";
import DailyTracker from "./components/DailyTracker";
import HistoryLogs from "./components/HistoryLogs";
import AIScienceInsight from "./components/AIScienceInsight";
import BiometricCharts from "./components/BiometricCharts";
import EncouragementSpace from "./components/EncouragementSpace";
import HTMLCodeExport from "./components/HTMLCodeExport";
import { Heart, Brain, TrendingUp, Calendar, Wind, Copy, Database, Cloud, WifiOff } from "lucide-react";
import { auth, db, googleProvider, OperationType, handleFirestoreError } from "./lib/firebase";
import { onAuthStateChanged, signInWithPopup, signOut } from "firebase/auth";
import { collection, onSnapshot, query, where, doc, setDoc, deleteDoc } from "firebase/firestore";

const initialDummy: DailyLog[] = [
  {
    id: "seed_1",
    date: "2026-06-08",
    stressScore: 8,
    anxietyScore: 7,
    happinessScore: 3,
    depressionScore: 7,
    journal: "수리 모의고사가 생각보다 안 나와서 자신감이 급감했다. 도통 집중이 되지 않고 머리만 아프다.",
    sleepHours: 5,
    exerciseMinutes: 0,
    meals: { breakfast: false, lunch: true, dinner: true },
    caffeineCups: 3
  },
  {
    id: "seed_2",
    date: "2026-06-09",
    stressScore: 7,
    anxietyScore: 8,
    happinessScore: 4,
    depressionScore: 6,
    journal: "새벽 스터디카페에서 나오는데 너무 심장이 가쁘게 뛰었다. 너무 많은 캔커피를 들이킨 지장인 것 같다.",
    sleepHours: 5.5,
    exerciseMinutes: 10,
    meals: { breakfast: false, lunch: true, dinner: true },
    caffeineCups: 3
  },
  {
    id: "seed_3",
    date: "2026-06-10",
    stressScore: 4,
    anxietyScore: 3,
    happinessScore: 7,
    depressionScore: 2,
    journal: "어젯밤 8시간 정도 충분히 자고 아침을 꼭 채웠더니 머리가 맑다! 점심시간에 운동장을 조깅했는데 기분이 묘하게 상쾌하다.",
    sleepHours: 8,
    exerciseMinutes: 30,
    meals: { breakfast: true, lunch: true, dinner: true },
    caffeineCups: 1
  },
  {
    id: "seed_4",
    date: "2026-06-11",
    stressScore: 3,
    anxietyScore: 4,
    happinessScore: 8,
    depressionScore: 1,
    journal: "오후 학원 수업 도중에 졸지 않고 잘 들었다! 수면 충전량이 충분한 영향이 피부로 느껴진다. 수능 준비 리듬이 점차 궤도에 잡힌다.",
    sleepHours: 7.5,
    exerciseMinutes: 20,
    meals: { breakfast: true, lunch: true, dinner: true },
    caffeineCups: 1
  }
];

export default function App() {
  const [logs, setLogs] = useState<DailyLog[]>([]);
  const [activeMenu, setActiveMenu] = useState<"tracker" | "charts" | "ai" | "history" | "healing" | "export">("tracker");
  const [user, setUser] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);

  // Monitor Auth Changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Sync DailyLogs via Firestore or LocalStorage
  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      // Local state fallback
      try {
        const saved = localStorage.getItem("workspace_student_logs");
        if (saved) {
          setLogs(JSON.parse(saved));
        } else {
          setLogs(initialDummy);
          localStorage.setItem("workspace_student_logs", JSON.stringify(initialDummy));
        }
      } catch (e) {
        console.error("Local storage load failed", e);
      }
      return;
    }

    // Set up active Cloud Firestore listener
    const q = query(collection(db, "daily_logs"), where("userId", "==", user.uid));
    const unsubscribe = onSnapshot(q, async (snapshot) => {
      if (snapshot.empty) {
        // If Firebase is completely empty, upload the local logs (or initial seeds) to sync up
        try {
          const guestLogsStr = localStorage.getItem("workspace_student_logs");
          const guestLogs = guestLogsStr ? JSON.parse(guestLogsStr) : initialDummy;
          for (const log of guestLogs) {
            await setDoc(doc(db, "daily_logs", log.id), {
              ...log,
              userId: user.uid
            });
          }
        } catch (err: any) {
          console.error("Failed to seed initial user logs on cloud:", err);
        }
      } else {
        const dbLogs: DailyLog[] = [];
        snapshot.forEach((docItem) => {
          const item = docItem.data();
          dbLogs.push({
            id: item.id,
            date: item.date,
            stressScore: Number(item.stressScore),
            anxietyScore: Number(item.anxietyScore),
            happinessScore: Number(item.happinessScore),
            depressionScore: Number(item.depressionScore),
            journal: item.journal || "",
            sleepHours: Number(item.sleepHours),
            exerciseMinutes: Number(item.exerciseMinutes),
            meals: item.meals || { breakfast: false, lunch: false, dinner: false },
            caffeineCups: Number(item.caffeineCups)
          } as DailyLog);
        });
        dbLogs.sort((a, b) => b.date.localeCompare(a.date));
        setLogs(dbLogs);
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, "daily_logs");
    });

    return () => unsubscribe();
  }, [user, authLoading]);

  const handleAddLog = async (newLog: DailyLog) => {
    if (user) {
      try {
        await setDoc(doc(db, "daily_logs", newLog.id), {
          ...newLog,
          userId: user.uid
        });
      } catch (error) {
        handleFirestoreError(error, OperationType.CREATE, `daily_logs/${newLog.id}`);
      }
    } else {
      const updated = logs.filter((l) => l.date !== newLog.date);
      const newLogs = [...updated, newLog].sort((a, b) => b.date.localeCompare(a.date));
      setLogs(newLogs);
      localStorage.setItem("workspace_student_logs", JSON.stringify(newLogs));
    }
  };

  const handleDeleteLog = async (id: string) => {
    if (user) {
      try {
        await deleteDoc(doc(db, "daily_logs", id));
      } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, `daily_logs/${id}`);
      }
    } else {
      const updated = logs.filter((log) => log.id !== id);
      setLogs(updated);
      localStorage.setItem("workspace_student_logs", JSON.stringify(updated));
    }
  };


  return (
    <div className="bg-slate-50 min-h-screen font-sans text-slate-800 flex flex-col antialiased">
      {/* Top calm header bar */}
      <header className="bg-white border-b border-slate-200 py-4 px-6 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <span className="p-2.5 bg-indigo-600 text-white rounded-xl text-xl font-bold tracking-tight shadow-sm">
              M
            </span>
            <div>
              <h1 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-1.5">
                수험생 생체 리듬 & 감정 통합 포털 <span className="text-indigo-600 font-normal">MindFlow v1.2</span>
              </h1>
              <p className="text-[10px] text-slate-400 font-bold tracking-wide uppercase">Biological Stress & Lifestyle Care System</p>
            </div>
          </div>

           {/* Quick Stats overview of the logged days & Student ID badge in Sleek Theme style */}
          <div className="flex flex-col sm:flex-row items-center gap-4 text-xs text-neutral-500 font-medium">
            <div className="hidden md:flex items-center gap-1.5 pr-4 border-r border-slate-200">
              {user ? (
                <span className="flex items-center gap-1.5 text-indigo-600 font-bold bg-indigo-50 px-2.5 py-1 rounded-full text-[10px]">
                  <Cloud className="w-3.5 h-3.5 animate-pulse text-indigo-600" />
                  실시간 클라우드 연동 중
                </span>
              ) : (
                <span className="flex items-center gap-1.5 text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full text-[10px]">
                  <WifiOff className="w-3.5 h-3.5 text-slate-400" />
                  오프라인 브라우저 저장
                </span>
              )}
              <span className="text-xs text-slate-600 ml-2"><strong>{logs.length}개 일지 기록</strong></span>
            </div>

            {authLoading ? (
              <div className="text-slate-400 text-xs px-2 animate-pulse">인증 로딩 중...</div>
            ) : user ? (
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="text-[9px] font-semibold text-indigo-500 uppercase tracking-wider">Cloud Connected</p>
                  <p className="text-xs font-bold text-slate-700">{user.displayName || "수험생"}</p>
                </div>
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName || "User"}
                    referrerPolicy="no-referrer"
                    className="w-9 h-9 rounded-full border-2 border-indigo-100 object-cover shadow-2xs"
                  />
                ) : (
                  <div className="w-9 h-9 bg-slate-100 rounded-full border-2 border-indigo-100 flex items-center justify-center text-sm">
                    👩‍🎓
                  </div>
                )}
                <button
                  onClick={() => signOut(auth)}
                  className="px-2 py-1.5 bg-slate-100 hover:bg-slate-200 hover:text-slate-800 text-slate-600 rounded-lg text-[10px] font-bold transition-all cursor-pointer"
                >
                  로그아웃
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="text-[9px] font-semibold text-rose-400 uppercase tracking-wider">Local Sandbox</p>
                  <p className="text-xs font-bold text-slate-700">게스트 수험생</p>
                </div>
                <div className="w-9 h-9 bg-slate-105 rounded-full border border-slate-200 flex items-center justify-center text-sm">
                  👩‍🎓
                </div>
                <button
                  onClick={async () => {
                    try {
                      await signInWithPopup(auth, googleProvider);
                    } catch (e: any) {
                      console.error("Sign in error", e);
                      alert("인증 팝업 오류가 발생했습니다. 새 창 열기나 팝업 허용이 필요할 수 있습니다: " + e.message);
                    }
                  }}
                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-[10px] font-bold shadow-xs transition-all flex items-center gap-1 cursor-pointer font-bold"
                >
                  <Database className="w-3 h-3 text-white" /> 구글 로그인 연동
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main body with Grid layout */}
      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 flex-1 w-full grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Navigation panel */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm space-y-2">
            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-2 mb-3">Care Dashboard</h3>
            <nav className="flex flex-col gap-1.5">
              {[
                { id: "tracker", label: "일일 기상도 (Tracker)", icon: <Heart className="w-4 h-4" /> },
                { id: "charts", label: "행동-정서 그래프 (Charts)", icon: <TrendingUp className="w-4 h-4" /> },
                { id: "ai", label: "생리 AI 과학 분석소 (AI)", icon: <Brain className="w-4 h-4 text-indigo-600" /> },
                { id: "history", label: "수험 기록 일기장 (History)", icon: <Calendar className="w-4 h-4" /> },
                { id: "healing", label: "온도 이완 치료소 (Healing)", icon: <Wind className="w-4 h-4" /> },
                { id: "export", label: "HTML 백업 다운로드 (Code)", icon: <Copy className="w-4 h-4 text-indigo-500" /> }
              ].map((m) => (
                <button
                  key={m.id}
                  onClick={() => setActiveMenu(m.id as any)}
                  className={`w-full text-left px-4.5 py-3.5 text-xs font-bold rounded-2xl flex items-center gap-3.5 transition-all cursor-pointer ${
                    activeMenu === m.id
                      ? "bg-indigo-50 text-indigo-800 shadow-3xs"
                      : "text-slate-500 hover:text-slate-800 hover:bg-slate-50"
                  }`}
                >
                  <span className={activeMenu === m.id ? "text-indigo-600" : "text-slate-400"}>
                    {m.icon}
                  </span>
                  {m.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Quick supportive quotes for stressed adolescents */}
          <div className="p-6 bg-indigo-900 text-white rounded-3xl space-y-3.5 shadow-md">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 bg-indigo-500 rounded text-[9px] font-bold uppercase tracking-widest">AI Insight</span>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-semibold text-indigo-200">생체 항상성 보호 Tip</p>
              <p className="text-xs leading-relaxed text-slate-100 italic">
                "수면 결손(Sleep Debt)은 이산화탄소 대사를 왜곡하고 뇌 기억 세포 해마를 노쇠화시킵니다. 수능이나 모의고사 주간에는 책상에서 뇌를 과도하게 압박하지 말고, 가볍게 이완해 주시길 권장합니다."
              </p>
            </div>
          </div>
        </div>

        {/* Dynamic view content render */}
        <div className="lg:col-span-3 space-y-8">
          {activeMenu === "tracker" && <DailyTracker onAddLog={handleAddLog} existingLogs={logs} />}
          {activeMenu === "charts" && <BiometricCharts logs={logs} />}
          {activeMenu === "ai" && <AIScienceInsight logs={logs} />}
          {activeMenu === "history" && <HistoryLogs logs={logs} onDeleteLog={handleDeleteLog} />}
          {activeMenu === "healing" && <EncouragementSpace user={user} />}
          {activeMenu === "export" && <HTMLCodeExport />}
        </div>
      </main>

      {/* Footer copyright */}
      <footer className="bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-400 mt-12">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p>© 2026 청소년·수험생 생체 리듬 분석 케어실 (Student Stress care & Homeostasis Protection Reactor app).</p>
          <div className="flex gap-4 font-mono text-[10px]">
            <span>Vite + React 19</span>
            <span>Gemini API Node-Proxy</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
