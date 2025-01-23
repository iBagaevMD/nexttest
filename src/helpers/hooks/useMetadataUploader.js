import { useCallback, useState } from 'react';
import { IPFS_GATEWAY, IPFS_UPLOADER_URL } from 'config';

import { useNotifications } from 'contexts/notifications';
import { useSnackbar } from 'notistack';

const useMetadataUploader = () => {
  const [isUploading, setIsUploading] = useState(false);
  const { showInfoNotification, showErrorNotification } = useNotifications();
  const { closeSnackbar } = useSnackbar();

  async function doUpload(params) {
    const jsonTokenMetadata = {
      name: params.tokenName,
      symbol: params.tokenSymbol,
      description: params.tokenDescription
    };

    // Build form data:
    const formData = new FormData();
    formData.append('image', params.imageFile);
    formData.append('json', JSON.stringify(jsonTokenMetadata));

    // Set up the request
    return await fetch(IPFS_UPLOADER_URL, {
      method: 'POST',
      body: formData
    });
  }

  const uploadMetadata = useCallback(
    async (params, onSuccess = () => {}) => {
      let notificationId;
      try {
        setIsUploading(true);
        notificationId = showInfoNotification(
          'Uploading metadata...',
          'This may take couple of seconds'
        );
        const result = await doUpload(params);
        if (!result.ok) {
          const customError = (await result.json()).error;
          if (!customError) throw Error('Result is not OK');
          showErrorNotification(customError);
          return null;
        }
        const metadata = (await result.json()).result;
        if (!metadata.jsonCID) throw Error('Metadata is missing');
        return `${IPFS_GATEWAY}/${metadata.jsonCID}`;
      } catch (e) {
        showErrorNotification('Error during metadata upload');
        return null;
      } finally {
        closeSnackbar(notificationId);
        setIsUploading(false);
      }
    },
    [showInfoNotification, showErrorNotification, closeSnackbar]
  );

  return {
    isUploading,
    uploadMetadata
  };
};

export default useMetadataUploader;
