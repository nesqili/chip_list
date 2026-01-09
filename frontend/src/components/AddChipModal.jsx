import React, { useState } from 'react';
import { Modal, Form, Input, Button, Space, Tag, message, Select, Row, Col } from 'antd';
import { PlusOutlined, SaveOutlined, ThunderboltOutlined } from '@ant-design/icons';
import useChipStore from '../stores/chipStore';

const AddChipModal = ({ visible, onClose }) => {
  const [form] = Form.useForm();
  const [tags, setTags] = useState([]);
  const [searchValue, setSearchValue] = useState('');
  const [autoFilling, setAutoFilling] = useState(false);
  const { addOrUpdateChip, autoFillChipInfo, checkDuplicateChip, allTags } = useChipStore();

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
      message.loading({ content: '正在通过AI搜索外网信息...', key: 'autoFill' });
      
      const chipInfo = await autoFillChipInfo(keyword);
      
      if (chipInfo) {
        form.setFieldsValue({
          company: chipInfo.company || form.getFieldValue('company'),
          model: chipInfo.model || form.getFieldValue('model'),
          releaseDate: chipInfo.releaseDate || '',
          process: chipInfo.process || '',
          power: chipInfo.power || '',
          aiPerformance: chipInfo.aiPerformance || '',
          cpu: chipInfo.cpu || '',
          gpu: chipInfo.gpu || '',
          storage: chipInfo.storage || '',
          modelSupport: chipInfo.modelSupport || '',
          codec: chipInfo.codec || '',
          other: chipInfo.other || ''
        });
        
        if (chipInfo.tags && chipInfo.tags.length > 0) {
          setTags([...new Set([...tags, ...chipInfo.tags])]);
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
      
      // 检查是否存在重复
      const existingChip = checkDuplicateChip(newChip.model);
      
      if (existingChip) {
        // 弹窗确认是否覆盖
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
        // 不存在重复，直接添加
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

  // 处理输入框的键盘事件，支持回车和逗号自动创建标签
  const handleTagInputKeyDown = (e) => {
    if ((e.key === 'Enter' || e.key === ',') && searchValue.trim()) {
      e.preventDefault();
      const newTag = searchValue.trim();
      if (newTag && !tags.includes(newTag)) {
        setTags([...tags, newTag]);
      }
      setSearchValue('');
    }
  };

  // 处理搜索值变化
  const handleSearchChange = (value) => {
    setSearchValue(value);
  };

  return (
    <Modal
      title={
        <Space>
          <PlusOutlined />
          <span>新增芯片信息</span>
        </Space>
      }
      open={visible}
      onCancel={handleClose}
      width={900}
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
      <Row gutter={16}>
        <Col span={18}>
          <Form
            form={form}
            layout="vertical"
            style={{ maxHeight: '60vh', overflowY: 'auto', paddingRight: '16px' }}
          >
            <Form.Item
              label="公司"
              name="company"
              rules={[{ required: true, message: '请输入公司名称' }]}
            >
              <Input placeholder="请输入公司名称" />
            </Form.Item>

            <Form.Item
              label="产品型号"
              name="model"
              rules={[{ required: true, message: '请输入产品型号' }]}
            >
              <Input placeholder="请输入产品型号" />
            </Form.Item>

            <Form.Item label="发布时间" name="releaseDate">
              <Input placeholder="如：2024-Q1" />
            </Form.Item>

            <Form.Item label="制程 (nm)" name="process">
              <Input placeholder="如：5nm" />
            </Form.Item>

            <Form.Item label="功耗 (W)" name="power">
              <Input placeholder="如：150W" />
            </Form.Item>

            <Form.Item label="AI算力 (TOPS)" name="aiPerformance">
              <Input placeholder="如：100 TOPS" />
            </Form.Item>

            <Form.Item label="CPU" name="cpu">
              <Input placeholder="CPU规格" />
            </Form.Item>

            <Form.Item label="GPU" name="gpu">
              <Input placeholder="GPU规格" />
            </Form.Item>

            <Form.Item label="存储" name="storage">
              <Input placeholder="如：16GB LPDDR5" />
            </Form.Item>

            <Form.Item label="可支持大模型运算参数规格" name="modelSupport">
              <Input placeholder="如：支持70B参数模型" />
            </Form.Item>

            <Form.Item label="编解码能力" name="codec">
              <Input.TextArea 
                placeholder="如：支持H.264/H.265/AV1编解码" 
                rows={2}
              />
            </Form.Item>

            <Form.Item label="标签">
              <Space direction="vertical" style={{ width: '100%' }} size="middle">
                <Select
                  mode="multiple"
                  placeholder="输入标签后按回车或逗号添加，也可选择已有标签"
                  value={tags}
                  onChange={handleTagSelect}
                  searchValue={searchValue}
                  onSearch={handleSearchChange}
                  onInputKeyDown={handleTagInputKeyDown}
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

                <Space wrap>
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

            <Form.Item label="其他" name="other">
              <Input.TextArea 
                placeholder="其他补充信息" 
                rows={2}
              />
            </Form.Item>
          </Form>
        </Col>

        <Col span={6}>
          <div style={{ 
            position: 'sticky', 
            top: 0, 
            paddingTop: '32px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center'
          }}>
            <Button
              type="dashed"
              icon={<ThunderboltOutlined />}
              onClick={handleAutoFill}
              loading={autoFilling}
              block
              style={{ 
                height: '80px',
                fontSize: '16px',
                fontWeight: 500
              }}
            >
              {autoFilling ? '补齐中...' : '自动补齐'}
            </Button>
            <div style={{ 
              marginTop: '16px', 
              fontSize: '12px', 
              color: '#999',
              textAlign: 'center',
              padding: '0 8px',
              lineHeight: '1.6'
            }}>
              先输入公司名称或产品型号，点击按钮可通过AI搜索外网信息自动补齐芯片规格
            </div>
          </div>
        </Col>
      </Row>
    </Modal>
  );
};

export default AddChipModal;