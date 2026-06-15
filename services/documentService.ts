import { GeneratedContent, UserInputData } from "../types";

// ---------------------------------------------------------------------------
// Shared helpers (used by Word download, Google Docs copy, and PDF export)
// ---------------------------------------------------------------------------

const getChapterTitles = (type: string): string[] => {
    if (type === "진로 맞춤 솔루션") {
        return [
            "제 1장. 직무 적성 및 역량 진단",
            "제 2장. 산업 트렌드 및 유망 직무",
            "제 3장. 커리어 로드맵 설계",
            "제 4장. 역량 강화 로드맵",
            "제 5장. 진로 성공 핵심 전략"
        ];
    } else if (type === "서류 맞춤 솔루션") {
        return [
            "제 1장. 자소서 문항 분석 및 의도 파악",
            "제 2장. STAR 기법 기반 스토리텔링",
            "제 3장. 직무 역량 키워드 배치",
            "제 4장. 이력서 시각화 및 구조 개선",
            "제 5장. 서류 합격 최종 보완 전략"
        ];
    } else if (type === "필기 맞춤 솔루션") {
        return [
            "제 1장. 필기 전형 유형 및 특징 분석",
            "제 2장. 핵심 개념 및 빈출 테마",
            "제 3장. 문제 풀이 및 시간 관리 스킬",
            "제 4장. 취약점 분석 및 보완 가이드",
            "제 5장. 필기 합격 실전 팁 요약"
        ];
    } else if (type === "기업&직무분석 솔루션") {
        return [
            "제 1장. 기업 핵심 가치 및 비즈니스 분석",
            "제 2장. 산업 내 위치 및 경쟁사 분석",
            "제 3장. 직무 핵심 역할 및 필요 역량 분석",
            "제 4장. 직무 실무 프로세스 및 커리어 패스",
            "제 5장. 기업-직무 적합성 종합 진단"
        ];
    } else if (type === "요청사항 맞춤 솔루션") {
        return [
            "제 1장. 요청사항 핵심 이슈 및 현황 분석",
            "제 2장. 요청사항 심층 분석 및 실행 가이드",
            "제 3장. 관련 분야 성공 사례 분석",
            "제 4장. 예상 리스크 및 대응 매뉴얼",
            "제 5장. 종합 결론 및 미래 제언"
        ];
    } else if (type === "기출 맞춤 솔루션") {
        return [
            "제 1장. 면접 유형별 특징 및 대비 전략",
            "제 2장. 빈출 핵심 기출 20선 (Part 1)",
            "제 3장. 빈출 핵심 기출 20선 (Part 2)",
            "제 4장. 기출 활용 노하우 및 실전 훈련법",
            "제 5장. 기출 기반 최종 합격 전략"
        ];
    } else if (type === "보강 솔루션") {
        return [
            "제 1장. 기존 솔루션 핵심 분석 및 취약점 도출",
            "제 2장. 요청사항 기반 정밀 보강 전략 수립",
            "제 3장. 콘텐츠 심층 강화 및 내용 확장",
            "제 4장. 실전 활용도 및 퀄리티 업그레이드",
            "제 5장. 보강 완료 및 최종 합격 로드맵"
        ];
    } else if (type === "맞춤 솔루션") {
        return [
            "제 1장. 맞춤솔루션 제작 1",
            "제 2장. 맞춤솔루션 제작 2",
            "제 3장. 맞춤솔루션 제작 3",
            "제 4장. 맞춤솔루션 제작 4",
            "제 5장. 맞춤솔루션 제작 5"
        ];
    } else {
        return [
            "제 1장. 서류 기반 예상질문 & 답변",
            "제 2장. 임기응변 전략",
            "제 3장. 면접관의 시선 (Checklist)",
            "제 4장. 고득점 합격 노하우",
            "제 5장. 면접관의 합격 전략 피드백"
        ];
    }
};

