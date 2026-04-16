import React, { useState, ChangeEvent } from 'react';
import { UserInputData } from '../types';

interface InputFormProps {
  onSubmit: (data: UserInputData) => void;
  isProcessing: boolean;
}

export const InputForm: React.FC<InputFormProps> = ({ onSubmit, isProcessing }) => {
  const [formData, setFormData] = useState<UserInputData>({
    solutionType: '면접 맞춤 솔루션',
    companyName: '',
    jobTitle: '',
    interviewType: '',
    studentName: '',
    requirements: '',
    referenceLinks: '',
    targetPageCount: 'AI 추천',
    analysisOptions: '',
    includeCoverImage: true,
    includeBodyImages: true,
    resumeFile: null,
    coverLetterFile: null,
    interviewNoticeFile: null,
    jobPostingFile: null,
    preTaskFile: null,
    ptMaterialFile: null,
    otherFiles: [],
  });

  const handleTextChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: checked }));
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, files } = e.target;
    if (files && files.length > 0) {
      setFormData(prev => ({ ...prev, [name]: files[0] }));
    }
  };

  const handleOtherFilesChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { files } = e.target;
    if (files && files.length > 0) {
      setFormData(prev => ({ ...prev, otherFiles: [...prev.otherFiles, ...Array.from(files)] }));
    }
  };

  const removeOtherFile = (index: number) => {
    setFormData(prev => {
      const newFiles = [...prev.otherFiles];
      newFiles.splice(index, 1);
      return { ...prev, otherFiles: newFiles };
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-4xl mx-auto bg-black/40 backdrop-blur-xl p-8 md:p-12 rounded-3xl shadow-2xl border border-white/10 relative overflow-hidden group">
      {/* Decorative Gold Glow */}
      <div className="absolute -top-24 -right-24 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none group-hover:bg-amber-500/20 transition-all duration-1000"></div>

      <div className="mb-12 text-center relative z-10">
        <h2 className="text-3xl font-bold text-white tracking-tight">지원자 정보 입력</h2>
        <p className="text-slate-400 mt-2">정확한 분석을 위해 서류와 정보를 빠짐없이 입력해주세요. <span className="text-amber-500 text-sm ml-2">(* 필수 입력 항목)</span></p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12 relative z-10">
        <div className="space-y-8">
            <div>
            <label className="block text-sm font-bold text-amber-500 mb-2 uppercase tracking-wider">솔루션 종류 <span className="text-red-500">*</span></label>
            <div className="relative">
                <select
                    name="solutionType"
                    required
                    className="w-full px-5 py-4 bg-white/5 rounded-xl border border-white/10 focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all text-white font-medium appearance-none cursor-pointer"
                    value={formData.solutionType}
                    onChange={handleTextChange as any}
                >
                    <option value="진로 맞춤 솔루션" className="bg-[#1a1a1a] text-white">진로 맞춤 솔루션</option>
                    <option value="서류 맞춤 솔루션" className="bg-[#1a1a1a] text-white">서류 맞춤 솔루션</option>
                    <option value="필기 맞춤 솔루션" className="bg-[#1a1a1a] text-white">필기 맞춤 솔루션</option>
                    <option value="면접 맞춤 솔루션" className="bg-[#1a1a1a] text-white">면접 맞춤 솔루션</option>
                    <option value="기업&직무분석 솔루션" className="bg-[#1a1a1a] text-white">기업&직무분석 솔루션</option>
                    <option value="요청사항 맞춤 솔루션" className="bg-[#1a1a1a] text-white">요청사항 맞춤 솔루션</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-amber-500">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                </div>
            </div>
            </div>
            <div>
            <label className="block text-sm font-bold text-amber-500 mb-2 uppercase tracking-wider">지원 기업명 <span className="text-red-500">*</span></label>
            <div className="relative">
                <input
                    type="text"
                    name="companyName"
                    required
                    className="w-full px-5 py-4 bg-white/5 rounded-xl border border-white/10 focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all text-white placeholder:text-slate-600 font-medium"
                    placeholder="예: 삼성전자"
                    value={formData.companyName}
                    onChange={handleTextChange}
                />
            </div>
            </div>
            <div>
            <label className="block text-sm font-bold text-amber-500 mb-2 uppercase tracking-wider">지원 직무 <span className="text-red-500">*</span></label>
             <div className="relative">
                <input
                    type="text"
                    name="jobTitle"
                    required
                    className="w-full px-5 py-4 bg-white/5 rounded-xl border border-white/10 focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all text-white placeholder:text-slate-600 font-medium"
                    placeholder="예: 전략기획 / 마케팅"
                    value={formData.jobTitle}
                    onChange={handleTextChange}
                />
            </div>
            </div>
            <div>
            <label className="block text-sm font-bold text-amber-500 mb-2 uppercase tracking-wider">결과물 목표 분량 <span className="text-red-500">*</span></label>
            <div className="relative">
                <select
                    name="targetPageCount"
                    required
                    className="w-full px-5 py-4 bg-white/5 rounded-xl border border-white/10 focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all text-white font-medium appearance-none cursor-pointer"
                    value={formData.targetPageCount}
                    onChange={handleTextChange as any}
                >
                    <option value="AI 추천" className="bg-[#1a1a1a] text-white">AI 추천 (자동 최적화)</option>
                    <option value="20" className="bg-[#1a1a1a] text-white">20페이지</option>
                    <option value="30" className="bg-[#1a1a1a] text-white">30페이지</option>
                    <option value="50" className="bg-[#1a1a1a] text-white">50페이지</option>
                    <option value="70" className="bg-[#1a1a1a] text-white">70페이지</option>
                    <option value="80" className="bg-[#1a1a1a] text-white">80페이지</option>
                    <option value="100" className="bg-[#1a1a1a] text-white">100페이지</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-amber-500">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                </div>
            </div>
            </div>
        </div>
        
        <div className="space-y-8">
            <div>
            <label className="block text-sm font-bold text-amber-500 mb-2 uppercase tracking-wider">면접 유형</label>
            <div className="relative">
                <input
                    type="text"
                    name="interviewType"
                    className="w-full px-5 py-4 bg-white/5 rounded-xl border border-white/10 focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all text-white placeholder:text-slate-600 font-medium"
                    placeholder="예: 1차 실무진 면접, PT 면접"
                    value={formData.interviewType}
                    onChange={handleTextChange}
                />
            </div>
            </div>
            <div>
            <label className="block text-sm font-bold text-amber-500 mb-2 uppercase tracking-wider">지원자 성함</label>
             <div className="relative">
                <input
                    type="text"
                    name="studentName"
                    className="w-full px-5 py-4 bg-white/5 rounded-xl border border-white/10 focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all text-white placeholder:text-slate-600 font-medium"
                    placeholder="예: 김코칭"
                    value={formData.studentName}
                    onChange={handleTextChange}
                />
            </div>
            </div>
        </div>
      </div>

      <div className="mb-12 relative z-10">
        <label className="block text-sm font-bold text-amber-500 mb-2 uppercase tracking-wider">요청사항 (Requirements)</label>
        <div className="relative">
            <textarea
                name="requirements"
                className="w-full px-5 py-4 bg-white/5 rounded-xl border border-white/10 focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all text-white placeholder:text-slate-600 font-medium min-h-[120px] resize-y"
                placeholder="AI에게 특별히 강조하고 싶은 점이나 추가적인 요청사항을 최대한 자세하게 작성해주세요. (예: 직무 관련 특정 경험을 강조해주세요, 영어 면접 질문도 포함해주세요 등)"
                value={formData.requirements}
                onChange={handleTextChange as any}
            />
        </div>
      </div>

      <div className="mb-12 relative z-10">
        <label className="block text-sm font-bold text-amber-500 mb-2 uppercase tracking-wider">심층 분석 및 고퀄리티 강화 키워드 (선택)</label>
        <div className="relative">
            <textarea
                name="analysisOptions"
                className="w-full px-5 py-4 bg-white/5 rounded-xl border border-white/10 focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all text-white placeholder:text-slate-600 font-medium min-h-[80px] resize-y"
                placeholder="솔루션의 퀄리티를 높이기 위해 강조하고 싶은 본인만의 핵심 역량, 산업 트렌드, 또는 기업 분석 키워드를 입력해주세요."
                value={formData.analysisOptions}
                onChange={handleTextChange as any}
            />
        </div>
      </div>

      <div className="mb-12 relative z-10">
        <label className="block text-sm font-bold text-amber-500 mb-2 uppercase tracking-wider">참고 링크 (선택)</label>
        <div className="relative">
            <input
                type="text"
                name="referenceLinks"
                className="w-full px-5 py-4 bg-white/5 rounded-xl border border-white/10 focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all text-white placeholder:text-slate-600 font-medium"
                placeholder="참고할 웹사이트 링크가 있다면 입력해주세요. (쉼표로 구분)"
                value={formData.referenceLinks}
                onChange={handleTextChange}
            />
        </div>
      </div>

      <div className="mb-12 relative z-10">
        <label className="block text-sm font-bold text-amber-500 mb-4 uppercase tracking-wider">이미지 생성 옵션</label>
        <div className="flex flex-wrap gap-6">
            <label className="flex items-center space-x-3 cursor-pointer group/cb">
                <div className="relative">
                    <input
                        type="checkbox"
                        name="includeCoverImage"
                        className="peer hidden"
                        checked={formData.includeCoverImage}
                        onChange={handleCheckboxChange}
                    />
                    <div className="w-6 h-6 border-2 border-white/20 rounded-md bg-white/5 peer-checked:bg-amber-500 peer-checked:border-amber-500 transition-all flex items-center justify-center">
                        <svg className="w-4 h-4 text-black opacity-0 peer-checked:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                    </div>
                </div>
                <span className="text-white font-medium group-hover/cb:text-amber-400 transition-colors">프리미엄 표지 이미지 생성</span>
            </label>

            <label className="flex items-center space-x-3 cursor-pointer group/cb">
                <div className="relative">
                    <input
                        type="checkbox"
                        name="includeBodyImages"
                        className="peer hidden"
                        checked={formData.includeBodyImages}
                        onChange={handleCheckboxChange}
                    />
                    <div className="w-6 h-6 border-2 border-white/20 rounded-md bg-white/5 peer-checked:bg-amber-500 peer-checked:border-amber-500 transition-all flex items-center justify-center">
                        <svg className="w-4 h-4 text-black opacity-0 peer-checked:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                    </div>
                </div>
                <span className="text-white font-medium group-hover/cb:text-amber-400 transition-colors">본문 인포그래픽 이미지 생성</span>
            </label>
        </div>
      </div>

      <div className="mb-12 relative z-10">
        <h3 className="text-lg font-bold text-white mb-6 pb-2 border-b border-white/10 flex items-center justify-between">
            <span>서류 첨부</span>
            <div className="flex flex-col items-end">
                <span className="text-[10px] font-normal text-amber-500 bg-amber-900/20 px-2 py-1 rounded border border-amber-500/20 mb-1">
                    HWP, PPT는 반드시 <span className="font-bold underline">PDF로 저장</span>하여 업로드하세요
                </span>
            </div>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          <FileInput label="자기소개서" name="coverLetterFile" onChange={handleFileChange} file={formData.coverLetterFile} />
          <FileInput label="이력서/경력기술서" name="resumeFile" onChange={handleFileChange} file={formData.resumeFile} />
          <FileInput label="면접 안내문" name="interviewNoticeFile" onChange={handleFileChange} file={formData.interviewNoticeFile} />
          <FileInput label="채용 공고문" name="jobPostingFile" onChange={handleFileChange} file={formData.jobPostingFile} />
          <FileInput label="사전과제 (선택)" name="preTaskFile" onChange={handleFileChange} file={formData.preTaskFile} />
          <FileInput label="PT 발표자료 (선택)" name="ptMaterialFile" onChange={handleFileChange} file={formData.ptMaterialFile} />
          <MultipleFileInput label="참고 자료 (선택)" name="otherFiles" onChange={handleOtherFilesChange} files={formData.otherFiles} onRemove={removeOtherFile} />
        </div>
        <p className="text-center text-xs text-red-400 mt-4 font-bold">
            ※ 주의: PPT, HWP 파일은 AI 분석이 불가능합니다. 파일 메뉴에서 [PDF로 저장] 후 업로드해주세요. (Word 지원됨)
        </p>
      </div>

      <div className="flex justify-center pt-2 relative z-10">
        <button
          type="submit"
          disabled={isProcessing}
          className={`w-full md:w-auto px-16 py-5 rounded-xl text-lg font-bold text-black shadow-lg shadow-amber-500/20 transform transition-all duration-300 hover:-translate-y-1 active:scale-95 flex items-center justify-center space-x-2 ${
            isProcessing ? 'bg-slate-700 text-slate-400 cursor-not-allowed' : 'bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:from-amber-300 hover:to-amber-500'
          }`}
        >
          {isProcessing ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>솔루션 분석 중...</span>
              </>
          ) : (
              <>
                 <span>PREMIUM 솔루션 생성</span>
              </>
          )}
        </button>
      </div>
    </form>
  );
};

