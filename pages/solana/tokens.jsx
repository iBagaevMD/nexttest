import React from 'react';

import { DashboardLayout } from 'layouts/DashboardLayout';
import TokensController from 'controllers/Solana/Tokens';

export default function Market() {
  return (
    <DashboardLayout>
      <TokensController />
    </DashboardLayout>
  );
}
