import React, { useContext, createContext } from 'react';
import { useSnackbar } from 'notistack';

const NotificationsContext = createContext();

export const NotificationsProvider = ({ children }) => {
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();

  const makeOptions = (opts) => {
    return {
      autoHideDuration: opts?.autoHideDuration !== undefined ? opts.autoHideDuration : 10000,
      persist: opts?.persist !== undefined ? opts.persist : false
    };
  };

  const showInfoNotification = (title, message, options) => {
    closeSnackbar();
    const finalOpts = makeOptions(options);
    return enqueueSnackbar({ type: 'info', title, message }, finalOpts);
  };

  const showErrorNotification = (msg, options) => {
    closeSnackbar();
    const finalOpts = makeOptions(options);
    return enqueueSnackbar(
      {
        type: 'error',
        message: msg?.error?.message || msg.responseText || msg.message || msg
      },
      finalOpts
    );
  };

  const showSuccessNotification = (title, message, options) => {
    closeSnackbar();
    const finalOpts = makeOptions(options);
    return enqueueSnackbar({ type: 'success', title, message }, finalOpts);
  };

  const showTxNotification = (description, hash, status, result) => {
    closeSnackbar();
    const opts = {
      autoHideDuration: 10000,
      persist: false
    };
    return enqueueSnackbar({ type: 'tx', description, hash, status, result }, opts);
  };

  const closeNotification = (id) => {
    id && closeSnackbar(id);
  };

  return (
    <NotificationsContext.Provider
      value={{
        showTxNotification,
        showErrorNotification,
        showSuccessNotification,
        showInfoNotification,
        closeNotification
      }}>
      {children}
    </NotificationsContext.Provider>
  );
};

export function useNotifications() {
  const context = useContext(NotificationsContext);
  if (!context) {
    throw new Error('Missing Notifications context');
  }
  const {
    showTxNotification,
    showErrorNotification,
    showSuccessNotification,
    showInfoNotification,
    closeNotification
  } = context;
  return {
    showTxNotification,
    showErrorNotification,
    showSuccessNotification,
    showInfoNotification,
    closeNotification
  };
}
