export interface UserInputData {
  solutionType: string;
  companyName: string;
  jobTitle: string;
  interviewType: string;
  studentName: string;
  requirements: string;
  referenceLinks: string;
  targetPageCount: string;
  analysisOptions: string;
  includeCoverImage: boolean;
  includeBodyImages: boolean;
  resumeFile: File | null;
  coverLetterFile: File | null;
  interviewNoticeFile: File | null;
  jobPostingFile: File | null;
  preTaskFile: File | null;
  ptMaterialFile: File | null;
  otherFiles: File[];
}

export enum ProcessStep {
  IDLE = 'IDLE',
  ANALYZING = 'ANALYZING', // Initial Setup
  WORKFLOW_1 = 'WORKFLOW_1', // Q&A Script
  WORKFLOW_2 = 'WORKFLOW_2', // Improvisation
  WORKFLOW_3 = 'WORKFLOW_3', // Interviewer's Perspective
  WORKFLOW_4 = 'WORKFLOW_4', // High Score Know-how
  WORKFLOW_5 = 'WORKFLOW_5', // Interviewer's Strategy Feedback
  GENERATING_IMAGES = 'GENERATING_IMAGES', // Visuals
  CREATING_DOC = 'CREATING_DOC', // Final Document Assembly
  COMPLETED = 'COMPLETED',
  ERROR = 'ERROR'
}

export enum TaskState {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED'
}

export interface TaskProgress {
  id: string;
  label: string;
  state: TaskState;
}

export interface GeneratedContent {
  section1: string;
  section2: string;
  section3: string;
  section4: string;
  section5: string;
  coverImage?: string; // Base64 data
  section1Image?: string;
  section2Image?: string;
  section3Image?: string;
  section4Image?: string;
  section5Image?: string;
}