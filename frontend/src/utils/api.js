import axios from 'axios';

/**
 * AI 搜索 API 接口模块
 * 负责与外部或模拟的 AI 服务进行交互，获取芯片规格信息
 */

// 模拟 API 响应延迟
const MOCK_DELAY = 1500;

/**
 * 内部模拟知识库 - 扩充更多真实芯片数据以提升"自动补齐"体验
 */
const MOCK_DB = [
  {
    keywords: ['h100', 'hopper', 'h100 tensor'],
    data: {
      company: 'NVIDIA',
      model: 'H100 Tensor Core GPU',
      releaseDate: '2022',
      process: '4nm (TSMC 4N)',
      power: '700W (TDP)',
      aiPerformance: '4000 TOPS (Transformer Engine INT8)',
      cpu: '-',
      gpu: 'H100 (Hopper Architecture)',
      storage: '80GB HBM3',
      modelSupport: 'Trillion-parameter models training & inference',
      codec: '7 NVDEC, 7 NVJPEG',
      tags: ['Data Center', 'AI Training', 'Hopper'],
      other: 'PCIe Gen5, NVLink 4.0 (900 GB/s bandwidth)'
    }
  },
  {
    keywords: ['h200', 'h200 tensor'],
    data: {
      company: 'NVIDIA',
      model: 'H200 Tensor Core GPU',
      releaseDate: '2023-Q4',
      process: '4nm (TSMC 4N)',
      power: '700W',
      aiPerformance: '4000 TOPS (INT8)',
      cpu: '-',
      gpu: 'Hopper Architecture',
      storage: '141GB HBM3e',
      modelSupport: 'Llama 2 70B, GPT-3 175B',
      codec: '7 NVDEC, 7 NVJPEG',
      tags: ['Data Center', 'HBM3e', 'AI Inference'],
      other: '4.8 TB/s Memory Bandwidth'
    }
  },
  {
    keywords: ['b200', 'blackwell', 'b200 tensor'],
    data: {
      company: 'NVIDIA',
      model: 'B200 Tensor Core GPU',
      releaseDate: '2024',
      process: '4nm (TSMC 4NP)',
      power: '1000W',
      aiPerformance: '9 PFLOPS (FP4)',
      cpu: '-',
      gpu: 'Blackwell Architecture',
      storage: '192GB HBM3e',
      modelSupport: 'Trillion-parameter generative AI',
      codec: 'RAS Engine, Decompression Engine',
      tags: ['Data Center', 'Blackwell', 'Generative AI'],
      other: 'NVLink 5.0 (1.8TB/s), 208B Transistors'
    }
  },
  {
    keywords: ['a100', 'a100 tensor', 'ampere'],
    data: {
      company: 'NVIDIA',
      model: 'A100 Tensor Core GPU',
      releaseDate: '2020',
      process: '7nm (TSMC)',
      power: '400W',
      aiPerformance: '624 TFLOPS (TF32)',
      cpu: '-',
      gpu: 'Ampere Architecture',
      storage: '40GB/80GB HBM2e',
      modelSupport: 'Large-scale AI training and inference',
      codec: '5 NVDEC, 2 NVJPEG',
      tags: ['Data Center', 'AI Training', 'Ampere'],
      other: 'PCIe Gen4, NVLink 3.0 (600 GB/s)'
    }
  },
  {
    keywords: ['v100', 'volta', 'v100 tensor'],
    data: {
      company: 'NVIDIA',
      model: 'V100 Tensor Core GPU',
      releaseDate: '2017',
      process: '12nm (TSMC)',
      power: '300W',
      aiPerformance: '125 TFLOPS (Mixed Precision)',
      cpu: '-',
      gpu: 'Volta Architecture',
      storage: '16GB/32GB HBM2',
      modelSupport: 'Deep learning training and inference',
      codec: '1 NVDEC',
      tags: ['Data Center', 'AI Training', 'Volta'],
      other: 'NVLink 2.0 (300 GB/s)'
    }
  },
  {
    keywords: ['rtx 4090', '4090', 'ada lovelace'],
    data: {
      company: 'NVIDIA',
      model: 'GeForce RTX 4090',
      releaseDate: '2022-Q4',
      process: '4nm (TSMC 4N)',
      power: '450W',
      aiPerformance: '1321 TOPS (INT8)',
      cpu: '-',
      gpu: 'Ada Lovelace Architecture',
      storage: '24GB GDDR6X',
      modelSupport: 'AI-powered gaming and content creation',
      codec: '2 NVDEC, 2 NVJPEG',
      tags: ['Consumer', 'Gaming', 'Ray Tracing'],
      other: 'DLSS 3, Ray Tracing Cores'
    }
  },
  {
    keywords: ['rtx 4080', '4080'],
    data: {
      company: 'NVIDIA',
      model: 'GeForce RTX 4080',
      releaseDate: '2022-Q4',
      process: '4nm (TSMC 4N)',
      power: '320W',
      aiPerformance: '780 TOPS (INT8)',
      cpu: '-',
      gpu: 'Ada Lovelace Architecture',
      storage: '16GB GDDR6X',
      modelSupport: 'AI-enhanced gaming',
      codec: '2 NVDEC, 2 NVJPEG',
      tags: ['Consumer', 'Gaming', 'High Performance'],
      other: 'DLSS 3, PCIe Gen4'
    }
  },
  {
    keywords: ['mi300', 'mi300x', 'instinct mi300x'],
    data: {
      company: 'AMD',
      model: 'Instinct MI300X',
      releaseDate: '2023',
      process: '5nm & 6nm (Chiplets)',
      power: '750W',
      aiPerformance: '1307 TFLOPS (FP16)',
      cpu: '-',
      gpu: 'CDNA 3 Architecture',
      storage: '192GB HBM3',
      modelSupport: 'Large Language Models (LLMs), Generative AI',
      codec: 'VCN 4.0 Media Engine',
      tags: ['HPC', 'Generative AI', 'Chiplet'],
      other: 'Infinity Fabric 3.0, 153B Transistors'
    }
  },
  {
    keywords: ['mi300a', 'instinct mi300a'],
    data: {
      company: 'AMD',
      model: 'Instinct MI300A',
      releaseDate: '2023',
      process: '5nm & 6nm',
      power: '550W',
      aiPerformance: 'High throughput computing',
      cpu: '24 Zen4 Cores',
      gpu: 'CDNA 3 Architecture',
      storage: '128GB HBM3',
      modelSupport: 'HPC & AI Converged Workloads',
      codec: '-',
      tags: ['APU', 'HPC', 'Data Center'],
      other: 'Unified Memory Architecture'
    }
  },
  {
    keywords: ['mi250', 'mi250x', 'instinct mi250'],
    data: {
      company: 'AMD',
      model: 'Instinct MI250X',
      releaseDate: '2021',
      process: '6nm & 7nm',
      power: '560W',
      aiPerformance: '383 TFLOPS (FP16)',
      cpu: '-',
      gpu: 'CDNA 2 Architecture',
      storage: '128GB HBM2e',
      modelSupport: 'HPC and AI workloads',
      codec: '-',
      tags: ['HPC', 'Data Center', 'Multi-Die'],
      other: 'Infinity Fabric Link 3'
    }
  },
  {
    keywords: ['tpu v5', 'tpu v5p', 'google tpu', 'cloud tpu'],
    data: {
      company: 'Google',
      model: 'Cloud TPU v5p',
      releaseDate: '2023',
      process: 'Unknown',
      power: 'Unknown',
      aiPerformance: '459 TFLOPS (BF16)',
      cpu: '-',
      gpu: 'TPU v5p Core',
      storage: '95GB HBM',
      modelSupport: 'Massive scale ML models',
      codec: '-',
      tags: ['Cloud', 'TPU', 'Google Cloud'],
      other: 'Inter-chip interconnect 2.8x faster than v4'
    }
  },
  {
    keywords: ['tpu v4', 'tpu v4i'],
    data: {
      company: 'Google',
      model: 'Cloud TPU v4',
      releaseDate: '2021',
      process: '7nm',
      power: 'Unknown',
      aiPerformance: '275 TFLOPS (BF16)',
      cpu: '-',
      gpu: 'TPU v4 Core',
      storage: '32GB HBM2',
      modelSupport: 'Large-scale ML training',
      codec: '-',
      tags: ['Cloud', 'TPU', 'Training'],
      other: 'Optimized for TensorFlow'
    }
  },
  {
    keywords: ['910b', 'ascend 910b', '昇腾910b', 'huawei 910'],
    data: {
      company: 'Huawei',
      model: 'Ascend 910B',
      releaseDate: '2023',
      process: '7nm (Estimated)',
      power: '310W',
      aiPerformance: '640 TOPS (INT8)',
      cpu: 'Da Vinci Architecture',
      gpu: 'NPU',
      storage: '32GB/64GB HBM2E',
      modelSupport: 'MindSpore, TensorFlow, Pytorch',
      codec: 'H.264/H.265 Hardware Decode',
      tags: ['NPU', 'Domestic', 'AI Training'],
      other: 'High efficiency AI computing'
    }
  },
  {
    keywords: ['910', 'ascend 910', '昇腾910'],
    data: {
      company: 'Huawei',
      model: 'Ascend 910',
      releaseDate: '2019',
      process: '7nm',
      power: '350W',
      aiPerformance: '512 TFLOPS (FP16)',
      cpu: 'Da Vinci Architecture',
      gpu: 'NPU',
      storage: '32GB HBM2',
      modelSupport: 'MindSpore, PyTorch, TensorFlow',
      codec: '-',
      tags: ['NPU', 'AI Training', 'Domestic'],
      other: 'High performance AI training'
    }
  },
  {
    keywords: ['m3 max', 'apple m3 max', 'm3max'],
    data: {
      company: 'Apple',
      model: 'M3 Max',
      releaseDate: '2023-Q4',
      process: '3nm',
      power: '30W-78W',
      aiPerformance: '18 TOPS (Neural Engine)',
      cpu: '16-core CPU',
      gpu: '40-core GPU',
      storage: 'Up to 128GB Unified Memory',
      modelSupport: 'On-device LLM inference',
      codec: 'ProRes, H.264, HEVC, AV1',
      tags: ['Consumer', 'Edge AI', 'ARM'],
      other: 'Hardware-accelerated ray tracing'
    }
  },
  {
    keywords: ['m3 pro', 'apple m3 pro', 'm3pro'],
    data: {
      company: 'Apple',
      model: 'M3 Pro',
      releaseDate: '2023-Q4',
      process: '3nm',
      power: '20W-50W',
      aiPerformance: '18 TOPS (Neural Engine)',
      cpu: '12-core CPU',
      gpu: '18-core GPU',
      storage: 'Up to 36GB Unified Memory',
      modelSupport: 'On-device AI processing',
      codec: 'ProRes, H.264, HEVC',
      tags: ['Consumer', 'Professional', 'ARM'],
      other: 'Unified memory architecture'
    }
  },
  {
    keywords: ['m2 ultra', 'apple m2 ultra', 'm2ultra'],
    data: {
      company: 'Apple',
      model: 'M2 Ultra',
      releaseDate: '2023-Q2',
      process: '5nm',
      power: '60W-150W',
      aiPerformance: '31.6 TOPS (Neural Engine)',
      cpu: '24-core CPU',
      gpu: '76-core GPU',
      storage: 'Up to 192GB Unified Memory',
      modelSupport: 'Professional AI workloads',
      codec: 'ProRes, H.264, HEVC',
      tags: ['Professional', 'High Performance', 'ARM'],
      other: 'UltraFusion interconnect'
    }
  },
  {
    keywords: ['gaudi 3', 'gaudi3', 'intel gaudi'],
    data: {
      company: 'Intel',
      model: 'Gaudi 3',
      releaseDate: '2024',
      process: '5nm',
      power: '900W',
      aiPerformance: '1835 TFLOPS (FP8)',
      cpu: '-',
      gpu: 'Tensor Processor Cores',
      storage: '128GB HBM2e',
      modelSupport: 'Enterprise GenAI',
      codec: '-',
      tags: ['Data Center', 'Intel', 'AI Accelerator'],
      other: 'Ethernet-based scale-out'
    }
  },
  {
    keywords: ['gaudi 2', 'gaudi2'],
    data: {
      company: 'Intel',
      model: 'Gaudi 2',
      releaseDate: '2022',
      process: '7nm',
      power: '600W',
      aiPerformance: '432 TFLOPS (BF16)',
      cpu: '-',
      gpu: 'Tensor Processor Cores',
      storage: '96GB HBM2e',
      modelSupport: 'Deep learning training',
      codec: '-',
      tags: ['Data Center', 'AI Training', 'Intel'],
      other: 'RoCE v2 networking'
    }
  },
  {
    keywords: ['l40s', 'l40s tensor'],
    data: {
      company: 'NVIDIA',
      model: 'L40S',
      releaseDate: '2023',
      process: '4nm',
      power: '350W',
      aiPerformance: '1466 TOPS (INT8)',
      cpu: '-',
      gpu: 'Ada Lovelace Architecture',
      storage: '48GB GDDR6',
      modelSupport: 'Graphics & AI Inference',
      codec: '3 NVDEC, 3 NVJPEG',
      tags: ['Data Center', 'Graphics', 'Inference'],
      other: 'Ray Tracing Cores, Tensor Cores'
    }
  },
  {
    keywords: ['l40', 'l40 tensor'],
    data: {
      company: 'NVIDIA',
      model: 'L40',
      releaseDate: '2022',
      process: '4nm',
      power: '300W',
      aiPerformance: '362 TFLOPS (TF32)',
      cpu: '-',
      gpu: 'Ada Lovelace Architecture',
      storage: '48GB GDDR6',
      modelSupport: 'Visual computing and AI',
      codec: '3 NVDEC, 3 NVJPEG',
      tags: ['Data Center', 'Professional Graphics'],
      other: 'Virtual workstation support'
    }
  },
  {
    keywords: ['snapdragon 8 gen 3', '8 gen 3', 'sm8650', 'qualcomm 8gen3'],
    data: {
      company: 'Qualcomm',
      model: 'Snapdragon 8 Gen 3',
      releaseDate: '2023',
      process: '4nm (TSMC)',
      power: '10W-15W',
      aiPerformance: '98 TOPS',
      cpu: 'Kryo (1x3.3GHz + 3x3.2GHz + 2x3.0GHz + 2x2.3GHz)',
      gpu: 'Adreno 750',
      storage: 'LPDDR5X support',
      modelSupport: 'On-device generative AI',
      codec: 'AV1, H.265, VP9',
      tags: ['Mobile', 'Edge AI', '5G'],
      other: 'Snapdragon X75 5G Modem'
    }
  },
  {
    keywords: ['snapdragon 8 gen 2', '8 gen 2', 'sm8550'],
    data: {
      company: 'Qualcomm',
      model: 'Snapdragon 8 Gen 2',
      releaseDate: '2022',
      process: '4nm (TSMC)',
      power: '10W-12W',
      aiPerformance: '60 TOPS',
      cpu: 'Kryo (1x3.2GHz + 4x2.8GHz + 3x2.0GHz)',
      gpu: 'Adreno 740',
      storage: 'LPDDR5X support',
      modelSupport: 'AI-enhanced mobile computing',
      codec: 'AV1, H.265, VP9',
      tags: ['Mobile', 'AI', '5G'],
      other: 'Snapdragon X70 5G Modem'
    }
  },
  {
    keywords: ['dimensity 9300', 'mtk 9300', 'mediatek 9300'],
    data: {
      company: 'MediaTek',
      model: 'Dimensity 9300',
      releaseDate: '2023',
      process: '4nm (TSMC)',
      power: '10W-14W',
      aiPerformance: '160 TOPS',
      cpu: 'Cortex-X4 + Cortex-A720',
      gpu: 'Immortalis-G720',
      storage: 'LPDDR5T support',
      modelSupport: 'Generative AI on mobile',
      codec: 'AV1, H.265, VP9',
      tags: ['Mobile', 'AI', '5G'],
      other: 'APU 790 for AI processing'
    }
  },
  {
    keywords: ['kunpeng 920', '鲲鹏920', 'huawei kunpeng'],
    data: {
      company: 'Huawei',
      model: 'Kunpeng 920',
      releaseDate: '2019',
      process: '7nm',
      power: '180W',
      aiPerformance: '-',
      cpu: '64-core ARM v8.2',
      gpu: '-',
      storage: '8-channel DDR4',
      modelSupport: 'Cloud and data center computing',
      codec: '-',
      tags: ['Server', 'ARM', 'Domestic'],
      other: 'High performance server processor'
    }
  },
  {
    keywords: ['xeon platinum 8480', '8480+', 'intel xeon 8480', 'sapphire rapids'],
    data: {
      company: 'Intel',
      model: 'Xeon Platinum 8480+',
      releaseDate: '2023',
      process: 'Intel 7 (10nm Enhanced)',
      power: '350W',
      aiPerformance: 'AMX acceleration',
      cpu: '56-core',
      gpu: '-',
      storage: '8-channel DDR5',
      modelSupport: 'AI and HPC workloads',
      codec: '-',
      tags: ['Server', 'Data Center', 'x86'],
      other: 'Advanced Matrix Extensions (AMX)'
    }
  },
  {
    keywords: ['epyc 9654', '9654', 'amd epyc', 'genoa'],
    data: {
      company: 'AMD',
      model: 'EPYC 9654',
      releaseDate: '2022',
      process: '5nm',
      power: '360W',
      aiPerformance: '-',
      cpu: '96-core Zen 4',
      gpu: '-',
      storage: '12-channel DDR5',
      modelSupport: 'Cloud and enterprise computing',
      codec: '-',
      tags: ['Server', 'Data Center', 'x86'],
      other: 'PCIe Gen5, CXL 1.1'
    }
  }
];

