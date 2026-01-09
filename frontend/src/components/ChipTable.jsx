import React, { useState, useEffect } from 'react';
import { Table, Button, Space, Tag, Input, Popconfirm, message, Tooltip, Alert } from 'antd';
import { EditOutlined, DeleteOutlined, SearchOutlined, PlusOutlined, CopyOutlined } from '@ant-design/icons';
import useChipStore from '../stores/chipStore';
import AddChipModal from './AddChipModal';
import EditChipModal from './EditChipModal';
import ImportExport from './ImportExport';

const ResizableTitle = (props) => {
  const { onResize, width, ...restProps } = props;

  if (!width) {
    return <th {...restProps} />;
  }

  return (
    <th {...restProps} style={{ ...restProps.style, position: 'relative' }}>
      {restProps.children}
      <span
        style={{
          position: 'absolute',
          right: 0,
          bottom: 0,
          top: 0,
          width: 10,
          cursor: 'col-resize',
          zIndex: 10,
          touchAction: 'none',
          userSelect: 'none',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center'
        }}
        onClick={(e) => e.stopPropagation()}
        onMouseDown={(e) => {
            e.preventDefault();
            e.stopPropagation();
            const startX = e.pageX;
            const startWidth = width;
            
            const onMouseMove = (moveEvent) => {
                const newWidth = startWidth + (moveEvent.pageX - startX);
                onResize(Math.max(newWidth, 50));
            };
            
            const onMouseUp = () => {
                document.removeEventListener('mousemove', onMouseMove);
                document.removeEventListener('mouseup', onMouseUp);
            };
            
            document.addEventListener('mousemove', onMouseMove);
            document.addEventListener('mouseup', onMouseUp);
        }}
      >
        <i style={{ width: '1px', height: '60%', background: 'rgba(0,0,0,0.1)' }}></i>
      </span>
    </th>
  );
};

