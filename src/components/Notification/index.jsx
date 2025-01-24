import React from 'react';
import clsx from 'clsx';
import { useMemo } from 'react';
import { styled } from '@mui/material/styles';
import Paper from '@mui/material/Paper';
import { useSnackbar } from 'notistack';

import { IS_DEV } from 'config';

const StyledPaper = styled(Paper)(({ theme }) => ({
  borderRadius: '8px'
}));

const Container = styled('div')(({ theme }) => ({
  padding: '8px 12px 8px 12px',
  display: 'flex',
  flexGrow: 1,
  backgroundColor: 'red',
  alignItems: 'center',
  '& a': {
    color: 'white',
    display: 'block',
    textDecoration: 'underline'
  },
  minWidth: '218px'
}));

const ContentContainer = styled('div')(({ theme }) => ({
  display: 'flex',
  flexGrow: 1,
  flexDirection: 'column',
  justifyContent: 'center'
}));

const Wrapper = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center'
}));

const Icon = styled('img')(({ theme }) => ({
  marginRight: 8,
  display: 'inline-flex'
}));

const Tx = styled('div')(({ theme }) => ({
  background: 'rgba(34, 34, 34, 1)',
  display: 'flex',
  alignItems: 'center'
}));

const Info = styled('div')(({ theme }) => ({
  background: 'rgba(244, 111, 81, 1)',
  display: 'flex',
  alignItems: 'center'
}));

const Error = styled('div')(({ theme }) => ({
  background: 'rgba(251, 61, 61, 1)'
}));

const Success = styled('div')(({ theme }) => ({
  background: 'rgba(34, 34, 34, 1)',
  display: 'flex',
  alignItems: 'center'
}));

const Small = styled('span')(({ theme }) => ({
  color: 'white',
  fontSize: 14
}));

const SmallOpacity = styled('span')(({ theme }) => ({
  fontSize: 14,
  color: 'white',
  opacity: 0.5
}));

const InfoContent = ({ notification }) => {
  return (
    <Info>
      <Icon src="/notifications/info.svg" alt="info notification icon" />
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        <Small>{notification.title}</Small>
        <Small>{notification.message}</Small>
      </div>
    </Info>
  );
};

const TxContent = ({ notification }) => {
  const link = `https://solscan.io/tx/${notification.hash}${IS_DEV ? '?cluster=devnet' : ''}`;

  return (
    <Tx>
      <Icon src="/notifications/tx.svg" alt="tx notification icon" />
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        <Small>{notification.description}</Small>
        <a href={link} target="_blank" rel="noopener noreferrer">
          <SmallOpacity>View on Explorer</SmallOpacity>
        </a>
      </div>
    </Tx>
  );
};

const ErrorContent = ({ notification }) => {
  return (
    <Wrapper>
      <Icon src="/notifications/error.svg" alt="error notification icon" />
      <Small className={clsx(Error)}>{notification.message}</Small>
    </Wrapper>
  );
};

const SuccessContent = ({ notification }) => {
  return (
    <Success>
      <Icon src="/notifications/success.svg" alt="success notification icon" />
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        <Small>{notification.title}</Small>
        <SmallOpacity>{notification.message}</SmallOpacity>
      </div>
    </Success>
  );
};

const Notification = ({ id, notification }) => {
  const { closeSnackbar } = useSnackbar();
  const clearNotification = () => closeSnackbar(id);

  const TYPES = {
    info: InfoContent,
    tx: TxContent,
    error: ErrorContent,
    success: SuccessContent
  };

  const Content = TYPES[notification.type] || InfoContent;

  const notificationClass = useMemo(() => {
    if (notification.status === 'success') {
      return Success;
    }
    const c = {
      info: Info,
      tx: Tx,
      error: Error,
      success: Success
    };
    return c[notification.type];
  }, [notification.type, notification.status]);

  return (
    <StyledPaper className={clsx(notificationClass)} onClick={clearNotification}>
      <Container>
        <ContentContainer>
          <Content notification={notification} />
        </ContentContainer>
      </Container>
    </StyledPaper>
  );
};

export default Notification;
