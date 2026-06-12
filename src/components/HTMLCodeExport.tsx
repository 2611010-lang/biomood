import React, { useState, useEffect } from "react";
import { Clipboard, Check, FileCode, Download, ExternalLink } from "lucide-react";

export default function HTMLCodeExport() {
  const [activeTab, setActiveTab] = useState<"letter" | "index" | "admin">("index");
  const [copied, setCopied] = useState(false);
  const [contents, setContents] = useState({
    letter: "",
    index: "",
    admin: ""
  });

  // Fetch static offline files content so we show the exact live matching codes!
  useEffect(() => {
    const fetchFiles = async () => {
      try {
        const resLetter = await fetch("/offline/letter.html");
        const resIndex = await fetch("/offline/index.html");
        const resAdmin = await fetch("/offline/admin.html");

        setContents({
          letter: resLetter.ok ? await resLetter.text() : "<!-- letter.html loading error -->",
          index: resIndex.ok ? await resIndex.text() : "<!-- index.html loading error -->",
          admin: resAdmin.ok ? await resAdmin.text() : "<!-- admin.html loading error -->"
        });
      } catch (err) {
        console.error("Error loading templates for viewer:", err);
      }
    };

    fetchFiles();
  }, []);

  const handleCopy = () => {
    const textToCopy = contents[activeTab];
    if (!textToCopy) return;

    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const currentCode = contents[activeTab];

  return (
    <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-100 shadow-sm" id="export-component">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 border-b border-slate-100 pb-4">
        <div>
          <span className="text-xs font-semibold px-2.5 py-1 bg-indigo-50 text-indigo-700 rounded-full">
            오프라인 단일 파일 배포 패키지
          </span>
          <h2 className="text-xl md:text-2xl font-bold text-slate-800 mt-1.5 flex items-center gap-2">
            <FileCode className="text-indigo-600 w-5 h-5" /> HTML 3개 백업 및 코드 추출 센터
          </h2>
        </div>
        <div className="flex gap-2.5">
          <a
            href={`/offline/${activeTab}.html`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
          >
            <ExternalLink className="w-3.5 h-3.5" /> 새 탭에서 실행해보기
          </a>
        </div>
      </div>

      <div className="p-4 bg-indigo-50/50 text-indigo-950 rounded-2xl text-xs leading-relaxed space-y-1 mb-6 border border-indigo-100/50">
        <p className="font-bold">💡 오프라인 HTML 파일 활용법:</p>
        <p>전달되는 HTML 파일들은 모바일/PC 어디서든 인터넷만 흐르면 즉시 구동되는 <strong>완전 독립 가동형 웹 문서</strong>입니다.</p>
        <p>firebaseConfig 더미값을 본인의 Firebase 프로젝트 키로 교체하시면, 1대의 데이터베이스 스택을 공유하여 <strong>일지 기록, 위로 편지 추천, 상담교사 통계제어가 모두 완벽히 연동</strong>되는 기적을 얻을 수 있습니다!</p>
      </div>

      {/* Tabs list */}
      <div className="flex border-b border-slate-100 mb-4 gap-1.5 overflow-x-auto scrollbar-none">
        {[
          { id: "index", label: "--- index.html --- (일지 작성 및 AI 요지)" },
          { id: "letter", label: "--- letter.html --- (숨쉬기 및 위로 편지)" },
          { id: "admin", label: "--- admin.html --- (상담 교사용 종합 통계)" }
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => {
              setActiveTab(t.id as any);
              setCopied(false);
            }}
            className={`py-2 px-4 text-xs font-bold transition-all rounded-t-xl cursor-pointer shrink-0 ${
              activeTab === t.id
                ? "border-b-2 border-indigo-650 text-indigo-700 bg-indigo-50/25 font-bold"
                : "text-slate-400 hover:text-slate-600"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Editor Block */}
      <div className="relative border border-slate-200 rounded-2xl bg-slate-900 text-slate-100 overflow-hidden text-xs">
        {/* Editor Ribbon controls */}
        <div className="bg-slate-850 px-4 py-2.5 flex justify-between items-center border-b border-slate-700 font-mono text-[10px] text-slate-400">
          <span>{activeTab}.html • Inline CSS & Javascript Included</span>
          <button
            onClick={handleCopy}
            className="flex items-center gap-1 px-3 py-1 bg-slate-700 hover:bg-slate-600 rounded-lg text-slate-200 hover:text-white transition-all cursor-pointer font-sans"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-indigo-400" /> 복사 완료!
              </>
            ) : (
              <>
                <Clipboard className="w-3.5 h-3.5" /> 코드 복사하기
              </>
            )}
          </button>
        </div>

        {/* Code display area */}
        <pre className="p-4 overflow-x-auto h-[480px] font-mono leading-relaxed text-slate-250 whitespace-pre scrollbar-thin">
          <code>{currentCode || "코드 템플릿 로딩 중..."}</code>
        </pre>
      </div>
    </div>
  );
}
