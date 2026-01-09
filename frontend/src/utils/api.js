import axios from 'axios';

/**
 * AI 搜索 API 接口模块
 * 负责与外部或模拟的 AI 服务进行交互，获取芯片规格信息
 */

// 模拟 API 响应延迟
const MOCK_DELAY = 1500;

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

      // --- 模拟 AI 知识库匹配逻辑 ---
      
      // NVIDIA H100
      if (lowerKey.includes('h100') || (lowerKey.includes('nvidia') && lowerKey.includes('hopper'))) {
        result = {
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
        };
      } 
      // AMD MI300
      else if (lowerKey.includes('mi300') || (lowerKey.includes('amd') && lowerKey.includes('instinct'))) {
        result = {
          company: 'AMD',
          model: 'Instinct MI300X',
          releaseDate: '2023',
          process: '5nm & 6nm (Chiplets)',
          power: '750W',
          aiPerformance: 'High throughput AI inference (Comparable to H100)',
          cpu: '-',
          gpu: 'CDNA 3 Architecture',
          storage: '192GB HBM3',
          modelSupport: 'Large Language Models (LLMs), Generative AI',
          codec: 'VCN 4.0 Media Engine',
          tags: ['HPC', 'Generative AI', 'Chiplet'],
          other: 'Infinity Fabric 3.0, 153B Transistors'
        };
      }
      // Google TPU v5
      else if (lowerKey.includes('tpu') && (lowerKey.includes('v5') || lowerKey.includes('google'))) {
        result = {
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
        };
      }
      // Huawei Ascend 910B
      else if (lowerKey.includes('910b') || lowerKey.includes('ascend') || lowerKey.includes('昇腾')) {
        result = {
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
        };
      }
      // Apple M3 Max (示例消费级)
      else if (lowerKey.includes('m3') && lowerKey.includes('max')) {
        result = {
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
        };
      }
      // 兜底逻辑：尝试提取部分信息或返回基础模板
      else if (keyword.length > 2) {
        // 如果没有精确匹配，模拟 AI 尝试从关键词中提取信息
        const isCompanyKnown = ['intel', 'qualcomm', 'mediatek', 'tesla'].some(c => lowerKey.includes(c));
        
        result = {
          company: isCompanyKnown ? keyword.split(' ')[0].toUpperCase() : '',
          model: keyword,
          releaseDate: '',
          process: '',
          power: '',
          aiPerformance: '',
          cpu: '',
          gpu: '',
          storage: '',
          modelSupport: '',
          codec: '',
          tags: ['AI Search Result'],
          other: 'Auto-filled based on generic search result'
        };
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
    throw error; // 让调用者处理错误
  }
};
*/