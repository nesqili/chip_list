import React from 'react';
import { Card, Select, Input, Button, Space, Row, Col, Typography, InputNumber } from 'antd';
import { SearchOutlined, ReloadOutlined, FilterOutlined, RocketOutlined } from '@ant-design/icons';
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
    filteredChips
  } = useChipStore();

  const handleAiMinChange = (value) => {
    const minValue = value || 0;
    setFilterAiRange([minValue, filterAiRange[1]]);
  };

  const handleAiMaxChange = (value) => {
    const maxValue = value || maxAiPerformance;
    setFilterAiRange([filterAiRange[0], maxValue]);
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
               <Button 
                 icon={<ReloadOutlined />} 
                 onClick={resetFilter}
                 block
                 style={{ 
                   marginTop: 26, 
                   height: 34, 
                   borderRadius: 6,
                   color: '#334155',
                   borderColor: '#cbd5e1',
                   fontWeight: 500
                 }}
               >
                 重置
               </Button>
            </Col>
          </Row>
        </Col>
      </Row>
    </Card>
  );
};

export default FilterBar;