import React, { useEffect, useState } from 'react';
import { ConfigProvider, Layout, Space, FloatButton, theme, Button } from 'antd';
import { MenuUnfoldOutlined, MenuFoldOutlined } from '@ant-design/icons';
import zhCN from 'antd/locale/zh_CN';
import ChipTable from './components/ChipTable';
import TagFilter from './components/TagFilter';
import SubPageManager from './components/SubPageManager';
import FilterBar from './components/FilterBar';
import useChipStore from './stores/chipStore';

const { Header, Content, Sider } = Layout;

const App = () => {
  const { initializeData } = useChipStore();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  useEffect(() => {
    const loadFont = () => {
      const link = document.createElement('link');
      link.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap';
      link.rel = 'stylesheet';
      document.head.appendChild(link);
    };

    loadFont();
    initializeData();
  }, [initializeData]);

  return (
    <ConfigProvider
      locale={zhCN}
      theme={{
        algorithm: theme.defaultAlgorithm,
        token: {
          colorPrimary: '#2563eb',
          borderRadius: 6,
          fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          colorTextBase: '#1e293b',
          colorBgBase: '#ffffff',
        },
        components: {
          Table: {
            headerBg: '#f1f5f9',
            headerColor: '#334155',
            rowHoverBg: '#eff6ff',
            borderColor: '#e2e8f0',
          },
          Button: {
            primaryColor: '#ffffff',
            defaultColor: '#334155',
            defaultBg: '#f8fafc',
            defaultBorderColor: '#cbd5e1',
            colorText: '#334155',
            colorBgContainer: '#f8fafc',
          },
          Card: {
            headerBg: '#ffffff',
            colorBorderSecondary: '#e2e8f0',
          },
          Layout: {
            siderBg: '#ffffff',
            bodyBg: '#f8fafc',
            headerBg: '#1e40af',
          },
        },
      }}
    >
      <Layout style={{ minHeight: '100vh' }}>
        <Header
          style={{
            background: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)',
            padding: '0 24px',
            display: 'flex',
            alignItems: 'center',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
            position: 'sticky',
            top: 0,
            zIndex: 1000,
            height: '64px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', width: '100%', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Button
                type="text"
                icon={sidebarCollapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                style={{
                  fontSize: '18px',
                  color: '#fff',
                  width: 40,
                  height: 40,
                }}
              />
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  background: 'rgba(255,255,255,0.2)',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '20px',
                }}
              >
                💾
              </div>
              <h1
                style={{
                  color: '#fff',
                  margin: 0,
                  fontSize: '20px',
                  fontWeight: 700,
                  letterSpacing: '-0.5px',
                }}
              >
                芯片规格数据库 <span style={{ opacity: 0.8, fontSize: '14px', fontWeight: 400 }}>By HAISNAP</span>
              </h1>
            </div>
          </div>
        </Header>

        <Layout>
          {!sidebarCollapsed && (
            <Sider
              width={320}
              theme="light"
              breakpoint="lg"
              collapsedWidth="0"
              style={{
                overflowY: 'auto',
                height: 'calc(100vh - 64px)',
                position: 'fixed',
                left: 0,
                top: 64,
                bottom: 0,
                zIndex: 900,
                boxShadow: '2px 0 8px rgba(0,0,0,0.05)',
                borderRight: '1px solid #e2e8f0'
              }}
            >
              <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {/* 标签筛选移至左侧目录上方 */}
                <div style={{ transform: 'scale(1)', transformOrigin: 'top left' }}>
                  <TagFilter />
                </div>
                <SubPageManager />
              </div>
            </Sider>
          )}

          <Layout style={{ marginLeft: sidebarCollapsed ? 0 : 320, padding: '24px', transition: 'all 0.3s ease' }}>
            <Content style={{ maxWidth: '1600px', margin: '0 auto', width: '100%' }}>
              <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                <FilterBar />
                
                {/* TagFilter 已移至左侧 */}
                {/* ImportExport 已集成在 ChipTable 内部工具栏 */}

                <ChipTable />
              </Space>
            </Content>
          </Layout>
        </Layout>

        <FloatButton.BackTop visibilityHeight={400} style={{ right: 24, bottom: 24 }} />
      </Layout>

      <style>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        body {
          font-family: Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
          overflow-x: hidden;
          background-color: #f8fafc;
        }

        ::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }

        ::-webkit-scrollbar-track {
          background: transparent;
        }

        ::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 3px;
        }

        ::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }

        .ant-layout-sider-trigger {
          background: #1e40af !important;
        }

        .ant-btn-default {
          background: #f8fafc !important;
          color: #334155 !important;
          border-color: #cbd5e1 !important;
        }

        .ant-btn-default:hover {
          background: #e2e8f0 !important;
          color: #1e293b !important;
          border-color: #94a3b8 !important;
        }

        .ant-btn-primary {
          color: #ffffff !important;
        }

        @media (max-width: 992px) {
          .ant-layout {
            margin-left: 0 !important;
          }
          .ant-layout-sider {
            display: none !important;
          }
        }
      `}</style>
    </ConfigProvider>
  );
};

export default App;