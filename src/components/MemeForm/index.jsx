import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import Typography from 'components/Typography';
import { TYPOGRAPHY_VARIANTS } from 'components/Typography/constants';
import Button from 'components/Button';
import { BUTTON_VARIANTS } from 'components/Button/constants';
import TextInput from 'components/Inputs/TextInput-memeForm';
import { useWallet } from 'contexts/wallet';
import { MAX_IMAGE_SIZE } from './constants';
import ConnectWalletModal from '../Modals/ConnectWalletModal';
import { useBlurBackground } from 'helpers/hooks/useBlurBackground';
import useMeme from 'helpers/hooks/useMeme';
import {
  setCreateMemeData,
  setGenerateCoinFromHomePage,
  setIsNeedUpdateMemes
} from 'store/userSlice';
import { getCreateMemeData, getDailyMemesLeft } from 'store/userSlice/selectors';
import { useNotifications } from 'contexts/notifications';

const FUNCTION_TYPES = [
  {
    title: 'Generate',
    key: 'generate'
  },
  {
    title: 'Do it yourself',
    key: 'self'
  }
];

export const MemeForm = ({ isHomePage, handleCloseModal }) => {
  const dispatch = useDispatch();
  const { userAddress } = useWallet();
  const [type, setType] = useState(FUNCTION_TYPES[0].key);
  const [inputsValues, setInputsValues] = useState({ name: '', symbol: '' });
  const [tokenImage, setTokenImage] = useState(null);
  const [isOpenedWalletModal, setIsOpenedWalletModal] = useState(false);
  const { showErrorNotification } = useNotifications();
  const ref = useRef();
  const { setBlurBackground } = useBlurBackground();
  const { isCreating, isGenerating, createMeme, generateMeme, isCreated } = useMeme();
  const isSendingRequest = isCreating || isGenerating;
  const [generatedCoinData, setGeneratedCoinData] = useState(null);
  const dailyMemesLeft = useSelector(getDailyMemesLeft);
  const isCanGenerate = userAddress ? dailyMemesLeft > 0 : true;

  const createMemeData = useSelector(getCreateMemeData);

  useEffect(() => {
    if (isCreated) {
      dispatch(setIsNeedUpdateMemes(true));
      handleCloseModal();
    }
  }, [isCreated]);

  useEffect(() => {
    if (createMemeData?.image) {
      setType(FUNCTION_TYPES[1].key);

      setInputsValues({ name: createMemeData.name, symbol: createMemeData.symbol });
      setTokenImage(createMemeData.image);
    }
  }, []);

  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleGenerateCoin = async () => {
    if (isHomePage) {
      setBlurBackground();
      setIsOpenedWalletModal(true);
      dispatch(setGenerateCoinFromHomePage(true));
      return;
    }
    const result = await generateMeme(userAddress);
    if (result) {
      setGeneratedCoinData(result);
    }
  };

  const handleCreateCoin = async () => {
    if (isHomePage) {
      // Redux не поддерживает несериализуемые значения,
      // конвертируем в base64 и добавляем в redux-store
      try {
        const base64Image = await fileToBase64(tokenImage);
        dispatch(
          setCreateMemeData({
            image: base64Image,
            name: inputsValues.name,
            symbol: inputsValues.symbol
          })
        );

        setBlurBackground();
        setIsOpenedWalletModal(true);
      } catch (error) {
        console.error('Error save to redux-store:', error);
      }
      return;
    }
    if (type === FUNCTION_TYPES[0].key && generatedCoinData) {
      const { name, symbol, imageUri, metadataUri } = generatedCoinData;
      await createMeme(userAddress, name, symbol, imageUri, metadataUri);
      return;
    }
    const { name, symbol } = inputsValues;
    await createMeme(userAddress, name, symbol, tokenImage);
  };

  const avatarBg = useMemo(() => {
    return tokenImage
      ? {
          backgroundImage: `url(${typeof tokenImage === 'string' ? tokenImage : URL.createObjectURL(tokenImage)})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }
      : {};
  }, [tokenImage]);

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
    setInputsValues({
      ...inputsValues,
      [name]: name === 'symbol' ? value?.trim() : value
    });
  };

  const renderLeftSide = useMemo(() => {
    switch (type) {
      case FUNCTION_TYPES[0].key:
        if (!generatedCoinData) {
          return (
            <>
              <Typography
                className="text-white"
                variant={TYPOGRAPHY_VARIANTS.HEADER_H2}
                text="We will take over the generation of the name, symbol and image ourselves"
              />
            </>
          );
        } else {
          return (
            <>
              <div className="flex flex-col space-y-3 mb-[32px] w-full">
                <TextInput
                  title="Name"
                  id="name"
                  maxLength="32"
                  value={generatedCoinData.name || ''}
                  disabled={true}
                  className="bg-transparent border-transparent"
                  handleChange={() => {}}
                />
              </div>
              <div className="flex flex-col space-y-3 w-full">
                <TextInput
                  id="symbol"
                  title="Symbol"
                  maxLength="8"
                  value={generatedCoinData.symbol || ''}
                  disabled={true}
                  className="bg-transparent border-transparent"
                  handleChange={() => {}}
                />
              </div>
            </>
          );
        }
      case FUNCTION_TYPES[1].key:
        return (
          <>
            <div className="flex flex-col space-y-3 mb-[32px] w-full">
              <TextInput
                title="Name"
                id="name"
                maxLength="32"
                value={inputsValues.name}
                placeholder="Token Name"
                className="border-transparent"
                handleChange={handleChange}
              />
            </div>
            <div className="flex flex-col space-y-3 w-full">
              <TextInput
                id="symbol"
                title="Symbol"
                maxLength="8"
                value={inputsValues.symbol}
                placeholder="Token Symbol"
                className="border-transparent"
                handleChange={handleChange}
              />
            </div>
          </>
        );
      default:
        return null;
    }
  }, [type, inputsValues, generatedCoinData]);

  const renderRightSide = useMemo(() => {
    switch (type) {
      case FUNCTION_TYPES[0].key:
        if (!generatedCoinData) {
          return (
            <>
              <img className="h-[185px] sm:h-[100px]" src="/icons/grey-rocket.svg" alt="" />
            </>
          );
        } else {
          return (
            <>
              <div className="relative w-full h-full flex items-center justify-center">
                {!!generatedCoinData.imageUri && (
                  <button
                    type="button"
                    disabled={true}
                    className="w-full rounded-[20px] h-full flex items-center justify-center"
                    style={{
                      backgroundImage: `url(${generatedCoinData.imageUri})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center'
                    }}>
                    {/* No remove icon because read-only */}
                  </button>
                )}
              </div>
            </>
          );
        }
      case FUNCTION_TYPES[1].key:
        return (
          <>
            <div className="relative w-full h-full flex items-center justify-center">
              {!!tokenImage && (
                <div
                  onClick={() => setTokenImage(null)}
                  className="hover:opacity-75 z-[3] cursor-pointer rounded-full absolute top-0 right-0 bg-red w-[24px] h-[24px] flex flex-col items-center justify-center">
                  <img
                    className="w-[16px] h-[16px]"
                    src="/icons/closeIcon.svg"
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
                className="w-full rounded-[20px] h-full flex items-center justify-center"
                style={tokenImage ? avatarBg : {}}>
                {tokenImage ? null : (
                  <div className="hover:opacity-90 flex flex-col items-center justify-center h-full w-full">
                    <img className="h-[80px] opacity-50" src="/icons/imageLoader.svg" alt="" />
                    <Typography
                      className="text-white-500 mt-4"
                      variant={TYPOGRAPHY_VARIANTS.BODY_M}
                      text="Chose your image"
                    />
                  </div>
                )}
              </button>
            </div>
          </>
        );
      default:
        return null;
    }
  }, [type, tokenImage, avatarBg, generatedCoinData]);

  const renderButton = () => {
    switch (type) {
      case FUNCTION_TYPES[0].key:
        if (!generatedCoinData) {
          return (
            <div className="w-full flex flex-col items-center justify-end space-y-[16px]">
              <Button
                className="w-full"
                text={dailyMemesLeft === 0 && !isHomePage ? '0 attempts left' : 'Generate'}
                isLoading={isSendingRequest}
                isDisabled={isSendingRequest || !isCanGenerate}
                onClick={handleGenerateCoin}
                variant={BUTTON_VARIANTS.LARGE}
              />
              <Typography
                className="text-white-500"
                variant={TYPOGRAPHY_VARIANTS.BODY_S}
                text="You can generate 2 memecoins a day for free"
              />
            </div>
          );
        } else {
          return (
            <div className="w-full flex flex-col items-center justify-end space-y-[16px]">
              <div className="w-full flex justify-start mb-[8px]">
                <Button
                  onClick={handleGenerateCoin}
                  className="rounded-full w-[60px] h-[60px] flex items-center justify-center bg-white-50"
                  text={<img src="/icons/refresh.svg" alt="Refresh" className="w-6 h-6" />}
                />
              </div>

              <Button
                isDisabled={
                  !generatedCoinData?.imageUri ||
                  !generatedCoinData?.name?.length ||
                  !generatedCoinData?.symbol?.length ||
                  isSendingRequest
                }
                isLoading={isSendingRequest}
                onClick={handleCreateCoin}
                className="w-full"
                text="Create"
                variant={BUTTON_VARIANTS.LARGE}
              />
              <Typography
                className="text-white-500"
                variant={TYPOGRAPHY_VARIANTS.BODY_S}
                text="You can generate 2 memecoins a day for free"
              />
            </div>
          );
        }

      case FUNCTION_TYPES[1].key:
        return (
          <div className="w-full flex flex-col items-center justify-end space-y-[16px]">
            <Button
              isDisabled={
                !tokenImage ||
                !inputsValues.name?.length ||
                !inputsValues?.symbol?.length ||
                isSendingRequest ||
                (isHomePage && !!userAddress)
              }
              onClick={handleCreateCoin}
              className="w-full"
              text="Create"
              variant={BUTTON_VARIANTS.LARGE}
            />
            <Typography
              className="text-white-500"
              variant={TYPOGRAPHY_VARIANTS.BODY_S}
              text="You can generate 2 memecoins a day for free"
            />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <React.Fragment>
      <div className="h-[562px] sm:h-auto w-full p-[16px] pl-[32px] sm:pl-[10px] sm:pt-[10px] sm:pb-[24px] flex items-center justify-center sm:flex-col backdrop-blur-[76px] bg-white-50 rounded-[32px] space-x-[32px] sm:space-x-0 sm:space-y-[32px]">
        <div className="flex-1 w-full h-full flex flex-col py-[32px] sm:py-0">
          <div className="w-full bg-white-50 rounded-[100px] mb-[32px] flex items-center justify-center">
            {FUNCTION_TYPES.map((item, itemIndex) => {
              const isActive = item.key === type;
              return (
                <Button
                  key={item.key}
                  onClick={() => setType(item.key)}
                  className={`flex-1 !text-[14px] !font-light !leading-[16px] ${isActive ? 'bg-white !text-black' : 'opacity-30'}`}
                  text={item.title}
                  variant={
                    isActive ? BUTTON_VARIANTS.LARGE_WHITE : BUTTON_VARIANTS.LARGE_TRANSPARENT
                  }
                />
              );
            })}
          </div>
          <div className="flex-1 w-full flex flex-col">
            <div className="sm:h-[144px] flex flex-col items-center justify-center">
              {renderLeftSide}
            </div>

            <div className="flex-1 flex-col justify-end flex w-full h-full sm:hidden">
              {renderButton()}
            </div>
          </div>
        </div>

        <div className="flex flex-col w-[530px] sm:w-full h-full sm:space-y-[20px]">
          <div className="w-full h-full sm:h-[324px] bg-white-50 opacity-80 rounded-[20px] flex items-center justify-center">
            {renderRightSide}
          </div>
          <div className="sm:w-full sm:h-full hidden sm:block">{renderButton()}</div>
        </div>
      </div>
      {isOpenedWalletModal && (
        <ConnectWalletModal
          isOnlySolana
          isOpened={isOpenedWalletModal}
          setOpened={setIsOpenedWalletModal}
        />
      )}
    </React.Fragment>
  );
};
