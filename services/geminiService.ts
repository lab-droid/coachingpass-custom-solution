import { GoogleGenAI, ThinkingLevel } from "@google/genai";
import mammoth from "mammoth";

// Initialize Gemini Client
const getAiClient = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

const SUPPORTED_MIME_TYPES = [
  'application/pdf',
  'text/plain',
  'text/html',
  'text/markdown',
  'text/csv',
  'text/xml',
  'text/rtf',
  'application/json',
  'image/png',
  'image/jpeg',
  'image/webp',
  'image/heic',
  'image/heif'
];

/**
 * Validates if the file type is supported.
 */
const validateFile = (file: File) => {
  const isMimeSupported = SUPPORTED_MIME_TYPES.some(type => file.type === type || file.type.startsWith(type.replace('*', '')));
  const isPdfByName = file.name.toLowerCase().endsWith('.pdf');
  const isDocx = file.name.toLowerCase().endsWith('.docx');

  if (isMimeSupported || isPdfByName || isDocx) {
      return;
  }

  const fileName = file.name.toLowerCase();
  
  if (fileName.endsWith('.doc')) {
      throw new Error(`구형 Word 파일(.doc)은 지원되지 않습니다.\n.docx로 저장하거나 [PDF로 저장] 후 업로드해주세요.`);
  }
  
  if (fileName.endsWith('.ppt') || fileName.endsWith('.pptx') || file.type.includes('powerpoint') || file.type.includes('presentation')) {
      throw new Error(`PPT 파일(.ppt, .pptx)은 AI가 직접 읽을 수 없습니다.\n번거로우시겠지만 [PDF로 저장] 후 업로드해주세요.`);
  }
  
  if (fileName.endsWith('.hwp') || fileName.endsWith('.hwpx') || file.type.includes('hwp')) {
      throw new Error(`한글 파일(.hwp)은 AI가 직접 읽을 수 없습니다.\n번거로우시겠지만 [PDF로 저장] 후 업로드해주세요.`);
  }

  throw new Error(`지원되지 않는 파일 형식입니다 (${file.type}).\nPDF, Word(.docx), 텍스트, 또는 이미지 파일만 지원됩니다.`);
};

/**
 * Process a file and return the appropriate Part object for Gemini.
 */
