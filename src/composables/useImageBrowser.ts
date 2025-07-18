import { ref, computed, nextTick } from 'vue'
import type { ImageFile, DirectoryInfo, ViewMode } from '@/types'
import { processDroppedFiles, generateDirectoryInfo, createImageFile } from '@/utils/fileUtils'

export function useImageBrowser() {
  const images = ref<ImageFile[]>([])
  const selectedImage = ref<ImageFile | null>(null)
  const isLoading = ref(false)
  const dragOver = ref(false)
  
  const viewMode = ref<ViewMode>({
    type: 'grid',
    gridSize: 'medium'
  })

  // 目录信息
  const directories = computed<DirectoryInfo[]>(() => {
    return generateDirectoryInfo(images.value)
  })

  // 图片总数
  const totalImages = computed(() => images.value.length)

  // 当前选中图片的索引
  const selectedImageIndex = computed(() => {
    if (!selectedImage.value) return -1
    return images.value.findIndex(img => img.path === selectedImage.value?.path)
  })

  // 是否有上一张图片
  const hasPrevious = computed(() => selectedImageIndex.value > 0)

  // 是否有下一张图片
  const hasNext = computed(() => selectedImageIndex.value < images.value.length - 1)

  // 处理文件拖拽
  async function handleDrop(event: DragEvent) {
    event.preventDefault()
    dragOver.value = false
    
    if (!event.dataTransfer?.items) return

    isLoading.value = true
    
    try {
      const newImages = await processDroppedFiles(event.dataTransfer.items)
      images.value = [...images.value, ...newImages]
      
      // 不自动选择图片，让用户主动点击查看
    } catch (error) {
      console.error('处理拖拽文件时出错:', error)
    } finally {
      isLoading.value = false
    }
  }

  // 处理文件选择（通过文件输入）
  function handleFileSelect(files: FileList) {
    isLoading.value = true
    
    const newImages: ImageFile[] = []
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      if (file.type.startsWith('image/')) {
        // 使用webkitRelativePath获取完整的相对路径，如果没有则使用文件名
        const fullPath = file.webkitRelativePath || file.name
        newImages.push(createImageFile(file, fullPath))
      }
    }
    
    images.value = [...images.value, ...newImages]
    
    // 不自动选择图片，让用户主动点击查看
    
    isLoading.value = false
  }

  // 拖拽相关事件处理
  function handleDragOver(event: DragEvent) {
    event.preventDefault()
    dragOver.value = true
  }

  function handleDragLeave(event: DragEvent) {
    event.preventDefault()
    // 只有当鼠标离开整个拖拽区域时才设置为false
    if (!event.relatedTarget || !(event.currentTarget as Element).contains(event.relatedTarget as Node)) {
      dragOver.value = false
    }
  }

  // 选择图片
  function selectImage(image: ImageFile) {
    selectedImage.value = image
  }

  // 切换到上一张图片
  function previousImage() {
    if (hasPrevious.value) {
      selectedImage.value = images.value[selectedImageIndex.value - 1]
    }
  }

  // 切换到下一张图片
  function nextImage() {
    if (hasNext.value) {
      selectedImage.value = images.value[selectedImageIndex.value + 1]
    }
  }

  // 清除所有图片
  function clearImages() {
    // 释放Object URLs以防止内存泄漏
    images.value.forEach(image => {
      URL.revokeObjectURL(image.url)
    })
    
    images.value = []
    selectedImage.value = null
  }

  // 删除指定图片
  function removeImage(imageToRemove: ImageFile) {
    URL.revokeObjectURL(imageToRemove.url)
    
    const index = images.value.findIndex(img => img.path === imageToRemove.path)
    images.value.splice(index, 1)
    
    // 如果删除的是当前选中的图片，选择下一张或上一张
    if (selectedImage.value?.path === imageToRemove.path) {
      if (images.value.length > 0) {
        const newIndex = Math.min(index, images.value.length - 1)
        selectedImage.value = images.value[newIndex]
      } else {
        selectedImage.value = null
      }
    }
  }

  // 更改视图模式
  function setViewMode(mode: ViewMode) {
    viewMode.value = mode
  }

  // 键盘导航
  function handleKeyNavigation(event: KeyboardEvent) {
    switch (event.key) {
      case 'ArrowLeft':
        event.preventDefault()
        previousImage()
        break
      case 'ArrowRight':
        event.preventDefault()
        nextImage()
        break
      case 'Escape':
        selectedImage.value = null
        break
    }
  }

  return {
    images,
    selectedImage,
    isLoading,
    dragOver,
    viewMode,
    directories,
    totalImages,
    selectedImageIndex,
    hasPrevious,
    hasNext,
    handleDrop,
    handleFileSelect,
    handleDragOver,
    handleDragLeave,
    selectImage,
    previousImage,
    nextImage,
    clearImages,
    removeImage,
    setViewMode,
    handleKeyNavigation
  }
} 