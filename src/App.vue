<template>
  <div id="app" class="app">
    <header class="app-header">
      <h1 class="app-title">📸 图片浏览器</h1>
      <div class="app-stats" v-if="totalImages > 0">
        <span>共 {{ totalImages }} 张图片</span>
        <span v-if="searchStats.isSearching">
          (筛选出 {{ searchStats.filtered }} 张)
        </span>
      </div>
    </header>

    <main class="app-main">
      <!-- 搜索栏 -->
      <div class="search-section" v-if="totalImages > 0">
        <div class="search-bar">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="搜索图片..."
            class="search-input"
          />
          <button
            v-if="searchQuery"
            @click="clearSearch"
            class="search-clear"
          >
            ✕
          </button>
        </div>
        
        <div class="view-controls">
          <select
            v-model="viewMode.type"
            class="view-select"
          >
            <option value="grid">网格视图</option>
            <option value="list">列表视图</option>
          </select>
          
          <select
            v-if="viewMode.type === 'grid'"
            v-model="viewMode.gridSize"
            class="size-select"
          >
            <option value="small">小图</option>
            <option value="medium">中图</option>
            <option value="large">大图</option>
          </select>
        </div>
      </div>

      <!-- 拖拽区域 -->
      <div
        v-if="totalImages === 0"
        class="drop-zone"
        :class="{ 'drag-over': dragOver }"
        @drop="handleDrop"
        @dragover="handleDragOver"
        @dragleave="handleDragLeave"
      >
        <div class="drop-zone-content">
          <div class="drop-icon">📁</div>
          <h2>拖拽文件夹到这里</h2>
          <p>支持包含图片的本地文件夹</p>
          <div class="supported-formats">
            <small>支持格式: JPG, PNG, GIF, WebP, SVG, BMP 等</small>
          </div>
          
          <div class="file-input-wrapper">
            <input
              type="file"
              id="file-input"
              multiple
              accept="image/*"
              webkitdirectory
              @change="handleFileInputChange"
              class="file-input"
            />
            <label for="file-input" class="file-input-label">
              或点击选择文件夹
            </label>
          </div>
        </div>
      </div>

      <!-- 图片展示区域 -->
      <div v-else class="image-display">
        <!-- 加载状态 -->
        <div v-if="isLoading" class="loading">
          <div class="loading-spinner"></div>
          <p>正在加载图片...</p>
        </div>

        <!-- 图片网格 -->
        <div
          v-if="viewMode.type === 'grid'"
          class="image-grid"
          :class="`grid-${viewMode.gridSize}`"
        >
          <div
            v-for="image in filteredImages"
            :key="image.path"
            class="image-card"
            :class="{ active: selectedImage?.path === image.path }"
            :title="image.path"
            @click="selectImage(image)"
          >
            <div class="image-wrapper">
              <img
                :src="image.url"
                :alt="image.name"
                class="image-thumbnail"
                loading="lazy"
              />
              <div class="image-overlay">
                <span class="image-name">{{ image.name }}</span>
                <span class="image-full-path">{{ image.path }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 图片列表 -->
        <div
          v-else
          class="image-list"
        >
          <div
            v-for="image in filteredImages"
            :key="image.path"
            class="image-list-item"
            :class="{ active: selectedImage?.path === image.path }"
            @click="selectImage(image)"
          >
            <img
              :src="image.url"
              :alt="image.name"
              class="list-thumbnail"
              loading="lazy"
            />
            <div class="image-info">
              <h3 class="image-name">{{ image.name }}</h3>
              <p class="image-details">
                {{ formatFileSize(image.size) }} • 
                {{ formatDate(image.lastModified) }}
              </p>
              <p class="image-path">
                <span class="path-label">路径：</span>{{ image.path }}
              </p>
            </div>
          </div>
        </div>

        <!-- 空状态 -->
        <div v-if="filteredImages.length === 0 && searchStats.isSearching" class="empty-state">
          <p>没有找到匹配的图片</p>
          <button @click="clearSearch" class="clear-search-btn">
            清除搜索
          </button>
        </div>
      </div>
    </main>

    <!-- 图片预览模态框 -->
    <div
      v-if="selectedImage"
      class="image-modal"
      @click="selectedImage = null"
      @keydown="handleKeyNavigation"
      tabindex="0"
    >
      <div class="modal-content" @click.stop>
        <button
          class="modal-close"
          @click="selectedImage = null"
        >
          ✕
        </button>
        
        <div class="modal-navigation">
          <button
            v-if="hasPrevious"
            @click="previousImage"
            class="nav-btn prev-btn"
          >
            ← 上一张
          </button>
          <button
            v-if="hasNext"
            @click="nextImage"
            class="nav-btn next-btn"
          >
            下一张 →
          </button>
        </div>

        <div class="modal-image-wrapper">
          <img
            :src="selectedImage.url"
            :alt="selectedImage.name"
            class="modal-image"
          />
        </div>

        <div class="modal-info">
          <h3>{{ selectedImage.name }}</h3>
          <p>{{ formatFileSize(selectedImage.size) }} • {{ formatDate(selectedImage.lastModified) }}</p>
          <p class="modal-path">
            <span class="path-label">路径：</span>{{ selectedImage.path }}
          </p>
        </div>
      </div>
    </div>

    <!-- 底部操作栏 -->
    <footer v-if="totalImages > 0" class="app-footer">
      <button @click="clearImages" class="clear-btn">
        清除所有图片
      </button>
      
      <div class="footer-stats">
        {{ selectedImageIndex + 1 }} / {{ totalImages }}
      </div>
      
      <div class="file-input-wrapper">
        <input
          type="file"
          id="add-file-input"
          multiple
          accept="image/*"
          webkitdirectory
          @change="handleFileInputChange"
          class="file-input"
        />
        <label for="add-file-input" class="add-files-btn">
          添加更多图片
        </label>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import { useImageBrowser } from '@/composables/useImageBrowser'
import { useSearch } from '@/composables/useSearch'
import { formatFileSize, formatDate } from '@/utils/fileUtils'

// 使用组合式函数
const {
  images,
  selectedImage,
  isLoading,
  dragOver,
  viewMode,
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
  handleKeyNavigation
} = useImageBrowser()

const {
  searchQuery,
  filteredImages,
  searchStats,
  clearSearch
} = useSearch(images)

// 处理文件输入变化
function handleFileInputChange(event: Event) {
  const target = event.target as HTMLInputElement
  if (target.files) {
    handleFileSelect(target.files)
    target.value = '' // 清除输入值以允许重复选择
  }
}

// 添加键盘事件监听
onMounted(() => {
  document.addEventListener('keydown', handleKeyNavigation)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeyNavigation)
  // 清理所有对象URL
  clearImages()
})
</script>

