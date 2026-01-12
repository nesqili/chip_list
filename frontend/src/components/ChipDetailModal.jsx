import React, { useState, useEffect } from 'react';
import { Modal, Button, Divider, Space, Tag, message, Segmented } from 'antd';
import { SaveOutlined, CloseOutlined, EditOutlined, RollbackOutlined, FileMarkdownOutlined, FormatPainterOutlined } from '@ant-design/icons';
import ReactMarkdown from 'react-markdown';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import useChipStore from '../stores/chipStore';

const ChipDetailModal = ({ visible, onClose, chipData }) => {
  const [content, setContent] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editorMode, setEditorMode] = useState('rich'); // 'rich' | 'markdown'
  
  const { getChipDetail, saveChipDetail } = useChipStore();

  useEffect(() => {
    if (visible && chipData) {
      const savedDetail = getChipDetail(chipData.id);
      const initialContent = savedDetail || '';
      setContent(initialContent);
      
      const hasContent = initialContent && initialContent.trim().length > 0;
      
      if (hasContent) {
        setIsEditing(false);
      } else {
        setIsEditing(true);
      }
    } else if (!visible) {
      setContent('');
      setIsEditing(false);
      setEditorMode('rich');
    }
  }, [visible, chipData, getChipDetail]);

  const handleSave = () => {
    if (chipData) {
      const result = saveChipDetail(chipData.id, content);
      if (result.success) {
        message.success('详细介绍已保存');
        setIsEditing(false);
      } else {
        message.error(result.message || '保存失败');
      }
    }
  };

  const handleCancelEdit = () => {
    const savedDetail = getChipDetail(chipData.id);
    setContent(savedDetail || '');
    setIsEditing(false);
  };

  const handleModeChange = (value) => {
    setEditorMode(value);
  };

  if (!chipData) return null;

  const quillModules = {
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'color': [] }, { 'background': [] }],
      ['link', 'image'],
      ['clean']
    ]
  };

  const renderFooter = () => {
    const buttons = [
      <Button key="close" onClick={onClose} icon={<CloseOutlined />}>
        关闭
      </Button>
    ];

    if (isEditing) {
      buttons.push(
        <Button key="cancel-edit" onClick={handleCancelEdit} icon={<RollbackOutlined />}>
          取消编辑
        </Button>,
        <Button key="save" type="primary" onClick={handleSave} icon={<SaveOutlined />}>
          保存档案
        </Button>
      );
    } else {
      buttons.push(
        <Button key="edit" type="primary" onClick={() => setIsEditing(true)} icon={<EditOutlined />}>
          编辑内容
        </Button>
      );
    }
    return buttons;
  };

  return (
    <Modal
      title={
        <Space>
          <span style={{ fontSize: '20px' }}>📄</span>
          <span style={{ fontWeight: 600, color: '#0f172a' }}>
            {`${chipData.company} ${chipData.model} - 详细档案`}
          </span>
          {isEditing ? <Tag color="orange">编辑模式</Tag> : <Tag color="blue">预览模式</Tag>}
        </Space>
      }
      open={visible}
      onCancel={onClose}
      width={900}
      style={{ top: 20 }}
      footer={renderFooter()}
      destroyOnClose
      maskClosable={false}
    >
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
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px 24px' }}>
          <div>
            <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '2px' }}>厂商</div>
            <div style={{ fontWeight: 600, color: '#1e293b' }}>{chipData.company}</div>
          </div>
          <div>
            <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '2px' }}>发布时间</div>
            <div style={{ fontWeight: 500, color: '#1e293b' }}>{chipData.releaseDate || '-'}</div>
          </div>
          <div>
            <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '2px' }}>制程工艺</div>
            <Tag color="blue" style={{ margin: 0 }}>{chipData.process || '-'}</Tag>
          </div>
          <div>
            <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '2px' }}>AI算力</div>
            <div style={{ fontWeight: 700, color: '#7c3aed' }}>{chipData.aiPerformance || '-'}</div>
          </div>
          <div>
            <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '2px' }}>功耗</div>
            <div style={{ fontWeight: 500, color: '#1e293b' }}>{chipData.power || '-'}</div>
          </div>
          <div>
            <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '2px' }}>存储规格</div>
            <div style={{ fontWeight: 500, color: '#1e293b' }}>{chipData.storage || '-'}</div>
          </div>
          {chipData.modelSupport && (
            <div style={{ gridColumn: '1 / -1' }}>
              <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '2px' }}>大模型支持</div>
              <div style={{ fontSize: '13px', color: '#334155' }}>{chipData.modelSupport}</div>
            </div>
          )}
        </div>
      </div>

      <div className="chip-detail-editor">
        <div style={{ marginBottom: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Space>
            <span style={{ fontSize: '15px', fontWeight: 600, color: '#334155' }}>📝 深度解析 / 详细资料</span>
          </Space>
          {isEditing && (
            <Segmented
              value={editorMode}
              onChange={handleModeChange}
              options={[
                {
                  label: (
                    <Space size={4}>
                      <FormatPainterOutlined />
                      <span>富文本</span>
                    </Space>
                  ),
                  value: 'rich',
                },
                {
                  label: (
                    <Space size={4}>
                      <FileMarkdownOutlined />
                      <span>Markdown</span>
                    </Space>
                  ),
                  value: 'markdown',
                },
              ]}
            />
          )}
          {!isEditing && (
            <span style={{ fontSize: '12px', color: '#94a3b8' }}>
              当前为预览模式，点击下方"编辑内容"进行修改
            </span>
          )}
        </div>
        
        <div style={{ minHeight: '400px', marginBottom: '24px' }}>
          {isEditing ? (
            <div>
              {editorMode === 'markdown' ? (
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="在此处输入 Markdown 格式内容...&#10;&#10;# 一级标题&#10;## 二级标题&#10;&#10;**粗体** *斜体*&#10;&#10;- 列表项&#10;&#10;[链接](url)"
                  style={{
                    width: '100%',
                    minHeight: '400px',
                    padding: '16px',
                    fontSize: '14px',
                    fontFamily: 'Consolas, Monaco, monospace',
                    border: '1px solid #d9d9d9',
                    borderRadius: '6px',
                    resize: 'vertical',
                    lineHeight: '1.6'
                  }}
                />
              ) : (
                <ReactQuill
                  value={content}
                  onChange={setContent}
                  modules={quillModules}
                  placeholder="在此处输入富文本内容，支持加粗、列表、图片等格式..."
                  style={{ minHeight: '400px', background: '#fff' }}
                />
              )}
            </div>
          ) : (
            <div
              style={{
                minHeight: '400px',
                padding: '16px',
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '6px',
                fontSize: '14px',
                lineHeight: '1.8',
                color: '#334155'
              }}
            >
              {content && content.trim().length > 0 ? (
                content.includes('<') && content.includes('>') ? (
                  <div dangerouslySetInnerHTML={{ __html: content }} />
                ) : (
                  <ReactMarkdown>{content}</ReactMarkdown>
                )
              ) : (
                <div style={{ textAlign: 'center', padding: '80px 20px', color: '#94a3b8' }}>
                  <div style={{ fontSize: '48px', marginBottom: '16px' }}>📝</div>
                  <div style={{ fontSize: '16px', fontWeight: 500, marginBottom: '8px' }}>暂无详细介绍</div>
                  <div style={{ fontSize: '13px' }}>点击下方"编辑内容"按钮添加芯片详细资料</div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <style>{`
        .chip-detail-editor .ql-container {
          min-height: 350px;
          font-size: 14px;
        }
        .chip-detail-editor .ql-editor {
          min-height: 350px;
          line-height: 1.8;
        }
        .chip-detail-editor h1 {
          font-size: 24px;
          font-weight: 700;
          margin: 24px 0 16px 0;
          padding-bottom: 8px;
          border-bottom: 2px solid #e2e8f0;
          color: #0f172a;
        }
        .chip-detail-editor h2 {
          font-size: 20px;
          font-weight: 600;
          margin: 20px 0 12px 0;
          color: #1e293b;
        }
        .chip-detail-editor h3 {
          font-size: 16px;
          font-weight: 600;
          margin: 16px 0 10px 0;
          color: #334155;
        }
        .chip-detail-editor ul, .chip-detail-editor ol {
          padding-left: 24px;
          margin: 12px 0;
        }
        .chip-detail-editor li {
          margin: 6px 0;
        }
        .chip-detail-editor code {
          background: #f1f5f9;
          padding: 2px 6px;
          border-radius: 3px;
          font-family: 'Courier New', monospace;
          font-size: 13px;
          color: #be185d;
        }
        .chip-detail-editor pre {
          background: #1e293b;
          color: #e2e8f0;
          padding: 16px;
          border-radius: 6px;
          overflow-x: auto;
          margin: 16px 0;
        }
        .chip-detail-editor pre code {
          background: transparent;
          color: inherit;
          padding: 0;
        }
        .chip-detail-editor a {
          color: #2563eb;
          text-decoration: none;
        }
        .chip-detail-editor a:hover {
          text-decoration: underline;
        }
        .chip-detail-editor blockquote {
          border-left: 4px solid #cbd5e1;
          padding-left: 16px;
          margin: 16px 0;
          color: #64748b;
          font-style: italic;
        }
        .chip-detail-editor table {
          width: 100%;
          border-collapse: collapse;
          margin: 16px 0;
        }
        .chip-detail-editor th,
        .chip-detail-editor td {
          border: 1px solid #e2e8f0;
          padding: 8px 12px;
          text-align: left;
        }
        .chip-detail-editor th {
          background: #f8fafc;
          font-weight: 600;
        }
        .chip-detail-editor strong {
          font-weight: 600;
          color: #0f172a;
        }
        .chip-detail-editor em {
          font-style: italic;
          color: #475569;
        }
        .chip-detail-editor img {
          max-width: 100%;
          height: auto;
          border-radius: 4px;
          margin: 12px 0;
        }
      `}</style>
    </Modal>
  );
};

export default ChipDetailModal;