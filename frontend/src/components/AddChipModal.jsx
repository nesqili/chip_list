import React, { useState } from 'react';
import { Modal, Form, Input, Button, Space, Tag, message, Select, Row, Col, Divider, Tooltip } from 'antd';
import { PlusOutlined, SaveOutlined, ThunderboltOutlined, InfoCircleOutlined } from '@ant-design/icons';
import useChipStore from '../stores/chipStore';
import { fetchAIChipInfo } from '../utils/api';

const AddChipModal = ({ visible, onClose }) => {
  const [form] = Form.useForm();
  const [tags, setTags] = useState([]);
  const [searchValue, setSearchValue] = useState('');
  const [autoFilling, setAutoFilling] = useState(false);
  const { addOrUpdateChip, checkDuplicateChip, allTags } = useChipStore();

  const handleAutoFill = async () => {
    const model = form.getFieldValue('model');
    const company = form.getFieldValue('company');
    
    if (!model && !company) {
      message.warning('请先输入产品型号或公司名称');
      return;
    }

    setAutoFilling(true);
    try {
      const keyword = model || company;
      message.loading({ content: '正在通过AI搜索外网信息...', key: 'autoFill', duration: 0 });
      
      const chipInfo = await fetchAIChipInfo(keyword);
      
      if (chipInfo && chipInfo.company && chipInfo.company !== '') {
        // 获取当前表单所有字段值
        const currentValues = form.getFieldsValue();
        
        // 智能合并策略：优先使用 AI 返回的非空数据，其次保留用户已输入的数据
        const mergedValues = {
          company: chipInfo.company || currentValues.company || '',
          model: chipInfo.model || currentValues.model || '',
          releaseDate: chipInfo.releaseDate || currentValues.releaseDate || '',
          process: chipInfo.process || currentValues.process || '',
          power: chipInfo.power || currentValues.power || '',
          aiPerformance: chipInfo.aiPerformance || currentValues.aiPerformance || '',
          cpu: chipInfo.cpu || currentValues.cpu || '',
          gpu: chipInfo.gpu || currentValues.gpu || '',
          storage: chipInfo.storage || currentValues.storage || '',
          modelSupport: chipInfo.modelSupport || currentValues.modelSupport || '',
          codec: chipInfo.codec || currentValues.codec || '',
          other: chipInfo.other || currentValues.other || ''
        };
        
        // 批量设置表单值
        form.setFieldsValue(mergedValues);
        
        // 合并标签（去重）
        if (chipInfo.tags && chipInfo.tags.length > 0) {
          setTags(prev => [...new Set([...prev, ...chipInfo.tags])]);
        }
        
        message.success({ content: '已通过AI搜索自动补齐相关信息', key: 'autoFill' });
      } else {
        message.info({ content: '未找到匹配的芯片信息，请手动输入', key: 'autoFill' });
      }
    } catch (error) {
      message.error({ content: '自动补齐失败，请检查网络连接', key: 'autoFill' });
      console.error('自动补齐错误:', error);
    } finally {
      setAutoFilling(false);
    }
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      const newChip = {
        ...values,
        tags
      };
      
      const existingChip = checkDuplicateChip(newChip.model);
      
      if (existingChip) {
        Modal.confirm({
          title: '检测到重复条目',
          content: (
            <div>
              <p>数据库中已存在型号为 <strong>{existingChip.model}</strong> 的芯片信息。</p>
              <p>是否要覆盖该条目？</p>
              <div style={{ marginTop: 12, padding: 12, background: '#f5f5f5', borderRadius: 4 }}>
                <div><strong>现有数据：</strong></div>
                <div>公司：{existingChip.company}</div>
                <div>制程：{existingChip.process}</div>
                <div>AI算力：{existingChip.aiPerformance}</div>
              </div>
            </div>
          ),
          okText: '覆盖',
          okType: 'danger',
          cancelText: '取消',
          onOk: () => {
            const result = addOrUpdateChip(newChip, true);
            if (result.success) {
              message.success('芯片信息已覆盖更新');
              handleClose();
            }
          },
          onCancel: () => {
            message.info('已取消操作，未更新数据');
          }
        });
      } else {
        const result = addOrUpdateChip(newChip, false);
        if (result.success) {
          message.success('芯片信息已添加');
          handleClose();
        }
      }
    } catch (error) {
      console.error('保存失败:', error);
      message.error('保存失败，请检查输入信息');
    }
  };

  const handleClose = () => {
    form.resetFields();
    setTags([]);
    setSearchValue('');
    onClose();
  };

  const handleTagClose = (removedTag) => {
    setTags(tags.filter(tag => tag !== removedTag));
  };

  const handleTagSelect = (selectedTags) => {
    setTags(selectedTags);
  };

  const handleTagInputKeyDown = (e) => {
    if ((e.key === 'Enter' || e.key === ',' || e.key === 'Tab') && searchValue.trim()) {
      e.preventDefault();
      const newTag = searchValue.trim();
      if (newTag && !tags.includes(newTag)) {
        setTags([...tags, newTag]);
      }
      setSearchValue('');
    }
  };

  const handleSearchChange = (value) => {
    setSearchValue(value);
  };

  const handleTagInputBlur = () => {
    if (searchValue.trim()) {
      const newTag = searchValue.trim();
      if (newTag && !tags.includes(newTag)) {
        setTags([...tags, newTag]);
      }
      setSearchValue('');
    }
  };

  return (
    <Modal
      title={
        <Space>
          <PlusOutlined style={{ color: '#1677ff' }} />
          <span style={{ fontSize: 16, fontWeight: 600 }}>新增芯片信息</span>
        </Space>
      }
      open={visible}
      onCancel={handleClose}
      width={900}
      style={{ top: 20 }}
      footer={[
        <Button key="cancel" onClick={handleClose}>
          取消
        </Button>,
        <Button 
          key="save" 
          type="primary" 
          icon={<SaveOutlined />} 
          onClick={handleSave}
        >
          保存
        </Button>
      ]}
    >
      <div style={{ padding: '0 8px' }}>
        <div style={{ 
          background: '#f8fafc', 
          padding: '16px', 
          borderRadius: '8px', 
          marginBottom: '20px',
          border: '1px solid #e2e8f0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ flex: 1 }}>
            <h4 style={{ margin: '0 0 4px 0', fontSize: '14px', color: '#334155' }}>AI 智能补齐</h4>
            <div style={{ fontSize: '12px', color: '#64748b' }}>
              输入"公司"或"型号"后，点击右侧按钮自动搜索并填充规格参数。
            </div>
          </div>
          <Button
            type="default"
            icon={<ThunderboltOutlined />}
            onClick={handleAutoFill}
            loading={autoFilling}
            style={{ 
              height: '36px', 
              padding: '0 20px', 
              fontWeight: 600,
              color: '#000000',
              background: '#fef3c7',
              borderColor: '#fbbf24',
              boxShadow: '0 2px 4px rgba(251, 191, 36, 0.2)'
            }}
          >
            {autoFilling ? '正在搜索...' : '⚡ 自动补齐'}
          </Button>
        </div>

        <Form
          form={form}
          layout="vertical"
          style={{ maxHeight: '65vh', overflowY: 'auto', paddingRight: '8px' }}
        >
          <Divider orientation="left" style={{ margin: '0 0 16px 0', fontSize: '13px', color: '#94a3b8' }}>基本信息</Divider>
          
          <Row gutter={24}>
            <Col span={12}>
              <Form.Item
                label="公司"
                name="company"
                rules={[{ required: true, message: '请输入公司名称' }]}
              >
                <Input placeholder="例如：NVIDIA" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="产品型号"
                name="model"
                rules={[{ required: true, message: '请输入产品型号' }]}
              >
                <Input placeholder="例如：H100 Tensor Core GPU" />
              </Form.Item>
            </Col>
          </Row>

          <Divider orientation="left" style={{ margin: '8px 0 16px 0', fontSize: '13px', color: '#94a3b8' }}>核心规格</Divider>

          <Row gutter={24}>
            <Col span={8}>
              <Form.Item label="发布时间" name="releaseDate">
                <Input placeholder="例如：2024-Q1" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label="制程 (nm)" name="process">
                <Input placeholder="例如：4nm" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label="功耗 (W)" name="power">
                <Input placeholder="例如：700W" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={24}>
            <Col span={12}>
              <Form.Item label="AI算力 (TOPS)" name="aiPerformance">
                <Input placeholder="例如：4000 TOPS (INT8)" suffix={<Tooltip title="通常指INT8或FP8峰值算力"><InfoCircleOutlined style={{color:'#ccc'}}/></Tooltip>} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="存储" name="storage">
                <Input placeholder="例如：80GB HBM3" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={24}>
            <Col span={12}>
              <Form.Item label="CPU" name="cpu">
                <Input placeholder="CPU 规格信息" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="GPU" name="gpu">
                <Input placeholder="GPU 架构信息" />
              </Form.Item>
            </Col>
          </Row>

          <Divider orientation="left" style={{ margin: '8px 0 16px 0', fontSize: '13px', color: '#94a3b8' }}>高级特性</Divider>

          <Row gutter={24}>
            <Col span={24}>
              <Form.Item label="可支持大模型运算参数规格" name="modelSupport">
                <Input placeholder="例如：支持Trillion-parameter models training" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={24}>
            <Col span={24}>
              <Form.Item label="编解码能力" name="codec">
                <Input.TextArea 
                  placeholder="例如：7 NVDEC, 7 NVJPEG" 
                  rows={1}
                  autoSize={{ minRows: 1, maxRows: 3 }}
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item label="标签">
            <Space direction="vertical" style={{ width: '100%' }} size="small">
              <Select
                mode="multiple"
                placeholder="输入标签后按回车、逗号或失焦自动添加"
                value={tags}
                onChange={handleTagSelect}
                searchValue={searchValue}
                onSearch={handleSearchChange}
                onInputKeyDown={handleTagInputKeyDown}
                onBlur={handleTagInputBlur}
                style={{ width: '100%' }}
                options={allTags.map(tag => ({ label: tag, value: tag }))}
                filterOption={(input, option) =>
                  option.label.toLowerCase().includes(input.toLowerCase())
                }
                dropdownRender={(menu) => (
                  <>
                    {menu}
                    {searchValue && !tags.includes(searchValue.trim()) && (
                      <div style={{ padding: '8px', borderTop: '1px solid #f0f0f0', color: '#999', fontSize: '12px' }}>
                        按 Enter 或 逗号键创建新标签: <strong>{searchValue.trim()}</strong>
                      </div>
                    )}
                  </>
                )}
              />
              <Space wrap size={[0, 4]}>
                {tags.map((tag, index) => (
                  <Tag
                    key={index}
                    closable
                    onClose={() => handleTagClose(tag)}
                    color="purple"
                  >
                    {tag}
                  </Tag>
                ))}
              </Space>
            </Space>
          </Form.Item>

          <Form.Item label="其他备注" name="other">
            <Input.TextArea 
              placeholder="其他补充信息" 
              rows={2}
            />
          </Form.Item>
        </Form>
      </div>
    </Modal>
  );
};

export default AddChipModal;