<style scoped>
/* 应用整体布局 */
.app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

/* 头部样式 */
.app-header {
  padding: 1rem 2rem;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 20px rgba(0, 0, 0, 0.1);
}

.app-title {
  margin: 0;
  font-size: 1.8rem;
  font-weight: 700;
  color: #2d3748;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.app-stats {
  display: flex;
  gap: 1rem;
  font-size: 0.9rem;
  color: #4a5568;
  font-weight: 500;
}

/* 主要内容区域 */
.app-main {
  flex: 1;
  padding: 2rem;
  overflow-y: auto;
}

/* 搜索区域 */
.search-section {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.search-bar {
  display: flex;
  align-items: center;
  position: relative;
  margin-bottom: 1rem;
}

.search-input {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  font-size: 1rem;
  background: #ffffff;
  transition: all 0.3s ease;
  outline: none;
}

.search-input:focus {
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.search-clear {
  position: absolute;
  right: 0.75rem;
  background: #f56565;
  color: white;
  border: none;
  border-radius: 50%;
  width: 1.5rem;
  height: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 0.8rem;
  transition: all 0.2s ease;
}

.search-clear:hover {
  background: #e53e3e;
  transform: scale(1.1);
}

.view-controls {
  display: flex;
  gap: 1rem;
}

.view-select,
.size-select {
  padding: 0.5rem 1rem;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  background: white;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.view-select:focus,
.size-select:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

/* 拖拽区域 */
.drop-zone {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border: 3px dashed #cbd5e0;
  border-radius: 24px;
  padding: 4rem 2rem;
  text-align: center;
  min-height: 400px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.drop-zone::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(45deg, transparent 30%, rgba(102, 126, 234, 0.05) 30%, rgba(102, 126, 234, 0.05) 70%, transparent 70%);
  background-size: 20px 20px;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.drop-zone.drag-over {
  border-color: #667eea;
  background: rgba(102, 126, 234, 0.05);
  transform: scale(1.02);
  box-shadow: 0 20px 60px rgba(102, 126, 234, 0.2);
}

.drop-zone.drag-over::before {
  opacity: 1;
}

.drop-zone-content {
  position: relative;
  z-index: 1;
}

.drop-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
  animation: bounce 2s infinite;
}

@keyframes bounce {
  0%, 20%, 50%, 80%, 100% {
    transform: translateY(0);
  }
  40% {
    transform: translateY(-10px);
  }
  60% {
    transform: translateY(-5px);
  }
}

.drop-zone h2 {
  margin: 0 0 0.5rem 0;
  font-size: 1.5rem;
  color: #2d3748;
  font-weight: 600;
}

.drop-zone p {
  margin: 0 0 1rem 0;
  color: #4a5568;
  font-size: 1.1rem;
}

.supported-formats {
  margin-bottom: 2rem;
}

.supported-formats small {
  color: #718096;
  background: rgba(113, 128, 150, 0.1);
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.8rem;
}

.file-input-wrapper {
  position: relative;
  display: inline-block;
}

.file-input {
  position: absolute;
  opacity: 0;
  width: 1px;
  height: 1px;
  overflow: hidden;
}

.file-input-label,
.add-files-btn {
  display: inline-block;
  padding: 0.75rem 1.5rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 12px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s ease;
  text-decoration: none;
  border: none;
  font-size: 0.9rem;
}

.file-input-label:hover,
.add-files-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 30px rgba(102, 126, 234, 0.3);
}

/* 图片展示区域 */
.image-display {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

/* 加载状态 */
.loading {
  text-align: center;
  padding: 2rem;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #e2e8f0;
  border-top: 4px solid #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* 图片网格 */
.image-grid {
  display: grid;
  gap: 1rem;
  margin-top: 1rem;
}

.grid-small {
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
}

.grid-medium {
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
}

.grid-large {
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
}

.image-card {
  position: relative;
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 2px solid transparent;
  background: white;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.image-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.15);
}

.image-card.active {
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.2);
}

.image-wrapper {
  position: relative;
  width: 100%;
  aspect-ratio: 1;
}

.image-thumbnail {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.image-card:hover .image-thumbnail {
  transform: scale(1.05);
}

.image-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.9));
  padding: 1.5rem 0.75rem 0.75rem;
  transform: translateY(100%);
  transition: transform 0.3s ease;
}

