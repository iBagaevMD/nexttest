import React, { useEffect, useState } from 'react';
import { setCookie, parseCookies } from 'nookies';
import { useRouter } from 'next/router';

import Portal from 'src/components/Portal';
import Typography from 'src/components/Typography';
import Button from 'src/components/Button';
import { TYPOGRAPHY_VARIANTS } from 'src/components/Typography/constants';
import { BUTTON_VARIANTS } from 'src/components/Button/constants';
import { useWallet } from 'src/contexts/wallet';
import { delay } from 'helpers/delay';

const CookieLayout = ({ children }) => {
  const [isOpenCookiesAlert, setIsOpenCookiesAlert] = useState(false); // Инициализируем как false
  const router = useRouter();
  const { userAddress } = useWallet();

  useEffect(() => {
    // Проверяем, что код выполняется на клиенте
    if (typeof window === 'undefined') return;

    async function handleCookies() {
      if (parseCookies().acceptCookies) {
        document.body.style.overflow = '';
        setIsOpenCookiesAlert(false);
        return;
      }

      await delay(250);
      document.body.style.overflow = 'hidden';
      setIsOpenCookiesAlert(true);
    }

    handleCookies();
  }, []);

  const onAcceptCookies = () => {
    setCookie(null, 'acceptCookies', 'true');
    document.body.style.overflow = '';
    setIsOpenCookiesAlert(false);

    if (userAddress) {
      router.push('/createToken');
    }
  };

  return (
    <React.Fragment>
      <div style={{ pointerEvents: isOpenCookiesAlert ? 'none' : 'auto' }}>{children}</div>
      {isOpenCookiesAlert && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={(e) => e.stopPropagation()}></div>
      )}
      <Portal isOpen={isOpenCookiesAlert}>
        <div className="rounded-[1000px] sm:rounded-[16px] max-w-[1112px] sm:flex-col sm:max-w-max ml-auto mr-auto flex items-center py-4 px-6 cookiesAlert absolute z-50 bottom-6 right-1 left-1">
          <div className="flex flex-col">
            <Typography
              className="text-white"
              text="Our website might be using cookies to improve the website’s performance and make it more comfortable for users."
              variant={TYPOGRAPHY_VARIANTS.BODY_S}
            />
            <div className="flex flex-wrap">
              <Typography
                className="text-white"
                text="If you continue to use"
                variant={TYPOGRAPHY_VARIANTS.BODY_S}
              />
              <Typography
                className="text-orange-second mr-1 ml-1"
                text="rocketlauncher.gg"
                variant={TYPOGRAPHY_VARIANTS.BODY_S}
              />
              <Typography
                className="text-white"
                text="you agree to the use of cookies on this website."
                variant={TYPOGRAPHY_VARIANTS.BODY_S}
              />
            </div>
          </div>
          <Button
            variant={BUTTON_VARIANTS.LARGE}
            className="ml-auto sm:mr-auto sm:w-full sm:mt-3"
            text="Continue"
            onClick={onAcceptCookies}
          />
        </div>
      </Portal>
    </React.Fragment>
  );
};

export default CookieLayout;
