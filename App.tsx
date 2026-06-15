import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { InputForm } from './components/InputForm';
import { ProcessVisualizer } from './components/ProcessVisualizer';
import { ProcessStep, UserInputData, GeneratedContent } from './types';
import { generateReportSection, generateCoverImage, generateInfographic } from './services/geminiService';
import { downloadAsWord, copyToGoogleDocs, exportToPdf } from './services/documentService';
import { TaskState, TaskProgress } from './types';

const getInitialTasks = (data: UserInputData): TaskProgress[] => {
    const solutionType = data.solutionType;
    const includeCover = data.includeCoverImage;
    const includeBody = data.includeBodyImages;

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
        } else if (type === "기업&직무분석 솔루션") {
            return [
                "기업 핵심 가치 및 비즈니스 분석",
                "산업 내 위치 및 경쟁사 분석",
                "직무 핵심 역할 및 필요 역량 분석",
                "직무 실무 프로세스 및 커리어 패스",
                "기업-직무 적합성 종합 진단"
            ];
        } else if (type === "요청사항 맞춤 솔루션") {
            return [
                "요청사항 핵심 이슈 및 현황 분석",
                "요청사항 심층 분석 및 실행 가이드",
                "관련 분야 성공 사례 분석",
                "예상 리스크 및 대응 매뉴얼",
                "종합 결론 및 미래 제언"
            ];
        } else if (type === "기출 맞춤 솔루션") {
            return [
                "면접 유형별 특징 및 대비 전략",
                "빈출 핵심 기출 20선 (Part 1)",
                "빈출 핵심 기출 20선 (Part 2)",
                "기출 활용 노하우 및 실전 훈련법",
                "기출 기반 최종 합격 전략"
            ];
        } else if (type === "보강 솔루션") {
            return [
                "기존 솔루션 핵심 분석 및 취약점 도출",
                "요청사항 기반 정밀 보강 전략 수립",
                "콘텐츠 심층 강화 및 내용 확장",
                "실전 활용도 및 퀄리티 업그레이드",
                "보강 완료 및 최종 합격 로드맵"
            ];
        } else if (type === "맞춤 솔루션") {
            return [
                data.customChapter1 || "맞춤솔루션 제작 1",
                data.customChapter2 || "맞춤솔루션 제작 2",
                data.customChapter3 || "맞춤솔루션 제작 3",
                data.customChapter4 || "맞춤솔루션 제작 4",
                data.customChapter5 || "맞춤솔루션 제작 5"
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

    const tasks: TaskProgress[] = [
        { id: 'section1', label: `챕터 1: ${labels[0]}`, state: TaskState.PENDING },
        { id: 'section2', label: `챕터 2: ${labels[1]}`, state: TaskState.PENDING },
        { id: 'section3', label: `챕터 3: ${labels[2]}`, state: TaskState.PENDING },
        { id: 'section4', label: `챕터 4: ${labels[3]}`, state: TaskState.PENDING },
        { id: 'section5', label: `챕터 5: ${labels[4]}`, state: TaskState.PENDING },
    ];

    if (includeCover) {
        tasks.push({ id: 'cover', label: '프리미엄 커버 이미지 디자인', state: TaskState.PENDING });
    }

    if (includeBody) {
        tasks.push({ id: 'img1', label: '챕터 1 인포그래픽 생성', state: TaskState.PENDING });
        tasks.push({ id: 'img2', label: '챕터 2 인포그래픽 생성', state: TaskState.PENDING });
        tasks.push({ id: 'img3', label: '챕터 3 인포그래픽 생성', state: TaskState.PENDING });
        tasks.push({ id: 'img4', label: '챕터 4 인포그래픽 생성', state: TaskState.PENDING });
        tasks.push({ id: 'img5', label: '챕터 5 인포그래픽 생성', state: TaskState.PENDING });
    }

    return tasks;
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
  const [isUsingCustomKey, setIsUsingCustomKey] = useState(false);
  const [errorDetails, setErrorDetails] = useState<{ message: string; advice: string } | null>(null);
  const [isKeyModalOpen, setIsKeyModalOpen] = useState(false);
  const [keyInput, setKeyInput] = useState('');

  useEffect(() => {
    checkApiKey();
  }, []);

  const updateTask = (id: string, state: TaskState) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, state } : t));
  };

  const checkApiKey = async () => {
    const customKeyExists = !!localStorage.getItem('CUSTOM_GEMINI_API_KEY');
    setIsUsingCustomKey(customKeyExists);
    if (window.aistudio) {
      const selected = await window.aistudio.hasSelectedApiKey();
      setHasApiKey(selected || customKeyExists);
    } else {
      setHasApiKey(customKeyExists || !!process.env.GEMINI_API_KEY);
    }
  };

  const handleApiKeySelect = async () => {
    if (window.aistudio) {
      try {
        await window.aistudio.openSelectKey();
        await checkApiKey();
        return;
      } catch (e) {
        console.warn("AI Studio key manager error, falling back to manual entry:", e);
      }
    }
    openManualKeyModal();
  };

  const openManualKeyModal = () => {
    setKeyInput(localStorage.getItem('CUSTOM_GEMINI_API_KEY') || '');
    setIsKeyModalOpen(true);
  };

  const handleSaveKey = async () => {
    const trimmed = keyInput.trim();
    if (trimmed) {
      localStorage.setItem('CUSTOM_GEMINI_API_KEY', trimmed);
    } else {
      localStorage.removeItem('CUSTOM_GEMINI_API_KEY');
    }
    setIsKeyModalOpen(false);
    await checkApiKey();
  };

  const handleClearKey = async () => {
    localStorage.removeItem('CUSTOM_GEMINI_API_KEY');
    setKeyInput('');
    setIsKeyModalOpen(false);
    await checkApiKey();
  };

  const handleRestart = () => {
    setStep(ProcessStep.IDLE);
    setTasks([]);
    setContent({
        section1: '', section2: '', section3: '', section4: '', section5: ''
    });
    setUserData(null);
    setErrorDetails(null);
  };

  const handleStartAnalysis = async (data: UserInputData) => {
    if (!hasApiKey && window.aistudio) {
       await handleApiKeySelect();
       const selected = await window.aistudio.hasSelectedApiKey();
       if (!selected) return;
    }

    setUserData(data);
    setStep(ProcessStep.ANALYZING);
    setTasks(getInitialTasks(data));

    try {
      // Parallel generation phase
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
          } else if (type === "기업&직무분석 솔루션") {
              return [
                  "기업 비즈니스 및 핵심 가치",
                  "산업 트렌드 및 경쟁 우위",
                  "직무 핵심 역할 및 역량",
                  "직무 실무 및 커리어 로드맵",
                  "기업-직무 적합성 시너지"
              ];
          } else if (type === "요청사항 맞춤 솔루션") {
              return [
                  "요청사항 핵심 이슈 및 현황 분석",
                  "요청사항 심층 분석 및 실행 가이드",
                  "관련 분야 성공 사례 분석",
                  "예상 리스크 및 대응 매뉴얼",
                  "종합 결론 및 미래 제언"
              ];
          } else if (type === "기출 맞춤 솔루션") {
              return [
                  "면접 유형별 특징 및 대비 전략",
                  "빈출 핵심 기출 분석 (1단계)",
                  "심층 핵심 기출 분석 (2단계)",
                  "기출 활용 노하우 및 훈련 가이드",
                  "기출 기반 필승 합격 전략"
              ];
          } else if (type === "보강 솔루션") {
              return [
                  "기존 항목 정밀 분석 및 진단",
                  "추가 요구사항 반영 전략",
                  "핵심 콘텐츠 심층 보완",
                  "실전 적용 퀄리티 강화",
                  "최종 합격 솔루션 완성"
              ];
          } else if (type === "맞춤 솔루션") {
              return [
                  data.customChapter1 || "맞춤솔루션 제작 1",
                  data.customChapter2 || "맞춤솔루션 제작 2",
                  data.customChapter3 || "맞춤솔루션 제작 3",
                  data.customChapter4 || "맞춤솔루션 제작 4",
                  data.customChapter5 || "맞춤솔루션 제작 5"
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

      let effectiveRequirements = data.requirements;
      let effectiveAnalysisOptions = data.analysisOptions;
      let customChapters: string[] | undefined = undefined;

      if (data.solutionType === "맞춤 솔루션") {
          const customGoal = data.customSubTheme ? `[맞춤 솔루션 핵심 목표 및 대주제]: ${data.customSubTheme}` : "";
          customChapters = [
              data.customChapter1 || "서류 기반 맞춤 분석 및 강점 추출",
              data.customChapter2 || "요청 사안의 맥락을 고려한 맞춤식 전략성 공략",
              data.customChapter3 || "돌발 상황 대비 및 압박 핵심 키워드 가이드",
              data.customChapter4 || "최종 맞춤 실천 로드맵 및 구체적 가이드라인",
              data.customChapter5 || "전문가 원스톱 피드백 및 파이널 레주메 총평"
          ];
          const customChaptersText = `[5대 핵심 챕터 맞춤 세부 주제 구성안]:
- 챕터 1: ${customChapters[0]}
- 챕터 2: ${customChapters[1]}
- 챕터 3: ${customChapters[2]}
- 챕터 4: ${customChapters[3]}
- 챕터 5: ${customChapters[4]}`;
          
          effectiveRequirements = `${effectiveRequirements ? effectiveRequirements + "\n\n" : ""}${customGoal}\n${customChaptersText}`;
          effectiveAnalysisOptions = `${effectiveAnalysisOptions ? effectiveAnalysisOptions + "\n\n" : ""}[맞춤 설계 테마]: ${data.customSubTheme || '개인 자율 설정형'}`;
      }

      const [
          section1, section2, section3, section4, section5,
          coverImage,
          img1, img2, img3, img4, img5
      ] = await Promise.all([
          runTask('section1', () => generateReportSection(1, data.solutionType, data.companyName, data.jobTitle, data.interviewType, data.studentName, effectiveRequirements, data.forbiddenContent, data.referenceLinks, data.targetPageCount, effectiveAnalysisOptions, fileContext, customChapters)),
          runTask('section2', () => generateReportSection(2, data.solutionType, data.companyName, data.jobTitle, data.interviewType, data.studentName, effectiveRequirements, data.forbiddenContent, data.referenceLinks, data.targetPageCount, effectiveAnalysisOptions, fileContext, customChapters)),
          runTask('section3', () => generateReportSection(3, data.solutionType, data.companyName, data.jobTitle, data.interviewType, data.studentName, effectiveRequirements, data.forbiddenContent, data.referenceLinks, data.targetPageCount, effectiveAnalysisOptions, fileContext, customChapters)),
          runTask('section4', () => generateReportSection(4, data.solutionType, data.companyName, data.jobTitle, data.interviewType, data.studentName, effectiveRequirements, data.forbiddenContent, data.referenceLinks, data.targetPageCount, effectiveAnalysisOptions, fileContext, customChapters)),
          runTask('section5', () => generateReportSection(5, data.solutionType, data.companyName, data.jobTitle, data.interviewType, data.studentName, effectiveRequirements, data.forbiddenContent, data.referenceLinks, data.targetPageCount, effectiveAnalysisOptions, fileContext, customChapters)),
          data.includeCoverImage 
            ? runTask('cover', () => generateCoverImage(data.companyName, data.jobTitle, data.studentName, data.solutionType))
            : Promise.resolve(undefined),
          data.includeBodyImages
            ? runTask('img1', () => generateInfographic(topics[0]))
            : Promise.resolve(undefined),
          data.includeBodyImages
            ? runTask('img2', () => generateInfographic(topics[1]))
            : Promise.resolve(undefined),
          data.includeBodyImages
            ? runTask('img3', () => generateInfographic(topics[2]))
            : Promise.resolve(undefined),
          data.includeBodyImages
            ? runTask('img4', () => generateInfographic(topics[3]))
            : Promise.resolve(undefined),
          data.includeBodyImages
            ? runTask('img5', () => generateInfographic(topics[4]))
            : Promise.resolve(undefined)
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
      await new Promise(resolve => setTimeout(resolve, 300));

      // Completion State
      setStep(ProcessStep.COMPLETED);

    } catch (error: any) {
      console.warn("Generation error:", error);
      setStep(ProcessStep.ERROR);
      
      const errorString = typeof error === 'string' ? error : JSON.stringify(error);
      let rawMessage = (error instanceof Error ? error.message : "") + " " + errorString;
      let errorMessage = "솔루션 생성 과정에서 오류가 발생했습니다.";
      let advice = "일시적인 오류일 수 있으니 잠시 후 다시 시도해 주시기 바랍니다. 문제가 지속될 경우 우측 상단의 [API Key 변경] 버튼을 통해 사용 가능한 다른 키가 있는지 확인해 주세요.";
      
      if (rawMessage.includes("503") || rawMessage.includes("high demand") || rawMessage.includes("UNAVAILABLE")) {
          errorMessage = "현재 AI 모델의 사용량이 급증하여 응답이 일시적으로 지연되고 있습니다.";
          advice = "보통 일시적인 과부하 상태이므로, 1~2분 정도 대기하신 후 [다시 시도하기] 버튼을 눌러보세요.";
      } else if (rawMessage.includes("429") || rawMessage.includes("limit") || rawMessage.includes("spending cap") || rawMessage.includes("quota") || rawMessage.includes("RESOURCE_EXHAUSTED")) {
          errorMessage = "Google AI Gemini API 호출 한도 또는 한달 결제 한도(Spending Cap)를 초과했습니다.";
          advice = "현재 사용 중인 API Key의 Credit/Spending Cap이 한도 초과 상태입니다. Google AI Studio 결제 옵션(Spend Cap)을 상향하시거나, 우측 상단의 [API Key 변경] 버튼을 클릭해 새로운 한도 여유가 있는 API Key로 상향 설정해 주세요.";
      } else {
          errorMessage = error instanceof Error ? error.message : String(error);
      }

      setErrorDetails({ message: errorMessage, advice });
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-slate-200 pb-20 font-sans selection:bg-amber-500/30 selection:text-amber-200">
      {/* Header */}
      <header className="bg-black/80 backdrop-blur-md border-b border-white/10 sticky top-0 z-50 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center space-x-3 group cursor-pointer" onClick={() => window.location.reload()}>
            <div className="w-10 h-10 bg-gradient-to-br from-amber-200 to-amber-600 rounded-xl flex items-center justify-center text-black group-hover:scale-105 transition-transform duration-300 shadow-[0_0_15px_rgba(245,158,11,0.3)]">
                <svg className="w-6 h-6 text-black/90 mix-blend-color-burn" viewBox="0 0 512 512" fill="none" stroke="currentColor">
                  {/* Outer Bow Circle (Tuner Ring) */}
                  <circle cx="180" cy="256" r="65" stroke="currentColor" strokeWidth="18" fill="none" />
                  
                  {/* Slider Track and Knob inside Bow */}
                  <line x1="145" y1="256" x2="215" y2="256" stroke="currentColor" strokeWidth="10" strokeLinecap="round" />
                  <circle cx="195" cy="256" r="15" fill="currentColor" />
                  
                  {/* Anchors on dial */}
                  <line x1="180" y1="168" x2="180" y2="178" stroke="currentColor" strokeWidth="8" strokeLinecap="round" />
                  <line x1="180" y1="334" x2="180" y2="344" stroke="currentColor" strokeWidth="8" strokeLinecap="round" />
                  <line x1="115" y1="256" x2="125" y2="256" stroke="currentColor" strokeWidth="8" strokeLinecap="round" />

                  {/* Key Shaft */}
                  <line x1="240" y1="256" x2="400" y2="256" stroke="currentColor" strokeWidth="18" strokeLinecap="round" />
                  
                  {/* Key Teeth as Bar Chart */}
                  <rect x="295" y="256" width="18" height="35" rx="6" fill="currentColor" />
                  <rect x="330" y="256" width="18" height="55" rx="6" fill="currentColor" />
                  <rect x="365" y="256" width="18" height="25" rx="6" fill="currentColor" />
                </svg>
            </div>
            <div className="flex flex-col">
                <h1 className="text-xl font-extrabold text-white tracking-tight leading-none">코칭패스 맞춤 솔루션</h1>
                <span className="text-[10px] font-bold text-amber-500 tracking-[0.2em] uppercase mt-1">프리미엄 면접 솔루션</span>
            </div>
          </div>

          <button 
              onClick={handleApiKeySelect}
              className={`text-xs font-bold text-black bg-gradient-to-r px-4 py-2.5 rounded-xl transition-all transform hover:scale-105 active:scale-95 flex items-center gap-2 ${
                isUsingCustomKey 
                  ? 'from-green-300 to-emerald-500 hover:from-green-200 hover:to-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.2)]' 
                  : 'from-amber-300 to-amber-500 hover:from-amber-200 hover:to-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.2)]'
              }`}
          >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
              </svg>
              {isUsingCustomKey ? '개인 API Key 변경 (적용됨)' : 'API Key 등록 (한도 초과 해결)'}
          </button>
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
                <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed font-light mb-8">
                    단순한 코칭이 아닙니다.<br className="hidden md:block"/> 
                    <strong className="text-white">코칭패스</strong>는 당신의 서류를 완벽하게 분석하여<br/>
                    면접관을 압도할 수 있는 <span className="text-amber-400">유일무이한 전략</span>을 제시합니다.
                </p>

                {/* API Key Not Configured Alert Banner */}
                {!isUsingCustomKey && (
                    <div className="max-w-2xl mx-auto p-5 bg-amber-500/10 border-2 border-amber-500/30 rounded-2xl text-left flex items-start gap-4 shadow-xl mb-12 animate-pulse">
                        <span className="text-2xl mt-0.5">⚠️</span>
                        <div>
                            <h4 className="text-amber-400 font-extrabold text-sm mb-1.5">
                                [필독] 공용 API 서비스 한도 소진 안내 - 개인 API Key 등록이 필요합니다.
                            </h4>
                            <p className="text-slate-300 text-xs leading-relaxed mb-2.5">
                                현재 많은 사용자 유입으로 인해 <strong>시스템 공용 API 키의 월간 사용 한도(Spending Cap)가 모두 소진</strong>되어 분석 진행 시 오류가 발생할 수 있습니다.
                            </p>
                            <p className="text-slate-300 text-xs leading-relaxed">
                                에러 없이 고품질 솔루션을 안전하게 발급받으시려면 우측 상단의 <strong className="text-amber-300">[API Key 등록]</strong> 버튼을 클릭하여 본인의 Gemini 무료 API Key를 입력 후 사용해 주시기 바랍니다. (입력한 키는 안전하게 이용자의 웹 브라우저 로컬 스토리지에만 저장됩니다.)
                            </p>
                            <button 
                               onClick={handleApiKeySelect}
                               className="mt-3.5 px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-amber-300 to-amber-500 hover:from-amber-200 hover:to-amber-400 text-black font-extrabold text-[11px] transition-all flex items-center gap-1.5 active:scale-95 shadow-md"
                            >
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                                </svg>
                                지금 즉시 개인 API Key 등록하기
                            </button>
                        </div>
                    </div>
                )}
            </div>
        )}

        {/* Stepper */}
        <div className={`transition-all duration-700 ease-in-out transform ${step === ProcessStep.IDLE ? 'mb-12 translate-y-0 opacity-100' : 'mb-20 translate-y-0 opacity-100'}`}>
          <ProcessVisualizer currentStep={step} solutionType={userData?.solutionType} />
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
                    {step === ProcessStep.CREATING_DOC && "최종: 최종 결과물(Docx) 병합 및 생성 중..."}
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
                {userData?.studentName}님의 솔루션 생성이 완료되었습니다.<br/>
                원하시는 방식으로 결과물을 확인하세요.
             </p>

             {/* Fallback Warning Box */}
             {typeof window !== 'undefined' && !!(window as any).hasTriggeredFallback && (
               <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-6 mb-8 max-w-2xl mx-auto text-left flex items-start gap-3.5">
                 <svg className="w-6 h-6 text-amber-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                 </svg>
                 <div>
                   <h4 className="text-amber-400 font-bold mb-1">안내: API 한도 초과로 인한 데모(시뮬레이션) 솔루션 생성</h4>
                   <p className="text-sm text-slate-300 leading-relaxed font-light">
                     현재 고부하 또는 플랫폼 결제 한도 초과(429 Quota Exceeded)로 인해, 실시간 AI 분석 대신 <span className="font-semibold text-white">동작이 검증된 최고 등급의 맞춤형 오프라인 데모(시뮬레이션) 솔루션</span>으로 대체 발급되었습니다. 
                   </p>
                   <p className="text-xs text-slate-400 mt-2 font-light">
                     온전한 오리지널 실시간 딥리빙 분석을 연동하시려면 우측 상단에서 <span className="text-amber-400 font-semibold cursor-pointer underline" onClick={handleApiKeySelect}>개인 Gemini API Key</span>를 발급 및 등록하여 사용해 주세요!
                   </p>
                 </div>
               </div>
             )}

             <div className="flex flex-col md:flex-row items-center justify-center gap-4 flex-wrap">
                <button
                    onClick={() => downloadAsWord(content, userData!)}
                    className="w-full md:w-auto px-8 py-4 bg-amber-600 hover:bg-amber-500 rounded-xl text-white font-bold transition-all transform hover:scale-105 active:scale-95 shadow-lg shadow-amber-600/20"
                >
                    솔루션 다운로드 (.doc)
                </button>
                <button
                    onClick={() => exportToPdf(content, userData!)}
                    className="w-full md:w-auto px-8 py-4 bg-rose-600 hover:bg-rose-500 rounded-xl text-white font-bold transition-all transform hover:scale-105 active:scale-95 shadow-lg shadow-rose-600/20"
                >
                    PDF로 저장하기
                </button>
                <button
                    onClick={() => copyToGoogleDocs(content, userData!)}
                    className="w-full md:w-auto px-8 py-4 bg-blue-600 hover:bg-blue-500 rounded-xl text-white font-bold transition-all transform hover:scale-105 active:scale-95 shadow-lg shadow-blue-600/20"
                >
                    구글Docs로 복사하기
                </button>
                <button 
                    onClick={handleRestart}
                    className="w-full md:w-auto px-8 py-4 bg-white/10 hover:bg-white/20 border border-white/10 rounded-xl text-white font-bold transition-all transform hover:scale-105 active:scale-95"
                >
                    다시 시작하기
                </button>
             </div>
          </div>
        )}

        {/* Error State */}
        {step === ProcessStep.ERROR && errorDetails && (
          <div className="bg-[#1a1111] rounded-3xl shadow-2xl overflow-hidden animate-fade-in border border-red-500/20 p-12 text-center max-w-2xl mx-auto relative">
             <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-red-500/5 rounded-full blur-3xl -z-10 pointer-events-none"></div>
             
             <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-8 border border-red-500/30">
                <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
             </div>
             
             <h2 className="text-3xl font-bold text-white mb-4">서비스 생성 오류 발생</h2>
             <p className="text-red-400 font-semibold mb-6 text-lg">{errorDetails.message}</p>
             
             <div className="bg-black/40 border border-white/5 rounded-2xl p-6 text-left mb-8">
                <h5 className="text-amber-400 font-bold mb-2 flex items-center gap-1.5 text-sm">
                   <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                   해결 가이드
                </h5>
                <p className="text-slate-300 text-sm leading-relaxed">{errorDetails.advice}</p>
                
                  <div className="mt-4 pt-4 border-t border-white/5 flex flex-col gap-2">
                     <p className="text-xs text-slate-400 font-light">지금 바로 사용 가능한 다른 API 키로 교체하려면 아래 버튼을 누르세요.</p>
                     <button 
                        onClick={handleApiKeySelect}
                        className="w-full mt-2 px-4 py-2.5 bg-gradient-to-r from-amber-400 to-amber-600 hover:from-amber-300 hover:to-amber-500 rounded-xl text-black font-bold text-xs transition-all flex items-center justify-center gap-1.5"
                     >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                        </svg>
                        API Key 설정 및 변경하기
                     </button>
                  </div>
             </div>
             
             <div className="flex justify-center">
                <button 
                    onClick={handleRestart}
                    className="px-8 py-3 bg-white/10 hover:bg-white/20 border border-white/10 rounded-xl text-white font-bold transition-all transform hover:scale-105 active:scale-95"
                >
                    다시 시도하기
                </button>
             </div>
          </div>
        )}
      </main>
      
      <footer className="text-center py-10 text-slate-600 text-sm border-t border-white/5">
        &copy; {new Date().getFullYear()} 코칭패스. 모든 권리 보유.
      </footer>

      {/* API Key Modal (replaces native prompt(), which is blocked inside iframes/previews) */}
      {isKeyModalOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fade-in"
          onClick={() => setIsKeyModalOpen(false)}
        >
          <div
            className="w-full max-w-md bg-[#141414] border border-white/10 rounded-2xl shadow-2xl p-7"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-2.5 mb-2">
              <svg className="w-5 h-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
              </svg>
              <h3 className="text-lg font-extrabold text-white">개인 Gemini API Key 등록</h3>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed mb-5">
              입력한 API 키는 브라우저 로컬 스토리지에만 저장됩니다. 미입력 시 시스템 기본 공용 API 키가 사용됩니다.
            </p>
            <input
              type="password"
              autoFocus
              value={keyInput}
              onChange={(e) => setKeyInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleSaveKey(); }}
              placeholder="AIza... 형식의 Gemini API Key를 붙여넣으세요"
              className="w-full px-4 py-3 rounded-xl bg-black/50 border border-white/10 text-slate-100 text-sm placeholder:text-slate-600 focus:outline-none focus:border-amber-500/60 focus:ring-1 focus:ring-amber-500/40 transition-all"
            />
            <div className="flex items-center justify-between gap-3 mt-6">
              <button
                onClick={handleClearKey}
                className="text-xs font-semibold text-slate-400 hover:text-red-400 transition-colors"
              >
                저장된 키 삭제
              </button>
              <div className="flex items-center gap-2.5">
                <button
                  onClick={() => setIsKeyModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-200 font-bold text-sm transition-all active:scale-95"
                >
                  취소
                </button>
                <button
                  onClick={handleSaveKey}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-300 to-amber-500 hover:from-amber-200 hover:to-amber-400 text-black font-extrabold text-sm transition-all active:scale-95 shadow-md"
                >
                  저장하기
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Root element not found');
const root = createRoot(rootElement);
root.render(<App />);