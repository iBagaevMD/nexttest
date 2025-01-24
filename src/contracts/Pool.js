const { beginCell, contractAddress, SendMode, toNano } = require('@ton/core');

class Pool {
  constructor(address, init) {
    this.address = address;
    this.init = init;
    this.estimatedDeployGasPrice = toNano('0.05');
  }

  static createFromAddress(address) {
    return new Pool(address);
  }

  // Convert pool config to cell
  static poolConfigToCell(config) {
    return beginCell()
      .storeRef(config.poolJettonContent)
      .storeCoins(0) // placeholder: INITIAL_JETTON_BALANCE
      .storeCoins(0) // placeholder: jetton_balance
      .storeCoins(0) // initial ton balance is 0
      .storeCoins(0) // placeholder: T0
      .storeUint(0, 10) // placeholder: FEE_PER_MILLE
      .storeUint(0, 2) // placeholder: FACTORY_ADDRESS
      .storeUint(0, 2) // placeholder: POOL_JETTON_WALLET_ADDRESS
      .storeUint(0, 2) // placeholder: admin_address
      .storeUint(0, 1) // IS_INITED: false
      .endCell();
  }

  static createFromConfig(config, code, workchain = 0) {
    const data = this.poolConfigToCell(config);
    const init = { code, data };
    return new Pool(contractAddress(workchain, init), init);
  }

  async sendDeploy(provider, via, value, initConfig) {
    await provider.internal(via, {
      value,
      sendMode: SendMode.PAY_GAS_SEPARATELY,
      body: beginCell()
        .storeUint(Pool.ops.init, 32)
        .storeUint(0, 64) // empty query_id
        .storeCoins(initConfig.poolJettonBalance)
        .storeCoins(initConfig.poolJettonBalance * initConfig.minimalPrice) // T0
        .storeUint(initConfig.feePerMille, 10)
        .storeAddress(initConfig.factoryAddress)
        .storeAddress(initConfig.jettonWalletAddress)
        .storeAddress(initConfig.adminAddress || via.address)
        .storeRef(
          beginCell()
            .storeCoins(initConfig.jettonTotalSupply)
            .storeAddress(initConfig.jettonAuthorAddress)
            .endCell()
        )
        .endCell()
    });
  }

  async sendBuyJetton(provider, via, value) {
    const query_id = 0;
    await provider.internal(via, {
      value,
      sendMode: SendMode.PAY_GAS_SEPARATELY,
      body: beginCell().storeUint(Pool.ops.buyJetton, 32).storeUint(query_id, 64).endCell()
    });
  }

  async getBalance(provider) {
    const state = await provider.getState();
    return state.balance;
  }

  async getVirtualTonBalance(provider) {
    const { stack } = await provider.get('ton_balance', []);
    return stack.readBigNumber();
  }

  async getVirtualJettonBalance(provider) {
    const { stack } = await provider.get('jetton_balance', []);
    return stack.readBigNumber();
  }

  async getSoldJettonsAmount(provider) {
    const { stack } = await provider.get('sold_jettons_amount', []);
    return stack.readBigNumber();
  }

  async getBuyJettonFixedFee(provider) {
    const { stack } = await provider.get('buy_jetton_fixed_fee', []);
    return stack.readBigNumber();
  }

  async getBuyExchangeAmountFromSendAmount(provider, sendAmount) {
    return sendAmount - await this.getBuyJettonFixedFee(provider);
  }

  async getEstimatedJettonForTon(provider, tonAmount) {
    const { stack } = await provider.get('estimated_jetton_for_ton', [
      { type: 'int', value: tonAmount }
    ]);
    return stack.readBigNumber();
  }

  async getEstimatedTonForJetton(provider, jettonAmount) {
    const { stack } = await provider.get('estimated_ton_for_jetton', [
      { type: 'int', value: jettonAmount }
    ]);
    return stack.readBigNumber();
  }

  async getFeePerMille(provider) {
    const { stack } = await provider.get('fee_per_mille', []);
    return stack.readBigNumber();
  }

  async getEstimatedRequiredTonForJetton(provider, jettonAmount) {
    const feePerMille = await this.getFeePerMille(provider);
    try {
      const amount = -(await this.getEstimatedTonForJetton(provider, -jettonAmount));
      return amount + (amount * 2n * feePerMille) / 1000n;
    } catch (error) {
      if (
        error.exitCode === Pool.contractErrorAmountNotAvailable ||
        (error.message &&
          error.message.includes(`exit_code: ${Pool.contractErrorAmountNotAvailable}`))
      ) {
        return Pool.errorAmountNotAvailable;
      }
      throw error;
    }
  }

