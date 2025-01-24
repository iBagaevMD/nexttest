import React, { useEffect } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { SnackbarProvider } from 'notistack';
import '../styles/globals.css';

import { wrapper } from '@/store';
import { WalletProvider } from 'contexts/wallet';
import { NotificationsProvider } from 'contexts/notifications';
import Notification from 'components/Notification';
import CookieLayout from 'layouts/CookieLayout';
import theme from 'theme';

const CustomSnackbar = React.forwardRef((props, ref) => {
  const { id, ...rest } = props;
  return (
    <div ref={ref}>
      <Notification id={id} notification={rest} />
    </div>
  );
});

const MyApp = ({ Component, pageProps }) => {
  useEffect(() => {
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
            maxSnack={6}
            anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            Components={{
              default: CustomSnackbar,
              success: CustomSnackbar,
              error: CustomSnackbar,
              warning: CustomSnackbar,
              info: CustomSnackbar
            }}>
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
