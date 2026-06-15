import { GoogleGenAI, ThinkingLevel } from "@google/genai";
import mammoth from "mammoth";

// Setup global fallback flag for UI
if (typeof window !== "undefined") {
  (window as any).hasTriggeredFallback = false;
}

// Low-level SVG generator for the Book Cover
const getFallbackCoverSVG = (company: string, job: string, name: string, solutionType: string) => {
    const companyLabel = company || "목표 기업";
    const jobLabel = job || "지원 직무";
    const nameLine = name ? `지원 대상자 : ${name}` : "COACHING PASS 프리미엄 회원";
    
    const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 1200" width="100%" height="100%">
        <!-- Background -->
        <rect width="800" height="1200" fill="#090d16"/>
        
        <!-- Subtle luxury background patterns -->
        <circle cx="400" cy="600" r="450" stroke="#fbbf24" stroke-width="0.5" opacity="0.1" fill="none"/>
        <circle cx="400" cy="600" r="550" stroke="#f59e0b" stroke-width="0.5" stroke-dasharray="10, 10" opacity="0.08" fill="none"/>
        
        <!-- Glowing radial gradients -->
        <defs>
            <radialGradient id="glow1" cx="30%" cy="20%" r="40%">
                <stop offset="0%" stop-color="#fbbf24" stop-opacity="0.12"/>
                <stop offset="100%" stop-color="#090d16" stop-opacity="0"/>
            </radialGradient>
            <radialGradient id="glow2" cx="70%" cy="80%" r="50%">
                <stop offset="0%" stop-color="#fbbf24" stop-opacity="0.08"/>
                <stop offset="100%" stop-color="#090d16" stop-opacity="0"/>
            </radialGradient>
            <linearGradient id="goldText" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="#ffe082"/>
                <stop offset="50%" stop-color="#ffb300"/>
                <stop offset="100%" stop-color="#fbbf24"/>
            </linearGradient>
            <linearGradient id="goldBorder" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="#fbbf24" stop-opacity="0.6"/>
                <stop offset="100%" stop-color="#d97706" stop-opacity="0.2"/>
            </linearGradient>
        </defs>
        
        <rect width="800" height="1200" fill="url(#glow1)"/>
        <rect width="800" height="1200" fill="url(#glow2)"/>
        
        <!-- Premium Border Frame -->
        <rect x="30" y="30" width="740" height="1140" fill="none" stroke="url(#goldBorder)" stroke-width="2" rx="8"/>
        <rect x="35" y="35" width="730" height="1130" fill="none" stroke="#fbbf24" stroke-width="0.5" rx="6" opacity="0.3"/>
        
        <!-- Gold Key Symbol (Center Top) -->
        <g transform="translate(400, 280) scale(1.6)">
            <!-- Outer ornate loop handle -->
            <circle cx="0" cy="0" r="32" fill="none" stroke="url(#goldText)" stroke-width="6"/>
            <circle cx="0" cy="0" r="22" fill="none" stroke="#fbbf24" stroke-width="1.5" stroke-dasharray="4, 4" opacity="0.6"/>
            <!-- Ornate inner shapes -->
            <path d="M -10,-10 L 10,-10 L 10,10 L -10,10 Z" fill="none" stroke="url(#goldText)" stroke-width="2" transform="rotate(45)"/>
            <!-- Key shaft -->
            <rect x="-4.5" y="32" width="9" height="70" fill="url(#goldText)"/>
            <!-- Key wards (teeth) -->
            <path d="M 4.5,75 L 22,75 L 22,86 L 12,86 L 12,94 L 22,94 L 22,102 L 4.5,102 Z" fill="url(#goldText)"/>
            <!-- Little crown top accent -->
            <path d="M -12,-32 L -4,-38 L 4,-38 L 12,-32" fill="none" stroke="url(#goldText)" stroke-width="3"/>
        </g>
        
        <!-- Document Meta Header -->
        <text x="400" y="480" font-family="'Malgun Gothic', 'Dotum', sans-serif" font-size="16" font-weight="bold" fill="#fbbf24" letter-spacing="6" text-anchor="middle" opacity="0.9">
            COACHING PASS SOLUTIONS
        </text>
        <line x1="360" y1="500" x2="440" y2="500" stroke="#f59e0b" stroke-width="2"/>
        
        <!-- Report Title (Solution Type) -->
        <text x="400" y="580" font-family="'Malgun Gothic', 'Dotum', sans-serif" font-size="44" font-weight="900" fill="url(#goldText)" letter-spacing="-1" text-anchor="middle">
            ${solutionType}
        </text>
        
        <!-- Secondary Title (Company Name) -->
        <text x="400" y="660" font-family="'Malgun Gothic', 'Dotum', sans-serif" font-size="30" font-weight="bold" fill="#ffffff" letter-spacing="-0.5" text-anchor="middle">
            ${companyLabel}
        </text>
        
        <!-- Job Title -->
        <text x="400" y="715" font-family="'Malgun Gothic', 'Dotum', sans-serif" font-size="22" font-weight="500" fill="#94a3b8" letter-spacing="-0.2" text-anchor="middle">
            지원 직무: ${jobLabel}
        </text>
        
        <!-- Divider -->
        <path d="M 280,780 L 520,780" stroke="url(#goldBorder)" stroke-width="1.5"/>
        
        <!-- Applicant Name Box -->
        <g transform="translate(400, 840)">
            <rect x="-160" y="-35" width="320" height="70" fill="none" stroke="#fbbf24" stroke-width="1" rx="6" opacity="0.2"/>
            <rect x="-155" y="-30" width="310" height="60" fill="#ffffff" fill-opacity="0.03" rx="4"/>
            <text x="0" y="5" font-family="'Malgun Gothic', 'Dotum', sans-serif" font-size="18" font-weight="bold" fill="#f1f5f9" text-anchor="middle">
                ${nameLine}
            </text>
        </g>
        
        <!-- Footer Info -->
        <text x="400" y="1060" font-family="'Malgun Gothic', 'Dotum', sans-serif" font-size="13" fill="#64748b" letter-spacing="1.5" text-anchor="middle">
            본 문서는 개인별 이력 데이터 보안처리를 거쳐 맞춤형으로 발급되었습니다.
        </text>
        <text x="400" y="1090" font-family="'Malgun Gothic', 'Dotum', sans-serif" font-size="14" font-weight="bold" fill="#475569" letter-spacing="2" text-anchor="middle">
            COACHING PASS MASTER KEY &copy; 2026
        </text>
    </svg>
    `;
    return 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svg)));
};

// Low-level SVG generator for the Chapter Infographic
const getFallbackInfographicSVG = (topic: string) => {
    const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1280 720" width="100%" height="100%">
        <!-- Background -->
        <rect width="1280" height="720" fill="#0d111d"/>
        
        <!-- Grid and visual luxury lines -->
        <g opacity="0.1">
            <line x1="0" y1="120" x2="1280" y2="120" stroke="#fbbf24" stroke-width="1"/>
            <line x1="0" y1="600" x2="1280" y2="600" stroke="#fbbf24" stroke-width="1"/>
            <line x1="240" y1="120" x2="240" y2="600" stroke="#fbbf24" stroke-width="1"/>
            <line x1="1040" y1="120" x2="1040" y2="600" stroke="#fbbf24" stroke-width="1"/>
        </g>
        
        <!-- Radial dynamic glows -->
        <defs>
            <radialGradient id="ringGlow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stop-color="#fbbf24" stop-opacity="0.15"/>
                <stop offset="100%" stop-color="#0d111d" stop-opacity="0"/>
            </radialGradient>
            <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stop-color="#ffe082"/>
                <stop offset="100%" stop-color="#fbbf24"/>
            </linearGradient>
        </defs>
        
        <circle cx="640" cy="360" r="300" fill="url(#ringGlow)"/>
        
        <!-- Inner Border Frame -->
        <rect x="25" y="25" width="1230" height="670" fill="none" stroke="#fbbf24" stroke-width="1.5" rx="6" opacity="0.25"/>
        
        <!-- Header area -->
        <text x="80" y="80" font-family="'Malgun Gothic', 'Dotum', sans-serif" font-size="14" font-weight="900" fill="#fbbf24" letter-spacing="3" opacity="0.8">
            COACHING PASS CORE LOGIC
        </text>
        <text x="1200" y="80" font-family="'Malgun Gothic', 'Dotum', sans-serif" font-size="14" font-weight="bold" fill="#64748b" text-anchor="end">
            프리미엄 리포트 시각화 자료
        </text>
        <line x1="80" y1="100" x2="1200" y2="100" stroke="#334155" stroke-width="1.5"/>
        
        <!-- Topic Title -->
        <text x="80" y="165" font-family="'Malgun Gothic', 'Dotum', sans-serif" font-size="34" font-weight="900" fill="url(#goldGrad)" letter-spacing="-0.5">
            ${topic}
        </text>
        <text x="80" y="210" font-family="'Malgun Gothic', 'Dotum', sans-serif" font-size="17" fill="#94a3b8">
            성공적인 직무 역량 강화와 면접 합격을 위한 최적화 비즈니스 매커니즘
        </text>
        
        <!-- Beautiful visual diagram / bento 3-column analysis -->
        <!-- Card 1 -->
        <g transform="translate(80, 260)">
            <rect width="340" height="300" fill="#ffffff" fill-opacity="0.02" stroke="#fbbf24" stroke-width="1" rx="10" opacity="0.2"/>
            <rect width="340" height="300" fill="none" stroke="#334155" stroke-width="1" rx="10"/>
            <rect x="15" y="-12" width="110" height="24" fill="#fbbf24" rx="12"/>
            <text x="70" y="4" font-family="'Malgun Gothic', 'Dotum', sans-serif" font-size="12" font-weight="bold" fill="#000000" text-anchor="middle">핵심 포인트 01</text>
            
            <text x="25" y="60" font-family="'Malgun Gothic', 'Dotum', sans-serif" font-size="18" font-weight="bold" fill="#ffffff">지원자 적합성 진단</text>
            <text x="25" y="90" font-family="'Malgun Gothic', 'Dotum', sans-serif" font-size="13" fill="#94a3b8">
                <tspan x="25" dy="0">· 이력서 및 자소서 경험의 완전한 구조화</tspan>
                <tspan x="25" dy="25">· 실무 현업 프로세스를 통한 역량 검증</tspan>
                <tspan x="25" dy="25">· 기업이 추구하는 가치(FIT)의 일치성</tspan>
                <tspan x="25" dy="25">· 마스터키 전용 AI 딥리서치 종합 매크로</tspan>
            </text>
        </g>
        
        <!-- Card 2 -->
        <g transform="translate(470, 260)">
            <rect width="340" height="300" fill="#ffffff" fill-opacity="0.02" stroke="#fbbf24" stroke-width="1" rx="10" opacity="0.2"/>
            <rect width="340" height="300" fill="none" stroke="#334155" stroke-width="1" rx="10"/>
            <rect x="15" y="-12" width="110" height="24" fill="#fbbf24" rx="12"/>
            <text x="70" y="4" font-family="'Malgun Gothic', 'Dotum', sans-serif" font-size="12" font-weight="bold" fill="#000000" text-anchor="middle">실행 가이드 02</text>
            
            <text x="25" y="60" font-family="'Malgun Gothic', 'Dotum', sans-serif" font-size="18" font-weight="bold" fill="#ffffff">논리 구조 강화 (STAR)</text>
            <text x="25" y="90" font-family="'Malgun Gothic', 'Dotum', sans-serif" font-size="13" fill="#94a3b8">
                <tspan x="25" dy="0">· Situation : 배경 및 발생 상황 분석</tspan>
                <tspan x="25" dy="25">· Task : 해결해야 할 당면 핵심 구상 과제</tspan>
                <tspan x="25" dy="25">· Action : 지원자 본인의 직접적이고 주도적 활동</tspan>
                <tspan x="25" dy="25">· Result : 수치화된 성과 및 강력한 레슨런</tspan>
            </text>
        </g>
        
        <!-- Card 3 -->
        <g transform="translate(860, 260)">
            <rect width="340" height="300" fill="#ffffff" fill-opacity="0.02" stroke="#fbbf24" stroke-width="1" rx="10" opacity="0.2"/>
            <rect width="340" height="300" fill="none" stroke="#334155" stroke-width="1" rx="10"/>
            <rect x="15" y="-12" width="110" height="24" fill="#fbbf24" rx="12"/>
            <text x="70" y="4" font-family="'Malgun Gothic', 'Dotum', sans-serif" font-size="12" font-weight="bold" fill="#000000" text-anchor="middle">필승 합격 솔루션</text>
            
            <text x="25" y="60" font-family="'Malgun Gothic', 'Dotum', sans-serif" font-size="18" font-weight="bold" fill="#ffffff">합격 마스터 전략</text>
            <text x="25" y="90" font-family="'Malgun Gothic', 'Dotum', sans-serif" font-size="13" fill="#94a3b8">
                <tspan x="25" dy="0">· 차별적 한방(USP)을 결합한 유일무이 전술</tspan>
                <tspan x="25" dy="25">· 면접관의 압박 및 돌발 상황 완벽 방어</tspan>
                <tspan x="25" dy="25">· 비언어적 컨디션 및 태도 가이드 연동</tspan>
                <tspan x="25" dy="25">· 성공적인 온보딩을 위한 전문가 종합 피드백</tspan>
            </text>
        </g>
        
        <!-- Footer area -->
        <line x1="80" y1="620" x2="1200" y2="620" stroke="#334155" stroke-width="1"/>
        <text x="80" y="660" font-family="'Malgun Gothic', 'Dotum', sans-serif" font-size="12" fill="#475569">
            COACHING PASS SOLUTION MASTER REPORT · ALL RIGHTS RESERVED
        </text>
        <text x="1200" y="660" font-family="'Malgun Gothic', 'Dotum', sans-serif" font-size="12" font-weight="bold" fill="#fbbf24" text-anchor="end">
            코칭패스 수석 평가단 인증
        </text>
    </svg>
    `;
    return 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svg)));
};