const processFile = async (file: File): Promise<{ inlineData?: { mimeType: string; data: string }; text?: string }> => {
  validateFile(file);

  // Handle DOCX Text Extraction
  if (file.name.toLowerCase().endsWith('.docx')) {
      try {
          const arrayBuffer = await file.arrayBuffer();
          const result = await mammoth.extractRawText({ arrayBuffer });
          return { 
              text: `[첨부파일: ${file.name}]\n${result.value}\n-------------------\n` 
          };
      } catch (e) {
          console.error("DOCX extraction failed", e);
          throw new Error(`Word 파일(${file.name}) 내용을 읽을 수 없습니다. PDF로 변환하여 업로드해주세요.`);
      }
  }

  // Handle Native Supported Types
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      const base64Data = base64String.split(',')[1];
      
      let mimeType = file.type;
      if ((!mimeType || mimeType === '') && file.name.toLowerCase().endsWith('.pdf')) {
          mimeType = 'application/pdf';
      }

      resolve({
        inlineData: {
            mimeType: mimeType,
            data: base64Data,
        }
      });
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

/**
 * Helper to execute an AI task with retry logic for transient errors (503, 429).
 */
const withRetry = async <T>(task: () => Promise<T>, maxRetries: number = 10): Promise<T> => {
    let lastError: any;
    for (let i = 0; i < maxRetries; i++) {
        try {
            return await task();
        } catch (error: any) {
            lastError = error;
            const errorMessage = error?.message || "";
            const isTransient = errorMessage.includes("503") || 
                               errorMessage.includes("UNAVAILABLE") || 
                               errorMessage.includes("429") || 
                               errorMessage.includes("RESOURCE_EXHAUSTED") ||
                               errorMessage.includes("high demand") ||
                               errorMessage.includes("deadline exceeded") ||
                               errorMessage.includes("Internal error");

            if (isTransient && i < maxRetries - 1) {
                // Exponential backoff: 3s, 6s, 12s, 24s... + jitter
                const delay = Math.pow(2, i + 1) * 1500 + Math.random() * 2000;
                console.warn(`Transient error detected. Retrying in ${Math.round(delay)}ms... (Attempt ${i + 1}/${maxRetries})`);
                await new Promise(resolve => setTimeout(resolve, delay));
                continue;
            }
            throw error;
        }
    }
    throw lastError;
};

/**
 * Generates an image using Gemini.
 */
const generateImage = async (prompt: string, aspectRatio: string = "16:9"): Promise<string | undefined> => {
    const ai = getAiClient();
    return withRetry(async () => {
        const response = await ai.models.generateContent({
            model: 'gemini-3.1-flash-image-preview',
            contents: { parts: [{ text: prompt }] },
            config: {
                imageConfig: {
                    aspectRatio: aspectRatio as any, 
                    imageSize: "1K"
                }
            }
        });

        for (const part of response.candidates?.[0]?.content?.parts || []) {
            if (part.inlineData) {
                return part.inlineData.data;
            }
        }
        return undefined;
    }, 5).catch(e => {
        console.error("Image generation failed after retries", e);
        return undefined; // Fail silently for images to allow text to proceed
    });
}

/**
 * Generates the cover image.
 */
export const generateCoverImage = async (company: string, job: string, name: string, solutionType: string) => {
    const nameText = name ? `Applicant Name: ${name}` : "";
    const prompt = `
      Design a premium, luxury book cover for an interview solution report.
      Theme: High-end Black and Gold.
      
      Visual Elements:
      - Background: Deep matte black with elegant gold geometric accents or gold dust textures.
      - Logo Area at the top: Display the text "Coaching Pass" in a bold, modern, metallic gold serif font, looking like a premium brand logo.
      - Center Text (Must be legible and sharp):
        Solution Type: ${solutionType}
        Target Company: ${company}
        Job Title: ${job}
        ${nameText}
      - Footer: A small key icon or a door opening symbol in gold.
      
      Style: Minimalist, Corporate, Expensive, Professional.
      Ratio: 16:9 (Wide).
      [CRITICAL] Ensure all Korean text is rendered perfectly without any broken characters or artifacts. Use a high-quality Korean font.
      Text must be in Korean or English as provided.
    `;
    return await generateImage(prompt, "16:9");
};

/**
 * Generates an infographic for a chapter.
 */
export const generateInfographic = async (topic: string) => {
    const prompt = `
      Create a high-quality presentation slide style infographic.
      Topic: "${topic}"
      
      [MANDATORY RULES]
      1. **Language**: Text inside the image MUST be 100% Korean (한국어). NO English text in the content body.
      2. **Content**: visually summarize the key points of '${topic}'. Use bullet points or a central diagram with Korean labels.
      3. **Style**: Professional Business Presentation. Luxury Black & Gold theme. Clean, modern, flat vector style.
      4. **Text Quality**: [CRITICAL] The Korean text must be perfectly rendered, sharp, and legible. No broken characters. Use a clean, modern Korean font.
      5. **Ratio**: 16:9 Wide.
      6. **Composition**: Ensure all elements are within the 16:9 frame and not clipped at the edges.
    `;
    return await generateImage(prompt, "16:9");
};

/**
 * Generates a specific section of the interview report.
 */
export const generateReportSection = async (
  sectionIndex: number,
  solutionType: string,
  company: string,
  job: string,
  type: string,
  name: string,
  requirements: string,
  referenceLinks: string,
  targetPageCount: string,
  analysisOptions: string,
  files: { resume: File | null; cover: File | null; notice: File | null; posting: File | null; preTask: File | null; ptMaterial: File | null; otherFiles: File[] }
): Promise<string> => {
  
  const contentParts: any[] = [];
  const ai = getAiClient();

  try {
    if (files.resume) contentParts.push(await processFile(files.resume));
    if (files.cover) contentParts.push(await processFile(files.cover));
    if (files.notice) contentParts.push(await processFile(files.notice));
    if (files.posting) contentParts.push(await processFile(files.posting));
    if (files.preTask) contentParts.push(await processFile(files.preTask));
    if (files.ptMaterial) contentParts.push(await processFile(files.ptMaterial));
    if (files.otherFiles && files.otherFiles.length > 0) {
      for (const file of files.otherFiles) {
        contentParts.push(await processFile(file));
      }
    }
  } catch (validationError) {
    throw validationError;
  }

  let specificPrompt = "";

  if (solutionType === "진로 맞춤 솔루션") {
    switch (sectionIndex) {
      case 1:
        specificPrompt = `
          1. 직무 적성 및 역량 진단 (이력서/경험 기반)
          - 지원자의 과거 경험, 전공, 자격증 등을 분석하여 가장 적합한 직무 역량을 도출하세요.
          - 강점 역량 3가지와 이를 뒷받침하는 근거를 상세히 기술하세요.
        `;
        break;
      case 2:
        specificPrompt = `
          2. 산업 트렌드 분석 및 유망 직무 추천
          - 지원자가 관심 있는 산업의 최신 트렌드(기술, 시장 변화 등)를 분석하세요.
          - 해당 산업 내에서 지원자의 역량으로 도전 가능한 유망 직무 2~3개를 추천하고 이유를 설명하세요.
        `;
        break;
      case 3:
        specificPrompt = `
          3. 중장기 커리어 로드맵 설계
          - 1년(단기), 3~5년(중기), 10년(장기) 단위의 커리어 성장 목표를 설정하세요.
          - 각 단계별로 달성해야 할 성과와 직무적 위치를 구체적으로 제시하세요.
        `;
        break;
      case 4:
        specificPrompt = `
          4. 필요 역량 강화 전략 (자격증, 프로젝트 등)
          - 목표 직무에 도달하기 위해 현재 부족한 역량을 정의하세요.
          - 이를 보완하기 위한 구체적인 학습 계획(자격증, 교육, 대외활동 등)을 로드맵 형태로 제시하세요.
        `;
        break;
      case 5:
        specificPrompt = `
          5. 전문가 총평 및 진로 성공 전략
          - 지원자의 진로 준비 상태를 종합적으로 평가하세요.
          - 성공적인 커리어 시작을 위한 핵심 조언과 마인드셋을 강조하며 마무리하세요.
        `;
        break;
    }
  } else if (solutionType === "서류 맞춤 솔루션") {
    switch (sectionIndex) {
      case 1:
        specificPrompt = `
          1. 자기소개서 항목별 심층 분석 및 문항 의도 파악
          - 지원 기업의 주요 자소서 문항을 분석하고, 인사담당자가 해당 문항을 통해 확인하고자 하는 숨은 의도를 설명하세요.
          - 각 문항에 적합한 핵심 키워드를 매칭하세요.
        `;
        break;
      case 2:
        specificPrompt = `
          2. 경험 기반 스토리텔링 및 STAR 기법 적용 첨삭
          - 지원자의 주요 경험을 STAR(Situation, Task, Action, Result) 기법에 맞춰 구조화하세요.
          - 단순 나열이 아닌 성과 중심의 매력적인 스토리텔링으로 변환하는 가이드를 제공하세요.
        `;
        break;
      case 3:
        specificPrompt = `
          3. 직무 역량 키워드 추출 및 배치 전략
          - 채용 공고(JD)를 분석하여 반드시 포함되어야 할 직무 역량 키워드를 추출하세요.
          - 이 키워드들을 서류의 어느 부분에 어떻게 배치해야 가독성과 임팩트가 높아질지 전략을 제시하세요.
        `;
        break;
      case 4:
        specificPrompt = `
          4. 이력서/포트폴리오 시각화 및 구조 개선 피드백
          - 이력서의 레이아웃, 가독성, 정보의 우선순위 배치를 분석하세요.
          - 인사담당자의 시선을 사로잡을 수 있는 시각적 강조 포인트와 구조적 개선안을 제안하세요.
        `;
        break;
      case 5:
        specificPrompt = `
          5. 서류 합격률을 높이는 최종 검토 및 보완 전략
          - 오탈자, 비문 체크를 넘어 서류 전체의 논리적 일관성을 점검하세요.
          - 제출 직전 마지막으로 반드시 수정해야 할 '합격 결정타' 보완점을 제시하세요.
        `;
        break;
    }
  } else if (solutionType === "필기 맞춤 솔루션") {
    switch (sectionIndex) {
      case 1:
        specificPrompt = `
          1. 기업별 필기 전형(NCS, 인적성 등) 유형 및 출제 경향 심층 분석
          - 해당 기업의 필기 시험 과목 구성, 문항 수, 시간 제한, 과락 기준, 감점 여부 등 특징을 극도로 상세히 분석하세요.
          - 최근 3개년 출제 경향 변화와 올해 예상되는 난이도 및 신유형 등장 가능성을 짚어주세요.
          - 사용자의 특별 요청사항이 필기 유형과 관련이 있다면 이를 최우선으로 반영하여 서술하세요.
        `;
        break;
      case 2:
        specificPrompt = `
          2. 과목별 핵심 개념 마스터 및 빈출 테마/유형 총정리
          - 주요 과목(언어, 수리, 추리, 상식, 전공 등)에서 매년 반복되는 핵심 개념과 10대 빈출 테마를 정리하세요.
          - 반드시 암기해야 할 필수 공식, 이론, 법령 등을 포함하고 실제 예시 문항 구조를 설명하세요.
          - 사용자가 특정 과목이나 개념에 대한 심화 분석을 요청했다면 그 부분을 A4 2페이지 이상 분량으로 아주 상세히 다루세요.
        `;
        break;
      case 3:
        specificPrompt = `
          3. 고득점을 위한 문제 풀이 전략 및 초단위 시간 관리 스킬
          - 제한된 시간 내에 정답률을 극대화하는 실전 풀이 순서(버릴 문제와 잡을 문제 선별법)를 전수하세요.
          - 수리/추리 영역에서의 시간 단축 야매법, 언어 영역에서의 지문 스캔 기술 등 실전 스킬을 상세히 기술하세요.
          - 사용자가 시간 부족 문제를 언급했다면 이를 해결하기 위한 개인 맞춤형 타임라인 시뮬레이션을 제공하세요.
        `;
        break;
      case 4:
        specificPrompt = `
          4. 취약점 극복을 위한 오답 노트 작성법 및 실전 보완 가이드
          - 반복해서 틀리는 유형을 분석하고 이를 완벽히 내 것으로 만드는 '코칭패스 전용 오답 노트' 시스템을 제안하세요.
          - 시험 직전 1주일, 3일, 1일 단위의 취약 과목 집중 공략 및 마무리 학습 체계를 상세히 설계하세요.
          - 사용자의 현재 약점이나 우려사항에 대한 구체적인 솔루션을 제시하세요.
        `;
        break;
      case 5:
        specificPrompt = `
          5. 필기 합격 커트라인 분석 및 시험 당일 실전 팁 (Final Checklist)
          - 예상 합격 커트라인과 경쟁률 데이터를 바탕으로 한 목표 점수 및 전략적 과목 배분을 설정하세요.
          - 시험 당일 준비물, 컨디션 관리, 마킹 실수 방지법, 모르는 문제 대처법 등 최종 체크리스트를 제공하세요.
          - 사용자의 최종 합격을 위한 수석 컨설턴트의 특별 격려 멘트와 핵심 요약을 포함하세요.
        `;
        break;
    }
  } else if (solutionType === "기업&직무분석 솔루션") {
    switch (sectionIndex) {
      case 1:
        specificPrompt = `
          1. 기업 핵심 가치 및 비즈니스 모델 심층 분석
          - 해당 기업의 설립 배경, 경영 철학, 핵심 가치(Core Values)를 분석하세요.
          - 현재 주력하고 있는 비즈니스 모델과 수익 구조를 상세히 설명하세요.
          - [중요] 할루시네이션 방지를 위해 현재 시점의 정확한 정보를 바탕으로 작성하세요.
        `;
        break;
      case 2:
        specificPrompt = `
          2. 산업 내 위치 및 경쟁사 비교 분석 (SWOT 포함)
          - 해당 기업이 속한 산업의 현재 트렌드와 산업 내에서의 시장 점유율 및 위치를 분석하세요.
          - 주요 경쟁사와의 차별점 및 강점/약점을 비교 분석하세요.
          - 기업의 SWOT(Strength, Weakness, Opportunity, Threat) 분석을 포함하세요.
        `;
        break;
      case 3:
        specificPrompt = `
          3. 직무 핵심 역할 및 필요 역량 심층 분석
          - 지원 직무의 구체적인 역할과 책임을 정의하세요.
          - 해당 직무를 수행하기 위해 반드시 필요한 핵심 역량(Hard Skill, Soft Skill)을 도출하세요.
          - 채용 공고(JD)가 있다면 이를 바탕으로 기업이 선호하는 인재상을 분석하세요.
        `;
        break;
      case 4:
        specificPrompt = `
          4. 직무 실무 프로세스 및 커리어 패스 분석
          - 해당 직무의 일반적인 하루/주간 업무 루틴과 실무 프로세스를 상세히 기술하세요.
          - 입사 후 연차별 성장 단계와 해당 기업 내에서의 커리어 패스(Career Path)를 제시하세요.
        `;
        break;
      case 5:
        specificPrompt = `
          5. 기업-직무 적합성 종합 진단 및 합격 전략
          - 앞서 분석한 기업의 특성과 직무의 요구사항을 결합하여 지원자가 강조해야 할 'Fit'을 정의하세요.
          - 기업의 미래 비전과 직무의 발전 방향이 일치하는 지점을 찾아 전략적 제언을 하세요.
        `;
        break;
    }
  } else if (solutionType === "요청사항 맞춤 솔루션") {
    switch (sectionIndex) {
      case 1:
        specificPrompt = `
          1. 요청사항 기반 핵심 이슈 및 현황 분석 (Google Deep Research 활용)
          - 사용자의 요청사항에 기입된 주제와 내용을 바탕으로 최신 트렌드와 정확한 팩트를 분석하세요.
          - 할루시네이션(허위 정보)을 방지하기 위해 검증된 데이터와 출처를 기반으로 현재 상황을 진단하세요.
        `;
        break;
      case 2:
        specificPrompt = `
          2. 요청사항 심층 분석 및 세부 실행 가이드
          - 요청사항의 핵심 목표를 달성하기 위한 구체적이고 실무적인 실행 방안을 제시하세요.
          - 단계별 프로세스, 필요 자원, 예상 결과 등을 상세히 기술하세요.
        `;
        break;
      case 3:
        specificPrompt = `
          3. 관련 분야 성공 사례 및 벤치마킹 분석
          - 요청사항과 유사한 성공 사례(국내외 기업, 개인 등)를 구체적으로 분석하여 제시하세요.
          - 각 사례에서 얻을 수 있는 핵심 인사이트와 적용 포인트를 도출하세요.
        `;
        break;
      case 4:
        specificPrompt = `
          4. 예상 리스크 분석 및 위기 대응 매뉴얼
          - 요청사항 실행 과정에서 발생할 수 있는 잠재적 리스크와 장애 요인을 분석하세요.
          - 각 리스크별 구체적인 대응 시나리오와 해결책을 제시하세요.
        `;
        break;
      case 5:
        specificPrompt = `
          5. 종합 결론 및 미래 지향적 제언
          - 분석된 내용을 바탕으로 요청사항에 대한 최종 솔루션을 요약하세요.
          - 지속 가능한 성장을 위한 전문가의 미래 지향적 제언과 핵심 성공 요인(KSF)을 강조하며 마무리하세요.
        `;
        break;
    }
  } else {
    // 기본값: 면접 맞춤 솔루션
    switch (sectionIndex) {
      case 1:
        specificPrompt = `
          1. 서류 기반 적중률 높은 예상질문 & 고득점 답변 스크립트 (20문항)
          - 지원자의 서류(이력서, 자소서, 사전과제, PT자료)를 분석하여 예상 질문 20개를 선정.
          - 직무 역량(40%), 인성/협업(30%), 로열티/지원동기(30%) 비율.
          - 질문 의도, 답변 전략, 모범 답변 스크립트 포함.
          - 모범 답변은 구어체로 작성.
        `;
        break;
      case 2:
        specificPrompt = `
          2. 예상치 못한 질문(압박/돌발)이 나왔을 때 임기응변 전략
          - 약점이나 논리적 공백을 파고드는 날카로운 질문 10가지.
          - 쿠션어 사용법, PREP 논리 구조화 화법.
          - 곤란한 상황 대처 매뉴얼.
        `;
        break;
      case 3:
        specificPrompt = `
          3. 면접관 시선에서 지원자님이 꼭 면접 전 대비해야 될 부분 (Checklist & PT Feedback)
          - 서류상 우려 사항 5가지와 해결책.
          - 차별화 포인트(USP) 전략.
          - PT 발표자료가 있다면, 장표 흐름(Storyline), 디자인, 내용 보완점 상세 분석.
        `;
        break;
      case 4:
        specificPrompt = `
          4. 면접장에서 면접관에게 고득점 받을 수 있는 노하우 (Attitude & Formatting)
          - 입장부터 퇴장까지 시뮬레이션.
          - 비언어적 요소(시선, 자세, 목소리).
          - 마지막 할 말 추천 멘트.
        `;
        break;
      case 5:
        specificPrompt = `
          5. 면접관의 합격 전략 피드백 (Interviewer's Strategy Feedback)
          - 지원자의 강점과 약점을 종합하여 면접관이 내리는 최종 합격 전략 피드백.
          - 경쟁자 대비 우위를 점할 수 있는 결정적 한 방(Winning Point).
          - 면접 직전 반드시 숙지해야 할 핵심 요약.
        `;
        break;
    }
  }

  const isAiRecommended = targetPageCount === 'AI 추천';
  const targetPages = isAiRecommended ? 50 : parseInt(targetPageCount);
  const minPagesPerSection = Math.floor(targetPages / 5);
  const maxPagesPerSection = Math.ceil(targetPages / 5);

  const prompt = `
    이번 단계에서는 아래 주제에 대해서만 집중적으로 작성합니다.
    
    [사용자 특별 요청사항 (필수 반영 사항 - 이 주제와 내용은 결과물에 무조건 포함되어야 함)]
    ${requirements ? requirements : "특별한 요청사항 없음"}

    [심층 분석 및 고퀄리티 강화 키워드]
    ${analysisOptions ? analysisOptions : "없음"}

    [참고 링크]
    ${referenceLinks ? referenceLinks : "없음"}
    
    [작성 주제]
    ${specificPrompt}

    [작성 절대 규칙 - 문서 서식 적용]
    문서를 Word 파일로 변환할 때 자동으로 스타일을 입히기 위해 아래 규칙을 반드시 지키세요.
    [중요] '#', '**', '---', '*', '__' 와 같은 마크다운 문법은 절대 사용하지 마세요.

    1. **소제목 (Subheadings)**: 각 질문이나 작은 주제의 제목은 반드시 '<h3>' 태그로 감싸세요.
       예) <h3>1. 자기소개를 해보세요.</h3>
       (이 부분은 문서에서 파란색 텍스트로 변환됩니다.)

    2. **강조 문장 (Warning/Emphasis)**: 답변 전략에서 매우 중요하거나 주의해야 할 핵심 문장은 반드시 '<span class="highlight-red">' 태그로 감싸세요.
       예) <span class="highlight-red">절대 하지 말아야 할 것은 핑계를 대는 것입니다.</span>
       (이 부분은 문서에서 빨간색 텍스트로 변환됩니다.)

    3. **핵심 키워드 (Bold)**: 중요한 단어나 포인트는 '<b>' 태그로 감싸세요.
       예) 이 질문의 핵심은 <b>문제 해결 능력</b>을 보여주는 것입니다.
       (이 부분은 문서에서 굵은(Bold) 텍스트로 변환됩니다.)

    4. **가독성**: 설명이 길어지면 두 문장마다 줄바꿈을 하세요.
    5. **전문성**: 냉철하고 분석적인 어조.
    6. **분량 (필수 준수)**: ${isAiRecommended ? '전체 리포트 분량은 AI가 분석 내용의 중요도에 따라 최적의 분량으로 자동 추천하여 작성합니다. (최소 30페이지 이상의 고퀄리티 지향)' : `전체 리포트 목표 분량은 **${targetPageCount}페이지**입니다. (허용 오차: ±10페이지)`}
       - 현재 작성 중인 이 섹션은 전체의 1/5 분량을 담당하므로, **최소 A4 ${minPagesPerSection} ~ ${maxPagesPerSection}페이지** 분량이 반드시 나와야 합니다.
       - 내용을 극도로 상세하게 풀어서 작성하고, 필요하다면 구체적인 사례, 단계별 가이드, 심층 분석 내용을 추가하여 절대 분량이 부족하지 않도록 하세요.
       - 분량이 부족할 경우 합격 솔루션으로서의 가치가 떨어지므로, 가능한 한 방대하고 깊이 있게 작성하는 것이 핵심입니다.
    7. **표(Table) 사용 필수**: 아래와 같은 구조적 데이터는 반드시 표준 HTML <table> 태그를 사용하여 작성하세요. 마크다운 표(|---|)는 절대 사용하지 마세요.
       - 데이터 비교, 장단점 분석, 타임라인/로드맵, 체크리스트, 예상 질문/답변 리스트 등.
       - <table>, <thead>, <tbody>, <tr>, <th>, <td> 태그를 사용하고, 별도의 CSS 스타일 속성은 넣지 마세요.
       - 표 내부에서도 마크다운 기호(#, **, *)는 사용하지 말고 <b>, <h3> 등의 태그를 사용하세요.
  `;

  contentParts.push({ text: prompt });

  return withRetry(async () => {
    const response = await ai.models.generateContent({
      model: 'gemini-flash-latest', 
      contents: { parts: contentParts },
      config: {
        thinkingConfig: { thinkingLevel: ThinkingLevel.LOW }, 
      },
    });

    return response.text || "내용 생성 실패";
  });
};