/**
 * 通过关键词搜索芯片规格信息 (模拟 AI 搜索)
 * 
 * 真实场景说明：
 * 在生产环境中，此函数应调用后端 API (如 /api/ai/chip-search)，
 * 后端再调用 OpenAI API (GPT-4) 或 Google Search API + 网页解析，
 * 从非结构化的互联网数据中提取结构化的芯片规格 JSON。
 * 
 * @param {string} keyword - 芯片型号或公司名称
 * @returns {Promise<Object|null>} - 返回芯片规格对象或 null
 */
export const fetchAIChipInfo = async (keyword) => {
  console.log(`[AI Search] Searching for: ${keyword}`);

  // 模拟异步请求过程
  return new Promise((resolve) => {
    setTimeout(() => {
      const lowerKey = keyword.trim().toLowerCase();
      let result = null;
      let matchType = 'none';

      // 1. 尝试在模拟知识库中精确匹配
      for (const entry of MOCK_DB) {
        if (entry.keywords.some(k => {
          const kLower = k.toLowerCase();
          return lowerKey === kLower || lowerKey.includes(kLower) || kLower.includes(lowerKey);
        })) {
          result = { ...entry.data };
          matchType = 'exact';
          console.log(`[AI Search] ✓ Found exact match in knowledge base`);
          break;
        }
      }

      // 1.5 如果精确匹配失败，尝试分词模糊匹配
      if (!result) {
        const keywordParts = lowerKey.split(/[\s\-_]+/).filter(p => p.length > 1);
        let maxMatchScore = 0;
        let bestMatch = null;
        
        for (const entry of MOCK_DB) {
          const matchScore = entry.keywords.reduce((score, k) => {
            const keywordLower = k.toLowerCase();
            let partialScore = 0;
            keywordParts.forEach(part => {
              if (keywordLower.includes(part) || part.includes(keywordLower)) {
                partialScore += part.length;
              }
            });
            return score + partialScore;
          }, 0);
          
          if (matchScore > maxMatchScore) {
            maxMatchScore = matchScore;
            bestMatch = entry;
          }
        }
        
        if (bestMatch && maxMatchScore > 2) {
          result = { ...bestMatch.data };
          matchType = 'fuzzy';
          console.log(`[AI Search] ✓ Found fuzzy match with score: ${maxMatchScore}`);
        }
      }

      // 2. 如果没有精确匹配，尝试基于规则的模糊推断
      if (!result) {
        console.log(`[AI Search] No exact match, trying intelligent inference...`);
        
        // 尝试推断公司
        let company = '';
        if (lowerKey.includes('nvidia') || lowerKey.includes('英伟达') || lowerKey.includes('rtx') || lowerKey.includes('gtx') || lowerKey.includes('geforce') || lowerKey.includes('tensor core') || lowerKey.match(/\b(h|a|v|l)\d{2,3}\b/)) {
          company = 'NVIDIA';
        } else if (lowerKey.includes('amd') || lowerKey.includes('radeon') || lowerKey.includes('epyc') || lowerKey.includes('instinct') || lowerKey.includes('ryzen') || lowerKey.match(/\bmi\d{3}\b/)) {
          company = 'AMD';
        } else if (lowerKey.includes('intel') || lowerKey.includes('英特尔') || lowerKey.includes('core') || lowerKey.includes('xeon') || lowerKey.includes('gaudi') || lowerKey.match(/\bi[3579]\b/)) {
          company = 'Intel';
        } else if (lowerKey.includes('apple') || lowerKey.includes('苹果') || lowerKey.match(/\bm[1-9]\b/) || lowerKey.match(/\bm[1-9]\s*(pro|max|ultra)\b/)) {
          company = 'Apple';
        } else if (lowerKey.includes('qualcomm') || lowerKey.includes('高通') || lowerKey.includes('snapdragon') || lowerKey.includes('骁龙') || lowerKey.match(/\b8\s*gen\s*[1-9]\b/) || lowerKey.match(/\bsm\d{4}\b/)) {
          company = 'Qualcomm';
        } else if (lowerKey.includes('huawei') || lowerKey.includes('华为') || lowerKey.includes('kunpeng') || lowerKey.includes('ascend') || lowerKey.includes('昇腾') || lowerKey.includes('鲲鹏') || lowerKey.match(/\b91[0-9]\b/)) {
          company = 'Huawei';
        } else if (lowerKey.includes('mediatek') || lowerKey.includes('联发科') || lowerKey.includes('dimensity') || lowerKey.includes('天玑') || lowerKey.includes('mtk')) {
          company = 'MediaTek';
        } else if (lowerKey.includes('google') || lowerKey.includes('tpu') || lowerKey.includes('tensor')) {
          company = 'Google';
        }
        
        // 尝试推断标签
        const tags = [];
        if (lowerKey.includes('gpu') || lowerKey.includes('显卡') || lowerKey.includes('graphics')) tags.push('GPU');
        if (lowerKey.includes('cpu') || lowerKey.includes('处理器') || lowerKey.includes('processor')) tags.push('CPU');
        if (lowerKey.includes('npu') || lowerKey.includes('ai') || lowerKey.includes('neural')) tags.push('AI Accelerator');
        if (lowerKey.includes('server') || lowerKey.includes('xeon') || lowerKey.includes('epyc') || lowerKey.includes('数据中心')) tags.push('Server');
        if (lowerKey.includes('mobile') || lowerKey.includes('snapdragon') || lowerKey.includes('dimensity') || lowerKey.includes('手机')) tags.push('Mobile');
        if (lowerKey.includes('datacenter') || lowerKey.includes('data center') || lowerKey.includes('云计算')) tags.push('Data Center');
        if (lowerKey.includes('gaming') || lowerKey.includes('游戏') || lowerKey.includes('rtx') || lowerKey.includes('geforce')) tags.push('Gaming');
        
        // 智能推断芯片类型并填充默认信息
        const isGPU = lowerKey.includes('gpu') || lowerKey.includes('rtx') || lowerKey.includes('radeon') || lowerKey.includes('geforce');
        const isCPU = lowerKey.includes('cpu') || lowerKey.includes('core i') || lowerKey.includes('ryzen') || lowerKey.includes('xeon') || lowerKey.includes('epyc');
        const isMobile = lowerKey.includes('snapdragon') || lowerKey.includes('dimensity') || lowerKey.includes('gen ');
        
        // 如果至少推断出了公司，返回智能模板
        if (company) {
          result = {
            company: company,
            model: keyword,
            releaseDate: '',
            process: isMobile ? '4nm (预估)' : '',
            power: isMobile ? '8-15W' : (isGPU ? '200-400W' : ''),
            aiPerformance: '',
            cpu: isCPU ? '(需要补充具体规格)' : '-',
            gpu: isGPU ? '(需要补充具体规格)' : '-',
            storage: isMobile ? 'LPDDR5/LPDDR5X' : '',
            modelSupport: '',
            codec: isMobile ? 'H.264, H.265, VP9' : '',
            tags: tags.length > 0 ? tags : [company],
            other: `AI 已识别为 ${company} 产品，部分字段基于常规规格推断，请手动补充完整信息`
          };
          matchType = 'inference';
          console.log(`[AI Search] ✓ Generated intelligent template for ${company}`);
        } else if (keyword.trim().length >= 3) {
          // 没有识别出公司但关键词足够长，返回基础模板
          result = {
            company: '',
            model: keyword,
            releaseDate: '',
            process: '',
            power: '',
            aiPerformance: '',
            cpu: '-',
            gpu: '-',
            storage: '',
            modelSupport: '',
            codec: '',
            tags: tags.length > 0 ? tags : ['未分类'],
            other: '⚠️ 未能识别芯片厂商，请手动补充完整信息'
          };
          matchType = 'basic';
          console.log(`[AI Search] ⚠ Generated basic template with unknown company`);
        }
      }

      // 确保所有字段都存在，避免undefined
      if (result) {
        const defaultResult = {
          company: '',
          model: '',
          releaseDate: '',
          process: '',
          power: '',
          aiPerformance: '',
          cpu: '-',
          gpu: '-',
          storage: '',
          modelSupport: '',
          codec: '',
          tags: [],
          other: ''
        };
        result = { ...defaultResult, ...result };
        console.log(`[AI Search] ✓ Match Type: ${matchType}, Result:`, result);
      } else {
        console.log(`[AI Search] ✗ No matching data found for: ${keyword}`);
      }

      resolve(result);
    }, MOCK_DELAY);
  });
};

/**
 * 示例：真实的调用方式 (当有后端支持时)
 */
/*
export const fetchAIChipInfoReal = async (keyword) => {
  try {
    const response = await axios.post('/api/ai/search', { keyword });
    if (response.data && response.data.success) {
      return response.data.data;
    }
    return null;
  } catch (error) {
    console.error('AI API Error:', error);
    throw error;
  }
};
*/