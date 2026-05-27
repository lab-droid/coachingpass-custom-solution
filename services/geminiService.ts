import { GoogleGenAI, ThinkingLevel } from "@google/genai";
import mammoth from "mammoth";

// Initialize Gemini Client
const getAiClient = () => new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

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
    const nameLine = name ? `Row 3 (Name): ${name}` : "";
    const prompt = `
      Create a vertical (portrait) premium book cover.
      Size: 1600px x 2560px.
      Theme: Luxury Black and Gold with a prominent Key symbol.
      
      Visual Composition:
      - Background: Matte deep black with subtle gold marble or silk textures.
      - Main Symbol: A large, detailed, metallic gold "Key" in the center, representing the "Key to Success".
      - Layout: All elements must be perfectly centered horizontally.
      
      Text Content (Render exactly in Korean):
      - Row 1 (Top): ${solutionType}
      - Row 2 (Middle): ${company}, ${job}
      - ${nameLine}
      
      Instruction for Text:
      - Text Alignment: Center all rows.
      - Font: Modern, elegant, high-contrast Korean serif or sans-serif font in metallic gold.
      - [CRITICAL] The Korean characters must be rendered perfectly without any artifacts, corruption, or missing strokes.
      
      Style: Executive, Sophisticated, High-end, Professional.
    `;
    // 9:16 aspect ratio is the closest standard for 1600x2560
    return await generateImage(prompt, "9:16");
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
  forbiddenContent: string,
  referenceLinks: string,
  targetPageCount: string,
  analysisOptions: string,
  files: { resume: File[]; cover: File[]; notice: File[]; posting: File[]; preTask: File[]; ptMaterial: File[]; otherFiles: File[] }
): Promise<string> => {
  
  const contentParts: any[] = [];
  const ai = getAiClient();

  try {
    const fileCategories = [files.resume, files.cover, files.notice, files.posting, files.preTask, files.ptMaterial, files.otherFiles];
    for (const category of fileCategories) {
      if (category && category.length > 0) {
        for (const file of category) {
          contentParts.push(await processFile(file));
        }
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
          - 사용자의 최종 합격을 위한 전문 컨설턴트의 특별 격려 멘트와 핵심 요약을 포함하세요.
        `;
        break;
    }
  } else if (solutionType === "기업&직무분석 솔루션") {
    switch (sectionIndex) {
      case 1:
        specificPrompt = `
          1. ${company} 핵심 가치 및 비즈니스 모델 심층 분석
          - ${company}의 설립 배경, 경영 철학, 핵심 가치(Core Values)를 구체적으로 분석하세요.
          - 현재 ${company}가 주력하고 있는 비즈니스 모델과 수익 구조를 아주 상세히 설명하세요.
          - [중요] 할루시네이션 방지를 위해 ${company}의 최신 공시 자료나 뉴스 등 현재 시점의 정확한 정보를 바탕으로 작성하세요.
        `;
        break;
      case 2:
        specificPrompt = `
          2. 산업 내 위치 및 경쟁사 비교 분석 (SWOT 포함)
          - ${company}가 속한 산업의 현재 전역 트렌드와 산업 내에서의 명확한 시장 점유율 및 위치를 분석하세요.
          - ${company}의 주요 경쟁사들을 나열하고, 각 사와의 차별점 및 강점/약점을 면밀히 비교 분석하세요.
          - ${company}의 SWOT(Strength, Weakness, Opportunity, Threat) 분석을 심도 있게 포함하세요.
        `;
        break;
      case 3:
        specificPrompt = `
          3. ${job} 직무 핵심 역할 및 필요 역량 심층 분석
          - ${company} 내에서의 ${job} 직무의 구체적인 역할과 책임을 정의하세요.
          - ${job} 직무를 성공적으로 수행하기 위해 반드시 필요한 핵심 역량(Hard Skill, Soft Skill) 5가지를 도출하세요.
          - 제공된 채용 공고(JD)나 기업 문화를 바탕으로 ${company}가 이 직무에서 선호하는 인재상을 상세히 분석하세요.
        `;
        break;
      case 4:
        specificPrompt = `
          4. ${job} 직무 실무 프로세스 및 커리어 패스 분석
          - ${company}에서의 ${job} 직무의 일반적인 하루/주간 업무 루틴과 실제 실무 가동 프로세스를 상상력을 발휘하여 현실적으로 기술하세요.
          - 입사 후 연차별 성장 단계(Junior to Senior)와 ${company} 내에서 기대할 수 있는 장기적인 커리어 패스(Career Path)를 구체적으로 제시하세요.
        `;
        break;
      case 5:
        specificPrompt = `
          5. ${company}-${job} 적합성 종합 진단 및 합격 전략
          - 앞서 분석한 ${company}의 특성과 ${job} 직무의 요구사항을 완벽히 결합하여 지원자가 강조해야 할 '핵심 Fit'을 정의하세요.
          - ${company}의 미래 비전과 ${job} 직무의 발전 방향이 일치하는 '전략적 기여 지점'을 찾아 구체적인 합격 제언을 하세요.
        `;
        break;
    }
  } else if (solutionType === "기출 맞춤 솔루션") {
    switch (sectionIndex) {
      case 1:
        specificPrompt = `
          1. 면접 유형별 특징 및 상세 대비 전략 분석
          - 입력된 면접 유형(${type})의 일반적인 진행 방식, 평가 요소, 그리고 주의사항을 상세히 분석하세요.
          - 해당 면접 유형에서 면접관이 가장 중요하게 생각하는 포인트(Key Point)를 도출하세요.
          - 해당 전형을 통과하기 위한 최적의 마인드셋과 기본 자세를 제시하세요.
        `;
        break;
      case 2:
        specificPrompt = `
          2. 자주 나오는 핵심 기출 문제 20선 (Part 1: 1~10번)
          - 면접 유형(${type})과 지원 직무(${job})에 맞춰 실제 면접에서 가장 빈번하게 출제되는 기출 질문 10개를 엄선하세요.
          - 각 질문별 [질문 의도], [답변 시 포함해야 할 핵심 포인트], [예시 답변 가이드]를 매우 상세히 작성하세요.
          - 할루시네이션 방지를 위해 실제 기업들의 기출 데이터를 참고하여 현실적인 질문들로 구성하세요.
        `;
        break;
      case 3:
        specificPrompt = `
          3. 자주 나오는 핵심 기출 문제 20선 (Part 2: 11~20번+)
          - 앞선 10개 질문에 이어, 추가로 10개 이상의 핵심 기출 질문을 제시하세요 (총 20개 이상 보장).
          - 직무 역량, 인성, 돌발 상황, 로열티 등 다양한 카테고리를 망라하세요.
          - 사용자의 특별 요청사항이 있다면 해당 내용을 반영한 기출 질문도 포함하세요.
          - 각 질문마다 [질문 의도]와 [답변 구성 전략]을 상세히 기술하세요.
        `;
        break;
      case 4:
        specificPrompt = `
          4. 기출 문제 활용 노하우 및 실전 훈련 가이드
          - 제공된 20개 이상의 기출 문제를 단순히 암기하는 것이 아니라, 어떻게 본인의 경험을 녹여 '나만의 답변'으로 커스터마이징할지 노하우를 전수하세요.
          - 키워드 중심의 답변 구조 잡기, 꼬리 질문 대응법, 답변 변형 기술 등을 상세히 설명하세요.
          - 거울 보고 연습하기, 녹음 분석 등 실전에서 써먹을 수 있는 구체적인 훈련 프로세스를 제시하세요.
        `;
        break;
      case 5:
        specificPrompt = `
          5. 기출 기반 면접 필승 전략 및 최종 마무리
          - 기출 문제 분석을 통해 도출된 이 기업/직무만의 고유한 면접 분위기와 합격 공식을 요약하세요.
          - 면접장 문을 열고 들어가는 순간부터 나가는 순간까지 기출을 토대로 구축한 본인만의 이미지를 일관성 있게 유지하는 전략을 제시하세요.
          - 지원자가 자신감을 가질 수 있도록 전문 컨설턴트의 최종 조언과 격려로 마무리하세요.
        `;
        break;
    }
  } else if (solutionType === "보강 솔루션") {
    switch (sectionIndex) {
      case 1:
        specificPrompt = `
          1. 기존 솔루션 핵심 분석 및 취약점 도출
          - 첨부된 참고자료(기존 솔루션)를 정밀하게 분석하여, 현재 구성의 강점과 보완이 필요한 취약점을 진단하세요.
          - 해당 솔루션이 타겟으로 하는 기업(${company}) 및 직무(${job})와의 정합성을 재검토하세요.
        `;
        break;
      case 2:
        specificPrompt = `
          2. 사용자 추가 요청사항 기반 정밀 보강 전략 수립
          - 사용자가 입력한 추가 요청사항(${requirements})과 분석 옵션(${analysisOptions})을 최우선으로 반영한 보강 방향성을 설정하세요.
          - 기존 내용 중 수정/교체가 필요한 부분과 새롭게 추가되어야 할 핵심 키워드를 도출하세요.
        `;
        break;
      case 3:
        specificPrompt = `
          3. 콘텐츠 심층 강화 및 전문성 기반 내용 확장
          - 기존 솔루션의 각 항목을 전문 컨설턴트의 시각에서 한 단계 더 깊게 보완하세요.
          - 논리적 구조 강화, 문장 표현의 세련미 향상, 구체적인 사례 및 수치 데이터 등을 보강하여 전문성을 극대화하세요.
        `;
        break;
      case 4:
        specificPrompt = `
          4. 실전 활용도 극대화 및 솔루션 퀄리티 업그레이드
          - 보강된 내용이 실제 면접이나 서류 전형에서 어떻게 합격 시그널로 작동할지 구체적인 활용 가이드를 제시하세요.
          - 인사담당자나 면접관이 매력을 느낄 수 있는 '필살기' 포인트로 다듬으세요.
        `;
        break;
      case 5:
        specificPrompt = `
          5. 보강 완료 종합 제언 및 최종 합격 로드맵
          - 보강된 전체 내용을 요약하고, 지원자가 최종 합격하기 위해 지금 바로 실천해야 할 Action Plan을 제시하세요.
          - 전문 컨설턴트로서 지원자의 합격을 확신하는 최종 격려와 조언으로 마무리하세요.
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
  } else if (solutionType === "맞춤 솔루션") {
    switch (sectionIndex) {
      case 1:
        specificPrompt = `
          1. 요청사항 및 첨부 서류 기반 핵심 분석 (딥리서치 활용)
          - [매우 중요] 외부 정보나 일반적인 템플릿 사용을 엄격히 제한하며, 오직 사용자의 요청사항과 첨부된 서류(이력서, 자소서, 경험 등) 정보만을 기반으로 작성해야 합니다.
          - 해당 서류와 요청사항 내용에 대해서만 Gemini의 딥리서치(Deep Research) 기능을 최대한 활용하여, 표면적인 텍스트를 넘어선 숨은 의미와 핵심 이슈를 심층적으로 진단하세요.
        `;
        break;
      case 2:
        specificPrompt = `
          2. 요청사항 해결을 위한 구체적 실행 방안 (서류 기반 딥리서치)
          - [매우 중요] 반드시 사용자의 요청사항과 첨부된 서류 내용에 국한하여 딥리서치 수준의 심층 분석을 바탕으로 실무적이고 구체적인 맞춤 해결책을 제시하세요.
          - 발견된 정보를 심도 있게 교차 분석하여, 현장에서 즉시 적용 가능한 단계별 액션 플랜을 도출하세요.
        `;
        break;
      case 3:
        specificPrompt = `
          3. 서류 심층(딥리서치) 분석을 통한 강점 및 보완점 도출
          - [매우 중요] 오직 제출된 서류 맥락 안에서 딥리서치를 수행하여, 요청사항 달성에 결정적인 영향을 미칠 본인만의 차별화 포인트와 강점을 분석하세요.
          - 서류의 구조적, 논리적 취약점을 심층 분석하여 구체적 예시와 함께 논리정연한 개선 방향을 제시하세요.
        `;
        break;
      case 4:
        specificPrompt = `
          4. 예상 상황 및 대응 전략 (서류 문맥 내 딥리서치)
          - [매우 중요] 외부 사례가 아닌, 오직 요청사항과 첨부 서류의 맥락 안에서만 도출될 수 있는 잠재적 리스크나 파생 상황을 딥리서치하여 도출하세요.
          - 각 예상 상황별로 서류에 기재된 경험이나 역량을 어떻게 활용하고 응용하여 최적의 논리로 방어 및 대응할지 설명하세요.
        `;
        break;
      case 5:
        specificPrompt = `
          5. 딥리서치 최종 요약 및 맞춤형 넥스트 스텝 제언
          - [매우 중요] 사용자의 요청사항 및 서류 내용을 한정적으로 기반하여 딥리서치한 분석 결과들을 종합, 최종 솔루션의 핵심 가치를 요약하세요.
          - 앞으로의 실행을 위한 제언을 서류 내 구체적 맥락과 완벽히 일치하는 선에서 전문가적 통찰과 함께 가장 효과적으로 제언하세요.
        `;
        break;
    }
  } else {
    // 기본값: 면접 맞춤 솔루션
    switch (sectionIndex) {
      case 1:
        specificPrompt = `
          1. 면접 유형별 서류 기반 적중률 높은 예상질문 & 고득점 답변 스크립트
          - [매우 중요] 사용자가 입력한 면접 유형명은 '${type}'입니다. 만약 여러 개의 면접 유형이 입력되어 있다면(예: 쉼표, 띄어쓰기 등으로 구분된 경우), 반드시 **각 면접 유형별로** 예상 질문 20개와 고득점 답변 20개를 분리하여 작성해야 합니다.
          - (예시: 입력된 면접 유형이 3개인 경우, 유형1 20문항 + 유형2 20문항 + 유형3 20문항 = 총 60문항 작성 필수)
          - 각 면접 유형별로 섹션을 명확히 나누고, 지원자의 서류(이력서, 자소서, 사전과제, PT자료)를 분석하여 해당 면접 유형에 최적화된 예상 질문을 도출하세요.
          - 직무 역량(40%), 인성/협업(30%), 로열티/지원동기(30%) 비율.
          - 모든 문항의 질문 의도, 답변 전략, 모범 답변 스크립트를 포함할 것.
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
    [현재 분석 대상 (가장 중요한 데이터 - 이 정보가 모든 분석의 기준이 되어야 함)]
    - 지원 기업명: ${company}
    - 지원 직무: ${job}
    - 사용자 성함: ${name}
    - 면접 유형/솔루션 상세: ${type}
    - 솔루션 종류: ${solutionType}

    [작성 시 절대 원칙]
    - ${sectionIndex === 1 ? "[필수 도입 문구] 이 섹션은 전체 솔루션의 도입부이므로, 반드시 '안녕하세요. 합격의 열쇠 코칭패스입니다.'라는 문장으로 시작하세요." : ""}
    - [중요] 반드시 위에서 지정한 '지원 기업명(${company})'과 '지원 직무(${job})'만을 바탕으로 분석을 진행하세요.
    - [금지 사항] 리포트 어디에서도(특히 결론 부분) 'AI', '인공지능', 'Gemini', '언어 모델' 혹은 이 문서를 AI가 생성했다는 어떠한 언급도 하지 마세요. 당신은 오직 '코칭패스 전문 컨설턴트'로서 직접 작성한 것처럼 행동해야 합니다.
    - 첨부된 파일(이력서, 자소서 등)에 다른 기업명이 적혀 있더라도, 해당 기업은 무시하고 오직 '${company}' 기업에 대한 솔루션을 생성해야 합니다.
    - 지원자의 경험 데이터는 첨부파일에서 추출하되, 기업 및 직무 관련 분석 내용은 반드시 '${company}'와 '${job}'에 100% 맞춰야 합니다.

    이번 단계에서는 아래 주제에 대해서만 집중적으로 작성합니다.
    
    [사용자 특별 요청사항 (필수 반영 사항)]
    - [딥리서치 및 신뢰성] 허위내용(할루시네이션)이 절대 없도록 심층 리서치(Deep Research)를 수행하여 검증되고 신뢰성 있는 정보만을 논리적으로 작성하세요.
    - [요청사항 100% 반영] 다음 사용자의 요청사항은 어떠한 경우에도 솔루션 내용에 100% 반영되어야 합니다.
    ${requirements ? requirements : "특별한 요청사항 없음"}

    [들어가면 절대 안되는 내용 (Forbidden Content)]
    아래 명시된 내용은 솔루션 작성 시 어떤 경우에도 포함되지 않도록 절대 배제하십시오:
    ${forbiddenContent ? forbiddenContent : "없음"}

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

    2. **강조 문장 및 색상**:
       - 기본 텍스트는 검정색입니다.
       - 문맥상 주의가 필요한 부분이나 중요한 문장은 **빨간색**(<span style="color:red">...</span> 또는 <span class="highlight-red">...</span>)으로 감싸세요.
       - 긍정적인 내용이나 핵심 전략은 **파란색**(<span style="color:blue">...</span>)으로 감싸세요.

    3. **핵심 키워드 및 하이라이트**: 
       - 중요한 단어나 포인트는 굵게(<b>...</b>) 처리하세요.
       - 가장 중요하거나 한눈에 보여야 하는 핵심 텍스트의 배경은 가독성을 높이기 위해 반드시 **노란색 배경에 검은 텍스트**(<span style="background-color:yellow; color:black;">...</span>)를 적용하세요.

    4. **가독성 (줄바꿈 필수)**: 텍스트의 가독성을 극대화하기 위해 글이 이어지지 않도록 **2~3줄마다 반드시 문단을 나누고(줄바꿈), 문단 사이에는 한 줄 띄어쓰기(<br><br>)**를 적용하여 여백을 확보하세요.
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
        systemInstruction: {
          parts: [{
            text: `
              당신은 대한민국 최고의 취업/면접 전문 컨설턴트입니다.
              당신은 스스로가 AI나 인공지능이라는 점을 리포트 어디에서도 언급하지 마십시오. 오직 사람인 전문 컨설턴트로서 답변하십시오.
              사용자가 제공한 [지원 기업명]과 [지원 직무]를 최우선으로 분석해야 합니다.
              첨부파일(자소서, 이력서 등)에서 지원자의 경험과 강점을 추출하되, 기업 데이터베이스와 분석 내용은 반드시 사용자가 입력한 '${company}' 기업에 한정되어야 합니다.
              절대로 다른 기업이나 유사 기업의 정보를 섞지 마세요.
              모든 답변은 전문적이고 신뢰할 수 있는 정보를 바탕으로, 할루시네이션(허위 정보) 없이 작성되어야 합니다.
            `
          }]
        }
      },
    });

    return response.text || "내용 생성 실패";
  });
};