import { create } from 'zustand';
import { loadChipData, saveChipData, loadLocalChipData, searchChipInfo } from '../utils/dataParser';

const useChipStore = create((set, get) => ({
  chips: [],
  filteredChips: [],
  loading: false,
  
  // 新增：表格选中行状态管理
  selectedRowKeys: [],

  // 筛选状态
  selectedTags: [],
  tagLogic: 'or',
  filterCompany: null,
  filterModelKeyword: '',
  filterAiRange: [0, 5000], // 默认AI算力范围(TOPS)
  
  // 辅助元数据
  subPages: [],
  allTags: [],
  allCompanies: [],
  maxAiPerformance: 5000,
  
  // 新增：筛选视图管理
  filterViews: [],

  initializeData: async () => {
    set({ loading: true });
    try {
      // 检查本地存储是否存在（区分首次加载和数据被清空）
      const hasLocalStorage = localStorage.getItem('chipData') !== null;
      let data = loadLocalChipData();
      
      // 仅当本地存储不存在时才从远程CSV加载（首次使用）
      if (!hasLocalStorage) {
        data = await loadChipData();
        saveChipData(data);
      } else if (!data) {
        // 本地存储存在但解析失败，设为空数组
        data = [];
      }

      set({ 
        chips: data, 
        loading: false 
      });
      
      // 初始化时加载所有辅助数据
      get().extractMetadata();
      get().loadSubPages();    // 加载标签组合视图
      get().loadFilterViews(); // 加载综合筛选视图
      get().applyFilters();    // 应用初始筛选
      
    } catch (error) {
      console.error('初始化数据失败:', error);
      set({ loading: false });
    }
  },

  // 提取标签、公司等元数据
  extractMetadata: () => {
    const { chips } = get();
    const tagSet = new Set();
    const companySet = new Set();
    let maxAi = 0;

    chips.forEach(chip => {
      // 提取标签
      if (chip.tags && Array.isArray(chip.tags)) {
        chip.tags.forEach(tag => tagSet.add(tag));
      }
      // 提取公司
      if (chip.company) {
        companySet.add(chip.company);
      }
      // 计算最大算力（用于滑块上限）
      if (chip.aiPerformance) {
        const match = chip.aiPerformance.toString().match(/(\d+(\.\d+)?)/);
        if (match) {
          const val = parseFloat(match[0]);
          if (val > maxAi) maxAi = val;
        }
      }
    });

    // 算力取整向上
    const safeMaxAi = Math.ceil(maxAi / 100) * 100 || 5000;

    set({ 
      allTags: Array.from(tagSet).sort(),
      allCompanies: Array.from(companySet).sort(),
      maxAiPerformance: safeMaxAi,
      // 如果当前筛选范围是默认值，更新为新上限
      filterAiRange: get().filterAiRange[1] === 5000 ? [0, safeMaxAi] : get().filterAiRange
    });
  },

  // --- CRUD 操作 ---

  addChip: (newChip) => {
    const { chips } = get();
    const chipWithId = { ...newChip, id: `${newChip.company}-${newChip.model}-${Date.now()}` };
    const updatedChips = [...chips, chipWithId];
    set({ chips: updatedChips });
    saveChipData(updatedChips);
    get().extractMetadata();
    get().applyFilters();
  },

  updateChip: (chipId, updatedData) => {
    const { chips } = get();
    const updatedChips = chips.map(chip => 
      chip.id === chipId ? { ...chip, ...updatedData } : chip
    );
    set({ chips: updatedChips });
    saveChipData(updatedChips);
    get().extractMetadata();
    get().applyFilters();
  },

  deleteChip: (chipId) => {
    const { chips } = get();
    const updatedChips = chips.filter(chip => chip.id !== chipId);
    set({ chips: updatedChips });
    saveChipData(updatedChips);
    get().extractMetadata();
    get().applyFilters();
  },

  // 新增：批量删除芯片
  deleteChips: (chipIds) => {
    const { chips } = get();
    const idsToDelete = new Set(chipIds);
    const beforeCount = chips.length;
    const updatedChips = chips.filter(chip => !idsToDelete.has(chip.id));
    
    console.log(`[批量删除] 删除前: ${beforeCount} 条, 删除 ${chipIds.length} 条, 删除后: ${updatedChips.length} 条`);
    
    // 更新数据并清空选中状态
    set({ chips: updatedChips, selectedRowKeys: [] });
    saveChipData(updatedChips);
    get().extractMetadata();
    get().applyFilters();
    
    // 验证本地存储是否更新成功
    const saved = loadLocalChipData();
    console.log(`[批量删除] 本地存储验证: ${saved ? saved.length : 0} 条`);
  },

  // 新增：设置选中行状态
  setSelectedRowKeys: (keys) => {
    set({ selectedRowKeys: keys });
  },

  // --- 导入导出逻辑 ---

  importChips: (importedData) => {
    const { chips } = get();
    let updatedChips = [...chips];
    let stats = { added: 0, updated: 0 };

    importedData.forEach(newChip => {
      // 必须有产品型号才能导入
      const newModel = newChip.model ? newChip.model.toString().trim() : '';
      if (!newModel) return;

      // 按芯片名称（型号）查重，不区分大小写
      const existingIndex = updatedChips.findIndex(c => 
        c.model && c.model.toString().trim().toLowerCase() === newModel.toLowerCase()
      );

      if (existingIndex !== -1) {
        // 更新现有数据
        const existingChip = updatedChips[existingIndex];
        updatedChips[existingIndex] = {
          ...existingChip,
          ...newChip,
          // 保持 ID 不变
          id: existingChip.id,
          // 合并标签
          tags: Array.from(new Set([...(existingChip.tags || []), ...(newChip.tags || [])]))
        };
        stats.updated++;
      } else {
        // 新增数据
        updatedChips.push({
          ...newChip,
          id: `${newChip.company || 'Unknown'}-${newModel}-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
          tags: newChip.tags || []
        });
        stats.added++;
      }
    });

    set({ chips: updatedChips });
    saveChipData(updatedChips);
    get().extractMetadata();
    get().applyFilters();
    return stats;
  },

  // --- 筛选设置 ---

  setSelectedTags: (tags) => {
    set({ selectedTags: tags });
    get().applyFilters();
  },

  setTagLogic: (logic) => {
    set({ tagLogic: logic });
    get().applyFilters();
  },
  
  setFilterCompany: (company) => {
    set({ filterCompany: company });
    get().applyFilters();
  },

  setFilterModelKeyword: (keyword) => {
    set({ filterModelKeyword: keyword });
    get().applyFilters();
  },

  setFilterAiRange: (range) => {
    set({ filterAiRange: range });
    get().applyFilters();
  },

  // --- 核心筛选逻辑 ---

  applyFilters: () => {
    const { 
      chips, 
      selectedTags, 
      tagLogic,
      filterCompany,
      filterModelKeyword,
      filterAiRange 
    } = get();
    
    let filtered = chips;

    // 1. 公司筛选
    if (filterCompany) {
      filtered = filtered.filter(chip => chip.company === filterCompany);
    }

    // 2. 关键词筛选 (匹配型号或公司)
    if (filterModelKeyword) {
      const keyword = filterModelKeyword.toLowerCase();
      filtered = filtered.filter(chip => 
        (chip.model && chip.model.toLowerCase().includes(keyword)) ||
        (chip.company && chip.company.toLowerCase().includes(keyword))
      );
    }

    // 3. AI算力范围筛选
    if (filterAiRange && filterAiRange.length === 2) {
      const [min, max] = filterAiRange;
      filtered = filtered.filter(chip => {
        // 无算力数据如果不参与筛选，默认保留或剔除，这里选择保留(如果min为0)或者逻辑处理
        if (!chip.aiPerformance) return min === 0; 
        
        const match = chip.aiPerformance.toString().match(/(\d+(\.\d+)?)/);
        if (!match) return min === 0;
        
        const val = parseFloat(match[0]);
        return val >= min && val <= max;
      });
    }

    // 4. 标签筛选
    if (selectedTags.length > 0) {
      filtered = filtered.filter(chip => {
        if (!chip.tags || chip.tags.length === 0) return false;
        
        if (tagLogic === 'and') {
          return selectedTags.every(tag => chip.tags.includes(tag));
        } else {
          return selectedTags.some(tag => chip.tags.includes(tag));
        }
      });
    }

    set({ filteredChips: filtered });
  },

  resetFilter: () => {
    const { maxAiPerformance } = get();
    set({ 
      selectedTags: [], 
      tagLogic: 'or',
      filterCompany: null,
      filterModelKeyword: '',
      filterAiRange: [0, maxAiPerformance],
    });
    get().applyFilters();
  },

  // --- 子页面管理 ---

  loadSubPages: () => {
    try {
      const saved = localStorage.getItem('chipSubPages');
      const subPages = saved ? JSON.parse(saved) : [];
      set({ subPages });
    } catch (error) {
      console.error('加载子页面失败:', error);
      set({ subPages: [] });
    }
  },

  // --- 筛选视图管理 ---

  loadFilterViews: () => {
    try {
      const saved = localStorage.getItem('chipFilterViews');
      const filterViews = saved ? JSON.parse(saved) : [];
      set({ filterViews });
    } catch (error) {
      console.error('加载筛选视图失败:', error);
      set({ filterViews: [] });
    }
  },

  saveFilterView: (name) => {
    const { filterViews, selectedTags, tagLogic, filterCompany, filterModelKeyword, filterAiRange } = get();
    
    // 检查是否有筛选条件
    const hasFilters = selectedTags.length > 0 || filterCompany || filterModelKeyword || 
                       (filterAiRange[0] !== 0 || filterAiRange[1] !== get().maxAiPerformance);
    
    if (!hasFilters) {
      return { success: false, message: '当前没有任何筛选条件' };
    }
    
    const newFilterView = {
      id: `filter-view-${Date.now()}`,
      name,
      selectedTags,
      tagLogic,
      filterCompany,
      filterModelKeyword,
      filterAiRange,
      createdAt: new Date().toISOString()
    };
    
    // 确保更新的是最新状态
    const updatedFilterViews = [...filterViews, newFilterView];
    set({ filterViews: updatedFilterViews });
    
    // 同步到 localStorage
    try {
      localStorage.setItem('chipFilterViews', JSON.stringify(updatedFilterViews));
    } catch (e) {
      console.error('保存筛选视图到本地存储失败', e);
    }
    
    return { success: true, message: '筛选视图已保存' };
  },

  loadFilterView: (filterView) => {
    set({ 
      selectedTags: filterView.selectedTags || [],
      tagLogic: filterView.tagLogic || 'or',
      filterCompany: filterView.filterCompany || null,
      filterModelKeyword: filterView.filterModelKeyword || '',
      filterAiRange: filterView.filterAiRange || [0, get().maxAiPerformance]
    });
    get().applyFilters();
  },

  deleteFilterView: (filterViewId) => {
    const { filterViews } = get();
    const updatedFilterViews = filterViews.filter(view => view.id !== filterViewId);
    set({ filterViews: updatedFilterViews });
    localStorage.setItem('chipFilterViews', JSON.stringify(updatedFilterViews));
  },

  saveSubPage: (name, tags, logic) => {
    const { subPages } = get();
    const newSubPage = {
      id: `subpage-${Date.now()}`,
      name,
      tags,
      logic,
      createdAt: new Date().toISOString()
    };
    const updatedSubPages = [...subPages, newSubPage];
    set({ subPages: updatedSubPages });
    localStorage.setItem('chipSubPages', JSON.stringify(updatedSubPages));
  },

  deleteSubPage: (subPageId) => {
    const { subPages } = get();
    const updatedSubPages = subPages.filter(page => page.id !== subPageId);
    set({ subPages: updatedSubPages });
    localStorage.setItem('chipSubPages', JSON.stringify(updatedSubPages));
  },

  loadSubPageView: (subPage) => {
    set({ 
      selectedTags: subPage.tags, 
      tagLogic: subPage.logic 
    });
    get().applyFilters();
  },

  // 检查是否存在重复芯片（按型号查重）
  checkDuplicateChip: (model) => {
    const { chips } = get();
    const normalizedModel = model ? model.toString().trim().toLowerCase() : '';
    if (!normalizedModel) return null;
    
    return chips.find(c => 
      c.model && c.model.toString().trim().toLowerCase() === normalizedModel
    );
  },

  // 自动补齐：通过AI搜索外网信息
  autoFillChipInfo: async (keyword) => {
    try {
      // 调用AI搜索API获取芯片信息
      // 这里使用模拟API，实际应该调用真实的AI搜索服务
      const response = await fetch('/api/ai-search-chip', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ keyword })
      });
      
      if (response.ok) {
        const chipInfo = await response.json();
        return chipInfo;
      } else {
        // 如果API调用失败，返回null
        console.warn('AI搜索服务暂不可用');
        return null;
      }
    } catch (error) {
      console.error('AI搜索失败:', error);
      return null;
    }
  },

  // 新增或更新芯片（支持覆盖逻辑）
  addOrUpdateChip: (newChip, shouldOverwrite = false) => {
    const { chips } = get();
    const newModel = newChip.model ? newChip.model.toString().trim() : '';
    
    if (!newModel) {
      throw new Error('产品型号不能为空');
    }
    
    // 检查是否存在重复
    const existingChipIndex = chips.findIndex(c => 
      c.model && c.model.toString().trim().toLowerCase() === newModel.toLowerCase()
    );
    
    let updatedChips;
    
    if (existingChipIndex !== -1) {
      if (!shouldOverwrite) {
        // 不覆盖，返回错误标识
        return { success: false, duplicate: true, existingChip: chips[existingChipIndex] };
      }
      
      // 覆盖现有数据，保持原ID
      const existingChip = chips[existingChipIndex];
      updatedChips = [...chips];
      updatedChips[existingChipIndex] = {
        ...newChip,
        id: existingChip.id,
        tags: Array.from(new Set([...(existingChip.tags || []), ...(newChip.tags || [])]))
      };
    } else {
      // 新增数据
      const chipWithId = { 
        ...newChip, 
        id: `${newChip.company}-${newChip.model}-${Date.now()}` 
      };
      updatedChips = [...chips, chipWithId];
    }
    
    set({ chips: updatedChips });
    saveChipData(updatedChips);
    get().extractMetadata();
    get().applyFilters();
    
    return { success: true, duplicate: false };
  }
}));

export default useChipStore;