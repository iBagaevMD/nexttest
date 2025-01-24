import { isAndroid, isIOS } from 'react-device-detect';

const getDownloadUrl = () => {
  if (isAndroid) {
    return {
      solana: 'https://play.google.com/store/apps/details?id=app.phantom',
      coinbase: 'https://play.google.com/store/apps/details?id=com.coinbase.android',
      tonkeeper: 'https://play.google.com/store/apps/details?id=com.ton_keeper'
    };
  }
  if (isIOS) {
    return {
      solana: 'https://apps.apple.com/ru/app/phantom-crypto-wallet/id1598432977',
      coinbase:
        'https://apps.apple.com/ru/app/coinbase-%D0%BA%D1%83%D0%BF%D0%B8-%D0%BF%D1%80%D0%BE%D0%B4%D0%B0%D0%B9-%D0%B1%D0%B8%D1%82%D0%BA%D0%BE%D0%B9%D0%BD/id886427730',
      tonkeeper: 'https://apps.apple.com/ru/app/tonkeeper/id1587742107'
    };
  }

  return {
    solana: 'https://chromewebstore.google.com/detail/phantom/bfnaelmomeimhlpmgjnjophhpkkoljpa',
    coinbase:
      'https://chromewebstore.google.com/detail/coinbase-wallet-extension/hnfanknocfeofbddgcijnmhnfnkdnaad',
    tonkeeper:
      'https://chromewebstore.google.com/detail/tonkeeper-%E2%80%94-wallet-for-to/omaabbefbmiijedngplfjmnooppbclkk'
  };
};

export const getSolanaWalletsForConnect = (connectWallet, disconnectWallet) => {
  return [
    {
      title: 'Phantom',
      desc: 'Any wallet and browser',
      image: '/wallets/phantom.png',
      func: () =>
        window.solana?.isConnected ? disconnectWallet('phantom') : connectWallet('phantom'),
      isEnabled: true,
      isConnected: window.solana?.isConnected,
      isNeedDownload: !window.solana,
      downloadUrl: getDownloadUrl()?.solana
    },
    {
      title: 'Coinbase Wallet',
      desc: 'Any wallet and browser',
      image: '/wallets/coinbase.png',
      func: () =>
        window.coinbaseSolana?.isConnected
          ? disconnectWallet('coinbase')
          : connectWallet('coinbase'),
      isEnabled: true,
      isConnected: window.coinbaseSolana?.isConnected,
      isNeedDownload: !window.coinbaseSolana,
      downloadUrl: getDownloadUrl()?.coinbase
    }
  ];
};

export const getTonWalletsForConnect = (connectWallet, disconnectWallet, tonConnector) => {
  return [
    {
      title: 'Tonkeeper',
      desc: 'Any wallet and browser',
      image: '/wallets/tonkeeper.png',
      func: () =>
        tonConnector?.connected ? disconnectWallet('tonkeeper') : connectWallet('tonkeeper'),
      isEnabled: true,
      isConnected: tonConnector?.connected,
      isNeedDownload: !window.tonkeeper,
      downloadUrl: getDownloadUrl()?.tonkeeper
    }
  ];
};
