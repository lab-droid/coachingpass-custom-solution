import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { InputForm } from './components/InputForm';
import { ProcessVisualizer } from './components/ProcessVisualizer';
import { ProcessStep, UserInputData, GeneratedContent } from './types';
import { generateReportSection, generateCoverImage, generateInfographic } from './services/geminiService';
import { downloadAsWord } from './services/documentService';
import { TaskState, TaskProgress } from './types';

const getInitialTasks = (solutionType: string): TaskProgress[] => {
    const getLabels = (type: string) => {
        if (type === "진로 맞춤 솔루션") {
            return [
                "직무 적성 및 역량 진단 생성",
                "산업 트렌드 및 유망 직무 분석",
                "커리어 로드맵 설계 생성",
                "역량 강화 로드맵 생성",
                "진로 성공 핵심 전략 생성"
            ];
        } else if (type === "서류 맞춤 솔루션") {
            return [
                "자소서 문항 분석 및 의도 파악",
                "STAR 기법 기반 스토리텔링 생성",
                "직무 역량 키워드 배치 전략",
                "이력서 시각화 및 구조 개선",
                "서류 합격 최종 보완 전략"
            ];
        } else if (type === "필기 맞춤 솔루션") {
            return [
                "필기 전형 유형 및 특징 분석",
                "핵심 개념 및 빈출 테마 정리",
                "문제 풀이 및 시간 관리 스킬",
                "취약점 분석 및 보완 가이드",
                "필기 합격 실전 팁 요약"
            ];
        } else {
            return [
                "예상질문 & 답변 생성",
                "임기응변 전략 생성",
                "면접관 시선 분석",
                "합격 노하우 생성",
                "면접관 전략 피드백 생성"
            ];
        }
    };

    const labels = getLabels(solutionType);

    return [
        { id: 'section1', label: `Chapter 1: ${labels[0]}`, state: TaskState.PENDING },
        { id: 'section2', label: `Chapter 2: ${labels[1]}`, state: TaskState.PENDING },
        { id: 'section3', label: `Chapter 3: ${labels[2]}`, state: TaskState.PENDING },
        { id: 'section4', label: `Chapter 4: ${labels[3]}`, state: TaskState.PENDING },
        { id: 'section5', label: `Chapter 5: ${labels[4]}`, state: TaskState.PENDING },
        { id: 'cover', label: '프리미엄 커버 이미지 디자인', state: TaskState.PENDING },
        { id: 'img1', label: 'Chapter 1 인포그래픽 생성', state: TaskState.PENDING },
        { id: 'img2', label: 'Chapter 2 인포그래픽 생성', state: TaskState.PENDING },
        { id: 'img3', label: 'Chapter 3 인포그래픽 생성', state: TaskState.PENDING },
        { id: 'img4', label: 'Chapter 4 인포그래픽 생성', state: TaskState.PENDING },
        { id: 'img5', label: 'Chapter 5 인포그래픽 생성', state: TaskState.PENDING },
    ];
};

declare global {
  interface AIStudio {
    hasSelectedApiKey: () => Promise<boolean>;
    openSelectKey: () => Promise<void>;
  }
  interface Window {
    aistudio?: AIStudio;
  }
}

