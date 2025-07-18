import { ref, computed, type Ref } from 'vue'
import Fuse from 'fuse.js'
import type { ImageFile, SearchOptions } from '@/types'

export function useSearch(images: Ref<ImageFile[]>) {
  const searchQuery = ref('')
  const searchOptions = ref<SearchOptions>({
    query: '',
    includeFileName: true,
    includeExtension: true
  })

  // Fuse.js配置
  const fuseOptions = computed(() => ({
    keys: [
      ...(searchOptions.value.includeFileName ? ['name'] : []),
      ...(searchOptions.value.includeExtension ? ['extension'] : []),
      'path'
    ],
    threshold: 0.3,
    distance: 100,
    minMatchCharLength: 1,
    includeScore: true
  }))

  // 创建Fuse实例
  const fuse = computed(() => new Fuse(images.value, fuseOptions.value))

  // 过滤后的图片列表
  const filteredImages = computed(() => {
    if (!searchQuery.value.trim()) {
      return images.value
    }

    const results = fuse.value.search(searchQuery.value)
    return results.map(result => result.item)
  })

  // 搜索统计
  const searchStats = computed(() => ({
    total: images.value.length,
    filtered: filteredImages.value.length,
    isSearching: searchQuery.value.trim().length > 0
  }))

  // 设置搜索查询
  function setSearchQuery(query: string) {
    searchQuery.value = query
  }

  // 清除搜索
  function clearSearch() {
    searchQuery.value = ''
  }

  // 更新搜索选项
  function updateSearchOptions(options: Partial<SearchOptions>) {
    searchOptions.value = { ...searchOptions.value, ...options }
  }

  return {
    searchQuery,
    searchOptions,
    filteredImages,
    searchStats,
    setSearchQuery,
    clearSearch,
    updateSearchOptions
  }
} 