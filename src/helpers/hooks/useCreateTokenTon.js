import { useState } from 'react';
import { useFactoryContract } from './useFactoryContract';

const useCreateTokenTon = () => {
  const [isDeployingToken, setIsDeployingToken] = useState(false);
  const [jettonInfo, setJettonInfo] = useState({
    // tokenPhoto: null,
    tokenName: '',
    tokenSymbol: '',
    priceInTons: '',
    // tokenDescription: 'JTN7 desc',
    // decimalsPrefix: 'micro',
    initialSupply: '',
    totalSupply: '',
    deployerSupplyPercent: '',
    metadataUri: ''
  });

  const factory = useFactoryContract();

  const deployJetton = (data) => {
    setIsDeployingToken(true);
    if (factory) {
      factory.sendInitiateNew(data);
    }
    setIsDeployingToken(false);
  };

  return {
    jettonInfo,
    setJettonInfo,
    deployJetton,
    isDeployingToken
  };
};

export default useCreateTokenTon;
