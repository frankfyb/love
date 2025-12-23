// ============================================================================
// 1. 通用配置元数据类型定义
// ============================================================================

/**
 * 通用控件类型
 */
export type GenericControlType = 
  | 'select' 
  | 'select-input'
  | 'radio' 
  | 'switch' 
  | 'color' 
  | 'slider' 
  | 'input' 
  | 'textarea' 
  | 'file' 
  | 'list' 
  | 'sticker-grid'
  | 'sticker-picker'
  | 'multi-select'
  | 'readonly';

/**
 * 分类类型
 */
export type CategoryType = 'scene' | 'content' | 'visual' | 'physics' | 'gameplay' | 'base' | 'background' | 'audio' | 'decoration';

/**
 * 通用配置项元数据接口
 */
export interface GenericConfigItemMetadata<T> {
  /** 标签 */
  label: string;
  /** 控件类型 */
  type: GenericControlType;
  /** 选项（用于select, radio等） */
  options?: { label: string; value: string | number; icon?: React.ReactNode }[];
  /** 最小值（用于slider） */
  min?: number;
  /** 最大值（用于slider） */
  max?: number;
  /** 步长（用于slider） */
  step?: number;
  /** 占位符 */
  placeholder?: string;
  /** 分类 */
  category: CategoryType;
  /** 描述 */
  description?: string;
  /** 条件显示函数 */
  condition?: (config: T) => boolean;
}

/**
 * 工具配置元数据接口
 */
export interface ToolConfigMetadata<T> {
  /** 配置项结构 */
  configSchema: Record<keyof T, GenericConfigItemMetadata<T>>;
  /** PC端标签页 */
  tabs: { id: CategoryType; label: string; icon?: React.ReactNode }[];
  /** 移动端步骤 */
  mobileSteps?: { id: number; label: string; icon?: React.ReactNode; fields: (keyof T)[] }[];
  /** 面板标题 */
  panelTitle?: string;
  /** 面板副标题 */
  panelSubtitle?: string;
}