const App: React.FC = () => {
  const [step, setStep] = useState<ProcessStep>(ProcessStep.IDLE);
  const [tasks, setTasks] = useState<TaskProgress[]>([]);
  const [content, setContent] = useState<GeneratedContent>({
      section1: '', section2: '', section3: '', section4: '', section5: ''
  });
  const [userData, setUserData] = useState<UserInputData | null>(null);
  const [hasApiKey, setHasApiKey] = useState(false);

  useEffect(() => {
    checkApiKey();
  }, []);

  const updateTask = (id: string, state: TaskState) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, state } : t));
  };

  const checkApiKey = async () => {
    if (window.aistudio) {
      const selected = await window.aistudio.hasSelectedApiKey();
      setHasApiKey(selected);
    }
  };

  const handleApiKeySelect = async () => {
    if (window.aistudio) {
      await window.aistudio.openSelectKey();
      await checkApiKey();
    }
  };

  const handleStartAnalysis = async (data: UserInputData) => {
    if (!hasApiKey && window.aistudio) {
       await handleApiKeySelect();
       const selected = await window.aistudio.hasSelectedApiKey();
       if (!selected) return;
    }

    setUserData(data);
    setStep(ProcessStep.ANALYZING);
    setTasks(getInitialTasks(data.solutionType));

    try {
      // --- Parallel Generation Phase ---
      setStep(ProcessStep.WORKFLOW_1); // Start with first step visually
      
      const fileContext = {
          resume: data.resumeFile, 
          cover: data.coverLetterFile, 
          notice: data.interviewNoticeFile, 
          posting: data.jobPostingFile, 
          preTask: data.preTaskFile,
          ptMaterial: data.ptMaterialFile,
          otherFiles: data.otherFiles
      };

      // Staggered parallelization to avoid burst limits
      const staggerDelay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

      const runTask = async (id: string, fn: () => Promise<any>) => {
          updateTask(id, TaskState.PROCESSING);
          try {
              const result = await fn();
              updateTask(id, TaskState.COMPLETED);
              return result;
          } catch (e) {
              updateTask(id, TaskState.FAILED);
              throw e;
          }
      };

      const getInfographicTopics = (type: string) => {
          if (type === "진로 맞춤 솔루션") {
              return [
                  "직무 적성 및 역량 진단",
                  "산업 트렌드 및 유망 직무",
                  "커리어 로드맵 설계",
                  "역량 강화 로드맵",
                  "진로 성공 핵심 전략"
              ];
          } else if (type === "서류 맞춤 솔루션") {
              return [
                  "자소서 문항 분석 및 의도 파악",
                  "STAR 기법 기반 스토리텔링",
                  "직무 역량 키워드 배치",
                  "이력서 시각화 및 구조 개선",
                  "서류 합격 최종 보완 전략"
              ];
          } else if (type === "필기 맞춤 솔루션") {
              return [
                  "필기 전형 유형 및 특징 분석",
                  "핵심 개념 및 빈출 테마",
                  "문제 풀이 및 시간 관리 스킬",
                  "취약점 분석 및 보완 가이드",
                  "필기 합격 실전 팁 요약"
              ];
          } else {
              return [
                  "면접 예상 질문 전략 및 핵심 역량",
                  "위기 관리 및 돌발 상황 대처법",
                  "지원자 SWOT 분석 및 약점 체크",
                  "면접 태도 및 합격 시그널",
                  "면접관의 합격 전략 피드백"
              ];
          }
      };

      const topics = getInfographicTopics(data.solutionType);

      const [
          section1, section2, section3, section4, section5,
          coverImage,
          img1, img2, img3, img4, img5
      ] = await Promise.all([
          runTask('section1', () => generateReportSection(1, data.solutionType, data.companyName, data.jobTitle, data.interviewType, data.studentName, data.requirements, data.referenceLinks, data.targetPageCount, data.analysisOptions, fileContext)),
          staggerDelay(500).then(() => runTask('section2', () => generateReportSection(2, data.solutionType, data.companyName, data.jobTitle, data.interviewType, data.studentName, data.requirements, data.referenceLinks, data.targetPageCount, data.analysisOptions, fileContext))),
          staggerDelay(1000).then(() => runTask('section3', () => generateReportSection(3, data.solutionType, data.companyName, data.jobTitle, data.interviewType, data.studentName, data.requirements, data.referenceLinks, data.targetPageCount, data.analysisOptions, fileContext))),
          staggerDelay(1500).then(() => runTask('section4', () => generateReportSection(4, data.solutionType, data.companyName, data.jobTitle, data.interviewType, data.studentName, data.requirements, data.referenceLinks, data.targetPageCount, data.analysisOptions, fileContext))),
          staggerDelay(2000).then(() => runTask('section5', () => generateReportSection(5, data.solutionType, data.companyName, data.jobTitle, data.interviewType, data.studentName, data.requirements, data.referenceLinks, data.targetPageCount, data.analysisOptions, fileContext))),
          staggerDelay(2500).then(() => runTask('cover', () => generateCoverImage(data.companyName, data.jobTitle, data.studentName))),
          staggerDelay(3000).then(() => runTask('img1', () => generateInfographic(topics[0]))),
          staggerDelay(3500).then(() => runTask('img2', () => generateInfographic(topics[1]))),
          staggerDelay(4000).then(() => runTask('img3', () => generateInfographic(topics[2]))),
          staggerDelay(4500).then(() => runTask('img4', () => generateInfographic(topics[3]))),
          staggerDelay(5000).then(() => runTask('img5', () => generateInfographic(topics[4])))
      ]);

      const finalContent = {
          section1, section2, section3, section4, section5,
          coverImage,
          section1Image: img1,
          section2Image: img2,
          section3Image: img3,
          section4Image: img4,
          section5Image: img5
      };
      
      setContent(finalContent);

      // --- Document Creation Phase ---
      setStep(ProcessStep.CREATING_DOC);
      
      // Slight delay to allow visualizer to update before download triggers
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Completion & Auto Download
      setStep(ProcessStep.COMPLETED);
      
      setTimeout(() => {
          downloadAsWord(finalContent, data);
      }, 500);

    } catch (error: any) {
      console.error(error);
      setStep(ProcessStep.ERROR);
      
      let errorMessage = error instanceof Error ? error.message : "알 수 없는 오류가 발생했습니다.";
      let advice = "잠시 후 다시 시도하거나, 문제가 지속되면 API Key를 확인해주세요.";
      
      if (errorMessage.includes("503") || errorMessage.includes("high demand") || errorMessage.includes("UNAVAILABLE")) {
          errorMessage = "현재 AI 모델의 사용량이 매우 많아 일시적으로 응답이 지연되고 있습니다.";
          advice = "1~2분 후에 다시 시도해 주시면 감사하겠습니다. (서버 과부하 현상은 보통 일시적입니다.)";
      } else if (errorMessage.includes("429") || errorMessage.includes("limit")) {
          errorMessage = "API 호출 한도를 초과했습니다.";
          advice = "잠시 기다린 후 다시 시도하거나, 유료 계정의 API Key인지 확인해 주세요.";
      }

      alert(`[오류 발생]\n${errorMessage}\n\n${advice}`);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-slate-200 pb-20 font-sans selection:bg-amber-500/30 selection:text-amber-200">
      {/* Header */}
      <header className="bg-black/80 backdrop-blur-md border-b border-white/10 sticky top-0 z-50 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center space-x-3 group cursor-pointer" onClick={() => window.location.reload()}>
            <div className="w-10 h-10 bg-gradient-to-br from-amber-200 to-amber-600 rounded-xl flex items-center justify-center text-black group-hover:scale-105 transition-transform duration-300 shadow-[0_0_15px_rgba(245,158,11,0.3)]">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                </svg>
            </div>
            <div className="flex flex-col">
                <h1 className="text-xl font-extrabold text-white tracking-tight leading-none">코칭패스 면접 맞춤 솔루션</h1>
                <span className="text-[10px] font-bold text-amber-500 tracking-[0.2em] uppercase mt-1">Premium Interview Solution</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-6 py-12">
        {step === ProcessStep.IDLE && (
            <div className="text-center mb-16 animate-fade-in-down">
                <span className="inline-block py-1 px-4 rounded-full bg-amber-900/30 border border-amber-500/30 text-amber-400 text-xs font-bold mb-8 shadow-[0_0_20px_rgba(245,158,11,0.1)]">
                    VVIP 합격 솔루션
                </span>
                <h2 className="text-4xl md:text-5xl lg:text-7xl font-extrabold text-white mb-8 tracking-tight leading-tight">
                    합격의 문을 여는<br/>
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-amber-600 drop-shadow-sm">마스터키 (Master Key)</span>
                </h2>
                <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed font-light">
                    단순한 코칭이 아닙니다.<br className="hidden md:block"/> 
                    <strong className="text-white">코칭패스</strong>는 당신의 서류를 완벽하게 분석하여<br/>
                    면접관을 압도할 수 있는 <span className="text-amber-400">유일무이한 전략</span>을 제시합니다.
                </p>
            </div>
        )}

        {/* Stepper */}
        <div className={`transition-all duration-700 ease-in-out transform ${step === ProcessStep.IDLE ? 'mb-12 translate-y-0 opacity-100' : 'mb-20 translate-y-0 opacity-100'}`}>
          <ProcessVisualizer currentStep={step} />
        </div>

        {/* Input Form */}
        {step === ProcessStep.IDLE && (
           <div className="animate-fade-in-up delay-100 relative z-10">
             <InputForm onSubmit={handleStartAnalysis} isProcessing={false} />
           </div>
        )}

        {/* Processing State */}
        {step !== ProcessStep.IDLE && step !== ProcessStep.COMPLETED && step !== ProcessStep.ERROR && (
          <div className="flex flex-col lg:flex-row items-start justify-center gap-12 py-12 animate-fade-in">
            {/* Animation Area */}
            <div className="flex flex-col items-center justify-center lg:w-1/2">
                <div className="relative mb-12">
                    <div className="w-40 h-40 border-2 border-amber-900/50 rounded-full animate-ping absolute top-0 left-0"></div>
                    <div className="w-40 h-40 border-2 border-amber-500/20 border-t-amber-500 rounded-full animate-spin relative z-10 bg-black/40 backdrop-blur-sm shadow-[0_0_30px_rgba(245,158,11,0.2)]"></div>
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-5xl animate-bounce">
                        {step === ProcessStep.GENERATING_IMAGES ? '🎨' : step === ProcessStep.CREATING_DOC ? '📄' : '🔑'}
                    </div>
                </div>
                <h3 className="text-3xl font-bold text-white mb-3 text-center">
                    {step === ProcessStep.ANALYZING && "서류 분석 및 데이터 준비 중..."}
                    {(step === ProcessStep.WORKFLOW_1 || step === ProcessStep.WORKFLOW_2 || step === ProcessStep.WORKFLOW_3 || step === ProcessStep.WORKFLOW_4 || step === ProcessStep.WORKFLOW_5 || step === ProcessStep.GENERATING_IMAGES) && "AI가 모든 섹션과 이미지를 통합 생성 중입니다..."}
                    {step === ProcessStep.CREATING_DOC && "Final: 최종 결과물(Docx) 병합 및 생성 중..."}
                </h3>
                <p className="text-amber-400/80 text-lg">AI가 합격의 열쇠를 만들고 있습니다</p>
                <p className="text-slate-500 text-sm mt-4">병렬 처리를 통해 생성 속도를 극대화했습니다. 잠시만 기다려주세요.</p>
            </div>

            {/* Real-time Task List */}
            <div className="lg:w-1/2 w-full bg-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur-md">
                <h4 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                    <span className="w-2 h-6 bg-amber-500 rounded-full"></span>
                    실시간 생성 현황
                </h4>
                <div className="space-y-4">
                    {tasks.map((task) => (
                        <div key={task.id} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5 transition-all duration-300">
                            <div className="flex items-center gap-3">
                                {task.state === TaskState.COMPLETED ? (
                                    <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
                                        <svg className="w-3 h-3 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                                    </div>
                                ) : task.state === TaskState.PROCESSING ? (
                                    <div className="w-5 h-5 border-2 border-amber-500/30 border-t-amber-500 rounded-full animate-spin"></div>
                                ) : task.state === TaskState.FAILED ? (
                                    <div className="w-5 h-5 rounded-full bg-red-500 flex items-center justify-center text-[10px] font-bold">!</div>
                                ) : (
                                    <div className="w-5 h-5 rounded-full bg-slate-700"></div>
                                )}
                                <span className={`text-sm font-medium ${task.state === TaskState.COMPLETED ? 'text-slate-400' : 'text-slate-200'}`}>
                                    {task.label}
                                </span>
                            </div>
                            <span className={`text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider ${
                                task.state === TaskState.COMPLETED ? 'bg-green-500/20 text-green-400' :
                                task.state === TaskState.PROCESSING ? 'bg-amber-500/20 text-amber-400 animate-pulse' :
                                task.state === TaskState.FAILED ? 'bg-red-500/20 text-red-400' :
                                'bg-slate-800 text-slate-500'
                            }`}>
                                {task.state === TaskState.COMPLETED ? '완료' :
                                 task.state === TaskState.PROCESSING ? '생성 중' :
                                 task.state === TaskState.FAILED ? '실패' : '대기'}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
          </div>
        )}

        {/* Completed State */}
        {step === ProcessStep.COMPLETED && (
          <div className="bg-[#111] rounded-3xl shadow-2xl overflow-hidden animate-fade-in-up border border-white/10 p-16 text-center">
             <div className="w-24 h-24 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-8 border border-green-500/30">
                <svg className="w-12 h-12 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
             </div>
             <h2 className="text-4xl font-bold text-white mb-4">솔루션 생성 완료</h2>
             <p className="text-xl text-slate-400 mb-8">
                {userData?.studentName}님의 면접 솔루션이 자동으로 다운로드 됩니다.<br/>
                다운로드가 시작되지 않으면 아래 버튼을 클릭하세요.
             </p>
             <button 
                onClick={() => downloadAsWord(content, userData!)}
                className="px-8 py-4 bg-amber-600 hover:bg-amber-500 rounded-xl text-white font-bold transition-colors"
             >
                수동으로 다운로드 (.doc)
             </button>
          </div>
        )}
      </main>
      
      <footer className="text-center py-10 text-slate-600 text-sm border-t border-white/5">
        &copy; {new Date().getFullYear()} Coaching Pass. All rights reserved.
      </footer>
    </div>
  );
};

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Root element not found');
const root = createRoot(rootElement);
root.render(<App />);