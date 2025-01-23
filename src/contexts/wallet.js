import React, { createContext, useContext, useState, useEffect } from 'react';
import { TonConnect } from '@tonconnect/sdk';
import { Address } from 'ton';

import { delay } from 'helpers/delay';
import { WALLET_NAMES, WALLET_TYPES } from './constants';
import { getManifestForActualStand } from 'helpers/manifest';

export const WalletContext = createContext({
  network: null,
  signer: null,
  userAddress: '',
  connectWallet: () => {},
  disconnectWallet: () => {},
  tonConnector: {}
});

export const WalletProvider = ({ children }) => {
  const [userAddress, setUserAddress] = useState('');
  const [tonConnector, setTonConnector] = useState(null);
  const [network, setNetwork] = useState(null);
  const [signer, setSigner] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setTonConnector(
        new TonConnect({
          manifestUrl: getManifestForActualStand()
        })
      );
    }
  }, []);

  const setProvider = (provider) => {
    setNetwork(provider);
    setSigner(window[provider]);
  };

  const resetProvider = () => {
    setNetwork(null);
    setSigner(null);
  };

  /*
    Connect wallets
   */

  const connectPhantom = async (onlyIfTrusted) => {
    try {
      const response = await window.solana.connect({ onlyIfTrusted: onlyIfTrusted === true });
      setUserAddress(response.publicKey.toString());
      setProvider(WALLET_NAMES.SOLANA);
    } catch (error) {}
  };

  const connectSolflare = async () => {
    try {
      await window.solflare.connect();
      setUserAddress(window.solflare.publicKey.toString());
      setProvider(WALLET_NAMES.SOLFLARE);
    } catch (error) {}
  };

  const connectCoinbase = async () => {
    try {
      await window.coinbaseSolana.connect();
      setUserAddress(window.coinbaseSolana.publicKey.toString());
      setProvider(WALLET_NAMES.COINBASE_SOLANA);
    } catch (error) {}
  };

  const connectTonkeeper = async () => {
    const walletConnectionSource = {
      jsBridgeKey: WALLET_NAMES.TONKEEPER
    };

    try {
      // Попытка подключения к кошельку
      await tonConnector.connect(walletConnectionSource);
      // Подписка на реактивные события у tonconnect sdk
      await tonConnector.onStatusChange(async (status) => {
        if (status?.provider === 'injected') {
          const account = tonConnector.account;

          if (account) {
            const formattedAddress = Address.parse(account.address).toString({ testOnly: false });
            setProvider(WALLET_NAMES.TONKEEPER);
            setUserAddress(formattedAddress);
          } else {
            console.log('Account information is not available yet');
          }
        }
      });
    } catch (error) {
      console.error('Connection error:', error);
    }
  };

  const walletConnectors = {
    [WALLET_TYPES.PHANTOM]: connectPhantom,
    [WALLET_TYPES.SOLFLARE]: connectSolflare,
    [WALLET_TYPES.COINBASE]: connectCoinbase,
    [WALLET_TYPES.TONKEEPER]: connectTonkeeper
  };

  const connectWallet = async (type, onlyIfTrusted) => {
    if (type) {
      sessionStorage.setItem('userWallet', type);
    }

    const connector = walletConnectors[type];
    if (connector) {
      if (type === WALLET_TYPES.PHANTOM) {
        await connector(onlyIfTrusted);
      } else {
        await connector();
      }
    }
  };

  /*
   End of connect wallets
   */

  /*
   Disconnect wallets
  */

  const disconnectPhantom = () => {
    window.solana.disconnect();
    setUserAddress('');
  };

  const disconnectSolflare = () => {
    window.solflare.disconnect();
    setUserAddress('');
  };

  const disconnectCoinbase = async () => {
    await window.coinbaseSolana.disconnect();
    setUserAddress('');
  };

  const disconnectTonkeeper = async () => {
    try {
      await tonConnector?.disconnect();
      setUserAddress('');
    } catch (error) {
      console.error('Error during disconnect:', error);
    }
  };

  const disconnectWallet = (type) => {
    if (type === WALLET_TYPES.PHANTOM) {
      disconnectPhantom();
    } else if (type === WALLET_TYPES.SOLFLARE) {
      disconnectSolflare();
    } else if (type === WALLET_TYPES.COINBASE) {
      disconnectCoinbase();
    } else if (type === WALLET_TYPES.TONKEEPER) {
      disconnectTonkeeper();
    }
    sessionStorage.removeItem('userWallet');
    resetProvider();
  };

  /*
   End of disconnect wallets
   */

  // Automatically try to connect to the wallet when the component mounts
  useEffect(() => {
    const wallet = sessionStorage.getItem('userWallet');
    const load = async () => {
      if (userAddress || isInitialized) return;
      await connectWallet(wallet, true);
    };
    load().then(() => setIsInitialized(true));
  }, [userAddress, isInitialized]);

  return (
    <WalletContext.Provider
      value={{
        tonConnector,
        network,
        signer,
        userAddress,
        connectWallet,
        disconnectWallet
      }}>
      {children}
    </WalletContext.Provider>
  );
};

export function useWallet() {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('Missing wallet context');
  }
  const { network, signer, userAddress, connectWallet, disconnectWallet, tonConnector } = context;

  return {
    network,
    signer,
    userAddress,
    tonConnector,
    connectWallet,
    disconnectWallet
  };
}
