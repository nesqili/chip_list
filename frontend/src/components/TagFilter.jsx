import React, { useState, useEffect } from 'react';
import { Card, Select, Radio, Button, Space, Tag, Empty } from 'antd';
import { FilterOutlined, ClearOutlined, PlusOutlined } from '@ant-design/icons';
import useChipStore from '../stores/chipStore';

const TagFilter = () => {
  const [localSelectedTags, setLocalSelectedTags] = useState([]);
  const [localLogic, setLocalLogic] = useState('or');
  
  const { 
    allTags, 
    selectedTags, 
    tagLogic, 
    setSelectedTags, 
    setTagLogic, 
    resetFilter,
    filteredChips,
    chips
  } = useChipStore();

  useEffect(() => {
    setLocalSelectedTags(selectedTags);
    setLocalLogic(tagLogic);
  }, [selectedTags, tagLogic]);

  const handleTagChange = (tags) => {
    setLocalSelectedTags(tags);
  };

  const handleLogicChange = (e) => {
    setLocalLogic(e.target.value);
  };

  const handleApplyFilter = () => {
    setSelectedTags(localSelectedTags);
    setTagLogic(localLogic);
  };

  const handleResetFilter = () => {
    setLocalSelectedTags([]);
    setLocalLogic('or');
    resetFilter();
  };

  const tagOptions = (allTags || []).map(tag => ({
    label: tag,
    value: tag
  }));

  return (
    <Card 
      title={
        <Space>
          <FilterOutlined />
          <span>标签筛选</span>
        </Space>
      }
      style={{ marginBottom: 16 }}
      extra={
        <Space>
          <Tag color="blue">
            共 {filteredChips?.length || 0} / {chips?.length || 0} 条数据
          </Tag>
        </Space>
      }
    >
      <Space direction="vertical" style={{ width: '100%' }} size="middle">
        <div>
          <div style={{ marginBottom: 8, fontWeight: 500 }}>选择标签：</div>
          <Select
            mode="multiple"
            allowClear
            style={{ width: '100%' }}
            placeholder="请选择要筛选的标签"
            value={localSelectedTags}
            onChange={handleTagChange}
            options={tagOptions}
            maxTagCount="responsive"
            notFoundContent={
              <Empty 
                description="暂无标签，请先为芯片添加标签" 
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
            }
          />
        </div>

        {localSelectedTags.length > 1 && (
          <div>
            <div style={{ marginBottom: 8, fontWeight: 500 }}>筛选逻辑：</div>
            <Radio.Group 
              value={localLogic} 
              onChange={handleLogicChange}
              buttonStyle="solid"
            >
              <Radio.Button value="or">
                或 (OR) - 满足任一标签即可
              </Radio.Button>
              <Radio.Button value="and">
                与 (AND) - 必须满足所有标签
              </Radio.Button>
            </Radio.Group>
          </div>
        )}

        <Space>
          <Button 
            type="primary" 
            icon={<FilterOutlined />}
            onClick={handleApplyFilter}
            disabled={localSelectedTags.length === 0}
          >
            应用筛选
          </Button>
          <Button 
            icon={<ClearOutlined />}
            onClick={handleResetFilter}
            disabled={selectedTags.length === 0}
          >
            清除筛选
          </Button>
        </Space>

        {selectedTags.length > 0 && (
          <div style={{ 
            padding: '12px', 
            background: '#f0f2f5', 
            borderRadius: '6px' 
          }}>
            <Space direction="vertical" size="small" style={{ width: '100%' }}>
              <div style={{ fontWeight: 500 }}>当前筛选条件：</div>
              <Space wrap>
                {selectedTags.map((tag) => {
                  const handleRemoveTag = () => {
                    const newTags = selectedTags.filter(t => t !== tag);
                    setLocalSelectedTags(newTags);
                    setSelectedTags(newTags);
                  };
                  return (
                    <Tag 
                      key={tag} 
                      color="purple" 
                      closable 
                      onClose={handleRemoveTag}
                    >
                      {tag}
                    </Tag>
                  );
                })}
              </Space>
              <div style={{ fontSize: '12px', color: '#666' }}>
                逻辑规则：
                <Tag color={tagLogic === 'and' ? 'blue' : 'green'} style={{ marginLeft: 8 }}>
                  {tagLogic === 'and' ? '与 (AND)' : '或 (OR)'}
                </Tag>
              </div>
            </Space>
          </div>
        )}
      </Space>
    </Card>
  );
};

export default TagFilter;