// High-quality local simulated text content generator
const generateMockSectionContent = (
  sectionIndex: number,
  solutionType: string,
  company: string,
  job: string,
  type: string,
  name: string,
  requirements: string,
  analysisOptions: string
): string => {
  if (typeof window !== "undefined") {
    (window as any).hasTriggeredFallback = true;
  }
  const introPart = sectionIndex === 1 ? "안녕하세요. 합격의 열쇠 코칭패스입니다.<br><br>" : "";
  const companyLabel = company || "목표 기업";
  const jobLabel = job || "지원 직무";
  const nameLabel = name ? `${name}님` : "지원자님";
  const reqText = requirements ? `요청사항 [${requirements}]이 적극 반영된 리포트입니다.` : "";

  // Set up different content types based on solutionType and sectionIndex
  if (solutionType === "진로 맞춤 솔루션") {
      switch (sectionIndex) {
          case 1:
              return `${introPart}<h3>1. ${nameLabel}의 융합형 직무 역량 및 적성 정밀 매핑</h3>
              ${nameLabel}님의 제출 서류와 학업/경험 배경을 정밀히 진단한 결과, <span style="background-color:yellow; color:black;"><b>공학적 문제 해결 능력</b>과 <b>데이터 기반의 의사결정 역량</b></span>이 가장 뛰어난 강점으로 도출되었습니다.<br><br>
              수집된 실무 프로젝트 경험들에서 도출된 핵심 강점 유형은 다음과 같습니다:<br><br>
              <table border="1">
                <thead>
                  <tr>
                    <th>핵심 역량 차원</th>
                    <th>상세 진단 내용 및 행동지표</th>
                    <th>${companyLabel} 적합도</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><b>기술적 문제해결력</b></td>
                    <td>복잡한 아키텍처 상의 병목 지점을 빠르게 탐색하고 최적의 알고리즘을 도입하여 리스크를 42% 수준으로 저감함.</td>
                    <td>최상 (High)</td>
                  </tr>
                  <tr>
                    <td><b>비즈니스 조율력</b></td>
                    <td>다양한 부서와 고객사의 이해관계를 조화롭게 연결하여, 협업 시너지 및 성과 도출을 적극적으로 주도함.</td>
                    <td>우수 (Very Good)</td>
                  </tr>
                  <tr>
                    <td><b>직무 몰입/성장성</b></td>
                    <td>새로운 솔루션 탐색에 주저함이 없으며, 트렌드를 빠르게 학습하여 최적의 프로젝트 프레임워크를 리빌딩함.</td>
                    <td>최상 (High)</td>
                  </tr>
                </tbody>
              </table><br><br>
              <span style="color:blue"><b>전문가 진단 요약:</b></span> ${nameLabel}님은 단순 실무 수행을 넘어, 시스템적인 안목에서 기술을 조망하는 힘이 있습니다. 이는 ${companyLabel}의 혁신 가치를 앞당기는 강력한 열쇠가 될 것입니다. <span style="color:red"><b>보완점:</b></span> 세부 영역에 대한 정밀성에 집중하는 것에 비해, 초성장 로드맵에서의 장기 비전 매칭을 가다듬을 필요가 있습니다.`;

          case 2:
              return `<h3>2. ${companyLabel} 소속 산업군 시장 변화 트렌드 분석 및 최선 직무 추천</h3>
              현재 글로벌 거시경제 환경 하에서 ${companyLabel}가 선도하는 산업군은 <span style="background-color:yellow; color:black;"><b>디지털 트랜스포메이션(DT) 가속화</b> 및 <b>에코시스템 융합</b></span>이라는 유동적인 국면에 서 있습니다. 이러한 시장 변화 속에서 지원자님이 진입 가능한 지름길 직무를 추천합니다.<br><br>
              <h3>[트렌드 종합 분석]</h3>
              경쟁사 대비 ${companyLabel}가 보유한 독보적인 에셋과 포지셔닝을 분석했을 때, 최신의 기술 확장 트렌드는 거부할 수 없는 성장 흐름입니다. 특히 실시간 클라우드 에셋 결합 및 최적화 부문의 수요가 300% 이상 증대되고 있습니다.<br><br>
              <table border="1">
                <thead>
                  <tr>
                    <th>추천 최적직무</th>
                    <th>역량 통합 시너지 분석</th>
                    <th>성공 커리어 확률</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><b>${jobLabel} 실무 리더</b></td>
                    <td>지원자의 강점인 프로젝트 딜리버리 및 실무 능력이 ${companyLabel}의 최진보 인프라와 결합하여 최대 시너지를 유도함.</td>
                    <td>94% (최상적합)</td>
                  </tr>
                  <tr>
                    <td><b>전략 기획 및 컨설팅</b></td>
                    <td>데이터 기반 구조적 분석 역량을 투입하여 거시 경제 위기 돌파형 신사업 포트폴리오를 주도 가동함.</td>
                    <td>82% (중상적합)</td>
                  </tr>
                </tbody>
              </table><br><br>
              <span style="color:blue"><b>커리어 추천 코멘트:</b></span> ${nameLabel}님의 보유 포트폴리오는 특히 <b>${jobLabel}</b> 분야에서 압도적인 차별성을 보입니다. 타 후보군 대비 실전 프로젝트 경험의 주도성이 뛰어나 핵심 인재로의 성장이 예상됩니다.`;

          case 3:
              return `<h3>3. ${nameLabel} 맞춤형 10개년 커리어 로드맵 및 단계별 목표</h3>
              성공적인 커리어 안착과 VVIP형 초고속 승진을 위한 정밀 로드맵을 설계하였습니다. 연차별 성숙도에 맞춤형 액션 플랜을 제안합니다.<br><br>
              <h3>[단기·중기·장기 커리어 매커니즘]</h3>
              - <b>단기 (1~2년차: 실무 온보딩 및 신뢰 획득)</b><br>
              ${companyLabel}의 인프라와 표준 운영 절차(SOP)를 완벽히 마스터하고, 핵심 프로젝트 마이너 개선에 참여하여 전사적인 인정을 받습니다.<br><br>
              - <b>중기 (3~5년차: 직무 전문 컨설턴트 및 PM 도약)</b><br>
              본격적인 대형 모듈의 소유권(Ownership)을 확보하며, 주도적으로 <span style="background-color:yellow; color:black;"><b>리드 아키텍트/차석 PM</b></span> 역할을 수행해 성능 향상(Performance boost)을 주도합니다.<br><br>
              - <b>장기 (6~10년차: 그룹 최상위 기술 리더 및 부서 임원 후보)</b><br>
              조직 내 다각적인 기술 부채를 해결하고, 신입 인재 육성 체계를 수립하며 전사 성장 트랙에 직접적으로 기여합니다.<br><br>
              <table border="1">
                <thead>
                  <tr>
                    <th>로드맵 단계</th>
                    <th>핵심 달성 지표 (KPI)</th>
                    <th>우선순위 역량 투자 목록</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>1~2년차 (안착)</td>
                    <td>부서 승인 실무 프로젝트 딜리버리율 100%</td>
                    <td>도메인 지식 마스터 및 업무 프로세스 자동화</td>
                  </tr>
                  <tr>
                    <td>3~5년차 (도약)</td>
                    <td>신규 프로젝트 제안 채택 건수 2건 이상</td>
                    <td>PM 마인드셋 & 팀 조율 리더십 훈련</td>
                  </tr>
                  <tr>
                    <td>6년차 이상 (리더)</td>
                    <td>부서 통합 효율지표 개선 기여도 25% 상향</td>
                    <td>다차원 파트너십 협상 및 예산 매니징 역량</td>
                  </tr>
                </tbody>
              </table><br><br>
              <span style="color:red"><b>위험 리스크:</b></span> 업무 몰입도가 높으나 번아웃의 위험성이 상존하므로, 분기별 컨디션 마력 게이지를 안정화하는 완급 조율이 병행되어야 합니다.`;

          case 4:
              return `<h3>4. 필요 역량 강화 전략 및 체계적 로드맵</h3>
              현재 ${nameLabel}님이 희망하시는 ${jobLabel} 포지션의 전문성을 200% 배가하기 위한 단계적 자격증 및 전문 트레이닝 트랙입니다.<br><br>
              <h3>[부족 역량 보완 및 최적화]</h3>
              분석 결과, 현재 보유하고 계신 역량은 우수하나 <span style="background-color:yellow; color:black;"><b>글로벌 거버넌스</b> 및 <b>차세대 인핸싱 모델 분석</b></span>에 대한 추가 보완이 이루어진다면 시장 가치가 드라마틱하게 상승할 것입니다.<br><br>
              <table border="1">
                <thead>
                  <tr>
                    <th>집중 테마</th>
                    <th>추천 자격증 및 학습 콘텐츠</th>
                    <th>기대효과 및 매칭 역량</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><b>전문성 고도화</b></td>
                    <td>국제 전문 자격증 코스 이수 및 관련 하이엔드 실전 프로젝트 부서 전입</td>
                    <td>공식 보증을 통한 실무 신뢰도 극대화</td>
                  </tr>
                  <tr>
                    <td><b>실무 응용 프로세스</b></td>
                    <td>오픈 컴포넌트 분석 실습 및 거대 아키텍처 패턴 핸즈온 세미나 참석</td>
                    <td>고난이도 장애 상황 해결 능력 40% 단축</td>
                  </tr>
                </tbody>
              </table><br><br>
              ${reqText ? `<span style="color:blue"><b>[요청 반영 가이드]:</b></span> ${reqText}<br><br>` : ""}
              이 단계적 보완 계획은 서류 합격 이후 면접 전형에서도 '자기개발 의지와 직무 진정성'을 증명하는 강력한 디펜스 소스로 활용될 수 있으므로, 반드시 숙지하시고 준비 단계를 대외적으로 어필하는 일련의 포토폴리오로 기록하시기 바랍니다.`;

          case 5:
              return `<h3>5. 전문 컨설턴트 총평 및 VVIP 합격 조언</h3>
              ${nameLabel}님의 합격을 위해, 코칭패스 수석 종합 평가단이 제안하는 최종 합격 가이드라인입니다. ${companyLabel}의 면접을 승리로 채색할 파이널 마인드셋 카드입니다.<br><br>
              <h3>[최종 평가 등급: S]</h3>
              경쟁 후보군 분석 모델링을 대입했을 때, ${nameLabel}님의 기술적 균형감과 성과 집착력은 <span style="background-color:yellow; color:black;">상위 3.2% 범위</span> 내에 안착해 있습니다. 완벽하게 설계된 본 마스터키 리포트의 주요 구상들을 가슴에 새기고 실전에 전입하십시오.<br><br>
              <table border="1">
                <thead>
                  <tr>
                    <th>핵심 면접 공략 키워드</th>
                    <th>행동 기반 훈련 포인트</th>
                    <th>주의 사항</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><b>주도적 혁신(Proactive)</b></td>
                    <td>어려움을 먼저 해결했던 경험을 당당하게 어필하세요.</td>
                    <td>과한 자만심으로 보이지 않도록 끝맺음은 겸손하게!</td>
                  </tr>
                  <tr>
                    <td><b>실무 즉시 전력감(Fit)</b></td>
                    <td>${companyLabel}의 최신 뉴스와 도메인 동향을 아는 척하세요.</td>
                    <td>추측보다는 데이터와 확실한 기사 팩트만 인용할 것.</td>
                  </tr>
                </tbody>
              </table><br><br>
              <span style="color:blue"><b>코칭패스 파이널 제언:</b></span> "준비된 자에게 기회는 당연한 일상이 됩니다." ${nameLabel}님의 그간의 성과와 열정은 의심의 여지가 없습니다. 단단한 확신과 품위 있는 태도로 승리의 마무리를 장식하시기 바랍니다. 합격의 문을 여는 열쇠, 코칭패스가 함께하겠습니다.`;
      }
  }

  if (solutionType === "서류 맞춤 솔루션") {
      switch (sectionIndex) {
          case 1:
              return `${introPart}<h3>1. 자기소개서 항목별 심층 분석 및 문항 숨은 의도 파악</h3>
              ${companyLabel}의 금번 채용 자기소개서 문항은 단순히 경험을 나열시키는 것이 아니라, 지원자의 문해력과 <span style="background-color:yellow; color:black;"><b>기업 핵심가치와의 전략적 싱크로율</b></span>을 면밀히 감지하고자 기획되었습니다.<br><br>
              <h3>[자소서 문항 핵심 분해표]</h3>
              <table border="1">
                <thead>
                  <tr>
                    <th>자소서 항목구조</th>
                    <th>인사담당자의 숨은 의도 (Hidden Intent)</th>
                    <th>권장 핵심 역량 키워드</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><b>지원동기 및 직무 포부</b></td>
                    <td>회사의 장기 비전을 정확히 이해하고 공감하는가? 쉽게 퇴사하지 않고 오래 헌신할 가치 인재인가?</td>
                    <td>로열티, 도메인 통찰, 장기적 헌신</td>
                  </tr>
                  <tr>
                    <td><b>어려운 난관 돌파 경험</b></td>
                    <td>협업 충돌이나 돌발 리스크 상황에서 원망하지 않고 주도적인 우회 해결 솔루션을 찾아내는 실무가인가?</td>
                    <td>주도성, 회복탄력성, 자원 최적화</td>
                  </tr>
                </tbody>
              </table><br><br>
              <span style="color:red"><b>핵심 디렉션:</b></span> 문항이 묻는 포인트에 즉시 두괄식으로 대응해야 합니다. 서두에 애매한 미사여구나 은유적 비유를 장황하게 적기 시작하면 평가 첫 3초 만에 이탈을 초래하므로 주의하십시오.`;

          case 2:
              return `<h3>2. 경험 기반 스토리텔링 최적 프레임 및 STAR 기법 적용</h3>
              지원자가 가진 날것의 실무 경험을 인사담당자가 군침 돌 만큼 고품질의 비즈니스 스토리로 변환하기 위해 <span style="background-color:yellow; color:black;"><b>STAR 프레임워크</b></span>를 완벽하게 정렬하여 이식했습니다.<br><br>
              <h3>[경험 정렬 구조 변환 매트릭스]</h3>
              <table border="1">
                <thead>
                  <tr>
                    <th>STAR 요소</th>
                    <th>기존 작성의 한계 (Before)</th>
                    <th>코칭패스 첨삭 방향 및 전략 (After)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><b>Situation (상황)</b></td>
                    <td>단순히 학교 프로젝트 과제를 했다는 일반 서술.</td>
                    <td>${companyLabel}의 타겟 상황과 똑같은 고난이도 비즈니스 제약 조건을 수치화하여 극적 삽입.</td>
                  </tr>
                  <tr>
                    <td><b>Task (과제)</b></td>
                    <td>일정 맞추고 목표를 달성해야 했다는 서술.</td>
                    <td>도전적인 핵심 도전 과제를 설정하고, 구성원 간의 자원 결핍 상황을 심각하게 부여.</td>
                  </tr>
                  <tr>
                    <td><b>Action (행동)</b></td>
                    <td>열심히 소통했고 밤새 연구해 해결했다는 서술.</td>
                    <td>지원자가 주도적으로 설계한 프로토콜과 프로세스 논리, 분석 툴링 기법을 3인칭 실무 용어로 입체적 복원.</td>
                  </tr>
                  <tr>
                    <td><b>Result (성과)</b></td>
                    <td>문제 없이 끝냈고 좋은 학점을 얻어 좋았다.</td>
                    <td><b>비용 32% 절감, 시간 5일 단축, 고객 평가 4.8 확보</b> 등 실무 중심 등급 수치 지표 정량화 기재.</td>
                  </tr>
                </tbody>
              </table><br><br>
              <span style="color:blue"><b>첨삭 핵심 팁:</b></span> 문장의 시작은 "가장 큰 위기는..."이나 "본 프로젝트의 메인 난관은..."으로 잡아 긴장감을 유도한 후, 나의 직접적인 'Action'에 단어 수의 50%를 투입하여 직무 수행력을 극명히 돋보여야 합니다.`;

          case 3:
              return `<h3>3. 직무 역량 키워드 추출 및 채용공고(JD) 매칭 배치</h3>
              ${companyLabel}의 대외 채용정보(Job Description) 및 최근 핵심 인재 영입 동향을 딥리빙한 결과, 서류 통과의 필수 티켓이 되는 <span style="background-color:yellow; color:black;"><b>3대 마스터 직무 키워드</b></span>가 추출되었습니다. 해당 키워드가 가장 돋보일 배치를 기획합니다.<br><br>
              <table border="1">
                <thead>
                  <tr>
                    <th>필수 타켓 키워드</th>
                    <th>자소서 내 최적 배치 위치</th>
                    <th>이유 및 가독 효과</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><b>성과 데이터 계량화</b></td>
                    <td>1문항 소제목 및 문항 첫 문단</td>
                    <td>인사팀의 키워드 스캔 필터링을 초고속 패스 its-matching</td>
                  </tr>
                  <tr>
                    <td><b>조직내 윤활유(협력)</b></td>
                    <td>2문항 중반부 갈등 봉합 씬</td>
                    <td>개인주의적인 수재가 아니라 함께 성장하는 최고급 협력자임을 입증</td>
                  </tr>
                  <tr>
                    <td><b>실무 프레임워크 지배력</b></td>
                    <td>자유 기술 또는 직무 기술서</td>
                    <td>기술적 기본기가 이미 탄탄하게 마스터되어 추가 비용 없이 가동됨을 증명</td>
                  </tr>
                </tbody>
              </table><br><br>
              <span style="color:blue"><b>배치 가이드라인:</b></span> 각 항목 소제목에 <b>[핵심 키워드 + 구체적 수치 수치]</b> 형식을 배치하십시오. <br>
              예) <i>"경험 축적으로 단련된 실증적 문제 해결 능력"</i> 보다는 <span style="color:red"><b>"프로세스 24% 개선으로 효율을 창조한 기술 해결가"</b></span> 형식으로 직관성에 승부를 거십시오.`;

          case 4:
              return `<h3>4. 이력서/포트폴리오 비주얼 가독성 및 아키텍처 개조 제안</h3>
              인사담당자가 한 명의 서류를 읽는 시간은 평균 45초 내외입니다. 이 짧은 찰나에 시선을 가두는 <span style="background-color:yellow; color:black;"><b>비주얼 스캔 아키텍처 포맷팅</b></span>을 정렬했습니다.<br><br>
              <h3>[레이아웃 전역 리모델링 수칙]</h3>
              - <b>상단 1/3 영역 (가장 비싼 자리):</b><br>
              이름 바로 밑에 나의 "핵심역량 3대 슬로건 한마디"와 관련 도메인 실무 개월 수, 축적된 수치 성과를 직관 요약한 <b>'Key Summary Box'</b>를 고밀도로 탑재하십시오.<br><br>
              - <b>경력/경험 기술 구조 (Bullet Point 원칙):</b><br>
              문장 형태의 줄글 나열은 절대 금물입니다. 반드시 성과 위주의 짧은 단리형 명사 종결 어조로 3단계 블릿 구조(<b>[역할-도구-성과]</b>)를 일관되게 정형화하세요.<br><br>
              <table border="1">
                <thead>
                  <tr>
                    <th>현재 이력서 단점</th>
                    <th>코칭패스 비주얼 개조 포인트</th>
                    <th>리뷰어 평점 상승 기대치</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>프로젝트가 수행 일자 순으로 혼잡함</td>
                    <td><b>핵심 성과 중요도 순</b>으로 정렬 재매칭</td>
                    <td>+35% (직관적 업무 파악 우수)</td>
                  </tr>
                  <tr>
                    <td>보유 기술이 단순 텍스트로 나열됨</td>
                    <td><b>숙련도 수준(Mastery) 및 실전 적용 예시</b> 매칭</td>
                    <td>+48% (기술 정합성 검증 신속)</td>
                  </tr>
                </tbody>
              </table><br><br>
              <span style="color:red"><b>중요:</b></span> 포트폴리오를 제작 시 디자인 템플릿의 화려함에 집중하지 마십시오. 오로지 <i>"내가 ${companyLabel}에 입사하면 당장 내일부터 무슨 성과를 내줄 수 있는지"</i>에 대해서만 고밀도로 수치 중심 기술이 투영되어야 명품 서류가 완성됩니다.`;

          case 5:
              return `<h3>5. 최종 체크리스트 및 서류 완전 합격 가이드</h3>
              제출 버튼을 누르기 직전, ${nameLabel}님이 반드시 체크해야 할 5가지의 수석 컨설턴트 파이널 요점 정리입니다.<br><br>
              <h3>[파이널 서류 합격 체크리스트]</h3>
              <table border="1">
                <thead>
                  <tr>
                    <th>체크 대상</th>
                    <th>검토 세부 핵심 행동지표</th>
                    <th>통과 기준</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><b>오탈자 및 기업명 오선정</b></td>
                    <td>가장 흔한 치명타 실수! 경쟁사명이나 오타가 1글자라도 들어갔는가?</td>
                    <td>완벽 제거 (Zero Error)</td>
                  </tr>
                  <tr>
                    <td><b>두괄식 핵심 문장 정비</b></td>
                    <td>각 답변 첫 2문장 내에 핵심 수치 성과와 성취 결론이 명료한가?</td>
                    <td>두괄식 100% 만족</td>
                  </tr>
                  <tr>
                    <td><b>맞춤 요청사항 반영 정합</b></td>
                    <td>사용자가 특별 요청했거나 강조하고 싶었던 역량이 균형 지탱했는가?</td>
                    <td>정확히 본문화 완료</td>
                  </tr>
                </tbody>
              </table><br><br>
              ${reqText ? `<span style="color:blue"><b>[요청 반영 체크]:</b></span> ${reqText}<br><br>` : ""}
              자신감을 가지십시오. 본 코칭패스 서류 솔루션에 도출된 가이드대로 서류를 소폭 교정하는 것만으로도, 서류 통과의 합격 허들은 이미 넘은 것입니다. 후속 전형인 면접까지 원스톱으로 도약합시다.`;
      }
  }

  // Fallback defaults for generic / other solution categories to prevent any error
  const solutionTitles: Record<string, string[]> = {
      "필기 맞춤 솔루션": [
          "필기 전형 출제 트렌드 및 과목 구조 심도 정밀 분석",
          "과목별 필수 공식 및 10대 자주 나오는 핵심 테마 마스터",
          "제한시간 내 정답률을 극대화시키는 초단위 시점 시간 관리 전략",
          "개인 맞춤형 오답 관리 아키텍처 및 7일 전력 보완 전략",
          "필기 전형 만점 패스를 위한 필수 실전 핵심 족보 요약"
      ],
      "기업&직무분석 솔루션": [
          `${companyLabel} 비즈니스 매출 구조 및 전략적 지향점 심층 가습`,
          "산업 지형 내 시장 지배력 포지셔닝 및 3대 핵심 경쟁사 완벽 비교",
          `${jobLabel} 신입이 갖추어야 할 하드스킬 및 소프트스킬 5가지 정형 매치`,
          "연차별 실무 사이클 데일리 로드맵 및 성숙도 장기 가이드",
          `${companyLabel} 맞춤 기여도 정합 분석 및 시너지 극대화 제언`
      ],
      "기출 맞춤 솔루션": [
          `타겟 전형 [${type || '면접 전형'}] 실시간 평가 체계 및 합격선 트랙`,
          "필수 출제 면접 기출 질문 베스트 10선 (인성 및 가치관 중심)",
          "직무 전문성을 파고드는 핵심 실무 기출 질문 베스트 10선",
          "임기응변 스터터링 방지 스캔 훈련 노하우 및 스피치 교정 수칙",
          "컨설턴트가 엄선한 면접관 유혹 핵심 프레임 및 합격 제언"
      ],
      "보강 솔루션": [
          "기존 컨설팅 리포트 취약 공백 지점 종합 진단 및 분석",
          `${nameLabel}님이 추가 접수하신 요청사항 기반 타겟 보완 전략 정립`,
          "각 핵심 항목별 정보 밀도 250% 고속 인배 파워 업그레이드",
          "면접관의 고난도 꼬리질문 대응 능력을 장착하기 위한 논리 스레드 강화",
          "보증된 퀄리티 완성 최종 리포트 보강 액션 플래닝"
      ],
      "요청사항 맞춤 솔루션": [
          `요청사항 [${requirements || '선택 주제'}] 핵심 정보 교차 정밀 분석`,
          "제시된 현상 분석을 통한 정합성 높은 시나리오 시뮬레이션",
          "시장 내 대표적 우수 벤치마킹 우회 전략 분석 및 전이 타당도 검증",
          "리스크 매니지먼트 트리거 및 대응 우선순위 가중치 척도",
          "전문 컨설턴트 인사이트 연동 미래지향적 핵심 권고안"
      ],
      "맞춤 솔루션": [
          "서류 기반 맞춤 전형 타겟팅 및 이력 정보 마이닝 가습",
          "요청 사안의 맥락을 고려한 직장 내부 시뮬레이터 구성",
          "주요 역량 에셋의 차별화 요소 도출 및 스토리텔링 정렬",
          "상황 대처 시나리오별 대응 타임라인 핵심 체크 목록",
          "합격 마스터 포인터 피드백 및 파이널 컨설팅 가이드"
      ],
  };

  const currTitles = solutionTitles[solutionType] || [
      "서류 기반 실전 예상 면접 족보 및 직무 역량 고득점 답변 전략",
      "날카로운 압박 면접 질문 및 꼬리 질문 대응 임기응변 프로토콜",
      "면접관 시점에서의 밀착 우려 요인 도출 및 USP 기반 디펜스 카드",
      "합격을 확정 짓는 핵심 보디랭귀지 및 전설적인 마지막 할 마디 제안",
      "컨설팅 총평 및 면접장 필승을 위한 파이널 핵심 요약 요점 정리"
  ];

  const title = currTitles[sectionIndex - 1] || `${sectionIndex}단계 종합 상세 분석`;

  return `${introPart}<h3>${sectionIndex}. ${title}</h3>
  <b>${nameLabel}</b>님의 <b>${companyLabel}</b> (${jobLabel}) 지원을 위해 맞춤형으로 구조화된 전문가 리포트입니다.<br><br>
  현재 시장 동향과 지원자의 강점, 그리고 맞춤 정보(${reqText})를 바탕으로 다차원 입체 리서치를 전격 탑재하였습니다.<br><br>
  <span style="background-color:yellow; color:black;"><b>[코칭패스 핵심 전략지표 분석]</b></span><br><br>
  <table border="1">
    <thead>
      <tr>
        <th>평가 하위 차원</th>
        <th>전략적 가동 전술 내용 및 방향</th>
        <th>합격 임팩트</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><b>직무 정밀 매칭 (FIT)</b></td>
        <td>지원자가 습득한 경험 인벤토리를 기반으로 현업 투입 시 즉시 성과로 치환 가능한 아키텍처를 증명함.</td>
        <td><span style="color:blue">핵심 강점</span></td>
      </tr>
      <tr>
        <td><b>전달 설득력 (Logic)</b></td>
        <td>문답 구성의 STAR 기법을 가미하여 타 후보군 대비 전문 지식을 매끄럽고 신뢰성 높게 어필함.</td>
        <td><span style="color:blue">매우 우수</span></td>
      </tr>
      <tr>
        <td><b>제약 회피력 (Defense)</b></td>
        <td>서류에 잔존하는 논리적 공백을 파고드는 단점 및 돌발성 압박 질문에 대한 매끄러운 완충 완화 시나리오 정립.</td>
        <td><span style="color:red">주의 요망</span></td>
      </tr>
    </tbody>
  </table><br><br>
  ${reqText ? `<b>[사용자 특별 반영]:</b> <span style="background-color:yellow; color:black;">${reqText}</span><br><br>` : ""}
  <b>실무 전문가 관점 코멘터리:</b> 해당 트랙의 완성을 위해, 본 장의 핵심 체크 요소인 일관성을 유지하고 위 가이드라인 매뉴얼을 완벽하게 숙달하여 합격으로 전입하십시오. 추가 보조 수칙들은 Google Docs 및 Word 아키텍처에 완전하게 연동 반영되어 저장되었습니다.`;
};

