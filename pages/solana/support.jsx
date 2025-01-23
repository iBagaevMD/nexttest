import React from 'react';

import { DashboardLayout } from 'layouts/DashboardLayout';
import DashboardSupport from 'components/DashboardSupport';

const Support = () => {
  const onConnectSupport = () => {
    window.open('https://t.me/suppport_rl', '_blank');
  };

  return (
    <DashboardLayout>
      <DashboardSupport onClick={onConnectSupport} />
    </DashboardLayout>
  );
};

export default Support;
