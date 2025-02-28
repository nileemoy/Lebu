// src/types/index.ts
export type ContentType = 'url' | 'text' | 'image' | 'video';
export type TruthCategory = 'high' | 'medium' | 'low';
export type Theme = 'light' | 'dark' | 'system';
export type Language = 'en' | 'es' | 'fr' | 'de' | 'zh';
export type ApiType = 'perplexity' | 'openai' | 'gemini';

export interface User {
  id: string;
  name: string;
  email: string;
  plan: 'free' | 'premium' | 'pro';
  createdAt?: string;
}

export interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  isAuthenticated: boolean;
}

export interface AuthContextType extends AuthState {
  signIn: (email: string, password: string) => Promise<User>;
  signUp: (email: string, password: string, name: string) => Promise<User>;
  signOut: () => void;
}

export interface Factor {
  name: string;
  score: number;
  icon?: React.ReactNode;
}

export interface BaseAnalysisResult {
  id?: string;
  type: ContentType;
  truthScore: number;
  timestamp: string;
  factors: Factor[];
}

export interface UrlAnalysisResult extends BaseAnalysisResult {
  type: 'url';
  url: string;
  title?: string;
  source?: string;
  credibility?: string;
  sourceReputation?: string;
  publishDate?: string;
  summary?: string;
}

export interface TextAnalysisResult extends BaseAnalysisResult {
  type: 'text';
  text: string;
  factualErrors?: number;
  misleadingClaims?: number;
  sentiment?: string;
  politicalBias?: string;
  summary?: string;
}

export interface ImageAnalysisResult extends BaseAnalysisResult {
  type: 'image';
  filename: string;
  manipulationDetected?: boolean;
  deepfakeConfidence?: number;
  manipulatedRegions?: string[];
  originalFound?: boolean;
  originalSource?: string;
  summary?: string;
}

export interface VideoAnalysisResult extends BaseAnalysisResult {
  type: 'video';
  filename: string;
  manipulationDetected?: boolean;
  deepfakeConfidence?: number;
  manipulatedElements?: string[];
  inconsistencies?: string[];
  summary?: string;
}

export type AnalysisResult = UrlAnalysisResult | TextAnalysisResult | ImageAnalysisResult | VideoAnalysisResult;

export interface AnalysisState {
  result: AnalysisResult | null;
  isLoading: boolean;
  error: string | null;
}

export interface AnalysisContextType extends AnalysisState {
  analyze: (type: ContentType, content: string | File) => Promise<AnalysisResult>;
  clearResult: () => void;
}

export interface HistoryState {
  historyItems: AnalysisResult[];
  isLoading: boolean;
  error: string | null;
}

export interface HistoryContextType extends HistoryState {
  addItem: (item: AnalysisResult) => void;
  removeItem: (itemId: string) => void;
  clearHistory: () => void;
}

export interface AppSettings {
  enableNotifications: boolean;
  autoAnalyzeLinks: boolean;
  saveHistory: boolean;
  theme: Theme;
  language: Language;
}

export interface ApiKeys {
  perplexity: string;
  openai: string;
  gemini: string;
}

export interface ContentInputProps {
  onAnalyze: (contentData: { type: ContentType; content: string | File; filename?: string; fileSize?: number; fileType?: string }) => void;
}

export interface AnalysisResultProps {
  result: AnalysisResult;
  onReset: () => void;
}

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'link';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  children: React.ReactNode;
}

export interface CardProps {
  title?: string;
  description?: string;
  footer?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
}

export interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
}

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
}

export interface TruthScoreProps {
  score: number;
}

export interface LayoutProps {
  children: React.ReactNode;
}