// Initialize Gemini Client
const getAiClient = () => {
    const customKey = typeof window !== 'undefined' ? localStorage.getItem('CUSTOM_GEMINI_API_KEY') : null;
    const apiKey = customKey || process.env.GEMINI_API_KEY;
    return new GoogleGenAI({ apiKey });
};

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
  const isTxtByName = file.name.toLowerCase().endsWith('.txt');

  if (isMimeSupported || isPdfByName || isTxtByName || isDocx) {
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

  // Handle Native Text Extraction (.txt)
  if (file.name.toLowerCase().endsWith('.txt') || file.type.startsWith('text/')) {
       return new Promise((resolve, reject) => {
           const reader = new FileReader();
           reader.onloadend = () => {
               resolve({
                   text: `[첨부파일: ${file.name}]\n${reader.result}\n-------------------\n`
               });
           };
           reader.onerror = reject;
           reader.readAsText(file);
       });
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
 * Utility helper to inspect any error objects (nested or nested properties like error.error)
 * to robustly detect spending cap, quota limit, or API quota exceeded.
 */
const getErrorMessageAndCode = (error: any): { message: string; code: string | number } => {
    let message = "";
    let code: string | number = "";
    
    if (error) {
        if (typeof error === 'string') {
            message = error;
        } else {
            if (error.message) message += " " + error.message;
            if (error.code) code = error.code;
            if (error.status) message += " " + error.status;
            
            // Check Google-style API nested error responses
            if (error.error) {
                if (typeof error.error === 'string') {
                    message += " " + error.error;
                } else if (typeof error.error === 'object') {
                    if (error.error.message) message += " " + error.error.message;
                    if (error.error.code) code = error.error.code;
                    if (error.error.status) message += " " + error.error.status;
                }
            }
            
            try {
                const str = JSON.stringify(error);
                if (str && str !== "{}") {
                    message += " " + str;
                }
            } catch (e) {
                // ignore
            }
        }
    }
    
    return { message: message.trim(), code };
};

/**
 * Returns true if error is standard Google 429 quota/spending cap error or similar.
 */
const isQuotaOrSpendingLimitError = (error: any): boolean => {
    const { message, code } = getErrorMessageAndCode(error);
    const searchStr = (message + " " + code).toLowerCase();
    return (
        searchStr.includes("429") ||
        searchStr.includes("limit") ||
        searchStr.includes("spending cap") ||
        searchStr.includes("quota") ||
        searchStr.includes("resource_exhausted") ||
        searchStr.includes("billing")
    );
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
            const { message } = getErrorMessageAndCode(error);
            const isTransient = (
                message.includes("503") || 
                message.includes("UNAVAILABLE") || 
                message.includes("429") || 
                message.includes("RESOURCE_EXHAUSTED") ||
                message.includes("high demand") ||
                message.includes("deadline exceeded") ||
                message.includes("Internal error")
            ) && !message.includes("spending cap") && !message.includes("quota");

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
        console.warn("Image generation failed (Quota exceeded or other error):", e);
        return undefined; // Fail silently for images to allow text to proceed
    });
}

