import React from 'react';

import { DashboardLayout } from 'layouts/DashboardLayout';
import MarketController from 'controllers/Ton/Market';

export default function Market() {
  return (
    <DashboardLayout>
      <MarketController />
    </DashboardLayout>
  );
}
