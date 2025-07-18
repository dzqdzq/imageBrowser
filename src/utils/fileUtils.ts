import type { ImageFile, DirectoryInfo } from '@/types'

// 支持的图片格式
export const SUPPORTED_IMAGE_FORMATS = [
  'jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp', 'ico', 'tiff', 'tif'
]

// 检查文件是否为图片
export function isImageFile(fileName: string): boolean {
  const extension = getFileExtension(fileName)
  return SUPPORTED_IMAGE_FORMATS.includes(extension)
}

// 获取文件扩展名
export function getFileExtension(fileName: string): string {
  return fileName.split('.').pop()?.toLowerCase() || ''
}

// 格式化文件大小
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B'
  
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// 格式化日期
export function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleString('zh-CN')
}

// 获取图片的原始尺寸
export function getImageDimensions(url: string): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      resolve({
        width: img.naturalWidth,
        height: img.naturalHeight
      })
    }
    img.onerror = () => {
      reject(new Error('Failed to load image'))
    }
    img.src = url
  })
}

// 从文件列表创建ImageFile对象
export function createImageFile(file: File, customPath?: string): ImageFile {
  return {
    name: file.name,
    path: customPath || file.webkitRelativePath || file.name,
    url: URL.createObjectURL(file),
    size: file.size,
    lastModified: file.lastModified,
    type: file.type,
    extension: getFileExtension(file.name)
  }
}

// 创建带有尺寸信息的ImageFile对象
export async function createImageFileWithDimensions(file: File, customPath?: string): Promise<ImageFile> {
  const imageFile = createImageFile(file, customPath)
  
  try {
    const dimensions = await getImageDimensions(imageFile.url)
    imageFile.width = dimensions.width
    imageFile.height = dimensions.height
  } catch (error) {
    console.warn(`Failed to get dimensions for ${imageFile.name}:`, error)
    // 尺寸获取失败时不设置width和height，保持undefined
  }
  
  return imageFile
}

// 处理拖拽的文件列表
export async function processDroppedFiles(items: DataTransferItemList): Promise<ImageFile[]> {
  const files: ImageFile[] = []
  const promises: Promise<void>[] = []

  for (let i = 0; i < items.length; i++) {
    const item = items[i]
    if (item.kind === 'file') {
      const entry = item.webkitGetAsEntry()
      if (entry) {
        promises.push(processEntry(entry, files, ''))
      }
    }
  }

  await Promise.all(promises)
  return files
}

// 递归处理目录条目
async function processEntry(entry: FileSystemEntry, files: ImageFile[], currentPath: string): Promise<void> {
  const fullPath = currentPath ? `${currentPath}/${entry.name}` : entry.name
  
  if (entry.isFile) {
    const fileEntry = entry as FileSystemFileEntry
    if (isImageFile(entry.name)) {
      const file = await getFileFromEntry(fileEntry)
      const imageFile = await createImageFileWithDimensions(file, fullPath)
      files.push(imageFile)
    }
  } else if (entry.isDirectory) {
    const dirEntry = entry as FileSystemDirectoryEntry
    const entries = await readDirectory(dirEntry)
    const promises = entries.map(subEntry => processEntry(subEntry, files, fullPath))
    await Promise.all(promises)
  }
}

// 从FileSystemFileEntry获取File对象
function getFileFromEntry(fileEntry: FileSystemFileEntry): Promise<File> {
  return new Promise((resolve, reject) => {
    fileEntry.file(resolve, reject)
  })
}

// 读取目录内容
function readDirectory(dirEntry: FileSystemDirectoryEntry): Promise<FileSystemEntry[]> {
  return new Promise((resolve, reject) => {
    const reader = dirEntry.createReader()
    const entries: FileSystemEntry[] = []
    
    function readEntries() {
      reader.readEntries((results) => {
        if (results.length === 0) {
          resolve(entries)
        } else {
          entries.push(...results)
          readEntries()
        }
      }, reject)
    }
    
    readEntries()
  })
}

// 生成目录信息
export function generateDirectoryInfo(images: ImageFile[]): DirectoryInfo[] {
  const directories = new Map<string, ImageFile[]>()
  
  images.forEach(image => {
    const dirPath = image.path.includes('/') 
      ? image.path.substring(0, image.path.lastIndexOf('/'))
      : '根目录'
    
    if (!directories.has(dirPath)) {
      directories.set(dirPath, [])
    }
    directories.get(dirPath)!.push(image)
  })
  
  return Array.from(directories.entries()).map(([path, images]) => ({
    name: path === '根目录' ? path : path.split('/').pop() || path,
    path,
    images,
    totalImages: images.length
  }))
} 