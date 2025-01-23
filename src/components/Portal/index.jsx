import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

const Portal = ({ children, isOpen }) => {
  const [container, setContainer] = useState(null);

  useEffect(() => {
    // Создаём контейнер для портала
    const portalContainer = document.createElement('div');
    document.body.appendChild(portalContainer);
    setContainer(portalContainer);

    // Удаляем контейнер при размонтировании
    return () => {
      document.body.removeChild(portalContainer);
    };
  }, []);

  if (!container || !isOpen) return null;

  return createPortal(children, container);
};

export default Portal;
