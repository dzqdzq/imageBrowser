export interface ImageFile {
  name: string
  path: string
  url: string
  size: number
  lastModified: number
  type: string
  extension: string
  width?: number  // 图片原始宽度
  height?: number // 图片原始高度
}

export interface DirectoryInfo {
  name: string
  path: string
  images: ImageFile[]
  totalImages: number
}

export interface SearchOptions {
  query: string
  includeFileName: boolean
  includeExtension: boolean
}

export interface ViewMode {
  type: 'grid' | 'list'
  gridSize: 'small' | 'medium' | 'large'
} 