// Strip characters that break filenames / data URIs across OSes.
const sanitizeFilename = (name: string): string =>
    name.replace(/[\\/:*?"<>|]/g, '').replace(/\s+/g, ' ').trim() || '코칭패스 솔루션';

const toImageSrc = (data: string): string =>
    data.startsWith('data:') ? data : `data:image/png;base64,${data}`;

export const copyToGoogleDocs = async (content: GeneratedContent, userData: UserInputData) => {
    // Parse text to apply styles
    const formatText = (text: string) => {
        const parts = text.split(/(<table[\s\S]*?<\/table>)/gi);
        return parts.map(part => {
            if (part.toLowerCase().startsWith('<table')) {
                return part
                    .replace(/style="[^"]*"/gi, '') // reset preset styles
                    .replace(/<table/gi, '<table border="1" cellpadding="8" style="width:100%; border-collapse:collapse; margin:24px 0; border:1px solid #e5e7eb;"')
                    .replace(/<th/gi, '<th style="border:1px solid #e5e7eb; padding:12px; background-color:#f9fafb; font-weight:700; font-size:10pt; color: #374151;"')
                    .replace(/<td/gi, '<td style="border:1px solid #e5e7eb; padding:12px; font-size:9.5pt; line-height:1.6; color: #4b5563;"')
                    .replace(/###/g, '')
                    .replace(/!!/g, '')
                    .replace(/\*\*/g, '')
                    .replace(/---/g, '');
            }
            let cleanedText = part
                .replace(/^- /gm, '• ')
                .replace(/^\* /gm, '• ')
                .replace(/###/g, '')
                .replace(/!!/g, '')
                .replace(/\*\*/g, '')
                .replace(/#/g, '')
                .replace(/---/g, '')
                .replace(/__/g, '')
                .replace(/\*/g, '')
                .replace(/`/g, '');
            return cleanedText.split('\n').map(line => {
                let processedLine = line.trim();
                if (!processedLine) return '';
                if (processedLine.startsWith('<h3>') && processedLine.endsWith('</h3>')) {
                    return processedLine;
                }
                return `<p style="margin-bottom: 10px; font-size: 11pt; text-align: justify; line-height: 1.6;">${processedLine}</p>`;
            }).join('');
        }).join('');
    };

    const getSectionHTML = (title: string, text: string, imageBase64?: string) => {
        let imgHTML = '';
        if (imageBase64) {
            imgHTML = `<img src="${toImageSrc(imageBase64)}" style="width: 100%; max-width: 6.5in; height: auto; margin-bottom: 20px; border: 1px solid #ddd;" alt="${title} Infographic" />`;
        }
        return `
          <h1 style="font-size: 20pt; font-weight: bold; color: #d4af37; border-bottom: 2px solid #000; padding-bottom: 10px; margin-top: 40px; margin-bottom: 20px; page-break-after: avoid;">${title}</h1>
          ${imgHTML}
          ${formatText(text)}
        `;
    };

    const chapters = getChapterTitles(userData.solutionType);

    let coverHTML = '';
    if (content.coverImage) {
        coverHTML = `<div style="page-break-after: always;"><img src="${toImageSrc(content.coverImage)}" style="width: 100%; height: auto; max-width: 794px; display: block; margin: 0 auto;" alt="Cover" /></div>`;
    } else {
        coverHTML = `
            <div style="text-align: center; margin-bottom: 40px; background: #000; color: #fff; padding: 40px; page-break-after: always;">
                <h1 style="color: #d4af37; font-size: 36pt; margin-bottom: 10px;">${userData.solutionType}</h1>
                <h2 style="color: #fff; font-size: 24pt; margin-bottom: 10px;">${userData.companyName}, ${userData.jobTitle}</h2>
                ${userData.studentName ? `<h3 style="color: #d4af37; font-size: 20pt;">${userData.studentName}</h3>` : ""}
            </div>
        `;
    }

    let htmlContent = `
        <div style="font-family: 'Malgun Gothic', 'Dotum', sans-serif; color: #000;">
            ${coverHTML}
            ${getSectionHTML(chapters[0], content.section1, content.section1Image)}
            <div style="page-break-before: always;"></div>
            ${getSectionHTML(chapters[1], content.section2, content.section2Image)}
            <div style="page-break-before: always;"></div>
            ${getSectionHTML(chapters[2], content.section3, content.section3Image)}
            <div style="page-break-before: always;"></div>
            ${getSectionHTML(chapters[3], content.section4, content.section4Image)}
            <div style="page-break-before: always;"></div>
            ${getSectionHTML(chapters[4], content.section5, content.section5Image)}
        </div>
    `;

    // Create a plain text version
    const plainText = [
        `${userData.solutionType}`,
        `${userData.companyName}, ${userData.jobTitle}`,
        `${userData.studentName || ''}`,
        '',
        chapters[0],
        content.section1,
        '',
        chapters[1],
        content.section2,
        '',
        chapters[2],
        content.section3,
        '',
        chapters[3],
        content.section4,
        '',
        chapters[4],
        content.section5,
    ].join('\n').replace(/###/g, '').replace(/!!/g, '').replace(/\*\*/g, '').replace(/<[^>]+>/g, '');

    if (navigator.clipboard && window.ClipboardItem) {
        try {
            const htmlBlob = new Blob([htmlContent], { type: "text/html" });
            const textBlob = new Blob([plainText], { type: "text/plain" });
            await navigator.clipboard.write([
                new ClipboardItem({
                    "text/html": htmlBlob,
                    "text/plain": textBlob,
                })
            ]);
            alert("구글 Docs용 내용이 클립보드에 복사되었습니다. 새 Docs 문서를 열고(Ctrl+V) 붙여넣기 하세요.");
        } catch (err) {
            console.error("클립보드 복사 실패", err);
            alert("클립보드 복사에 실패했습니다.");
        }
    } else {
        alert("이 브라우저에서는 클립보드 복사를 지원하지 않습니다.");
    }
};

// ---------------------------------------------------------------------------
// Print-document HTML builder (shared by Word export and PDF export)
// ---------------------------------------------------------------------------

// Parse text to apply styles (class-based; used in <head> CSS documents)
const formatBodyText = (text: string) => {
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
            .replace(/^- /gm, '• ')
            .replace(/^\* /gm, '• ')
            .replace(/###/g, '')
            .replace(/!!/g, '')
            .replace(/\*\*/g, '')
            .replace(/#/g, '')
            .replace(/---/g, '')
            .replace(/__/g, '')
            .replace(/\*/g, '')
            .replace(/`/g, '');

        // 3. Process as paragraphs and handle specific HTML tags
        const lines = cleanedText.split('\n');
        return lines.map(line => {
            let processedLine = line.trim();
            if (!processedLine) return '';
            if (processedLine.startsWith('<h3>') && processedLine.endsWith('</h3>')) {
                return processedLine;
            }
            return `<p>${processedLine}</p>`;
        }).join('');
    }).join('');
};

const getBodySectionHTML = (title: string, text: string, imageBase64?: string) => {
    let imgHTML = '';
    if (imageBase64) {
        imgHTML = `<img src="${toImageSrc(imageBase64)}" class="infographic" alt="${title} Infographic" />`;
    }
    return `
      <h1>${title}</h1>
      ${imgHTML}
      ${formatBodyText(text)}
    `;
};

const buildCoverPage = (content: GeneratedContent, userData: UserInputData) => {
    if (content.coverImage) {
        return `
        <div class="CoverPage">
            <img src="${toImageSrc(content.coverImage)}" class="cover-img" />
        </div>
        <br clear="all" style="page-break-before:always" />
      `;
    }
    return `
        <div class="CoverPage" style="background:black; color:white;">
            <div style="width:100%;">
                <h1 style="color:gold; font-size:36pt; margin-bottom:10px;">${userData.solutionType}</h1>
                <h2 style="color:white; font-size:24pt; margin-bottom:10px;">${userData.companyName}, ${userData.jobTitle}</h2>
                ${userData.studentName ? `<h3 style="color:gold; font-size:20pt;">${userData.studentName}</h3>` : ""}
            </div>
        </div>
        <br clear="all" style="page-break-before:always" />
      `;
};

const buildBodyContent = (content: GeneratedContent, userData: UserInputData) => {
    const chapters = getChapterTitles(userData.solutionType);
    return `
    <div class="content-body">
      ${getBodySectionHTML(chapters[0], content.section1, content.section1Image)}

      <div class="section-break"></div>
      ${getBodySectionHTML(chapters[1], content.section2, content.section2Image)}

      <div class="section-break"></div>
      ${getBodySectionHTML(chapters[2], content.section3, content.section3Image)}

      <div class="section-break"></div>
      ${getBodySectionHTML(chapters[3], content.section4, content.section4Image)}

      <div class="section-break"></div>
      ${getBodySectionHTML(chapters[4], content.section5, content.section5Image)}

      <div class="footer-notice">
         <p>본 솔루션은 코칭패스의 전문성 있는 코치진과 컨설턴트가 함께 제작한 프리미엄 합격 솔루션입니다.</p>
         <p>사용된 모든 개인정보 및 서류 데이터는 솔루션 생성 즉시 시스템에서 영구 파기되었습니다.</p>
         <p>해당 솔루션의 모든 저작권은 합격의 열쇠 코칭패스에 있으며, 외부 유포를 금합니다.</p>
         <p>Copyright © 코칭패스. 모든 권리 보유.</p>
      </div>
    </div>
  `;
};

const PAGE_STYLES = `
        /* Page Layout */
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
            display: flex;
            justify-content: center;
            align-items: center;
            text-align: center;
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
`;

export const downloadAsWord = (content: GeneratedContent, userData: UserInputData) => {
  const filename = sanitizeFilename(`코칭패스 ${userData.solutionType}_${userData.companyName}_${userData.jobTitle}_${userData.studentName}`);

  // HTML-based Word Export Structure
  const header = `
    <html xmlns:o='urn:schemas-microsoft-com:office:office'
          xmlns:w='urn:schemas-microsoft-com:office:word'
          xmlns='http://www.w3.org/TR/REC-html40'>
    <head>
      <meta charset='utf-8'>
      <title>${filename}</title>
      <style>${PAGE_STYLES}</style>
    </head>
    <body>
  `;

  const coverPage = buildCoverPage(content, userData);
  const bodyContent = buildBodyContent(content, userData);
  const footer = "</body></html>";

  const sourceHTML = header + coverPage + bodyContent + footer;

  // Use a Blob (not a data: URI) so large documents with embedded base64
  // images are not truncated by URL length limits.
  const blob = new Blob(['﻿', sourceHTML], { type: 'application/msword' });
  const url = URL.createObjectURL(blob);

  const fileDownload = document.createElement("a");
  document.body.appendChild(fileDownload);
  fileDownload.href = url;
  fileDownload.download = `${filename}.doc`;
  fileDownload.click();
  document.body.removeChild(fileDownload);
  URL.revokeObjectURL(url);
};

// ---------------------------------------------------------------------------
// PDF export — opens a print-optimized window and triggers the browser's
// "Save as PDF". This handles Korean fonts, embedded images, page breaks and
// tables natively, with no extra dependency.
// ---------------------------------------------------------------------------
export const exportToPdf = (content: GeneratedContent, userData: UserInputData) => {
  const filename = sanitizeFilename(`코칭패스 ${userData.solutionType}_${userData.companyName}_${userData.jobTitle}_${userData.studentName}`);

  const coverPage = buildCoverPage(content, userData);
  const bodyContent = buildBodyContent(content, userData);

  const printHTML = `
    <!DOCTYPE html>
    <html lang="ko">
    <head>
      <meta charset="utf-8">
      <title>${filename}</title>
      <style>
        ${PAGE_STYLES}
        html, body { margin: 0; padding: 0; }
        /* Apply page margins to the flowing content (cover keeps full bleed). */
        .content-body { padding: 1in; }
        @media print {
          .content-body { padding: 0; }
        }
      </style>
    </head>
    <body>
      ${coverPage}
      ${bodyContent}
    </body>
    </html>
  `;

  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert('팝업이 차단되어 PDF 창을 열 수 없습니다. 브라우저의 팝업 차단을 해제한 후 다시 시도해 주세요.');
    return;
  }

  printWindow.document.open();
  printWindow.document.write(printHTML);
  printWindow.document.close();

  // Wait for embedded images to load before opening the print dialog so the
  // PDF is not generated with blank images.
  const triggerPrint = () => {
    printWindow.focus();
    printWindow.print();
  };

  const images = Array.from(printWindow.document.images);
  if (images.length === 0) {
    setTimeout(triggerPrint, 300);
    return;
  }

  let loaded = 0;
  let done = false;
  const checkDone = () => {
    loaded += 1;
    if (!done && loaded >= images.length) {
      done = true;
      setTimeout(triggerPrint, 200);
    }
  };
  images.forEach(img => {
    if (img.complete) {
      checkDone();
    } else {
      img.addEventListener('load', checkDone);
      img.addEventListener('error', checkDone);
    }
  });
  // Safety fallback in case some load events never fire.
  setTimeout(() => { if (!done) { done = true; triggerPrint(); } }, 3000);
};
