export const useBlurBackground = () => {
  const setBlurBackground = () => {
    document.body.style.overflow = 'hidden';
    document.getElementById('blurId')?.classList.add('bgBlur');
  };

  const resetBlurBackground = () => {
    document.body.style.overflow = '';
    document.getElementById('blurId')?.classList.remove('bgBlur');
  };

  return {
    setBlurBackground,
    resetBlurBackground
  };
};
