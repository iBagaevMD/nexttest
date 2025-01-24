import React, { useEffect, useState } from 'react';
import { getHttpEndpoint } from '@orbs-network/ton-access';
import { TonClient } from '@ton/ton';

import { DashboardLayout } from 'layouts/DashboardLayout';
import DeployToken from 'components/TonCreateSteps/DeployToken';
import FinalStep from 'components/TonCreateSteps/FinalStep';
import useMetadataUploader from 'helpers/hooks/useMetadataUploader';
import useCreateTokenTon from 'helpers/hooks/useCreateTokenTon';
import { getMinterAddress } from 'contracts/JettonMinterAddress';
import { useNotifications } from 'contexts/notifications';

const CreateToken = () => {
  const [isLoadingCreateToken, setIsLoadingCreateToken] = useState(false);
  const { showErrorNotification } = useNotifications();
  const [tokenImage, setTokenImage] = useState(null);
  const { deployJetton, isDeployingToken } = useCreateTokenTon();
  const { uploadMetadata, isUploading } = useMetadataUploader();
  const [step, setStep] = useState(1);
  const [tonviewerUrl, setTonviewerUrl] = useState('');

  const isMinterDeployed = async (address) => {
    const endpoint = await getHttpEndpoint({ network: 'mainnet' });
    const client = new TonClient({ endpoint });
    return client.isContractDeployed(address);
  };

  useEffect(() => {
    let timer;
    if (isLoadingCreateToken) {
      timer = setTimeout(() => {
        setIsLoadingCreateToken(false);
      }, 40000);
    }

    return () => {
      clearTimeout(timer);
    };
  }, [isLoadingCreateToken]);

  const onCreateToken = async (params) => {
    const uploadData = {
      imageFile: params.tokenImage,
      tokenSymbol: params.tokenSymbol?.trim(),
      tokenName: params.tokenName?.trim()
    };
    const tokenMetadataURI = await uploadMetadata(uploadData);

    if (tokenMetadataURI === null) {
      setIsLoadingCreateToken(false);
    }

    if (tokenMetadataURI !== null) {
      const minterAddress = getMinterAddress(tokenMetadataURI)?.toString();
      setTonviewerUrl(minterAddress);

      const isAlreadyDeployed = await isMinterDeployed(minterAddress);

      if (isAlreadyDeployed) {
        showErrorNotification(
          `This token already deployed, change token name or token symbol, or image and try again`
        );
        setIsLoadingCreateToken(false);
        return;
      }
      await deployJetton({
        deployerSupplyPercent: params.deployerSupplyPercent,
        minimalPrice: params.minimalPrice,
        metadataUri: tokenMetadataURI,
        totalSupply: params.totalSupply
      });
    }
  };

  useEffect(() => {
    // Т.к Sdk кидает runtime error который не перехватывается, создан данный костыль;
    const oldWindowErrorFunc = window.Error;
    let isHandlingError = false;

    window.Error = function (...args) {
      if (isHandlingError) {
        return oldWindowErrorFunc.apply(this, args); // Избегаем рекурсии
      }

      isHandlingError = true;
      try {
        if (args[0] && typeof args[0] === 'string' && args[0].includes('TON_CONNECT_SDK')) {
          console.warn('Suppressed TON_CONNECT_SDK error:', args[0]);
          return; // Подавляем ошибку
        }
        return oldWindowErrorFunc.apply(this, args); // Обработка остальных ошибок
      } finally {
        isHandlingError = false; // Сбрасываем флаг после обработки
      }
    };

    return () => {
      window.Error = oldWindowErrorFunc;
    };
  }, []);

  return (
    <DashboardLayout>
      {step === 1 && (
        <DeployToken
          isLoadingCreateToken={isLoadingCreateToken}
          setIsLoadingCreateToken={setIsLoadingCreateToken}
          setStep={setStep}
          onDeploy={onCreateToken}
          isDeploying={isUploading || isDeployingToken}
          tokenImage={tokenImage}
          setTokenImage={setTokenImage}
        />
      )}
      {step === 2 && (
        <FinalStep
          tonviewerUrl={tonviewerUrl}
          tokenImage={tokenImage}
          setTokenImage={setTokenImage}
          setStep={setStep}
        />
      )}
    </DashboardLayout>
  );
};

export default CreateToken;
