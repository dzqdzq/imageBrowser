import { ref, computed, watch } from 'vue'

export function useImageViewer() {
  const scale = ref(1)
  const translateX = ref(0)
  const translateY = ref(0)
  const isDragging = ref(false)
  const dragStartX = ref(0)
  const dragStartY = ref(0)
  const dragStartTranslateX = ref(0)
  const dragStartTranslateY = ref(0)
  const fitMode = ref<'contain' | 'width' | 'height' | 'original'>('contain')
  
  // 缩放和平移的CSS变换
  const imageTransform = computed(() => {
    return `scale(${scale.value}) translate(${translateX.value}px, ${translateY.value}px)`
  })

  // 重置视图
  function resetView() {
    scale.value = 1
    translateX.value = 0
    translateY.value = 0
  }

  // 放大
  function zoomIn() {
    const newScale = Math.min(scale.value * 1.2, 5) // 最大5倍
    scale.value = newScale
  }

  // 缩小
  function zoomOut() {
    const newScale = Math.max(scale.value / 1.2, 0.1) // 最小0.1倍
    scale.value = newScale
    
    // 如果缩小到1倍以下，重置位置
    if (newScale <= 1) {
      translateX.value = 0
      translateY.value = 0
    }
  }

  // 适应窗口
  function fitToWindow() {
    scale.value = 1
    translateX.value = 0
    translateY.value = 0
    fitMode.value = 'contain'
  }

  // 适应宽度（对长图特别有用）
  function fitToWidth() {
    scale.value = 1
    translateX.value = 0
    translateY.value = 0
    fitMode.value = 'width'
  }

  // 适应高度
  function fitToHeight() {
    scale.value = 1
    translateX.value = 0
    translateY.value = 0
    fitMode.value = 'height'
  }

  // 原始尺寸
  function originalSize() {
    scale.value = 1
    translateX.value = 0
    translateY.value = 0
    fitMode.value = 'original'
  }

  // 切换适应模式
  function toggleFitMode() {
    const modes = ['contain', 'width', 'height', 'original'] as const
    const currentIndex = modes.indexOf(fitMode.value)
    const nextIndex = (currentIndex + 1) % modes.length
    
    fitMode.value = modes[nextIndex]
    scale.value = 1
    translateX.value = 0
    translateY.value = 0
  }

  // 鼠标滚轮缩放
  function handleWheel(event: WheelEvent) {
    event.preventDefault()
    
    if (event.deltaY < 0) {
      zoomIn()
    } else {
      zoomOut()
    }
  }

  // 开始拖拽
  function startDrag(event: MouseEvent) {
    if (scale.value <= 1) return // 只有放大时才允许拖拽
    
    isDragging.value = true
    dragStartX.value = event.clientX
    dragStartY.value = event.clientY
    dragStartTranslateX.value = translateX.value
    dragStartTranslateY.value = translateY.value
    
    document.addEventListener('mousemove', handleDrag)
    document.addEventListener('mouseup', endDrag)
  }

  // 拖拽中
  function handleDrag(event: MouseEvent) {
    if (!isDragging.value) return
    
    const deltaX = event.clientX - dragStartX.value
    const deltaY = event.clientY - dragStartY.value
    
    translateX.value = dragStartTranslateX.value + deltaX
    translateY.value = dragStartTranslateY.value + deltaY
  }

  // 结束拖拽
  function endDrag() {
    isDragging.value = false
    document.removeEventListener('mousemove', handleDrag)
    document.removeEventListener('mouseup', endDrag)
  }

  // 双击放大/还原
  function handleDoubleClick() {
    if (scale.value === 1) {
      scale.value = 2
    } else {
      resetView()
    }
  }

  // 监听缩放变化，自动调整位置边界
  watch(scale, (newScale) => {
    if (newScale <= 1) {
      translateX.value = 0
      translateY.value = 0
    }
  })

  return {
    scale,
    translateX,
    translateY,
    isDragging,
    fitMode,
    imageTransform,
    resetView,
    zoomIn,
    zoomOut,
    fitToWindow,
    fitToWidth,
    fitToHeight,
    originalSize,
    toggleFitMode,
    handleWheel,
    startDrag,
    handleDoubleClick
  }
} 