import React from 'react';
import clsx from 'clsx';
import { useMemo } from 'react';
import { styled } from '@mui/material/styles';
import Paper from '@mui/material/Paper';
import { useSnackbar } from 'notistack';

import { IS_DEV } from 'src/config';

const useStyles = styled((theme) => ({
  paper: {
    borderRadius: '8px'
  },
  container: {
    padding: '8px 12px 8px 12px',
    display: 'flex',
    flexGrow: 1,
    alignItems: 'center',
    '& a': {
      color: 'white',
      display: 'block',
      textDecoration: 'underline'
    },
    minWidth: '218px'
  },
  contentContainer: {
    display: 'flex',
    flexGrow: 1,
    flexDirection: 'column',
    justifyContent: 'center'
  },
  wrapper: {
    display: 'flex',
    alignItems: 'center'
  },
  icon: {
    marginRight: 8,
    display: 'inline-flex'
  },
  tx: {
    background: 'rgba(34, 34, 34, 1)',
    display: 'flex',
    alignItems: 'center'
  },
  info: {
    background: 'rgba(244, 111, 81, 1)',
    display: 'flex',
    alignItems: 'center'
  },
  error: {
    background: 'rgba(251, 61, 61, 1)'
  },
  success: {
    background: 'rgba(34, 34, 34, 1)',
    display: 'flex',
    alignItems: 'center'
  },
  small: {
    color: 'white',
    fontSize: 14
  },
  smallOpacity: {
    fontSize: 14,
    color: 'white',
    opacity: 0.5
  }
}));

const Notification = ({ id, notification }) => {
  const classes = useStyles();
  const { closeSnackbar } = useSnackbar();
  const clearNotification = () => closeSnackbar(id);

  const TYPES = {
    info: [null, InfoContent],
    tx: [null, TxContent],
    error: [null, ErrorContent],
    success: [null, SuccessContent]
  };

  const [, Content] = TYPES[notification.type];

  const notificationClass = useMemo(() => {
    if (notification.status === 'success') {
      return classes.success;
    }
    const c = {
      info: classes.info,
      tx: classes.tx,
      error: classes.error,
      success: classes.success
    };
    return c[notification.type];
  }, [
    notification.type,
    notification.status,
    classes.error,
    classes.success,
    classes.tx,
    classes.info
  ]);

  return (
    <Paper className={clsx(classes.paper, notificationClass)} onClick={clearNotification}>
      <div className={classes.container}>
        <div className={classes.contentContainer}>
          <Content {...{ notification }} />
        </div>
      </div>
    </Paper>
  );
};

const TxContent = ({ notification }) => {
  const classes = useStyles();

  const link = `https://solscan.io/tx/${notification.hash}${IS_DEV ? '?cluster=devnet' : ''}`;

  return (
    <div className={classes.tx}>
      <img className={classes.icon} src="/notifications/tx.svg" alt="tx notification icon" />
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        <span className={classes.small}>{notification.description}</span>
        <a href={link} target="_blank" rel="noopener noreferrer" className={classes.smallOpacity}>
          View on Explorer
        </a>
      </div>
    </div>
  );
};

const InfoContent = ({ notification }) => {
  const classes = useStyles();
  return (
    <div className={classes.info}>
      <img className={classes.icon} src="/notifications/info.svg" alt="info notification icon" />
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        <span className={classes.small}>{notification.title}</span>
        <span className={classes.small}>{notification.message}</span>
      </div>
    </div>
  );
};

const ErrorContent = ({ notification }) => {
  const classes = useStyles();
  return (
    <div className={classes.wrapper}>
      <img className={classes.icon} src="/notifications/error.svg" alt="error notification icon" />
      <span className={clsx(classes.small, classes.error)}>{notification.message}</span>
    </div>
  );
};

const SuccessContent = ({ notification }) => {
  const classes = useStyles();
  return (
    <div className={classes.success}>
      <img
        className={classes.icon}
        src="/notifications/success.svg"
        alt="success notification icon"
      />
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        <span className={classes.small}>{notification.title}</span>
        <span className={classes.smallOpacity}>{notification.message}</span>
      </div>
    </div>
  );
};

export default Notification;