  async getEstimatedRequiredJettonForTon(provider, tonAmount) {
    const feePerMille = await this.getFeePerMille(provider);
    try {
      const compensatedTonAmount = tonAmount + (tonAmount * 2n * feePerMille) / 1000n;
      return -(await this.getEstimatedJettonForTon(provider, -compensatedTonAmount));
    } catch (error) {
      if (
        error.exitCode === Pool.contractErrorAmountNotAvailable ||
        (error.message &&
          error.message.includes(`exit_code: ${Pool.contractErrorAmountNotAvailable}`))
      ) {
        return Pool.errorAmountNotAvailable;
      }
      throw error;
    }
  }

  async getPriceComponents(provider) {
    const { stack } = await provider.get("price_components", []);
    const jettonBalance = stack.readBigNumber();
    const tonBalance = stack.readBigNumber();
    const T0 = stack.readBigNumber();
    return { jettonBalance, tonBalance, T0 }
  }

  calcJettonPrice(tonBalance, jettonBalance, T0) {
    return Number(tonBalance + T0) / Number(jettonBalance);
  }

  async getEstimatedPriceImpact(provider, unusedParam, swapParam) {
    let tonPoolBalanceChange;
    let jettonPoolBalanceChange;

    if ('jettonAmountForSell' in swapParam) {
      jettonPoolBalanceChange = swapParam.jettonAmountForSell;
      tonPoolBalanceChange = - await this.getEstimatedTonForJetton(provider, jettonPoolBalanceChange);
    } else {
      // this reproduces what's going on on pool (see "available_ton_amount ="),
      // and tonSendAmountForBuy should be == msg_value (as long as the fee is paid separately).
      tonPoolBalanceChange = await this.getBuyExchangeAmountFromSendAmount(provider, swapParam.tonSendAmountForBuy);

      jettonPoolBalanceChange = - await this.getEstimatedJettonForTon(provider, tonPoolBalanceChange);
    }

    const { tonBalance, jettonBalance, T0 } = await this.getPriceComponents(provider);
    const nextTonBalance = tonBalance + tonPoolBalanceChange;
    const nextJettonBalance = jettonBalance + jettonPoolBalanceChange;

    const currentPrice = this.calcJettonPrice(tonBalance, jettonBalance, T0);
    const estimatedNextPrice = this.calcJettonPrice(nextTonBalance, nextJettonBalance, T0);

    const result =  (estimatedNextPrice - currentPrice) / currentPrice;
    return result;
  }

  async getCollectFeeUpperEstimation(provider) {
    const { stack } = await provider.get('collect_fee_upper_estimation', []);
    return stack.readBigNumber();
  }

  async sendCollectFunds(provider, via, amountToCollect) {
    const query_id = 0;
    const valueToEnsureSend = 10_000_000n;
    await provider.internal(via, {
      value: valueToEnsureSend,
      sendMode: SendMode.PAY_GAS_SEPARATELY,
      body: beginCell()
        .storeUint(Pool.ops.collectFunds, 32)
        .storeUint(query_id, 64)
        .storeCoins(amountToCollect)
        .endCell()
    });
  }

  async getCollectableFundsAmount(provider) {
    const { stack } = await provider.get('collectable_funds_amount', []);
    return stack.readBigNumber();
  }
}

// Define static properties after the class to avoid dependency issues
Pool.ops = {
  init: 101,
  collectFunds: 102,
  buyJetton: 1
};

Pool.errorAmountNotAvailable = 'amount_not_available';
Pool.contractErrorAmountNotAvailable = 0xfff3;
Pool.estimatedFixedFee_sendJettonExceptForward = 42_000_000n;
Pool.pool__fee_buy_jetton_forward = 43_500_000n;
Pool.estimatedFixedFee_sellJetton = Pool.pool__fee_buy_jetton_forward + 2_200_000n;
Pool.estimatedMinimalValueToSend_sellJetton =
  Pool.estimatedFixedFee_sendJettonExceptForward + Pool.estimatedFixedFee_sellJetton;

module.exports = Pool;
