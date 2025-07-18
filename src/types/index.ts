export interface ImageFile {
  name: string
  path: string
  url: string
  size: number
  lastModified: number
  type: string
  extension: string
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