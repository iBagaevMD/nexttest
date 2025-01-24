import { PublicKey } from '@solana/web3.js';

// 0.01% with 1-spacing
const prodAmmConfig100 = {
  id: new PublicKey('9iFER3bpjf1PTTCQCfTRu17EJgvsxo9pVyA9QWwEuX4x'),
  index: 4,
  protocolFeeRate: 120000,
  tradeFeeRate: 100,
  tickSpacing: 1,
  fundFeeRate: 40000,
  fundOwner: new PublicKey('FundHfY8oo8J9KYGyfXFFuQCHe7Z1VBNmsj84eMcdYs4'),
  description: 'Best for very stable pairs'
};
// 0.05% with 1-spacing
const prodAmmConfig500_1 = {
  id: new PublicKey('3XCQJQryqpDvvZBfGxR7CLAw5dpGJ9aa7kt1jRLdyxuZ'),
  index: 5,
  protocolFeeRate: 120000,
  tradeFeeRate: 500,
  tickSpacing: 1,
  fundFeeRate: 40000,
  fundOwner: new PublicKey('FundHfY8oo8J9KYGyfXFFuQCHe7Z1VBNmsj84eMcdYs4'),
  description: 'Best for tighter ranges'
};
// 0.05% with 10-spacing
const prodAmmConfig500_10 = {
  id: new PublicKey('HfERMT5DRA6C1TAqecrJQFpmkf3wsWTMncqnj3RDg5aw'),
  index: 2,
  protocolFeeRate: 120000,
  tradeFeeRate: 500,
  tickSpacing: 10,
  fundFeeRate: 40000,
  fundOwner: new PublicKey('FundHfY8oo8J9KYGyfXFFuQCHe7Z1VBNmsj84eMcdYs4'),
  description: 'Best for wider ranges'
};
// 0.25% with 60-spacing
const prodAmmConfig2500 = {
  id: new PublicKey('E64NGkDLLCdQ2yFNPcavaKptrEgmiQaNykUuLC1Qgwyp'),
  index: 1,
  protocolFeeRate: 120000,
  tradeFeeRate: 2500,
  tickSpacing: 60,
  fundFeeRate: 40000,
  fundOwner: new PublicKey('FundHfY8oo8J9KYGyfXFFuQCHe7Z1VBNmsj84eMcdYs4'),
  description: 'Best for most pairs'
};
// 1% with 120-spacing
const prodAmmConfig10000 = {
  id: new PublicKey('A1BBtTYJd4i3xU8D6Tc2FzU6ZN4oXZWXKZnCxwbHXr8x'),
  index: 3,
  protocolFeeRate: 120000,
  tradeFeeRate: 10000,
  tickSpacing: 120,
  fundFeeRate: 40000,
  fundOwner: new PublicKey('FundHfY8oo8J9KYGyfXFFuQCHe7Z1VBNmsj84eMcdYs4'),
  description: 'Best for exotic pairs'
};

export {
  prodAmmConfig100,
  prodAmmConfig500_1,
  prodAmmConfig500_10,
  prodAmmConfig2500,
  prodAmmConfig10000
};
