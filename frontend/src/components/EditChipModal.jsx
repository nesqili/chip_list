import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, Button, Space, Tag, message, Select } from 'antd';
import { EditOutlined, SaveOutlined, PlusOutlined } from '@ant-design/icons';
import useChipStore from '../stores/chipStore';

const EditChipModal = ({ visible, onClose, chipData }) => {
  const [form] = Form.useForm();
  const [tags, setTags] = useState([]);
  const [inputVisible, setInputVisible] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const { updateChip, allTags } = useChipStore();

  useEffect(() => {
    if (visible && chipData) {
      form.setFieldsValue({
        company: chipData.company || '',
        model: chipData.model || '',
        releaseDate: chipData.releaseDate || '',
        process: chipData.process || '',
        power: chipData.power || '',
        aiPerformance: chipData.aiPerformance || '',
        cpu: chipData.cpu || '',
        gpu: chipData.gpu || '',
        storage: chipData.storage || '',
        modelSupport: chipData.modelSupport || '',
        codec: chipData.codec || '',
        other: chipData.other || ''
      });
      setTags(chipData.tags || []);
    }
  }, [visible, chipData, form]);

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      const updatedChip = {
        ...values,
        tags
      };
      
      updateChip(chipData.id, updatedChip);
      message.success('芯片信息已更新');
      handleClose();
    } catch (error) {
      console.error('保存失败:', error);
    }
  };

  const handleClose = () => {
    form.resetFields();
    setTags([]);
    setInputVisible(false);
    setInputValue('');
    onClose();
  };

  const handleTagClose = (removedTag) => {
    setTags(tags.filter(tag => tag !== removedTag));
  };

  const handleInputConfirm = () => {
    if (inputValue && !tags.includes(inputValue)) {
      setTags([...tags, inputValue]);
    }
    setInputVisible(false);
    setInputValue('');
  };

  const showInput = () => {
    setInputVisible(true);
  };

  const handleTagSelect = (selectedTags) => {
    setTags(selectedTags);
  };

  return (
    <Modal
      title={
        <Space>
          <EditOutlined />
          <span>编辑芯片信息</span>
        </Space>
      }
      open={visible}
      onCancel={handleClose}
      width={800}
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
              placeholder="选择已有标签或添加新标签"
              value={tags}
              onChange={handleTagSelect}
              style={{ width: '100%' }}
              options={allTags.map(tag => ({ label: tag, value: tag }))}
              dropdownRender={(menu) => (
                <>
                  {menu}
                  <div style={{ padding: '8px', borderTop: '1px solid #f0f0f0' }}>
                    <Button
                      type="text"
                      icon={<PlusOutlined />}
                      onClick={showInput}
                      block
                    >
                      添加新标签
                    </Button>
                  </div>
                </>
              )}
            />
            
            {inputVisible && (
              <Input
                type="text"
                size="small"
                style={{ width: '200px' }}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onBlur={handleInputConfirm}
                onPressEnter={handleInputConfirm}
                placeholder="输入新标签"
                autoFocus
              />
            )}

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
    </Modal>
  );
};

export default EditChipModal;