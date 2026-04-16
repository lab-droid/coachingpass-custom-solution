import { GeneratedContent, UserInputData } from "../types";

export const downloadAsWord = (content: GeneratedContent, userData: UserInputData) => {
  const filename = `코칭패스 ${userData.solutionType}_${userData.companyName}_${userData.jobTitle}_${userData.studentName}`;
  
  // HTML-based Word Export Structure
  const header = `
    <html xmlns:o='urn:schemas-microsoft-com:office:office' 
          xmlns:w='urn:schemas-microsoft-com:office:word' 
          xmlns='http://www.w3.org/TR/REC-html40'>
    <head>
      <meta charset='utf-8'>
      <title>${filename}</title>
      <style>
        /* Word Specific Page Layout */
        @page {
            size: A4;
            margin: 1.0in;
        }
        @page CoverPage {
            size: A4;
            margin: 0; /* No margin for cover to allow full bleed image */
        }
        div.CoverPage {
            page: CoverPage;
            width: 100%;
            height: 100%;
        }
        
        body { font-family: 'Malgun Gothic', 'Dotum', sans-serif; line-height: 1.6; color: #000; }
        
        /* Content Body Styles */
        .section-break { page-break-before: always; }
        
        /* Main Title Style */
        h1 { font-size: 20pt; font-weight: bold; color: #d4af37; border-bottom: 2px solid #000; padding-bottom: 10px; margin-top: 40px; margin-bottom: 20px; }
        
        /* Subheading Style (Blue as requested) */
        h3 { font-size: 13pt; font-weight: bold; color: #1e40af; margin-top: 20px; margin-bottom: 5px; }
        
        p { margin-bottom: 10px; font-size: 11pt; text-align: justify; }
        
        /* Red Emphasis Style */
        .highlight-red { color: #dc2626; font-weight: bold; }
        
        .infographic {
            width: 100%;
            max-width: 6.5in; /* Standard A4 width minus margins */
            height: auto;
            margin-bottom: 20px;
            border: 1px solid #ddd;
        }

        .cover-img {
            width: 100%;
            max-width: 100%;
            height: auto;
            display: block;
            margin: 0 auto;
        }

        .footer-notice {
            margin-top: 100px;
            text-align: center;
            font-size: 10pt;
            color: #666;
            border-top: 1px solid #ccc;
            padding-top: 20px;
        }

        /* Table Styles */
        table {
            border-collapse: collapse;
            width: 100%;
            margin: 20px 0;
            border: 1px solid #000;
        }
        th {
            background-color: #f3f4f6;
            font-weight: bold;
            text-align: center;
            border: 1px solid #000;
            padding: 8px;
            font-size: 10pt;
        }
        td {
            border: 1px solid #000;
            padding: 8px;
            vertical-align: top;
            font-size: 10pt;
        }
      </style>
    </head>
    <body>
  `;

  // Cover Page with Image
  let coverPage = '';
  if (content.coverImage) {
      coverPage = `
        <div class="CoverPage">
            <img src="data:image/png;base64,${content.coverImage}" class="cover-img" />
        </div>
        <br clear="all" style="page-break-before:always" />
      `;
  } else {
      // Fallback if image failed
      coverPage = `
        <div class="CoverPage" style="background:black; color:white; display:flex; flex-direction:column; justify-content:center; align-items:center; text-align:center; height:100vh;">
            <h1 style="color:gold; font-size:40pt;">Coaching Pass</h1>
            <h2>${userData.companyName} - ${userData.jobTitle}</h2>
            <h3>${userData.studentName}</h3>
        </div>
        <br clear="all" style="page-break-before:always" />
      `;
  }

  // Parse text to apply styles
  const formatText = (text: string) => {
      // 1. Split text by table blocks first to protect them from markdown stripping
      const parts = text.split(/(<table[\s\S]*?<\/table>)/gi);
      
      return parts.map(part => {
          if (part.toLowerCase().startsWith('<table')) {
              // Inside tables, only strip specific markdown markers that might break layout
              return part
                  .replace(/###/g, '')
                  .replace(/!!/g, '')
                  .replace(/\*\*/g, '')
                  .replace(/---/g, '');
          }

          // 2. For non-table parts, strip unwanted markdown characters
          let cleanedText = part
              .replace(/^- /gm, '• ') // Convert markdown list to bullet (MUST BE FIRST)
              .replace(/^\* /gm, '• ') // Convert markdown list to bullet (MUST BE FIRST)
              .replace(/###/g, '') // Remove old heading markers
              .replace(/!!/g, '')  // Remove old emphasis markers
              .replace(/\*\*/g, '') // Remove bold markers
              .replace(/#/g, '')    // Remove any other #
              .replace(/---/g, '')  // Remove horizontal rules
              .replace(/__/g, '')   // Remove underline/bold markers
              .replace(/\*/g, '')   // Remove any other *
              .replace(/`/g, '');    // Remove backticks

          // 3. Process as paragraphs and handle specific HTML tags
          const lines = cleanedText.split('\n');
          return lines.map(line => {
              let processedLine = line.trim();
              if (!processedLine) return ''; 

              // If the line is already wrapped in <h3>, don't wrap in <p>
              if (processedLine.startsWith('<h3>') && processedLine.endsWith('</h3>')) {
                  return processedLine;
              }

              return `<p>${processedLine}</p>`;
          }).join('');
      }).join('');
  };

  const getSectionHTML = (title: string, text: string, imageBase64?: string) => {
      let imgHTML = '';
      if (imageBase64) {
          imgHTML = `<img src="data:image/png;base64,${imageBase64}" class="infographic" alt="${title} Infographic" />`;
      }
      return `
        <h1>${title}</h1>
        ${imgHTML}
        ${formatText(text)}
      `;
  };

  const getChapterTitles = (type: string) => {
      if (type === "진로 맞춤 솔루션") {
          return [
              "Chapter 1. 직무 적성 및 역량 진단",
              "Chapter 2. 산업 트렌드 및 유망 직무",
              "Chapter 3. 커리어 로드맵 설계",
              "Chapter 4. 역량 강화 로드맵",
              "Chapter 5. 진로 성공 핵심 전략"
          ];
      } else if (type === "서류 맞춤 솔루션") {
          return [
              "Chapter 1. 자소서 문항 분석 및 의도 파악",
              "Chapter 2. STAR 기법 기반 스토리텔링",
              "Chapter 3. 직무 역량 키워드 배치",
              "Chapter 4. 이력서 시각화 및 구조 개선",
              "Chapter 5. 서류 합격 최종 보완 전략"
          ];
      } else if (type === "필기 맞춤 솔루션") {
          return [
              "Chapter 1. 필기 전형 유형 및 특징 분석",
              "Chapter 2. 핵심 개념 및 빈출 테마",
              "Chapter 3. 문제 풀이 및 시간 관리 스킬",
              "Chapter 4. 취약점 분석 및 보완 가이드",
              "Chapter 5. 필기 합격 실전 팁 요약"
          ];
      } else {
          return [
              "Chapter 1. 서류 기반 예상질문 & 답변",
              "Chapter 2. 임기응변 전략",
              "Chapter 3. 면접관의 시선 (Checklist)",
              "Chapter 4. 고득점 합격 노하우",
              "Chapter 5. 면접관의 합격 전략 피드백"
          ];
      }
  };

  const chapters = getChapterTitles(userData.solutionType);

  const bodyContent = `
    <div class="content-body">
      ${getSectionHTML(chapters[0], content.section1, content.section1Image)}
      
      <div class="section-break"></div>
      ${getSectionHTML(chapters[1], content.section2, content.section2Image)}
      
      <div class="section-break"></div>
      ${getSectionHTML(chapters[2], content.section3, content.section3Image)}
      
      <div class="section-break"></div>
      ${getSectionHTML(chapters[3], content.section4, content.section4Image)}
      
      <div class="section-break"></div>
      ${getSectionHTML(chapters[4], content.section5, content.section5Image)}
      
      <div class="footer-notice">
         <p>본 솔루션은 코칭패스 자체 AI를 활용해서 코칭패스의 코치진과 컨설턴트가 함께 제작한 솔루션입니다.</p>
         <p>사용된 모든 개인정보 및 서류 데이터는 솔루션 생성 즉시 시스템에서 영구 파기되었습니다.</p>
         <p>Copyright © Coaching Pass. All rights reserved.</p>
      </div>
    </div>
  `;

  const footer = "</body></html>";
  
  const sourceHTML = header + coverPage + bodyContent + footer;
  const source = 'data:application/vnd.ms-word;charset=utf-8,' + encodeURIComponent(sourceHTML);
  
  const fileDownload = document.createElement("a");
  document.body.appendChild(fileDownload);
  fileDownload.href = source;
  fileDownload.download = `${filename}.doc`;
  fileDownload.click();
  document.body.removeChild(fileDownload);
};