const ChipTable = () => {
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [currentChip, setCurrentChip] = useState(null);
  const [searchText, setSearchText] = useState('');
  const [searchedColumn, setSearchedColumn] = useState('');
  const [colWidths, setColWidths] = useState({});

  const { 
    filteredChips, 
    deleteChip, 
    deleteChips,
    loading, 
    initializeData, 
    chips,
    selectedRowKeys,
    setSelectedRowKeys
  } = useChipStore();

  // 使用 ref 防止删除后重复初始化
  const hasInitialized = React.useRef(false);

  useEffect(() => {
    if (!hasInitialized.current && chips.length === 0) {
      initializeData();
      hasInitialized.current = true;
    }
  }, [initializeData]);

  const handleEdit = (record) => {
    setCurrentChip(record);
    setEditModalVisible(true);
  };

  const handleDelete = (chipId) => {
    deleteChip(chipId);
    message.success('芯片信息已删除');
  };

  const handleBatchDelete = () => {
    if (!selectedRowKeys || selectedRowKeys.length === 0) {
      message.warning('请先选择要删除的数据');
      return;
    }
    
    const deleteCount = selectedRowKeys.length;
    const keysToDelete = [...selectedRowKeys];
    
    // 记录删除前的数据量
    const beforeCount = filteredChips.length;
    console.log(`[批量删除] 删除前数据量: ${beforeCount}, 待删除: ${deleteCount}`);
    
    // 执行删除
    deleteChips(keysToDelete);
    
    // 验证删除结果
    setTimeout(() => {
      const afterCount = filteredChips.length;
      console.log(`[批量删除] 删除后数据量: ${afterCount}`);
      
      if (afterCount === beforeCount - deleteCount) {
        message.success(`已成功删除 ${deleteCount} 条数据`);
      } else {
        message.warning(`删除操作可能未完全生效，请刷新页面确认`);
      }
    }, 100);
  };

  const onSelectChange = (newSelectedRowKeys) => {
    setSelectedRowKeys(newSelectedRowKeys);
  };

  const rowSelection = {
    selectedRowKeys,
    onChange: onSelectChange,
    columnWidth: 48,
    fixed: true,
    preserveSelectedRowKeys: true, // 确保翻页或筛选时选中状态不丢失（虽然当前是单页）
  };

  const handleCopy = (record) => {
    const content = `${record.company} ${record.model}\n制程: ${record.process}\n算力: ${record.aiPerformance}`;
    navigator.clipboard.writeText(content);
    message.success('芯片核心信息已复制');
  };

  const getColumnSearchProps = (dataIndex, title) => ({
    filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
      <div style={{ padding: 8 }} onKeyDown={(e) => e.stopPropagation()}>
        <Input
          placeholder={`搜索 ${title}`}
          value={selectedKeys[0]}
          onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
          onPressEnter={() => handleSearch(selectedKeys, confirm, dataIndex)}
          style={{ marginBottom: 8, display: 'block' }}
        />
        <Space>
          <Button
            type="primary"
            onClick={() => handleSearch(selectedKeys, confirm, dataIndex)}
            icon={<SearchOutlined />}
            size="small"
            style={{ width: 90 }}
          >
            搜索
          </Button>
          <Button
            onClick={() => handleReset(clearFilters, confirm)}
            size="small"
            style={{ width: 90 }}
          >
            重置
          </Button>
        </Space>
      </div>
    ),
    filterIcon: (filtered) => (
      <SearchOutlined style={{ color: filtered ? '#1677ff' : '#bfbfbf', fontSize: '14px' }} />
    ),
    onFilter: (value, record) =>
      record[dataIndex]
        ? record[dataIndex].toString().toLowerCase().includes(value.toLowerCase())
        : '',
  });

  const handleSearch = (selectedKeys, confirm, dataIndex) => {
    confirm();
    setSearchText(selectedKeys[0]);
    setSearchedColumn(dataIndex);
  };

  const handleReset = (clearFilters, confirm) => {
    clearFilters();
    setSearchText('');
    confirm();
  };

  const companyColors = {
    'NVIDIA': '#76b900', '英伟达': '#76b900',
    'AMD': '#ed1c24',
    'Intel': '#0071c5', '英特尔': '#0071c5',
    'Qualcomm': '#3253dc', '高通': '#3253dc',
    'Apple': '#555555', '苹果': '#555555',
    'Huawei': '#c8102e', '华为': '#c8102e',
    'MediaTek': '#ff6a13', '联发科': '#ff6a13',
  };

  const shouldUseLightText = (colorCode) => {
    if (!colorCode) return false;
    if (colorCode === '#76b900') return false; 
    return true;
  };

  const columns = [
    {
      title: '公司',
      dataIndex: 'company',
      key: 'company',
      width: 120,
      fixed: 'left',
      ...getColumnSearchProps('company', '公司'),
      render: (text) => {
        const bg = companyColors[text] || 'default';
        const isDefault = bg === 'default';
        const textColor = !isDefault && shouldUseLightText(bg) ? '#fff' : 'rgba(0, 0, 0, 0.88)';
        return (
          <Tag color={bg} style={{ fontWeight: 600, border: 'none', color: textColor }}>
            {text}
          </Tag>
        );
      },
    },
    {
      title: '产品型号',
      dataIndex: 'model',
      key: 'model',
      width: 160,
      fixed: 'left',
      ...getColumnSearchProps('model', '产品型号'),
      render: (text) => <span style={{ fontWeight: 700, color: '#0f172a' }}>{text}</span>,
    },
    {
      title: '发布时间',
      dataIndex: 'releaseDate',
      key: 'releaseDate',
      width: 120,
      ...getColumnSearchProps('releaseDate', '发布时间'),
    },
    {
      title: '制程 (nm)',
      dataIndex: 'process',
      key: 'process',
      width: 110,
      ...getColumnSearchProps('process', '制程'),
      sorter: (a, b) => parseFloat(a.process) - parseFloat(b.process),
    },
    {
      title: '功耗 (W)',
      dataIndex: 'power',
      key: 'power',
      width: 110,
      ...getColumnSearchProps('power', '功耗'),
      sorter: (a, b) => parseFloat(a.power) - parseFloat(b.power),
    },
    {
      title: 'AI算力 (TOPS)',
      dataIndex: 'aiPerformance',
      key: 'aiPerformance',
      width: 150,
      fixed: 'left',
      ...getColumnSearchProps('aiPerformance', 'AI算力'),
      sorter: (a, b) => parseFloat(a.aiPerformance) - parseFloat(b.aiPerformance),
      render: (text) => (
        <Tag color="gold" style={{ fontWeight: 700, fontSize: '13px', padding: '2px 8px', color: '#78350f' }}>
          {text}
        </Tag>
      ),
    },
    {
      title: 'CPU',
      dataIndex: 'cpu',
      key: 'cpu',
      width: 200,
      ellipsis: { showTitle: false },
      ...getColumnSearchProps('cpu', 'CPU'),
      render: (text) => <Tooltip title={text}><span>{text}</span></Tooltip>,
    },
    {
      title: 'GPU',
      dataIndex: 'gpu',
      key: 'gpu',
      width: 200,
      ellipsis: { showTitle: false },
      ...getColumnSearchProps('gpu', 'GPU'),
      render: (text) => <Tooltip title={text}><span>{text}</span></Tooltip>,
    },
    {
      title: '存储',
      dataIndex: 'storage',
      key: 'storage',
      width: 160,
      ...getColumnSearchProps('storage', '存储'),
    },
    {
      title: '大模型支持',
      dataIndex: 'modelSupport',
      key: 'modelSupport',
      width: 180,
      ellipsis: true,
      ...getColumnSearchProps('modelSupport', '大模型参数'),
    },
    {
      title: '编解码能力',
      dataIndex: 'codec',
      key: 'codec',
      width: 180,
      ellipsis: true,
      ...getColumnSearchProps('codec', '编解码'),
    },
    {
      title: '标签',
      dataIndex: 'tags',
      key: 'tags',
      width: 220,
      render: (tags) => (
        <Space wrap size={[0, 4]}>
          {tags && tags.length > 0 ? (
            tags.map((tag, index) => <Tag key={index} color="cyan" style={{ color: '#0891b2' }}>{tag}</Tag>)
          ) : <span style={{ color: '#cbd5e1' }}>-</span>}
        </Space>
      ),
    },
    {
      title: '其他',
      dataIndex: 'other',
      key: 'other',
      width: 150,
      ellipsis: true,
      ...getColumnSearchProps('other', '其他'),
    },
    {
      title: '操作',
      key: 'action',
      width: 140,
      fixed: 'right',
      render: (_, record) => (
        <Space size={0}>
          <Tooltip title="编辑">
            <Button 
              type="link" 
              icon={<EditOutlined />} 
              onClick={() => handleEdit(record)} 
              style={{ color: '#2563eb' }}
            />
          </Tooltip>
          <Tooltip title="复制信息">
             <Button 
               type="link" 
               icon={<CopyOutlined />} 
               onClick={() => handleCopy(record)} 
               style={{ color: '#059669' }}
             />
          </Tooltip>
          <Popconfirm
            title="确定删除?"
            onConfirm={() => handleDelete(record.id)}
            okText="是"
            cancelText="否"
          >
            <Button type="link" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const mergedColumns = columns.map((col) => {
    const currentWidth = colWidths[col.key] || col.width;
    
    return {
      ...col,
      width: currentWidth,
      onHeaderCell: (column) => ({
        width: column.width,
        onResize: (w) => {
          setColWidths(prev => ({ ...prev, [column.key]: w }));
        },
      }),
    };
  });

  return (
    <div style={{ background: '#fff', borderRadius: '8px', boxShadow: '0 1px 2px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
      <div style={{ padding: '16px 24px', borderBottom: '1px solid #f0f0f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <Space>
          <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 600, color: '#1e293b' }}>芯片数据列表</h3>
          <Tag color="blue" style={{ borderRadius: '12px', padding: '0 10px' }}>共 {filteredChips.length} 款</Tag>
        </Space>
        
        <Space>
          {selectedRowKeys.length > 0 && (
            <Space style={{ marginRight: 16 }}>
                <span style={{ color: '#64748b', fontWeight: 500 }}>已选 {selectedRowKeys.length} 项</span>
                <Popconfirm
                    title={
                      <div>
                        <div style={{ fontWeight: 600, marginBottom: 8 }}>确认删除操作</div>
                        <div>即将删除 <span style={{ color: '#ff4d4f', fontWeight: 600 }}>{selectedRowKeys.length}</span> 条芯片数据</div>
                        <div style={{ fontSize: 12, color: '#8c8c8c', marginTop: 4 }}>此操作不可恢复，请谨慎操作</div>
                      </div>
                    }
                    onConfirm={handleBatchDelete}
                    okText="确认删除"
                    cancelText="取消"
                    okButtonProps={{ danger: true }}
                    icon={<DeleteOutlined style={{ color: '#ff4d4f' }} />}
                >
                    <Button 
                      danger 
                      icon={<DeleteOutlined />}
                      style={{
                        background: '#fff1f0',
                        borderColor: '#ffccc7',
                        color: '#cf1322',
                        fontWeight: 500,
                        boxShadow: '0 2px 4px rgba(207, 19, 34, 0.1)'
                      }}
                    >
                      批量删除 ({selectedRowKeys.length})
                    </Button>
                </Popconfirm>
            </Space>
          )}
          <ImportExport />
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setAddModalVisible(true)}
          >
            新增芯片
          </Button>
        </Space>
      </div>

      {selectedRowKeys.length > 0 && (
        <Alert 
          message={`当前已选中 ${selectedRowKeys.length} 条数据，可进行批量操作。`} 
          type="info" 
          showIcon 
          banner
          style={{ marginBottom: 0 }}
        />
      )}

      <Table
        components={{
          header: {
            cell: ResizableTitle,
          },
        }}
        rowSelection={rowSelection}
        columns={mergedColumns}
        dataSource={filteredChips}
        rowKey="id"
        loading={loading}
        pagination={false}
        scroll={{ x: 'max-content', y: 'calc(100vh - 400px)' }}
        sticky
        size="middle"
        rowClassName={(record, index) => (index % 2 === 0 ? 'table-row-light' : 'table-row-dark')}
        style={{ width: '100%' }}
      />

      <AddChipModal visible={addModalVisible} onClose={() => setAddModalVisible(false)} />
      <EditChipModal
        visible={editModalVisible}
        onClose={() => {
          setEditModalVisible(false);
          setCurrentChip(null);
        }}
        chipData={currentChip}
      />
    </div>
  );
};

export default ChipTable;