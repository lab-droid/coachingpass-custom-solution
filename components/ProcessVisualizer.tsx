import React from 'react';
import { ProcessStep } from '../types';

interface ProcessVisualizerProps {
  currentStep: ProcessStep;
}

const steps = [
  { id: ProcessStep.WORKFLOW_1, label: '예상 질문', icon: '1' },
  { id: ProcessStep.WORKFLOW_2, label: '돌발 전략', icon: '2' },
  { id: ProcessStep.WORKFLOW_3, label: '약점 분석', icon: '3' },
  { id: ProcessStep.WORKFLOW_4, label: '합격 노하우', icon: '4' },
  { id: ProcessStep.WORKFLOW_5, label: '전략 피드백', icon: '5' },
  { id: ProcessStep.GENERATING_IMAGES, label: '이미지 생성', icon: '🎨' },
  { id: ProcessStep.CREATING_DOC, label: '최종 결과물', icon: '📄' },
];

export const ProcessVisualizer: React.FC<ProcessVisualizerProps> = ({ currentStep }) => {
  const stepOrder = [
      ProcessStep.IDLE, 
      ProcessStep.ANALYZING, 
      ProcessStep.WORKFLOW_1, 
      ProcessStep.WORKFLOW_2, 
      ProcessStep.WORKFLOW_3, 
      ProcessStep.WORKFLOW_4, 
      ProcessStep.WORKFLOW_5,
      ProcessStep.GENERATING_IMAGES,
      ProcessStep.CREATING_DOC,
      ProcessStep.COMPLETED
  ];

  const getStepStatus = (stepId: ProcessStep, index: number) => {
    const currentIndex = stepOrder.indexOf(currentStep);
    const stepIndex = stepOrder.indexOf(stepId);

    if (currentStep === ProcessStep.ERROR) return 'text-red-500';
    if (currentIndex > stepIndex) return 'text-amber-500 font-bold';
    if (currentIndex === stepIndex) return 'text-amber-500 font-bold animate-pulse';
    return 'text-slate-600';
  };

  const getBarColor = (index: number) => {
     const currentIndex = stepOrder.indexOf(currentStep);
     // steps array indices align with WORKFLOW_1 (index 2 in stepOrder)
     // stepOrder: 0=IDLE, 1=ANALYZING, 2=WF1, 3=WF2, 4=WF3, 5=WF4, 6=IMAGES, 7=DOC, 8=COMPLETED
     
     // index 0 (WF1) -> target is WF2 (stepOrder 3)
     const targetStepIndexInOrder = index + 3; 
     
     if (currentIndex >= targetStepIndexInOrder) return 'bg-amber-500';
     return 'bg-slate-800';
  };

  return (
    <div className="w-full max-w-5xl mx-auto py-8">
      <div className="flex items-center justify-between relative">
        {/* Connector Lines */}
        <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-full h-1 -z-10 flex px-10">
           {steps.slice(0, -1).map((_, idx) => (
             <div key={`line-${idx}`} className={`flex-1 h-0.5 mx-2 transition-colors duration-500 ${getBarColor(idx)} rounded`}></div>
           ))}
        </div>

        {steps.map((step, idx) => (
          <div key={step.id} className="flex flex-col items-center px-2 relative min-w-[80px]">
            <div className={`w-12 h-12 rounded-full border-2 flex items-center justify-center text-xl transition-all duration-300 bg-[#0a0a0a] z-10 ${
              getStepStatus(step.id, idx).includes('amber') ? 'border-amber-500 text-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.4)] scale-110' : 'border-slate-700 text-slate-700'
            }`}>
              {step.icon}
            </div>
            <span className={`mt-3 text-xs font-medium text-center transition-colors duration-300 ${getStepStatus(step.id, idx)}`}>
              {step.label}
            </span>
          </div>
        ))}
      </div>
      
      {currentStep !== ProcessStep.IDLE && currentStep !== ProcessStep.COMPLETED && currentStep !== ProcessStep.ERROR && (
         <div className="mt-8 text-center text-amber-400 bg-amber-900/10 border border-amber-500/20 p-3 rounded-lg animate-fade-in max-w-md mx-auto">
            <p className="text-sm font-medium">
                {currentStep === ProcessStep.CREATING_DOC
                    ? "최종 솔루션 문서를 병합하고 있습니다..."
                    : currentStep === ProcessStep.ANALYZING
                    ? "서류를 분석하고 있습니다..."
                    : "AI가 모든 섹션과 이미지를 통합 병렬 생성 중입니다. (속도 개선)"}
            </p>
         </div>
      )}
    </div>
  );
};