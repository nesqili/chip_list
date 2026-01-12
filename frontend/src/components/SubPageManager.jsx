import React, { useState, useEffect } from 'react';
import { List, Button, Modal, Input, Space, Tag, message, Popconfirm, Typography, Tooltip, Divider, Empty } from 'antd';
import { PlusOutlined, DeleteOutlined, SaveOutlined, AppstoreOutlined, RightOutlined, FilterOutlined, TagOutlined, MenuFoldOutlined } from '@ant-design/icons';
import useChipStore from '../stores/chipStore';

const { Text } = Typography;

const SubPageManager = ({ onCollapse }) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [pageName, setPageName] = useState('');
  
  const { 
    selectedTags, 
    tagLogic, 
    subPages, 
    saveSubPage, 
    deleteSubPage, 
    loadSubPageView,
    loadSubPages,
    // 新增：筛选视图相关
    filterViews,
    loadFilterViews,
    deleteFilterView,
    loadFilterView,
    maxAiPerformance
  } = useChipStore();

  useEffect(() => {
    loadSubPages();
    loadFilterViews();
  }, [loadSubPages, loadFilterViews]);

  const handleSaveSubPage = () => {
    if (!pageName.trim()) {
      message.warning('请输入子页面名称');
      return;
    }
    
    if (selectedTags.length === 0) {
      message.warning('请至少选择一个标签进行筛选后再保存');
      return;
    }

    saveSubPage(pageName, selectedTags, tagLogic);
    message.success(`视图 "${pageName}" 已保存`);
    setPageName('');
    setIsModalVisible(false);
  };

  const handleDeleteSubPage = (e, subPageId, name) => {
    e.stopPropagation();
    deleteSubPage(subPageId);
    message.success(`视图 "${name}" 已删除`);
  };

  const handleLoadSubPage = (subPage) => {
    loadSubPageView(subPage);
    message.success(`已切换至视图 "${subPage.name}"`);
  };

  // 筛选视图相关操作
  const handleDeleteFilterView = (e, viewId, name) => {
    e.stopPropagation();
    deleteFilterView(viewId);
    message.success(`筛选视图 "${name}" 已删除`);
  };

  const handleLoadFilterView = (view) => {
    loadFilterView(view);
    message.success(`已切换至筛选视图 "${view.name}"`);
  };

  const handleOpenModal = () => {
    if (selectedTags.length === 0) {
      message.warning('请先在右侧选择标签进行筛选');
      return;
    }
    setIsModalVisible(true);
  };

  // 通用列表项样式
  const renderItemStyle = {
    background: '#ffffff',
    borderRadius: '8px',
    padding: '12px',
    marginBottom: '10px',
    border: '1px solid #e2e8f0',
    cursor: 'pointer',
    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
    position: 'relative',
    boxShadow: '0 1px 2px rgba(0,0,0,0.02)',
  };

  const itemHoverStyle = (e) => {
    e.currentTarget.style.borderColor = '#3b82f6';
    e.currentTarget.style.transform = 'translateY(-1px)';
    e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.05)';
  };

  const itemLeaveStyle = (e) => {
    e.currentTarget.style.borderColor = '#e2e8f0';
    e.currentTarget.style.transform = 'none';
    e.currentTarget.style.boxShadow = '0 1px 2px rgba(0,0,0,0.02)';
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* 头部操作区 */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <Space>
            <AppstoreOutlined style={{ fontSize: '18px', color: '#2563eb' }} />
            <Text strong style={{ fontSize: '16px', color: '#0f172a' }}>我的视图</Text>
          </Space>
          {onCollapse && (
            <Tooltip title="隐藏侧边栏">
              <Button
                type="text"
                size="small"
                icon={<MenuFoldOutlined />}
                onClick={onCollapse}
                style={{ color: '#64748b' }}
              />
            </Tooltip>
          )}
        </div>
        <Button 
          type="primary" 
          icon={<PlusOutlined />} 
          onClick={handleOpenModal}
          block
          style={{ 
            background: '#eff6ff',
            borderColor: '#bfdbfe',
            color: '#000000',
            boxShadow: 'none',
            height: '36px',
            fontWeight: 500
          }}
        >
          保存当前标签视图
        </Button>
      </div>

      <Divider style={{ margin: '8px 0' }} />

      <div style={{ flex: 1, overflowY: 'auto', marginRight: -8, paddingRight: 8 }}>
        
        {/* 综合筛选视图 (来自 FilterBar 保存) */}
        {filterViews.length > 0 && (
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: '12px', fontWeight: 600, color: '#64748b', marginBottom: 8, paddingLeft: 4 }}>
              综合筛选视图 ({filterViews.length})
            </div>
            {filterViews.map(item => (
              <div
                key={item.id}
                onClick={() => handleLoadFilterView(item)}
                style={renderItemStyle}
                onMouseEnter={itemHoverStyle}
                onMouseLeave={itemLeaveStyle}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                    <Space size={6} align="start">
                        <FilterOutlined style={{ color: '#2563eb', marginTop: 3 }} />
                        <Text strong style={{ fontSize: '14px', color: '#334155', maxWidth: '140px' }} ellipsis title={item.name}>
                        {item.name}
                        </Text>
                    </Space>
                    <Popconfirm
                        title="删除此视图?"
                        onConfirm={(e) => handleDeleteFilterView(e, item.id, item.name)}
                        onCancel={(e) => e.stopPropagation()}
                        okText="删除"
                        cancelText="取消"
                        okButtonProps={{ danger: true, size: 'small' }}
                        cancelButtonProps={{ size: 'small' }}
                    >
                        <Tooltip title="删除">
                        <Button 
                            type="text" size="small" danger icon={<DeleteOutlined />} 
                            onClick={(e) => e.stopPropagation()}
                            style={{ minWidth: 24, width: 24, height: 24, padding: 0 }}
                        />
                        </Tooltip>
                    </Popconfirm>
                </div>
                
                <div style={{ fontSize: '11px', color: '#64748b', marginBottom: 8, display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                   {item.filterCompany && <Tag style={{ fontSize: 10, margin: 0, border: 'none', background: '#f1f5f9' }}>{item.filterCompany}</Tag>}
                   {item.filterModelKeyword && <Tag style={{ fontSize: 10, margin: 0, border: 'none', background: '#f1f5f9' }}>kw:{item.filterModelKeyword}</Tag>}
                   {(item.filterAiRange && (item.filterAiRange[0] !== 0 || item.filterAiRange[1] !== maxAiPerformance)) && (
                       <Tag style={{ fontSize: 10, margin: 0, border: 'none', background: '#f1f5f9' }}>AI:{item.filterAiRange[0]}-{item.filterAiRange[1]}</Tag>
                   )}
                   {item.selectedTags && item.selectedTags.length > 0 && (
                       <Tag style={{ fontSize: 10, margin: 0, border: 'none', background: '#f1f5f9' }}>标签:{item.selectedTags.length}</Tag>
                   )}
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f1f5f9', paddingTop: 6 }}>
                    <span style={{ fontSize: '11px', color: '#94a3b8' }}>{new Date(item.createdAt).toLocaleDateString()}</span>
                    <Space size={4} style={{ fontSize: '11px', color: '#2563eb' }}>
                    <span>加载</span><RightOutlined style={{ fontSize: 10 }} />
                    </Space>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 标签组合视图 */}
        <div style={{ marginBottom: 20 }}>
            {subPages.length > 0 && (
                <div style={{ fontSize: '12px', fontWeight: 600, color: '#64748b', marginBottom: 8, paddingLeft: 4 }}>
                标签组合视图 ({subPages.length})
                </div>
            )}
            
            {subPages.length === 0 && filterViews.length === 0 && (
                <Empty 
                    image={Empty.PRESENTED_IMAGE_SIMPLE} 
                    description={<span style={{fontSize: 12, color: '#94a3b8'}}>暂无保存的视图</span>} 
                />
            )}
            
            {subPages.map(item => (
                <div
                key={item.id}
                onClick={() => handleLoadSubPage(item)}
                style={renderItemStyle}
                onMouseEnter={itemHoverStyle}
                onMouseLeave={itemLeaveStyle}
                >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                    <Space size={6} align="start">
                        <TagOutlined style={{ color: '#8b5cf6', marginTop: 3 }} />
                        <Text strong style={{ fontSize: '14px', color: '#334155', maxWidth: '140px' }} ellipsis title={item.name}>
                            {item.name}
                        </Text>
                    </Space>
                    
                    <Popconfirm
                    title="删除此视图?"
                    onConfirm={(e) => handleDeleteSubPage(e, item.id, item.name)}
                    onCancel={(e) => e.stopPropagation()}
                    okText="删除"
                    cancelText="取消"
                    okButtonProps={{ danger: true, size: 'small' }}
                    cancelButtonProps={{ size: 'small' }}
                    >
                    <Tooltip title="删除">
                        <Button 
                        type="text" size="small" danger icon={<DeleteOutlined />} 
                        onClick={(e) => e.stopPropagation()}
                        style={{ minWidth: 24, width: 24, height: 24, padding: 0 }}
                        />
                    </Tooltip>
                    </Popconfirm>
                </div>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginBottom: 8 }}>
                    <Tag style={{ marginRight: 0, fontSize: '10px', lineHeight: '18px', border: 'none', padding: '0 6px', fontWeight: 600, background: item.logic === 'and' ? '#dbeafe' : '#d1fae5', color: item.logic === 'and' ? '#1e40af' : '#065f46' }}>
                    {item.logic === 'and' ? 'AND' : 'OR'}
                    </Tag>
                    {item.tags.slice(0, 2).map((tag, idx) => (
                    <Tag key={idx} style={{ marginRight: 0, fontSize: '10px', lineHeight: '18px', padding: '0 6px', maxWidth: '80px', overflow: 'hidden', textOverflow: 'ellipsis', background: '#faf5ff', color: '#6b21a8', border: 'none' }}>
                        {tag}
                    </Tag>
                    ))}
                    {item.tags.length > 2 && (
                    <Tag style={{ fontSize: '10px', padding: '0 4px', marginRight: 0, background: '#f1f5f9', color: '#64748b', border: 'none' }}>
                        +{item.tags.length - 2}
                    </Tag>
                    )}
                </div>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f1f5f9', paddingTop: 6 }}>
                    <span style={{ fontSize: '11px', color: '#94a3b8' }}>{new Date(item.createdAt).toLocaleDateString()}</span>
                    <Space size={4} style={{ fontSize: '11px', color: '#2563eb' }}>
                    <span>加载</span><RightOutlined style={{ fontSize: 10 }} />
                    </Space>
                </div>
                </div>
            ))}
        </div>
      </div>

      <Modal
        title={
          <Space>
             <SaveOutlined style={{ color: '#2563eb' }} />
             <span style={{ fontWeight: 600, color: '#0f172a' }}>保存当前标签视图</span>
          </Space>
        }
        open={isModalVisible}
        onOk={handleSaveSubPage}
        onCancel={() => {
          setIsModalVisible(false);
          setPageName('');
        }}
        okText="保存"
        cancelText="取消"
        centered
        width={420}
        okButtonProps={{ style: { background: '#eff6ff', borderColor: '#bfdbfe', color: '#1e40af', fontWeight: 500 } }}
        cancelButtonProps={{ style: { borderColor: '#cbd5e1', color: '#475569' } }}
      >
        <Space direction="vertical" style={{ width: '100%', marginTop: 20 }} size="large">
          <div>
            <div style={{ marginBottom: 8, fontWeight: 500, color: '#334155' }}>视图名称</div>
            <Input
              placeholder="例如：高性能AI芯片..."
              value={pageName}
              onChange={(e) => setPageName(e.target.value)}
              maxLength={20}
              autoFocus
              size="large"
            />
          </div>
          
          <div style={{ background: '#f8fafc', padding: 16, borderRadius: 8, border: '1px solid #e2e8f0' }}>
            <div style={{ marginBottom: 12, fontSize: 13, color: '#64748b', fontWeight: 500 }}>
              包含以下标签筛选：
            </div>
            <Space size={6} wrap>
              <Tag style={{ fontSize: 12, background: tagLogic === 'and' ? '#dbeafe' : '#d1fae5', color: tagLogic === 'and' ? '#1e40af' : '#065f46', border: 'none', fontWeight: 500 }}>
                 {tagLogic === 'and' ? '逻辑：必须满足所有(AND)' : '逻辑：满足任一(OR)'}
              </Tag>
              {selectedTags.map(tag => (
                <Tag key={tag} style={{ fontSize: 12, background: '#faf5ff', color: '#6b21a8', border: 'none' }}>
                  {tag}
                </Tag>
              ))}
            </Space>
          </div>
        </Space>
      </Modal>
    </div>
  );
};

export default SubPageManager;