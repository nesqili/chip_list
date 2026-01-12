import React, { useState, useEffect } from 'react';
import { Modal, Button, Row, Col, Divider, Space, Tag, message } from 'antd';
import { SaveOutlined, CloseOutlined } from '@ant-design/icons';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import useChipStore from '../stores/chipStore';

const ChipDetailModal = ({ visible, onClose, chipData }) => {
  const [content, setContent] = useState('');
  // 确保 store 中有 getChipDetail 和 saveChipDetail 方法
  const { getChipDetail, saveChipDetail } = useChipStore();

  // 监听 visible 和 chipData 变化，加载数据
  useEffect(() => {
    if (visible && chipData) {
      // 获取已保存的富文本内容（HTML字符串）
      const savedDetail = getChipDetail(chipData.id);
      // ReactQuill 接收 HTML 字符串作为 value，会自动渲染格式
      setContent(savedDetail || '');
    } else if (!visible) {
      // 关闭时清空内容，避免闪烁
      setContent('');
    }
  }, [visible, chipData, getChipDetail]);

  const handleSave = () => {
    if (chipData) {
      // 保存 HTML 内容到 store (最终持久化到 localStorage)
      const result = saveChipDetail(chipData.id, content);
      if (result.success) {
        message.success('详细介绍已保存');
        onClose();
      } else {
        message.error(result.message || '保存失败');
      }
    }
  };

  // 富文本编辑器模块配置
  const modules = {
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike', 'blockquote'],
      [{'list': 'ordered'}, {'list': 'bullet'}],
      [{ 'color': [] }, { 'background': [] }], // 支持颜色和背景色
      ['link', 'image'],
      ['clean']
    ],
  };

  // 支持的格式
  const formats = [
    'header',
    'bold', 'italic', 'underline', 'strike', 'blockquote',
    'list', 'bullet',
    'color', 'background',
    'link', 'image'
  ];

  if (!chipData) return null;

  return (
    <Modal
      title={
        <Space>
          <span style={{ fontSize: '20px' }}>📄</span>
          <span style={{ fontWeight: 600, color: '#0f172a' }}>
            {`${chipData.company} ${chipData.model} - 详细档案`}
          </span>
        </Space>
      }
      open={visible}
      onCancel={onClose}
      width={900}
      style={{ top: 20 }}
      footer={[
        <Button key="cancel" onClick={onClose} icon={<CloseOutlined />}>
          关闭
        </Button>,
        <Button key="save" type="primary" onClick={handleSave} icon={<SaveOutlined />}>
          保存档案
        </Button>
      ]}
      destroyOnClose
      maskClosable={false}
    >
      {/* 顶部规格参数展示区 */}
      <div style={{ 
        background: '#f8fafc', 
        padding: '16px 20px', 
        borderRadius: '8px', 
        marginBottom: '20px',
        border: '1px solid #e2e8f0'
      }}>
        <Divider orientation="left" style={{ margin: '0 0 16px 0', fontSize: '13px', color: '#64748b' }}>
          📊 核心规格快照
        </Divider>
        <Row gutter={[24, 16]}>
          <Col span={8}>
            <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '2px' }}>厂商</div>
            <div style={{ fontWeight: 600, color: '#1e293b' }}>{chipData.company}</div>
          </Col>
          <Col span={8}>
            <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '2px' }}>发布时间</div>
            <div style={{ fontWeight: 500, color: '#1e293b' }}>{chipData.releaseDate || '-'}</div>
          </Col>
          <Col span={8}>
             <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '2px' }}>制程工艺</div>
             <Tag color="blue" style={{ margin: 0 }}>{chipData.process || '-'}</Tag>
          </Col>
          <Col span={8}>
            <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '2px' }}>AI算力</div>
            <div style={{ fontWeight: 700, color: '#7c3aed' }}>{chipData.aiPerformance || '-'}</div>
          </Col>
          <Col span={8}>
            <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '2px' }}>功耗</div>
            <div style={{ fontWeight: 500, color: '#1e293b' }}>{chipData.power || '-'}</div>
          </Col>
          <Col span={8}>
            <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '2px' }}>存储规格</div>
            <div style={{ fontWeight: 500, color: '#1e293b' }}>{chipData.storage || '-'}</div>
          </Col>
          {chipData.modelSupport && (
            <Col span={24}>
              <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '2px' }}>大模型支持</div>
              <div style={{ fontSize: '13px', color: '#334155' }}>{chipData.modelSupport}</div>
            </Col>
          )}
        </Row>
      </div>

      {/* 富文本编辑区 */}
      <div className="chip-detail-editor">
        <div style={{ marginBottom: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Space>
            <span style={{ fontSize: '15px', fontWeight: 600, color: '#334155' }}>📝 深度解析 / 详细资料</span>
          </Space>
          <span style={{ fontSize: '12px', color: '#94a3b8' }}>支持富文本编辑与格式渲染</span>
        </div>
        <div style={{ height: '400px', marginBottom: '24px' }}>
          <ReactQuill 
            theme="snow"
            value={content}
            onChange={setContent}
            modules={modules}
            formats={formats}
            style={{ height: '350px', background: '#fff' }}
            placeholder="在此处输入芯片架构深度分析、性能评测数据、应用案例等详细信息..."
          />
        </div>
      </div>
    </Modal>
  );
};

export default ChipDetailModal;