import React from 'react';

import { DashboardLayout } from 'layouts/DashboardLayout';
import TradeController from 'controllers/Ton/Trade';

const Trade = () => {
  return (
    <DashboardLayout>
      <TradeController />
    </DashboardLayout>
  );
};

export default Trade;
