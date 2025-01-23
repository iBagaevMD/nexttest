import React from 'react';

import { DashboardLayout } from 'layouts/DashboardLayout';
import MarketController from 'controllers/Solana/Market';

export default function Market() {
  return (
    <DashboardLayout>
      <MarketController />
    </DashboardLayout>
  );
}
