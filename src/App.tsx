import { App as AntdApp } from 'antd';
import { Helmet } from 'react-helmet-async';

import Logo from '@/assets/images/cupllogo.png';
import Router from '@/router/index';
import AntdConfig from '@/theme/antd';

import { MotionLazy } from './components/animate/motion-lazy';
import { FileUploadProvider } from './pages/Imports/Importfile';

function App() {
  return (
      <AntdConfig>
        <AntdApp>
          <MotionLazy>
            <FileUploadProvider>
              <Helmet>
                <title>SPA Dashboard</title>
                <link rel="icon" href={Logo} />
              </Helmet>
            </FileUploadProvider>
            <Router />
          </MotionLazy>
        </AntdApp>
      </AntdConfig>
  );
}

export default App;
