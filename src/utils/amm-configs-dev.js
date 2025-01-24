import { PublicKey } from '@solana/web3.js';

// 0.05% with 10-spacing
const devAmmConfig500_10 = {
  id: new PublicKey('GVSwm4smQBYcgAJU7qjFHLQBHTc4AdB3F2HbZp6KqKof'),
  index: 2,
  protocolFeeRate: 120000,
  tradeFeeRate: 500,
  tickSpacing: 10,
  fundFeeRate: 40000,
  fundOwner: new PublicKey('FundHfY8oo8J9KYGyfXFFuQCHe7Z1VBNmsj84eMcdYs4'),
  description: 'Best for wider ranges'
};
// 0.25% with 60-spacing
const devAmmConfig2500 = {
  id: new PublicKey('B9H7TR8PSjJT7nuW2tuPkFC63z7drtMZ4LoCtD7PrCN1'),
  index: 1,
  protocolFeeRate: 120000,
  tradeFeeRate: 2500,
  tickSpacing: 60,
  fundFeeRate: 40000,
  fundOwner: new PublicKey('FundHfY8oo8J9KYGyfXFFuQCHe7Z1VBNmsj84eMcdYs4'),
  description: 'Best for most pairs'
};
// 1% with 120-spacing
const devAmmConfig10000 = {
  id: new PublicKey('GjLEiquek1Nc2YjcBhufUGFRkaqW1JhaGjsdFd8mys38'),
  index: 3,
  protocolFeeRate: 120000,
  tradeFeeRate: 10000,
  tickSpacing: 120,
  fundFeeRate: 40000,
  fundOwner: new PublicKey('FundHfY8oo8J9KYGyfXFFuQCHe7Z1VBNmsj84eMcdYs4'),
  description: 'Best for exotic pairs'
};

export { devAmmConfig500_10, devAmmConfig2500, devAmmConfig10000 };