.image-card:hover .image-overlay {
  transform: translateY(0);
}

.image-name {
  color: white;
  font-size: 0.8rem;
  font-weight: 500;
  display: block;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-bottom: 0.25rem;
}

.image-full-path {
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.7rem;
  font-weight: 400;
  display: block;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* 图片列表 */
.image-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-top: 1rem;
}

.image-list-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: white;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 2px solid transparent;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.image-list-item:hover {
  transform: translateX(4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
}

.image-list-item.active {
  border-color: #667eea;
  background: rgba(102, 126, 234, 0.05);
}

.list-thumbnail {
  width: 60px;
  height: 60px;
  object-fit: cover;
  border-radius: 8px;
  flex-shrink: 0;
}

.image-info {
  flex: 1;
  min-width: 0;
}

.image-info .image-name {
  margin: 0 0 0.25rem 0;
  font-size: 1rem;
  font-weight: 600;
  color: #2d3748;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.image-details {
  margin: 0 0 0.25rem 0;
  font-size: 0.8rem;
  color: #718096;
}

.image-path {
  margin: 0;
  font-size: 0.75rem;
  color: #a0aec0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.path-label {
  font-weight: 600;
  color: #718096;
}

/* 空状态 */
.empty-state {
  text-align: center;
  padding: 2rem;
  color: #718096;
}

.clear-search-btn {
  margin-top: 1rem;
  padding: 0.5rem 1rem;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s ease;
}

.clear-search-btn:hover {
  background: #5a6fd8;
  transform: translateY(-1px);
}

/* 图片预览模态框 */
.image-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(5px);
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.modal-content {
  position: relative;
  max-width: 90vw;
  max-height: 90vh;
  background: white;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  animation: modalSlideIn 0.3s ease;
}

@keyframes modalSlideIn {
  from {
    transform: scale(0.9) translateY(20px);
    opacity: 0;
  }
  to {
    transform: scale(1) translateY(0);
    opacity: 1;
  }
}

.modal-close {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  border: none;
  border-radius: 50%;
  width: 2.5rem;
  height: 2.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 1.2rem;
  z-index: 10;
  transition: all 0.3s ease;
}

.modal-close:hover {
  background: rgba(0, 0, 0, 0.9);
  transform: scale(1.1);
}

.modal-navigation {
  position: absolute;
  top: 50%;
  left: 1rem;
  right: 1rem;
  transform: translateY(-50%);
  display: flex;
  justify-content: space-between;
  pointer-events: none;
  z-index: 10;
}

.nav-btn {
  background: rgba(0, 0, 0, 0.7);
  color: white;
  border: none;
  border-radius: 8px;
  padding: 0.75rem 1rem;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s ease;
  pointer-events: auto;
}

.nav-btn:hover {
  background: rgba(0, 0, 0, 0.9);
  transform: scale(1.05);
}

.modal-image-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  max-height: 70vh;
  background: #f7fafc;
}

