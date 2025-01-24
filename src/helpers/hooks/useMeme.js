import { useCallback, useState } from 'react';
import { SOLANA_ROCKET_API_URL } from 'config';

import { useNotifications } from 'contexts/notifications';
import { useSnackbar } from 'notistack';

const useMeme = () => {
  const [isCreating, setIsCreating] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isCreated, setIsCreated] = useState(false);
  const { showInfoNotification, showErrorNotification, showSuccessNotification } =
    useNotifications();
  const { closeSnackbar } = useSnackbar();

  async function doCreateMeme(account, tokenName, tokenSymbol, imageFileOrUri, metadataUri) {
    // If fileOrUri is a File, do the original multipart flow:
    if (imageFileOrUri instanceof File) {
      const jsonTokenMetadata = {
        name: tokenName,
        symbol: tokenSymbol
      };
      const formData = new FormData();
      formData.append('image', imageFileOrUri);
      formData.append('json', JSON.stringify(jsonTokenMetadata));
      formData.append('account', account);

      return await fetch(`${SOLANA_ROCKET_API_URL}/meme/createOwn`, {
        method: 'POST',
        body: formData
      });
    } else {
      // Otherwise, assume fileOrUri is actually the imageUri string
      const requestBody = {
        account,
        name: tokenName,
        symbol: tokenSymbol,
        imageUri: imageFileOrUri,
        metadataUri: metadataUri
      };
      return await fetch(`${SOLANA_ROCKET_API_URL}/meme/createGen`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      });
    }
  }

  const createMeme = useCallback(
    async (account, tokenName, tokenSymbol, imageFileOrUri, metadataUri) => {
      let notificationId;
      try {
        setIsCreating(true);
        notificationId = showInfoNotification('Uploading data...', 'This may take a few seconds');
        const response = await doCreateMeme(
          account,
          tokenName,
          tokenSymbol,
          imageFileOrUri,
          metadataUri
        );
        const json = await response.json();
        if (!response.ok) {
          const customError = json.error;
          if (!customError) throw Error('Result is not OK');
          showErrorNotification(customError);
          return null;
        }
        showSuccessNotification('Token was added');
        setIsCreated(true);
        return json.result;
      } catch (e) {
        showErrorNotification('Error during upload');
      } finally {
        closeSnackbar(notificationId);
        setIsCreating(false);
      }
      return null;
    },
    [showInfoNotification, showErrorNotification, closeSnackbar]
  );

  async function doGenerateMeme(account) {
    const data = JSON.stringify({
      account
    });
    // Send request
    return await fetch(`${SOLANA_ROCKET_API_URL}/meme/generate`, {
      method: 'POST',
      body: data
    });
  }

  const generateMeme = useCallback(
    async (account) => {
      let notificationId;
      try {
        setIsGenerating(true);
        notificationId = showInfoNotification(
          'Generating meme...',
          'This may take couple of seconds'
        );
        const response = await doGenerateMeme(account);
        const json = await response.json();
        if (!response.ok) {
          const customError = json.error;
          if (!customError) throw Error('Result is not OK');
          showErrorNotification(customError);
          return null;
        }
        return json.result;
      } catch (e) {
        showErrorNotification('Error during generation');
        return null;
      } finally {
        closeSnackbar(notificationId);
        setIsGenerating(false);
      }
    },
    [showInfoNotification, showErrorNotification, closeSnackbar]
  );

  return {
    isCreating,
    isGenerating,
    createMeme,
    generateMeme,
    isCreated
  };
};

export default useMeme;
