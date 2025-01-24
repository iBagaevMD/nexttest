import React, { useState, useRef, useMemo, useEffect } from 'react';

import { useWallet } from 'contexts/wallet';
import Typography from 'components/Typography';
import TextInput from 'components/Inputs/TextInput';
import NumberInput from 'components/Inputs/NumberInput';
import Button from 'components/Button';
import { TYPOGRAPHY_VARIANTS } from 'components/Typography/constants';
import { BUTTON_VARIANTS } from 'components/Button/constants';
import { MAX_IMAGE_SIZE } from './constants';
import useCreateTokenTon from 'helpers/hooks/useCreateTokenTon';
import { isPositiveInteger } from 'helpers/number';
import { toNanoton } from 'helpers/ton';
import { useNotifications } from 'contexts/notifications';

const DeployToken = ({
  onDeploy,
  isDeploying,
  tokenImage,
  setTokenImage,
  setStep,
  isLoadingCreateToken,
  setIsLoadingCreateToken
}) => {
  const { showSuccessNotification, showErrorNotification, showInfoNotification } =
    useNotifications();
  const { jettonInfo, setJettonInfo } = useCreateTokenTon();
  const ref = useRef();
  const { userAddress } = useWallet();
  const [inputErrors, setInputErrors] = useState([]);

  const handleImageChange = (event) => {
    const file = event.target.files[0];

    if (file && file.size < MAX_IMAGE_SIZE) {
      setTokenImage(file);
    } else {
      showErrorNotification('The uploaded file size is too large');
      setTokenImage(null);
    }
    event.target.value = null;
  };

  const handleChange = (e) => {
    const name = e.target?.name;
    const value = e.target?.value;

    // priceInTons и deployerSupplyPercent только целые положительные числа в текущей реализации
    // не более 1_000_000
    if (name === 'priceInTons') {
      if (isPositiveInteger(Number(value)) && value <= 1000000) {
        setJettonInfo({
          ...jettonInfo,
          [name]: value
        });
      }
      return;
    }

    // не более 9_000_000_000
    if (name === 'totalSupply') {
      if (isPositiveInteger(Number(value)) && value <= 9000000000) {
        setJettonInfo({
          ...jettonInfo,
          [name]: value
        });
      }
      return;
    }

    if (name === 'tokenSymbol' || name === 'tokenName') {
      const regex = /^[A-Za-z\s]*$/;
      if (regex.test(value)) {
        setJettonInfo({
          ...jettonInfo,
          [name]: name === 'tokenSymbol' ? value?.trim() : value
        });
      }
      return;
    }

    if (name === 'deployerSupplyPercent') {
      if (isPositiveInteger(Number(value))) {
        setJettonInfo({
          ...jettonInfo,
          [name]: value
        });
      }
      return;
    }

    if (jettonInfo[name] === value) return;
    setJettonInfo({
      ...jettonInfo,
      [name]: value
    });
  };

  useEffect(() => {
    if (tokenImage) {
      checkIsValid();
    }
  }, [tokenImage]);

  const checkIsValid = () => {
    let result = [];

    if (!tokenImage) result.push('tokenImage');
    if (!jettonInfo.tokenName) result.push('tokenName');
    if (!jettonInfo.tokenSymbol) result.push('tokenSymbol');
    if (!jettonInfo.priceInTons) result.push('priceInTons');
    if (!jettonInfo.totalSupply) result.push('totalSupply');
    if (
      Number(jettonInfo.deployerSupplyPercent) < 0 ||
      Number(jettonInfo.deployerSupplyPercent > 5 || !jettonInfo.deployerSupplyPercent)
    )
      result.push('deployerSupplyPercent');

    setInputErrors(result);
    return result;
  };

  const handleDeploy = async (e) => {
    e.preventDefault();

    if (checkIsValid()?.length) return;

    setIsLoadingCreateToken(true);

    onDeploy({
      tokenImage: tokenImage,
      tokenName: jettonInfo.tokenName?.trim(),
      tokenSymbol: jettonInfo.tokenSymbol,
      totalSupply: toNanoton(jettonInfo.totalSupply),
      minimalPrice: jettonInfo.priceInTons,
      deployerSupplyPercent: jettonInfo.deployerSupplyPercent
    });
  };

  const transactionSentHandler = () => {
    showInfoNotification('Confirm the transaction', 'check your wallet');
  };

  const transactionSignedHandler = () => {
    showSuccessNotification('Transaction sent, monitor the status in the wallet');
    setIsLoadingCreateToken(false);
    setStep(2);
  };

  const transactionFailedHandler = () => {
    showErrorNotification('Transaction failed.', 'check your wallet');
    setIsLoadingCreateToken(false);
  };

  useEffect(() => {
    window.addEventListener('ton-connect-transaction-sent-for-signature', transactionSentHandler);

    window.addEventListener('ton-connect-transaction-signed', transactionSignedHandler);

    window.addEventListener('ton-connect-transaction-signing-failed', transactionFailedHandler);

    return () => {
      window.removeEventListener(
        'ton-connect-transaction-sent-for-signature',
        transactionSentHandler
      );

      window.removeEventListener('ton-connect-transaction-signed', transactionSignedHandler);

      window.removeEventListener(
        'ton-connect-transaction-signing-failed',
        transactionFailedHandler
      );
    };
  }, []);

  const avatarBg = useMemo(() => {
    return tokenImage
      ? {
          backgroundImage: `url(${typeof tokenImage === 'string' ? tokenImage : URL.createObjectURL(tokenImage)})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }
      : {};
  }, [tokenImage]);

  const isDisabled = !userAddress || isDeploying;

  return (
    <div className="flex flex-col items-center mx-auto overflow-auto mt-16 sm:mt-6 w-full">
      <div className="flex flex-col items-center justify-center w-[460px] sm:w-full">
        <Typography
          className="text-white"
          text="Create token"
          variant={TYPOGRAPHY_VARIANTS.HEADER_H2}
        />
        <Typography
          className="text-white text-center opacity-[0.5] mt-[12px]"
          text="Customize your Ton Token exactly the way you envision it. Less than 5 minutes, at an
          affordable cost."
          variant={TYPOGRAPHY_VARIANTS.BODY_M}
        />
      </div>

      <div className="w-full max-w-[460px] sm:max-w-full py-[48px] sm:py-[36px]">
        <form className="w-full flex flex-col items-center space-y-[32px]" onSubmit={handleDeploy}>
          <div className="relative flex flex-col items-center justify-center">
            {!!tokenImage && (
              <div
                onClick={() => setTokenImage(null)}
                className="hover:opacity-75 z-[3] cursor-pointer rounded-full absolute top-0 right-0 bg-red w-[24px] h-[24px] flex flex-col items-center justify-center">
                <img
                  className="w-[16px] h-[16px]"
                  src="/closeIcon.svg"
                  alt="remove token image icon"
                />
              </div>
            )}
            <input
              ref={ref}
              accept="image/png, image/jpeg"
              className="hidden"
              id="contained-button-file"
              type="file"
              onChange={handleImageChange}
              maxsize={MAX_IMAGE_SIZE}
            />

            <button
              type="button"
              onClick={() => ref.current.click()}
              className={`rounded-full flex items-center justify-center ${inputErrors?.includes('tokenImage') ? 'bg-red' : 'logo-btn-gradient'} h-[100px] w-[100px]`}>
              {tokenImage ? (
                <div
                  className="hover:opacity-90 rounded-full w-[98%] h-[98%] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
                  style={avatarBg}></div>
              ) : (
                <div className="hover:opacity-90 rounded-full bg-black-1000 flex items-center justify-center w-[98%] h-[98%] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                  <img className="opacity-30" src="/icons/imageLoader.svg" alt="image loader" />
                </div>
              )}
            </button>
          </div>
          <Typography
            className={`${inputErrors?.includes('tokenImage') ? 'text-red' : 'text-white opacity-50'}`}
            text="Choose your image"
            variant={TYPOGRAPHY_VARIANTS.BODY_S}
          />
          <TextInput
            onBlur={checkIsValid}
            isError={inputErrors?.includes('tokenName')}
            title="Name"
            maxLength="32"
            id="tokenName"
            value={jettonInfo.tokenName}
            handleChange={handleChange}
            placeholder="Specify the desired name for your Token"
          />
          <TextInput
            onBlur={checkIsValid}
            isError={inputErrors?.includes('tokenSymbol')}
            title="Symbol"
            maxLength="10"
            id="tokenSymbol"
            value={jettonInfo.tokenSymbol}
            handleChange={handleChange}
            placeholder="Indicate the symbol (max 10 characters)"
          />
          <NumberInput
            onBlur={checkIsValid}
            isError={inputErrors?.includes('priceInTons')}
            title="Minimal price in TONs"
            id="priceInTons"
            tip="Minimum price for 1 billion of your token"
            value={jettonInfo.priceInTons}
            placeholder="Minimal price in TONs"
            handleChange={(e) => handleChange(e)}
          />
          <React.Fragment>
            <NumberInput
              onBlur={checkIsValid}
              isError={inputErrors?.includes('totalSupply')}
              title="Total Supply"
              id="totalSupply"
              tip="Total amount of tokens to be created"
              value={jettonInfo.totalSupply}
              placeholder="Determine the Supply of your Token"
              handleChange={(e) => handleChange(e)}
            />
          </React.Fragment>
          <React.Fragment>
            <NumberInput
              onBlur={checkIsValid}
              isError={inputErrors?.includes('deployerSupplyPercent')}
              title="Supply Percent"
              id="deployerSupplyPercent"
              tip="Percentage of tokens that will be issued (you can only choose between 0 to 5 percent)"
              value={jettonInfo.deployerSupplyPercent}
              placeholder="0-5%"
              handleChange={(e) => handleChange(e)}
            />
            {!!jettonInfo.deployerSupplyPercent &&
              (Number(jettonInfo.deployerSupplyPercent) < 0 ||
                Number(jettonInfo.deployerSupplyPercent) > 5) && (
                <div className="text-[12px] text-red !mt-1 !mr-[46%]">
                  The value must be between 0 and 5
                </div>
              )}
          </React.Fragment>

          <Button
            isDisabled={isDisabled || isDeploying || isLoadingCreateToken}
            text="Create token"
            isLoading={isDeploying || isLoadingCreateToken}
            type="submit"
            className="w-[460px] h-[58px] sm:w-full"
            variant={BUTTON_VARIANTS.LARGE}
          />
        </form>
      </div>
    </div>
  );
};

export default DeployToken;