interface FileInputProps {
  label: string;
  name: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  file: File | null;
}

const FileInput: React.FC<FileInputProps> = ({ label, name, onChange, file }) => (
  <div className={`relative p-5 rounded-xl border border-dashed transition-all duration-300 group ${file ? 'border-amber-500/50 bg-amber-500/10' : 'border-white/20 hover:border-amber-400 hover:bg-white/5'}`}>
    <label className="block text-sm font-bold text-slate-300 mb-1 group-hover:text-amber-400 transition-colors cursor-pointer w-full h-full">
        {label}
        <input
            type="file"
            name={name}
            onChange={onChange}
            className="hidden"
            accept=".pdf,.txt,.jpg,.jpeg,.png,.webp,.doc,.docx,.ppt,.pptx,.hwp,.hwpx"
        />
        <div className="flex items-center mt-3">
            {file ? (
                <div className="flex items-center text-amber-500 text-sm">
                     <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                     <span className="truncate max-w-[200px]">{file.name}</span>
                </div>
            ) : (
                <div className="flex items-center text-slate-500 text-xs font-medium">
                     <span className="px-2 py-1 bg-white/10 rounded text-slate-400 mr-2 group-hover:bg-amber-500 group-hover:text-black transition-colors">업로드</span>
                     <span>파일 선택</span>
                </div>
            )}
        </div>
    </label>
  </div>
);

