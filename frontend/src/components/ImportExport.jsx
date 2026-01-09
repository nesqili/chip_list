import React, { useState } from 'react';
import { Button, Upload, Space, message, Modal, Alert } from 'antd';
import { DownloadOutlined, UploadOutlined } from '@ant-design/icons';
import useChipStore from '../stores/chipStore';
import { exportToCSV, parseImportedCSV } from '../utils/dataParser';

const ImportExport = () => {
  const { chips, importChips } = useChipStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [importStats, setImportStats] = useState(null);

  // 导出功能
  const handleExport = () => {
    try {
      if (!chips || chips.length === 0) {
        message.warning('当前无数据可导出');
        return;
      }
      const csvContent = exportToCSV(chips);
      // 添加 BOM 防止 Excel 乱码
      const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      
      // 生成带时间戳的文件名
      const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
      link.setAttribute('href', url);
      link.setAttribute('download', `chip_specs_export_${dateStr}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      message.success('数据导出成功');
    } catch (error) {
      console.error('导出失败:', error);
      message.error('导出失败，请重试');
    }
  };

  // 文件上传处理
  const handleUpload = (file) => {
    // 检查文件类型
    const isCSV = file.type === 'text/csv' || file.name.endsWith('.csv');
    if (!isCSV) {
      message.error('请上传 CSV 格式文件');
      return Upload.LIST_IGNORE;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target.result;
        // 解析 CSV
        const parsedData = parseImportedCSV(content);
        
        if (!parsedData || parsedData.length === 0) {
          message.warning('文件中未找到有效数据');
          return;
        }

        // 调用 store 进行合并
        const stats = importChips(parsedData);
        setImportStats(stats);
        setIsModalOpen(true);
        message.success('数据导入处理完成');
      } catch (error) {
        console.error('导入解析失败:', error);
        message.error('文件解析失败，请检查文件格式是否正确');
      }
    };
    reader.onerror = () => {
      message.error('读取文件失败');
    };
    reader.readAsText(file);
    return false; // 阻止默认上传行为（不发送请求到服务器）
  };

  return (
    <>
      <Space>
        <Upload
          beforeUpload={handleUpload}
          showUploadList={false}
          accept=".csv"
        >
          <Button icon={<UploadOutlined />}>导入数据</Button>
        </Upload>
        
        <Button 
          icon={<DownloadOutlined />} 
          onClick={handleExport}
        >
          导出数据
        </Button>
      </Space>

      <Modal
        title="导入结果统计"
        open={isModalOpen}
        onOk={() => setIsModalOpen(false)}
        onCancel={() => setIsModalOpen(false)}
        footer={[
          <Button key="ok" type="primary" onClick={() => setIsModalOpen(false)}>
            确认
          </Button>
        ]}
        width={400}
        centered
      >
        {importStats && (
          <Space direction="vertical" style={{ width: '100%', alignItems: 'center', padding: '16px 0' }}>
            <Alert
              message="导入成功"
              description="数据已成功合并到本地数据库。"
              type="success"
              showIcon
              style={{ width: '100%', marginBottom: 24 }}
            />
            <div style={{ display: 'flex', gap: 48, justifyContent: 'center', width: '100%' }}>
               <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                 <div style={{ fontSize: 32, fontWeight: 'bold', color: '#52c41a', lineHeight: 1 }}>
                    {importStats.added}
                 </div>
                 <div style={{ color: '#666', marginTop: 8 }}>新增记录</div>
               </div>
               <div style={{ width: 1, background: '#f0f0f0' }} />
               <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                 <div style={{ fontSize: 32, fontWeight: 'bold', color: '#1890ff', lineHeight: 1 }}>
                    {importStats.updated}
                 </div>
                 <div style={{ color: '#666', marginTop: 8 }}>更新记录</div>
               </div>
            </div>
          </Space>
        )}
      </Modal>
    </>
  );
};

export default ImportExport;