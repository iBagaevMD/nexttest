const { beginCell, contractAddress, SendMode, toNano } = require('@ton/core');

const { Op } = require('./JettonConstants');

class JettonWallet {
  constructor(address, init) {
    this.address = address;
    this.init = init;
  }

  static createFromAddress(address) {
    return new JettonWallet(address);
  }

  static createFromConfig(config, code, workchain = 0) {
    const data = jettonWalletConfigToCell(config);
    const init = { code, data };
    return new JettonWallet(contractAddress(workchain, init), init);
  }

  async sendDeploy(provider, via, value) {
    await provider.internal(via, {
      value,
      sendMode: SendMode.PAY_GAS_SEPARATELY,
      body: beginCell().endCell()
    });
  }

  async getJettonBalance(provider) {
    let state = await provider.getState();
    if (state.state.type !== 'active') {
      return BigInt(0);
    }
    let res = await provider.get('get_wallet_data', []);
    return res.stack.readBigNumber();
  }

  static transferMessage(
    jetton_amount,
    to,
    responseAddress,
    customPayload,
    forward_ton_amount,
    forwardPayload
  ) {
    const queryId = 0;
    return beginCell()
      .storeUint(Op.transfer, 32)
      .storeUint(queryId, 64)
      .storeCoins(jetton_amount)
      .storeAddress(to)
      .storeAddress(responseAddress)
      .storeMaybeRef(customPayload)
      .storeCoins(forward_ton_amount)
      .storeMaybeRef(forwardPayload)
      .endCell();
  }
  async sendTransfer(
    provider,
    via,
    value,
    jetton_amount,
    to,
    responseAddress,
    customPayload,
    forward_ton_amount,
    forwardPayload
  ) {
    await provider.internal(via, {
      sendMode: SendMode.PAY_GAS_SEPARATELY,
      body: JettonWallet.transferMessage(
        jetton_amount,
        to,
        responseAddress,
        customPayload,
        forward_ton_amount,
        forwardPayload
      ),
      value
    });
  }

  static burnMessage(jetton_amount, responseAddress, customPayload) {
    const queryId = 0;
    return beginCell()
      .storeUint(Op.burn, 32)
      .storeUint(queryId, 64)
      .storeCoins(jetton_amount)
      .storeAddress(responseAddress)
      .storeMaybeRef(customPayload)
      .endCell();
  }

  async sendBurn(provider, via, value, jetton_amount, responseAddress, customPayload) {
    await provider.internal(via, {
      sendMode: SendMode.PAY_GAS_SEPARATELY,
      body: JettonWallet.burnMessage(jetton_amount, responseAddress, customPayload),
      value
    });
  }

  static withdrawTonsMessage() {
    const queryId = 0;
    return beginCell().storeUint(0x6d8e5e3c, 32).storeUint(queryId, 64).endCell();
  }

  async sendWithdrawTons(provider, via) {
    await provider.internal(via, {
      sendMode: SendMode.PAY_GAS_SEPARATELY,
      body: JettonWallet.withdrawTonsMessage(),
      value: toNano('0.1')
    });
  }

  static withdrawJettonsMessage(from, amount) {
    const queryId = 0;
    return beginCell()
      .storeUint(0x768a50b2, 32)
      .storeUint(queryId, 64)
      .storeAddress(from)
      .storeCoins(amount)
      .storeMaybeRef(null)
      .endCell();
  }

  async sendWithdrawJettons(provider, via, from, amount) {
    await provider.internal(via, {
      sendMode: SendMode.PAY_GAS_SEPARATELY,
      body: JettonWallet.withdrawJettonsMessage(from, amount),
      value: toNano('0.1')
    });
  }
}

function jettonWalletConfigToCell(config) {
  return beginCell().endCell();
}

module.exports = { JettonWallet, jettonWalletConfigToCell };
