import React, { useState } from 'react';
import { Card, Select, Input, Button, Space, Row, Col, Typography, InputNumber, Modal, message } from 'antd';
import { SearchOutlined, ReloadOutlined, FilterOutlined, RocketOutlined, SaveOutlined } from '@ant-design/icons';
import useChipStore from '../stores/chipStore';

const { Text } = Typography;

const FilterBar = () => {
  const {
    allCompanies,
    maxAiPerformance,
    filterCompany,
    setFilterCompany,
    filterModelKeyword,
    setFilterModelKeyword,
    filterAiRange,
    setFilterAiRange,
    resetFilter,
    filteredChips,
    selectedTags,
    tagLogic,
    saveFilterView
  } = useChipStore();

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [viewName, setViewName] = useState('');

  const handleAiMinChange = (value) => {
    const minValue = value || 0;
    setFilterAiRange([minValue, filterAiRange[1]]);
  };

  const handleAiMaxChange = (value) => {
    const maxValue = value || maxAiPerformance;
    setFilterAiRange([filterAiRange[0], maxValue]);
  };

  const handleSaveFilterView = () => {
    if (!viewName.trim()) {
      message.warning('请输入筛选视图名称');
      return;
    }
    
    const result = saveFilterView(viewName);
    if (result.success) {
      message.success(result.message);
      setViewName('');
      setIsModalVisible(false);
    } else {
      message.warning(result.message);
    }
  };

  const handleOpenSaveModal = () => {
    // 检查是否有筛选条件
    const hasFilters = selectedTags.length > 0 || filterCompany || filterModelKeyword || 
                       (filterAiRange[0] !== 0 || filterAiRange[1] !== maxAiPerformance);
    
    if (!hasFilters) {
      message.warning('当前没有任何筛选条件，请先设置筛选条件');
      return;
    }
    
    setIsModalVisible(true);
  };

  const companyOptions = allCompanies.map(c => ({ label: c, value: c }));

  return (
    <Card
      bordered={false}
      style={{
        background: '#fff',
        borderRadius: '8px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
        marginBottom: 16
      }}
      bodyStyle={{ padding: '20px 24px' }}
    >
      <Row gutter={[24, 16]} align="middle">
        <Col xs={24} md={24} lg={4}>
          <Space align="center" style={{ height: '100%' }}>
            <div
              style={{
                width: 40,
                height: 40,
                background: '#eff6ff',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#2563eb',
                fontSize: '20px'
              }}
            >
              <FilterOutlined />
            </div>
            <div>
              <Text strong style={{ fontSize: 16, display: 'block', lineHeight: 1.2, color: '#1e293b' }}>
                筛选查询
              </Text>
              <div style={{ fontSize: 13, color: '#64748b', marginTop: 2 }}>
                找到 <span style={{ color: '#e11d48', fontWeight: 600 }}>{filteredChips.length}</span> 款芯片
              </div>
            </div>
          </Space>
        </Col>

        <Col xs={24} md={24} lg={20}>
          <Row gutter={[20, 16]} align="middle">
            <Col xs={24} sm={12} md={6}>
              <div style={{ marginBottom: 6, color: '#475569', fontSize: '13px', fontWeight: 600 }}>
                芯片厂商
              </div>
              <Select
                placeholder="选择厂商"
                style={{ width: '100%' }}
                allowClear
                showSearch
                value={filterCompany}
                onChange={setFilterCompany}
                options={companyOptions}
                filterOption={(input, option) =>
                  (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                }
              />
            </Col>

            <Col xs={24} sm={12} md={6}>
              <div style={{ marginBottom: 6, color: '#475569', fontSize: '13px', fontWeight: 600 }}>
                型号关键词
              </div>
              <Input
                placeholder="输入型号搜索..."
                prefix={<SearchOutlined style={{ color: '#94a3b8' }} />}
                value={filterModelKeyword}
                onChange={(e) => setFilterModelKeyword(e.target.value)}
                allowClear
                style={{ borderRadius: 6 }}
              />
            </Col>

            <Col xs={24} sm={24} md={8}>
              <div style={{ marginBottom: 6 }}>
                <Space size="small">
                  <RocketOutlined style={{ color: '#7c3aed', fontSize: 14 }} />
                  <span style={{ color: '#475569', fontSize: '13px', fontWeight: 600 }}>AI算力 (TOPS)</span>
                </Space>
              </div>
              <Space size={8} style={{ width: '100%' }}>
                <InputNumber
                  min={0}
                  max={filterAiRange[1]}
                  value={filterAiRange[0]}
                  onChange={handleAiMinChange}
                  placeholder="最小值"
                  style={{ width: '100%', flex: 1 }}
                  controls={false}
                  formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
                />
                <span style={{ color: '#94a3b8', fontWeight: 600 }}>-</span>
                <InputNumber
                  min={filterAiRange[0]}
                  max={maxAiPerformance}
                  value={filterAiRange[1]}
                  onChange={handleAiMaxChange}
                  placeholder="最大值"
                  style={{ width: '100%', flex: 1 }}
                  controls={false}
                  formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
                />
              </Space>
            </Col>

            <Col xs={24} sm={24} md={4} style={{ textAlign: 'right' }}>
              <Space size={8} style={{ width: '100%', marginTop: 26 }}>
                <Button 
                  icon={<SaveOutlined />} 
                  onClick={handleOpenSaveModal}
                  style={{ 
                    height: 34, 
                    borderRadius: 6,
                    color: '#2563eb',
                    borderColor: '#93c5fd',
                    background: '#eff6ff',
                    fontWeight: 500,
                    flex: 1
                  }}
                >
                  保存视图
                </Button>
                <Button 
                  icon={<ReloadOutlined />} 
                  onClick={resetFilter}
                  style={{ 
                    height: 34, 
                    borderRadius: 6,
                    color: '#334155',
                    borderColor: '#cbd5e1',
                    fontWeight: 500,
                    flex: 1
                  }}
                >
                  重置
                </Button>
              </Space>
            </Col>
          </Row>
        </Col>
      </Row>

      <Modal
        title={
          <Space>
            <SaveOutlined style={{ color: '#2563eb' }} />
            <span style={{ fontWeight: 600, color: '#0f172a' }}>保存筛选视图</span>
          </Space>
        }
        open={isModalVisible}
        onOk={handleSaveFilterView}
        onCancel={() => {
          setIsModalVisible(false);
          setViewName('');
        }}
        okText="保存"
        cancelText="取消"
        centered
        width={420}
        okButtonProps={{ 
          style: { 
            background: '#2563eb', 
            borderColor: '#2563eb',
            fontWeight: 500
          } 
        }}
      >
        <Space direction="vertical" style={{ width: '100%', marginTop: 20 }} size="large">
          <div>
            <div style={{ marginBottom: 8, fontWeight: 500, color: '#334155' }}>视图名称</div>
            <Input
              placeholder="例如：高算力AI芯片、NVIDIA筛选..."
              value={viewName}
              onChange={(e) => setViewName(e.target.value)}
              maxLength={30}
              autoFocus
              size="large"
              onPressEnter={handleSaveFilterView}
            />
          </div>
          
          <div style={{ 
            background: '#f8fafc', 
            padding: 16, 
            borderRadius: 8, 
            border: '1px solid #e2e8f0' 
          }}>
            <div style={{ marginBottom: 12, fontSize: 13, color: '#64748b', fontWeight: 500 }}>
              当前筛选条件：
            </div>
            <Space direction="vertical" size={8} style={{ width: '100%' }}>
              {filterCompany && (
                <div style={{ fontSize: 12, color: '#334155' }}>
                  <span style={{ color: '#64748b' }}>芯片厂商：</span>
                  <span style={{ fontWeight: 600 }}>{filterCompany}</span>
                </div>
              )}
              {filterModelKeyword && (
                <div style={{ fontSize: 12, color: '#334155' }}>
                  <span style={{ color: '#64748b' }}>型号关键词：</span>
                  <span style={{ fontWeight: 600 }}>{filterModelKeyword}</span>
                </div>
              )}
              {(filterAiRange[0] !== 0 || filterAiRange[1] !== maxAiPerformance) && (
                <div style={{ fontSize: 12, color: '#334155' }}>
                  <span style={{ color: '#64748b' }}>AI算力范围：</span>
                  <span style={{ fontWeight: 600 }}>{filterAiRange[0]} - {filterAiRange[1]} TOPS</span>
                </div>
              )}
              {selectedTags && selectedTags.length > 0 && (
                <div style={{ fontSize: 12, color: '#334155' }}>
                  <span style={{ color: '#64748b' }}>标签筛选（{tagLogic === 'and' ? 'AND' : 'OR'}）：</span>
                  <span style={{ fontWeight: 600 }}>{selectedTags.join(', ')}</span>
                </div>
              )}
            </Space>
          </div>
        </Space>
      </Modal>
    </Card>
  );
};

export default FilterBar;