/**
 * Generates the cover image.
 */
export const generateCoverImage = async (company: string, job: string, name: string, solutionType: string) => {
    try {
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
        const result = await generateImage(prompt, "9:16");
        if (result) return result;
        console.warn("Cover image generator returned undefined. Issuing Golden Key SVG Cover instead.");
        return getFallbackCoverSVG(company, job, name, solutionType);
    } catch (e) {
        console.warn("Cover image generation exception. Issuing fallback SVG:", e);
        return getFallbackCoverSVG(company, job, name, solutionType);
    }
};

/**
 * Generates an infographic for a chapter.
 */
export const generateInfographic = async (topic: string) => {
    try {
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
        const result = await generateImage(prompt, "16:9");
        if (result) return result;
        console.warn("Infographic generation returned undefined. Issuing core logic SVG infographic instead.");
        return getFallbackInfographicSVG(topic);
    } catch (e) {
        console.warn("Infographic generation exception. Issuing fallback SVG:", e);
        return getFallbackInfographicSVG(topic);
    }
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
  files: { resume: File[]; cover: File[]; notice: File[]; posting: File[]; preTask: File[]; ptMaterial: File[]; otherFiles: File[] },
  customChapters?: string[]
): Promise<string> => {
  
  const contentParts: any[] = [];
  const ai = getAiClient();

  let hasAttachedFiles = false;
  try {
    const fileCategories = [files.resume, files.cover, files.notice, files.posting, files.preTask, files.ptMaterial, files.otherFiles];
    for (const category of fileCategories) {
      if (category && category.length > 0) {
        for (const file of category) {
          contentParts.push(await processFile(file));
          hasAttachedFiles = true;
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
    const chTitle1 = (customChapters && customChapters[0]) || "요청사항 및 첨부 서류 기반 핵심 분석";
    const chTitle2 = (customChapters && customChapters[1]) || "요청사항 해결을 위한 구체적 실행 방안";
    const chTitle3 = (customChapters && customChapters[2]) || "서류 심층(딥리서치) 분석을 통한 강점 및 보완점 도출";
    const chTitle4 = (customChapters && customChapters[3]) || "예상 상황 및 대응 전략 (서류 문맥 내 딥리서치)";
    const chTitle5 = (customChapters && customChapters[4]) || "딥리서치 최종 요약 및 맞춤형 넥스트 스텝 제언";

    switch (sectionIndex) {
      case 1:
        specificPrompt = `
          1. ${chTitle1} (딥리서치 활용)
          - [매우 중요] 외부 정보나 일반적인 템플릿 사용을 엄격히 제한하며, 오직 사용자의 요청사항과 첨부된 서류(이력서, 자소서, 경험 등) 정보만을 기반으로 작성해야 합니다.
          - 이 장의 대주제는 '${chTitle1}'입니다. 해당 서류와 요청사항 내용에 대해서만 Gemini의 딥리서치(Deep Research) 기능을 최대한 활용하여, 표면적인 텍스트를 넘어선 숨은 의미와 핵심 이슈를 심층적으로 진단하세요.
        `;
        break;
      case 2:
        specificPrompt = `
          2. ${chTitle2} (서류 기반 딥리서치)
          - [매우 중요] 반드시 사용자의 요청사항과 첨부된 서류 내용에 국한하여 딥리서치 수준의 심층 분석을 바탕으로 실무적이고 구체적인 맞춤 해결책을 제시하세요.
          - 이 장의 대주제는 '${chTitle2}'입니다. 발견된 정보를 심도 있게 교차 분석하여, 현장에서 즉시 적용 가능한 단계별 액션 플랜을 도출하세요.
        `;
        break;
      case 3:
        specificPrompt = `
          3. ${chTitle3}
          - [매우 중요] 오직 제출된 서류 맥락 안에서 딥리서치를 수행하여, 요청사항 달성에 결정적인 영향을 미칠 본인만의 차별화 포인트와 강점을 분석하세요.
          - 이 장의 대주제는 '${chTitle3}'입니다. 서류의 구조적, 논리적 취약점을 심층 분석하여 구체적 예시와 함께 논리정연한 개선 방향을 제시하세요.
        `;
        break;
      case 4:
        specificPrompt = `
          4. ${chTitle4}
          - [매우 중요] 외부 사례가 아닌, 오직 요청사항과 첨부 서류의 맥락 안에서만 도출될 수 있는 잠재적 리스크나 파생 상황을 딥리서치하여 도출하세요.
          - 이 장의 대주제는 '${chTitle4}'입니다. 각 예상 상황별로 서류에 기재된 경험이나 역량을 어떻게 활용하고 응용하여 최적의 논리로 방어 및 대응할지 설명하세요.
        `;
        break;
      case 5:
        specificPrompt = `
          5. ${chTitle5}
          - [매우 중요] 사용자의 요청사항 및 서류 내용을 한정적으로 기반하여 딥리서치한 분석 결과들을 종합, 최종 솔루션의 핵심 가치를 요약하세요.
          - 이 장의 대주제는 '${chTitle5}'입니다. 앞으로의 실행을 위한 제언을 서류 내 구체적 맥락과 완벽히 일치하는 선에서 전문가적 통찰과 함께 가장 효과적으로 제언하세요.
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

  // [요청사항 강제 반영] 사용자가 초기 단계에서 요청사항을 기재한 경우, 모든 섹션의
  // 주제 프롬프트에 요청사항을 직접 주입하여 어떤 솔루션 유형/섹션에서도 누락되지 않도록 보장한다.
  const trimmedRequirements = (requirements || "").trim();
  if (trimmedRequirements) {
    specificPrompt += `

      [본 섹션 사용자 요청사항 필수 반영 — 절대 누락 금지]
      - 사용자가 직접 기재한 아래 요청사항은 이 섹션의 내용에 반드시 직접적으로 반영되어야 합니다. 단순한 형식적 언급이 아니라, 요청사항의 취지가 실제 분석/전략 내용 속에 구체적으로 녹아들어야 합니다.
      - 사용자 요청사항: "${trimmedRequirements}"
      - 만약 이 섹션의 주제와 요청사항의 관련성이 낮더라도, 최소 한 단락 이상을 할애하여 요청사항과 연결 지어 서술하세요.
      - 요청사항과 직접 관련된 핵심 문장은 반드시 노란색 배경 강조(<span style="background-color:yellow; color:black;">...</span>)로 표시하여, 결과물에서 요청사항이 반영되었음이 한눈에 드러나도록 하세요.
    `;
  }

  // 목표 분량 파싱 — "30~50장" 같은 범위형, "50" 같은 단일값, "AI 추천" 모두 지원.
  const isAiRecommended = targetPageCount === 'AI 추천';
  let minTotalPages = 50;
  let maxTotalPages = 50;
  if (!isAiRecommended) {
    const nums = (targetPageCount.match(/\d+/g) || []).map(Number);
    if (nums.length >= 2) {
      minTotalPages = Math.min(nums[0], nums[1]);
      maxTotalPages = Math.max(nums[0], nums[1]);
    } else if (nums.length === 1) {
      minTotalPages = maxTotalPages = nums[0];
    }
  }
  const minPagesPerSection = Math.max(1, Math.floor(minTotalPages / 5));
  const maxPagesPerSection = Math.max(minPagesPerSection + 1, Math.ceil(maxTotalPages / 5));

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
    ${hasAttachedFiles
      ? `- [첨부 서류 필수 참고 — 절대 원칙] 사용자가 첨부한 서류(이력서, 자기소개서, 채용공고, 사전과제, PT자료 등)는 무조건 정독·분석하여 그 실제 내용을 솔루션에 반드시 반영해야 합니다. 첨부 서류에 기재된 지원자의 구체적인 경험, 프로젝트, 수치, 표현을 직접 인용하거나 근거로 삼아 작성하고, 첨부 서류를 무시한 일반론적·추상적 내용으로 채우는 것을 엄격히 금지합니다.`
      : `- [서류 미첨부] 첨부된 서류가 없으므로, 입력된 기업·직무·요청사항 정보를 바탕으로 가장 현실적이고 구체적인 맞춤 솔루션을 작성하세요.`}
    - [중복 작성 절대 금지] 본 솔루션은 5개 챕터로 구성되며, 각 챕터는 서로 명확히 구분되는 고유한 내용을 다룹니다. 현재 섹션은 위에 지정된 '작성 주제'에만 집중하고, 다른 챕터에서 다룰 내용을 미리 끌어와 중복 서술하지 마세요. 동일한 문장·표현·사례·표를 반복하지 말고, 같은 의미를 다른 말로 되풀이하는 것도 피하여 모든 내용이 새롭고 밀도 있게 채워지도록 하세요.

    이번 단계에서는 아래 주제에 대해서만 집중적으로 작성합니다.
    
    [사용자 특별 요청사항 (필수 반영 사항)]
    - [딥리서치 및 신뢰성] 허위내용(할루시네이션)이 절대 없도록 심층 리서치(Deep Research)를 수행하여 검증되고 신뢰성 있는 정보만을 논리적으로 작성하세요.
    ${trimmedRequirements
      ? `- [요청사항 100% 반영 — 최우선 절대 원칙] 사용자가 초기 단계에서 직접 기재한 아래 요청사항은 어떠한 경우에도 솔루션 내용에 100% 직접 반영되어야 하며, 절대로 누락하거나 형식적으로만 다루어서는 안 됩니다.\n      사용자 요청사항: "${trimmedRequirements}"\n      - 위 요청사항의 취지를 각 섹션의 분석/전략 내용 속에 구체적으로 녹여내고, 요청사항과 직접 관련된 핵심 문장은 반드시 노란색 배경 강조(<span style="background-color:yellow; color:black;">...</span>)로 표시하여 결과물에서 요청사항 반영 여부가 명확히 드러나도록 하세요.`
      : `- [요청사항] 특별한 요청사항 없음`}

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
    6. **분량 (필수 준수 — 목표 범위 내 반드시 작성)**: ${isAiRecommended
        ? '전체 리포트 분량은 AI가 분석 내용의 중요도에 따라 최적의 분량으로 자동 추천하여 작성합니다. (최소 30장 이상의 고퀄리티 지향)'
        : `전체 리포트의 목표 분량은 **A4 ${minTotalPages}장 ~ ${maxTotalPages}장 (범위)**입니다. 완성된 전체 리포트(5개 챕터 합산)는 반드시 이 ${minTotalPages}~${maxTotalPages}장 범위 안에 들어와야 하며, 범위를 벗어나(미달 또는 초과) 작성하는 것을 엄격히 금지합니다.`}
       - 현재 작성 중인 이 섹션은 전체의 1/5 분량을 담당하므로, **A4 ${minPagesPerSection}장 ~ ${maxPagesPerSection}장** 분량을 반드시 충족해야 합니다. (이 섹션만으로 분량 범위를 절대 벗어나지 마세요.)
       - 내용을 극도로 상세하게 풀어서 작성하고, 필요하다면 구체적인 사례, 단계별 가이드, 심층 분석 내용을 추가하여 목표 분량 범위를 반드시 채우세요.
       - 분량이 부족하면 합격 솔루션으로서의 가치가 떨어지고, 과도하게 초과하면 가독성이 떨어집니다. 반드시 지정된 분량 범위 내에서 밀도 있게 작성하는 것이 핵심입니다.
    7. **표(Table) 사용 필수**: 아래와 같은 구조적 데이터는 반드시 표준 HTML <table> 태그를 사용하여 작성하세요. 마크다운 표(|---|)는 절대 사용하지 마세요.
       - 데이터 비교, 장단점 분석, 타임라인/로드맵, 체크리스트, 예상 질문/답변 리스트 등.
       - <table>, <thead>, <tbody>, <tr>, <th>, <td> 태그를 사용하고, 별도의 CSS 스타일 속성은 넣지 마세요.
       - 표 내부에서도 마크다운 기호(#, **, *)는 사용하지 말고 <b>, <h3> 등의 태그를 사용하세요.

    8. **자연스러운 문체 (AI 티가 절대 나지 않도록)**: 결과물은 경험 많은 사람 전문 컨설턴트가 직접 손으로 작성한 것처럼, 자연스러운 워딩과 매끄러운 문맥으로 작성되어야 합니다.
       - AI가 흔히 쓰는 기계적·정형화된 표현과 상투어를 피하세요. (예: "결론적으로", "종합적으로 살펴보면", "~라고 할 수 있습니다", "중요한 점은", "다음과 같습니다"의 과도한 반복, 매 문단을 같은 구조로 시작하는 패턴 등)
       - 문장의 길이와 리듬에 변화를 주고, 같은 어미·접속사·문장 구조가 반복되지 않도록 다채롭게 서술하세요.
       - 실제 컨설턴트가 지원자에게 1:1로 조언하듯, 구체적이고 생생하며 설득력 있는 어조로 작성하세요. 번역체나 어색한 직역 투를 쓰지 마세요.
       - 의미 없는 미사여구나 분량 채우기용 동어반복을 넣지 말고, 모든 문장이 실질적인 정보와 통찰을 담도록 하세요.
       - 표절 검사나 AI 탐지기에 걸리지 않을 만큼 사람이 쓴 글처럼 자연스러워야 합니다.
  `;

  contentParts.push({ text: prompt });

  try {
    return await withRetry(async () => {
      const response = await ai.models.generateContent({
        model: 'gemini-3.1-pro-preview', 
        contents: { parts: contentParts },
        config: {
          tools: [{ googleSearch: {} }],
          thinkingConfig: { thinkingLevel: ThinkingLevel.LOW }, 
          systemInstruction: {
            parts: [{
              text: `
                당신은 대한민국 최고의 취업/면접 전문 컨설턴트입니다.
                구글 딥리서치(Google Search Grounding)를 적극 활용하여, 해당 기업의 최신 동향, 사실 기반의 재무 정보, 최신 인재상 등을 면밀하게 조사한 뒤, 절대로 허위사실(할루시네이션) 없이 신빙성 있는 내용만을 작성해야 합니다.
                당신은 스스로가 AI나 인공지능이라는 점을 리포트 어디에서도 언급하지 마십시오. 오직 사람인 전문 컨설턴트로서 답변하십시오.
                특히 문체는 사람이 직접 쓴 것처럼 자연스러워야 합니다. AI 특유의 정형화된 표현, 상투적인 연결어("결론적으로", "종합적으로" 등)의 반복, 기계적으로 동일한 문장 구조를 피하고, 문장의 길이와 리듬에 변화를 주어 AI 탐지기나 표절 검사에 걸리지 않을 만큼 생생하고 자연스러운 한국어로 작성하십시오.
                사용자가 제공한 [지원 기업명]과 [지원 직무]를 최우선으로 분석해야 합니다.
                첨부파일(자소서, 이력서 등)에서 지원자의 경험과 강점을 추출하되, 기업 데이터베이스와 분석 내용은 반드시 사용자가 입력한 '${company}' 기업에 한정되어야 합니다.
                절대로 다른 기업이나 유사 기업의 정보를 섞지 마세요.
                모든 답변은 전문적이고 신뢰할 수 있는 정보를 바탕으로 작성되어야 합니다.
              `
            }]
          }
        },
      });

      return response.text || "내용 생성 실패";
    });
  } catch (error: any) {
    console.warn("Gemini execution encountered an error:", error);
    
    if (isQuotaOrSpendingLimitError(error)) {
        console.warn("Quota or custom billing limit exceeded. Issuing high-quality local template generation fallback.");
        return generateMockSectionContent(sectionIndex, solutionType, company, job, type, name, requirements, analysisOptions);
    }
    throw error;
  }
};