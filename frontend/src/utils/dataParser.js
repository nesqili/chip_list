import axios from 'axios';

/**
 * CSV 数据解析工具
 * 负责从远程 CSV 文件读取、解析并整合芯片数据
 * 以及处理数据的导入导出
 */

const CSV_URLS = [
  'https://haisnap.tos-cn-beijing.volces.com/file/1ac73b5b-c0e9-4912-b379-68b2152a6f68_1767750600517.csv',
  'https://haisnap.tos-cn-beijing.volces.com/file/7078205e-0c83-4e91-be7a-abcf90aa7650_1767750600518.csv'
];

/**
 * 健壮的 CSV 解析器，支持引号包裹和逗号
 * 解决简单的 split(',') 无法处理字段内含有逗号的问题
 */
const parseCSV = (text) => {
  const arr = [];
  let quote = false;
  let row = [];
  let col = '';
  let c = 0;
  
  // 统一换行符
  text = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

  for (; c < text.length; c++) {
    let cc = text[c];
    let nc = text[c+1];

    if (cc === '"') {
      if (quote && nc === '"') {
        // 双引号转义
        col += '"';
        c++;
      } else {
        // 切换引号状态
        quote = !quote;
      }
    } else if (cc === ',' && !quote) {
      // 字段分隔符
      row.push(col.trim());
      col = '';
    } else if (cc === '\n' && !quote) {
      // 行结束符
      row.push(col.trim());
      col = '';
      if (row.some(v => v)) arr.push(row);
      row = [];
    } else {
      col += cc;
    }
  }
  // 处理最后一个字段
  if (col || row.length > 0) {
    row.push(col.trim());
    if (row.some(v => v)) arr.push(row);
  }
  
  if (arr.length === 0) return [];
  
  // 处理表头，移除 BOM 和引号
  const headers = arr[0].map(h => h.replace(/^[\ufeff"']+|["']+$/g, '').trim());
  
  return arr.slice(1).map(row => {
    const obj = {};
    headers.forEach((h, i) => {
      if (h) obj[h] = row[i] || '';
    });
    return obj;
  });
};

/**
 * 将解析后的原始数据标准化为统一格式
 * 兼容多种表头命名
 */
const normalizeData = (rawData) => {
  return rawData.map(item => ({
    company: item['公司'] || item['Company'] || item['厂商'] || '',
    model: item['产品型号'] || item['Model'] || item['型号'] || item['芯片名称'] || '',
    releaseDate: item['发布时间'] || item['Release Date'] || item['上市时间'] || '',
    process: item['制程'] || item['Process'] || item['制程工艺'] || item['制程 (nm)'] || '',
    power: item['功耗'] || item['Power'] || item['TDP'] || item['功耗 (w)'] || '',
    aiPerformance: item['AI算力'] || item['AI Performance'] || item['算力'] || item['AI算力 (TOPS)'] || '',
    cpu: item['CPU'] || item['处理器'] || '',
    gpu: item['GPU'] || item['显卡'] || '',
    storage: item['存储'] || item['Storage'] || item['内存'] || '',
    modelSupport: item['大模型支持'] || item['Model Support'] || item['模型参数'] || item['可支持大模型运算参数规格'] || '',
    codec: item['编解码'] || item['Codec'] || item['视频编解码'] || item['编解码能力'] || '',
    // 支持从 CSV 导入标签，假设以 | 或 ; 分隔
    tags: item['标签'] ? item['标签'].split(/[,;|，；]/).map(t => t.trim()).filter(Boolean) : 
          (item['Tags'] ? item['Tags'].split(/[,;|]/).map(t => t.trim()).filter(Boolean) : []),
    other: item['其他'] || item['Other'] || item['备注'] || ''
  })).filter(item => item.model); // 过滤掉没有型号的数据
};

/**
 * 内部合并逻辑：用于初始化加载时合并重复数据
 */
const mergeChipsInternal = (chips) => {
  const merged = new Map();
  
  chips.forEach(chip => {
    // 归一化 Key：公司-型号 (全小写比较)
    const companyKey = (chip.company || 'unknown').trim().toLowerCase();
    const modelKey = (chip.model || '').trim().toLowerCase();
    const key = `${companyKey}-${modelKey}`;

    if (merged.has(key)) {
      const existing = merged.get(key);
      // 合并字段：如果现有数据为空，则使用新数据
      Object.keys(chip).forEach(k => {
        if (k === 'tags') {
           // 合并标签
           const combinedTags = new Set([...existing.tags, ...chip.tags]);
           existing.tags = Array.from(combinedTags);
        } else if (k !== 'id' && (!existing[k] || existing[k] === '')) {
           if (chip[k]) existing[k] = chip[k];
        }
      });
    } else {
      merged.set(key, { 
        ...chip, 
        id: `${chip.company || 'Unknown'}-${chip.model}-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`
      });
    }
  });
  
  return Array.from(merged.values());
};

const sortByCompany = (chips) => {
  return chips.sort((a, b) => {
    const companyA = a.company || '';
    const companyB = b.company || '';
    if (companyA !== companyB) {
      return companyA.localeCompare(companyB, 'zh-CN');
    }
    return (a.model || '').localeCompare(b.model || '', 'zh-CN');
  });
};

// --- API ---

export const loadChipData = async () => {
  try {
    const responses = await Promise.all(
      CSV_URLS.map(url => axios.get(url, { responseType: 'text' }))
    );
    
    const allData = responses.flatMap(res => parseCSV(res.data));
    const normalized = normalizeData(allData);
    const merged = mergeChipsInternal(normalized);
    const sorted = sortByCompany(merged);
    
    return sorted;
  } catch (error) {
    console.error('加载芯片数据失败:', error);
    return [];
  }
};

export const saveChipData = (chips) => {
  try {
    localStorage.setItem('chipData', JSON.stringify(chips));
    return true;
  } catch (error) {
    console.error('保存芯片数据失败:', error);
    return false;
  }
};

export const loadLocalChipData = () => {
  try {
    const data = localStorage.getItem('chipData');
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('读取本地芯片数据失败:', error);
    return null;
  }
};

export const searchChipInfo = async (keyword) => {
  const localData = loadLocalChipData();
  if (!localData) return null;
  
  const found = localData.find(chip => 
    (chip.model && chip.model.toLowerCase().includes(keyword.toLowerCase())) ||
    (chip.company && chip.company.toLowerCase().includes(keyword.toLowerCase()))
  );
  
  return found || null;
};

// --- 新增：导入导出与合并功能 ---

/**
 * 导出数据为 CSV 字符串
 */
export const exportToCSV = (chips) => {
  const headers = [
    '公司', '产品型号', '发布时间', '制程 (nm)', '功耗 (w)', 
    'AI算力 (TOPS)', 'CPU', 'GPU', '存储', 
    '可支持大模型运算参数规格', '编解码能力', '标签', '其他'
  ];
  
  const keys = [
    'company', 'model', 'releaseDate', 'process', 'power', 
    'aiPerformance', 'cpu', 'gpu', 'storage', 
    'modelSupport', 'codec', 'tags', 'other'
  ];

  const escapeCSV = (val) => {
    if (val === null || val === undefined) return '';
    const str = String(val);
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const csvRows = [headers.join(',')];

  chips.forEach(chip => {
    const row = keys.map(key => {
      if (key === 'tags') {
        return escapeCSV(Array.isArray(chip[key]) ? chip[key].join('|') : '');
      }
      return escapeCSV(chip[key]);
    });
    csvRows.push(row.join(','));
  });

  return csvRows.join('\n');
};

/**
 * 解析用户上传的 CSV 内容
 */
export const parseImportedCSV = (csvContent) => {
  try {
    const parsed = parseCSV(csvContent);
    const normalized = normalizeData(parsed);
    return normalized;
  } catch (error) {
    console.error('解析导入CSV失败:', error);
    throw error;
  }
};

/**
 * 核心查重合并逻辑
 * 规则：按芯片名称（公司+型号）查重。
 * - 如果存在：更新规格信息（新数据覆盖旧数据，标签合并）。
 * - 如果不存在：新增。
 */
export const mergeImportedData = (currentChips, importedChips) => {
    // 将现有数据放入 Map 方便查找
    const chipMap = new Map();
    
    currentChips.forEach(chip => {
        const key = `${(chip.company||'').trim()}-${(chip.model||'').trim()}`.toLowerCase();
        chipMap.set(key, chip);
    });

    let addedCount = 0;
    let updatedCount = 0;

    importedChips.forEach(newChip => {
        const key = `${(newChip.company||'').trim()}-${(newChip.model||'').trim()}`.toLowerCase();
        
        if (chipMap.has(key)) {
            // 更新逻辑：新数据有值则覆盖旧数据
            const existing = chipMap.get(key);
            let hasChange = false;
            
            Object.keys(newChip).forEach(field => {
                if (field === 'tags') {
                    // 合并标签
                    const oldTags = new Set(existing.tags || []);
                    const newTagCount = oldTags.size;
                    (newChip.tags || []).forEach(t => oldTags.add(t));
                    if (oldTags.size > newTagCount) {
                        existing.tags = Array.from(oldTags);
                        hasChange = true;
                    }
                } else if (field !== 'id' && newChip[field] !== undefined && newChip[field] !== '') {
                    // 只有当导入的数据非空时才覆盖，或者根据需求：
                    // "如果有的则更新规格信息" -> 只要导入数据里有这个字段，就更新
                    if (existing[field] !== newChip[field]) {
                        existing[field] = newChip[field];
                        hasChange = true;
                    }
                }
            });
            if (hasChange) updatedCount++;
        } else {
            // 新增
            const chipWithId = { 
                ...newChip, 
                id: `${newChip.company}-${newChip.model}-${Date.now()}-${Math.random().toString(36).substr(2, 4)}` 
            };
            chipMap.set(key, chipWithId);
            addedCount++;
        }
    });

    // 重新转换为数组并排序
    const mergedList = Array.from(chipMap.values());
    const sortedList = sortByCompany(mergedList);

    return {
        data: sortedList,
        stats: { added: addedCount, updated: updatedCount }
    };
};