.modal-image {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

.modal-info {
  padding: 1.5rem;
  background: white;
}

.modal-info h3 {
  margin: 0 0 0.5rem 0;
  font-size: 1.2rem;
  font-weight: 600;
  color: #2d3748;
}

.modal-info p {
  margin: 0.25rem 0;
  color: #4a5568;
  font-size: 0.9rem;
}

.modal-path {
  font-size: 0.8rem !important;
  color: #718096 !important;
  word-break: break-all;
}

/* 底部操作栏 */
.app-footer {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-top: 1px solid rgba(255, 255, 255, 0.2);
  padding: 1rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 -2px 20px rgba(0, 0, 0, 0.1);
}

.clear-btn {
  padding: 0.5rem 1rem;
  background: #f56565;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s ease;
}

.clear-btn:hover {
  background: #e53e3e;
  transform: translateY(-1px);
}

.footer-stats {
  font-weight: 600;
  color: #4a5568;
  background: rgba(74, 85, 104, 0.1);
  padding: 0.5rem 1rem;
  border-radius: 20px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .app-header {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }

  .app-main {
    padding: 1rem;
  }

  .search-section {
    padding: 1rem;
  }

  .view-controls {
    flex-direction: column;
  }

  .drop-zone {
    padding: 2rem 1rem;
    min-height: 300px;
  }

  .drop-icon {
    font-size: 3rem;
  }

  .grid-small {
    grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  }

  .grid-medium {
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  }

  .grid-large {
    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  }

  .app-footer {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }

  .modal-content {
    max-width: 95vw;
    max-height: 95vh;
  }

  .modal-navigation {
    left: 0.5rem;
    right: 0.5rem;
  }

  .nav-btn {
    padding: 0.5rem 0.75rem;
    font-size: 0.8rem;
  }
}

@media (max-width: 480px) {
  .app-title {
    font-size: 1.4rem;
  }

  .search-input {
    font-size: 16px; /* 防止iOS缩放 */
  }

  .image-list-item {
    flex-direction: column;
    text-align: center;
  }

  .list-thumbnail {
    width: 80px;
    height: 80px;
  }
}

/* 滚动条样式 */
::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.1);
  border-radius: 10px;
}

::-webkit-scrollbar-thumb {
  background: rgba(102, 126, 234, 0.6);
  border-radius: 10px;
}

::-webkit-scrollbar-thumb:hover {
  background: rgba(102, 126, 234, 0.8);
}

/* 选择状态 */
::selection {
  background: rgba(102, 126, 234, 0.2);
}

/* 焦点样式 */
*:focus {
  outline: none;
}

/* 动画优化 */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}

/* 暗色模式支持 */
@media (prefers-color-scheme: dark) {
  .app {
    background: linear-gradient(135deg, #1a202c 0%, #2d3748 100%);
  }

  .app-header,
  .search-section,
  .image-display,
  .app-footer {
    background: rgba(45, 55, 72, 0.95);
    color: #e2e8f0;
  }

  .app-title {
    color: #e2e8f0;
  }

  .search-input,
  .view-select,
  .size-select {
    background: #2d3748;
    border-color: #4a5568;
    color: #e2e8f0;
  }

  .image-card,
  .image-list-item {
    background: #2d3748;
  }

  .modal-content {
    background: #2d3748;
  }

  .modal-info {
    background: #2d3748;
    color: #e2e8f0;
  }

  .modal-image-wrapper {
    background: #1a202c;
  }

  .path-label {
    color: #a0aec0;
  }
}
</style> 