interface MultipleFileInputProps {
  label: string;
  name: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  files: File[];
  onRemove: (index: number) => void;
}

const MultipleFileInput: React.FC<MultipleFileInputProps> = ({ label, name, onChange, files, onRemove }) => (
  <div className={`relative p-5 rounded-xl border border-dashed transition-all duration-300 group ${files.length > 0 ? 'border-amber-500/50 bg-amber-500/10' : 'border-white/20 hover:border-amber-400 hover:bg-white/5'}`}>
    <label className="block text-sm font-bold text-slate-300 mb-1 group-hover:text-amber-400 transition-colors cursor-pointer w-full">
        {label}
        <input
            type="file"
            name={name}
            onChange={onChange}
            className="hidden"
            multiple
            accept=".pdf,.txt,.jpg,.jpeg,.png,.webp,.doc,.docx,.ppt,.pptx,.hwp,.hwpx"
        />
        <div className="flex items-center mt-3">
            <div className="flex items-center text-slate-500 text-xs font-medium">
                 <span className="px-2 py-1 bg-white/10 rounded text-slate-400 mr-2 group-hover:bg-amber-500 group-hover:text-black transition-colors">업로드</span>
                 <span>파일 추가</span>
            </div>
        </div>
    </label>
    {files.length > 0 && (
        <div className="mt-3 space-y-2">
            {files.map((file, idx) => (
                <div key={idx} className="flex items-center justify-between text-amber-500 text-sm bg-black/20 p-2 rounded">
                     <div className="flex items-center truncate">
                         <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                         <span className="truncate max-w-[150px]">{file.name}</span>
                     </div>
                     <button type="button" onClick={(e) => { e.preventDefault(); onRemove(idx); }} className="text-red-400 hover:text-red-300 ml-2">
                         <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                     </button>
                </div>
            ))}
        </div>
    )}
  </div>
);