import React, { useState, useEffect, useRef } from "react";
import { Heart, Send, Sparkles, Wind, Users, PlusCircle, Check, Cloud, WifiOff } from "lucide-react";
import { db, OperationType, handleFirestoreError } from "../lib/firebase";
import { collection, onSnapshot, query, setDoc, doc } from "firebase/firestore";

interface FutureLetter {
  id: string;
  author: string;
  content: string;
  category: "counselor" | "peer" | "self";
  createdAt: string;
}

export default function EncouragementSpace({ user }: { user?: any }) {
  // Breathing state
  const [breathingState, setBreathingState] = useState<"ready" | "inhale" | "hold" | "exhale">("ready");
  const [breathingTimer, setBreathingTimer] = useState(0);
  const breathingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Future Letters state
  const [letters, setLetters] = useState<FutureLetter[]>([]);

  const [newLetterAuthor, setNewLetterAuthor] = useState("");
  const [newLetterContent, setNewLetterContent] = useState("");
  const [letterSaved, setLetterSaved] = useState(false);

  // Synchronize Encouragement Letters with Firebase Cloud DB or LocalStorage
  useEffect(() => {
    if (!user) {
      // Local mode fallback
      const saved = localStorage.getItem("workspace_student_letters");
      if (saved) {
        setLetters(JSON.parse(saved));
      } else {
        const defaultLetters: FutureLetter[] = [
          {
            id: "1",
            author: "은빛날개 전문상담교사",
            category: "counselor",
            content: "오늘 모의고사 성적이 원하는 만큼 흘러가지 않았더라도 낙담하지 마세요. 우리 몸속의 신경 단백질은 오르내리는 점수보다, 매일 아침 차분히 영양을 섭취하고 7시간을 버텨준 세포의 견고함을 더 지지합니다. 너는 충분히 고귀합니다.",
            createdAt: "2026-06-08"
          },
          {
            id: "2",
            author: "삼수탈출 수능만점 선배",
            category: "peer",
            content: "수면 5시간 미만으로 코르티솔 분비를 극도로 높여가며 스터디카페에서 지샌 날의 결과보다, 매일 30분씩 학교 운동장을 돌며 세로토닌을 올린 주간에 수능 수학 최고 시너지가 나왔어요. 나 자신을 돌보는 게 수험의 제1원칙입니다.",
            createdAt: "2026-06-11"
          }
        ];
        setLetters(defaultLetters);
        localStorage.setItem("workspace_student_letters", JSON.stringify(defaultLetters));
      }
      return;
    }

    // Live sync from Firestore
    const q = query(collection(db, "letters"));
    const unsubscribe = onSnapshot(q, async (snapshot) => {
      if (snapshot.empty) {
        // Seed first letters on Firestore so the space is never dry
        const defaultLetters: FutureLetter[] = [
          {
            id: "1",
            author: "은빛날개 전문상담교사",
            category: "counselor",
            content: "오늘 모의고사 성적이 원하는 만큼 흘러가지 않았더라도 낙담하지 마세요. 우리 몸속의 신경 단백질은 오르내리는 점수보다, 매일 아침 차분히 영양을 섭취하고 7시간을 버텨준 세포의 견고함을 더 지지합니다. 너는 충분히 고귀합니다.",
            createdAt: "2026-06-08"
          },
          {
            id: "2",
            author: "삼수탈출 수능만점 선배",
            category: "peer",
            content: "수면 5시간 미만으로 코르티솔 분비를 극도로 높여가며 스터디카페에서 지샌 날의 결과보다, 매일 30분씩 학교 운동장을 돌며 세로토닌을 올린 주간에 수능 수학 최고 시너지가 나왔어요. 나 자신을 돌보는 게 수험의 제1원칙입니다.",
            createdAt: "2026-06-11"
          }
        ];
        for (const letItem of defaultLetters) {
          try {
            await setDoc(doc(db, "letters", letItem.id), letItem);
          } catch (err) {
            console.error("Error seeding letter to Firestore:", err);
          }
        }
      } else {
        const dbLetters: FutureLetter[] = [];
        snapshot.forEach((docItem) => {
          dbLetters.push(docItem.data() as FutureLetter);
        });
        dbLetters.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
        setLetters(dbLetters);
      }
    }, (error) => {
      console.warn("Firestore letters list read error:", error);
    });

    return () => unsubscribe();
  }, [user]);

  // Breathing simulation logic (4-7-8 breathing)
  // 4s Inhale, 7s Hold, 8s Exhale
  useEffect(() => {
    if (breathingState === "ready") {
      setBreathingTimer(0);
      if (breathingIntervalRef.current) clearInterval(breathingIntervalRef.current);
      return;
    }

    breathingIntervalRef.current = setInterval(() => {
      setBreathingTimer((prev) => {
        if (breathingState === "inhale" && prev >= 4) {
          setBreathingState("hold");
          return 0;
        } else if (breathingState === "hold" && prev >= 7) {
          setBreathingState("exhale");
          return 0;
        } else if (breathingState === "exhale" && prev >= 8) {
          setBreathingState("inhale");
          return 0;
        }
        return prev + 1;
      });
    }, 1000);

    return () => {
      if (breathingIntervalRef.current) clearInterval(breathingIntervalRef.current);
    };
  }, [breathingState]);

  const handleStartBreathing = () => {
    setBreathingState("inhale");
    setBreathingTimer(0);
  };

  const handleStopBreathing = () => {
    setBreathingState("ready");
  };

  const handleAddLetter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLetterContent.trim()) return;

    const letterId = "letter_" + Date.now();
    const lCategory = "self" as const;
    const authorVal = newLetterAuthor.trim() || "익명의 수험생";
    const letter: FutureLetter = {
      id: letterId,
      author: authorVal,
      category: lCategory,
      content: newLetterContent.trim(),
      createdAt: new Date().toISOString().split('T')[0]
    };

    if (user) {
      try {
        await setDoc(doc(db, "letters", letterId), {
          ...letter,
          userId: user.uid
        });
      } catch (error) {
        handleFirestoreError(error, OperationType.CREATE, `letters/${letterId}`);
      }
    } else {
      const updatedLetters = [letter, ...letters];
      setLetters(updatedLetters);
      localStorage.setItem("workspace_student_letters", JSON.stringify(updatedLetters));
    }

    setNewLetterContent("");
    setNewLetterAuthor("");
    setLetterSaved(true);
    setTimeout(() => setLetterSaved(false), 3000);
  };

  const getCircleScaleClass = () => {
    switch (breathingState) {
      case "inhale": return "scale-125 bg-indigo-500 shadow-xl shadow-indigo-250";
      case "hold": return "scale-140 bg-indigo-600 shadow-2xl shadow-indigo-300";
      case "exhale": return "scale-95 bg-indigo-400 opacity-60";
      default: return "scale-100 bg-slate-300";
    }
  };

  return (
    <div className="space-y-8" id="encouragement-component">
      {/* SECTION 1: 4-7-8 Breathing Loop */}
      <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-100 shadow-sm">
        <div className="flex items-center gap-2 mb-6 border-b border-slate-100 pb-4">
          <Wind className="w-5 h-5 text-indigo-600" />
          <div>
            <span className="text-xs font-semibold px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded-full">자율신경 조절 수련</span>
            <h2 className="text-xl font-bold text-slate-800 mt-1">호르몬 이완 수련 (4-7-8 호흡 루프)</h2>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          {/* Lefthand interactive visualizer */}
          <div className="flex flex-col items-center justify-center p-6 bg-slate-50/50 border border-slate-100 rounded-2xl h-80 relative overflow-hidden">
            {/* Pulsating air halo */}
            <div
              className={`w-32 h-32 rounded-full absolute transition-all duration-[1000ms] ease-in-out opacity-20 ${getCircleScaleClass()}`}
            />

            {/* Inner air core */}
            <div
              className={`w-20 h-20 rounded-full text-white font-bold flex items-center justify-center shadow-md transition-all duration-[1000ms] ease-in-out z-10 ${getCircleScaleClass()}`}
            >
              {breathingState === "ready" && "대기"}
              {breathingState === "inhale" && "들이쉬기"}
              {breathingState === "hold" && "참기"}
              {breathingState === "exhale" && "내쉬기"}
            </div>

            {/* Current status prompt */}
            <div className="mt-8 text-center z-10 space-y-1">
              <p className="text-sm font-bold text-slate-800 max-w-sm">
                {breathingState === "ready" && "호흡 수련 시작 버튼을 클릭하세요."}
                {breathingState === "inhale" && `4초 흡입: 코로 깊게 들이쉬세요... (${breathingTimer}초)`}
                {breathingState === "hold" && `7초 유지: 머릿속 스트레스를 가두세요... (${breathingTimer}초)`}
                {breathingState === "exhale" && `8초 배출: 입으로 완전히 배출해 봅니다... (${breathingTimer}초)`}
              </p>
              <p className="text-xs text-slate-400 font-medium">
                뇌의 과부하 교감신경을 부교감신경으로 강제 전환하는 심신 안정이론입니다.
              </p>
            </div>

            {/* Action buttons */}
            <div className="absolute bottom-4 flex gap-2">
              {breathingState === "ready" ? (
                <button
                  onClick={handleStartBreathing}
                  className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-all cursor-pointer"
                >
                  호흡 수련 시작
                </button>
              ) : (
                <button
                  onClick={handleStopBreathing}
                  className="px-4 py-1.5 bg-slate-600 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold transition-all cursor-pointer"
                >
                  중단하고 이완
                </button>
              )}
            </div>
          </div>

          {/* Righthand physiological explain */}
          <div className="space-y-4">
            <h3 className="font-extrabold text-sm text-indigo-700 uppercase tracking-widest">🩺 왜 4-7-8 호흡일까요? 수험생 신경과학</h3>
            <ul className="space-y-3 text-xs text-slate-600 leading-relaxed">
              <li>
                <strong>🧘 부교감신경 강제 활성:</strong> 8초의 폐활 배출은 기도를 길고 고르게 열어 미주신경을 부드럽게 압박하며 격앙된 맥박수를 즉지 낮추도록 도정합니다.
              </li>
              <li>
                <strong>🧠 혈류 흐름의 정상화:</strong> 전두엽에 집중된 불안 파형(Beta Wave)을 제어하고 휴식 파형(Alpha Wave)을 고르게 촉진하여 고도의 기억력을 최적화합니다.
              </li>
              <li>
                <strong>☀️ 코르티솔 분비 제어:</strong> 격렬해지던 스트레스 인자와 신체 부신피질 활성화 수치를 원래 배율대로 정온 조종합니다.
              </li>
            </ul>
            <div className="p-3 bg-indigo-50/55 rounded-xl text-[11px] text-indigo-900 border border-indigo-100/50">
              * 불안으로 심장이 두근거리거나 시험 직전 집중이 흔들릴 때 의도적인 심신 조율을 3회 반복해보세요. 시냅스가 완전히 안정됩니다.
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 2: Stressed highschoolers future letter room */}
      <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-100 shadow-sm text-sm">
        <div className="flex items-center gap-2 mb-6 border-b border-slate-100 pb-4">
          <Users className="w-5 h-5 text-indigo-600" />
          <div>
            <span className="text-xs font-semibold px-2 py-0.5 bg-indigo-50 text-indigo-805 rounded-full">공감과 격려의 벽</span>
            <h2 className="text-xl font-bold text-slate-800 mt-1">미래의 나에게 쓰는 극복 편지</h2>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Letter Input Board */}
          <div className="lg:col-span-1 p-5 border border-indigo-100 rounded-2xl bg-indigo-50/5 animate-fade-in">
            <h3 className="font-bold text-indigo-950 mb-3 flex items-center gap-1">
              <PlusCircle className="w-4 h-4 text-indigo-600" /> 편지 한 자루 던지기
            </h3>

            {letterSaved && (
              <div className="mb-4 p-2.5 bg-indigo-50 border border-indigo-100 text-indigo-800 text-xs rounded-xl flex items-center gap-2 font-bold">
                <Check className="w-3.5 h-3.5 text-indigo-600" /> 편지가 온정의 벽에 박혔습니다!
              </div>
            )}

            <form onSubmit={handleAddLetter} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">작성자 명의 (익명 가능)</label>
                <input
                  type="text"
                  placeholder="예: 지친 수험생, 만점 도전이 등"
                  value={newLetterAuthor}
                  onChange={(e) => setNewLetterAuthor(e.target.value)}
                  className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:ring-1 focus:ring-indigo-500 outline-none font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">나 혹은 동료를 향한 격려 한 숟갈</label>
                <textarea
                  placeholder="예: 수능 끝난 날의 나에게, 포기하지 않고 7시간씩 자며 꿋꿋이 급식을 채운 너는 진짜 위인이다..."
                  value={newLetterContent}
                  onChange={(e) => setNewLetterContent(e.target.value)}
                  required
                  rows={4}
                  className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:ring-1 focus:ring-indigo-500 outline-none font-medium"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer font-bold"
              >
                <Send className="w-3.5 h-3.5" /> 격려 편지 부치기
              </button>
            </form>
          </div>

          {/* Letters List display */}
          <div className="lg:col-span-2 space-y-4">
            <h3 className="font-bold text-slate-700 flex items-center gap-1.5 text-xs tracking-wider uppercase">
              <Sparkles className="w-4 h-4 text-indigo-600" /> 친구들과 교사들의 위로 편지함
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {letters.map((letItem) => (
                <div
                  key={letItem.id}
                  className={`p-4 border rounded-2xl flex flex-col justify-between shadow-2xs relative ${
                    letItem.category === "counselor"
                      ? "border-slate-200/60 bg-slate-50/50"
                      : "border-indigo-100 bg-indigo-50/5"
                  }`}
                >
                  <p className="text-xs text-slate-600 whitespace-pre-line leading-relaxed italic mb-4 font-semibold">
                    &ldquo;{letItem.content}&rdquo;
                  </p>

                  <div className="flex items-center justify-between border-t border-slate-100 pt-2.5 text-[10px]">
                    <span className={`px-2 py-0.5 rounded-full font-bold ${
                      letItem.category === "counselor"
                        ? "bg-slate-100 text-slate-700 border border-slate-200"
                        : "bg-indigo-50 text-indigo-750 border border-indigo-100"
                    }`}>
                      {letItem.category === "counselor" ? "교사 위로방" : "자유 격려관"}
                    </span>
                    <span className="font-medium text-slate-500">
                      by <strong>{letItem.author}</strong> ({letItem.createdAt})
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
