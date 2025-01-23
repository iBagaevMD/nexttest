import { useEffect } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { SnackbarProvider } from 'notistack';
import '../styles/globals.css';

import { wrapper } from '@/store';
import { WalletProvider } from 'contexts/wallet';
import { NotificationsProvider } from 'contexts/notifications';
import Notification from 'components/Notification';
import CookieLayout from 'layouts/CookieLayout';
import theme from 'theme';

function MyApp({ Component, pageProps }) {
  useEffect(() => {
    // Создаем элемент portal-root, если его нет
    if (!document.getElementById('portal-root')) {
      const portalRoot = document.createElement('div');
      portalRoot.setAttribute('id', 'portal-root');
      document.body.appendChild(portalRoot);
    }
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <WalletProvider>
        <CookieLayout>
          <SnackbarProvider
            className="top-[70px]"
            maxSnack={6}
            anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            content={(key, data) => (
              <div>
                <Notification id={key} notification={data} />
              </div>
            )}>
            <NotificationsProvider>
              <Component {...pageProps} />
            </NotificationsProvider>
          </SnackbarProvider>
        </CookieLayout>
      </WalletProvider>
    </ThemeProvider>
  );
}

export default wrapper.withRedux(MyApp);
