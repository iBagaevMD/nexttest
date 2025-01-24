import { beginCell, contractAddress, SendMode, toNano } from '@ton/core';

import { Op } from './JettonConstants';

class JettonMinter {
  constructor(address, init) {
    this.address = address;
    this.init = init;
    this.estimatedDeployGasPrice = toNano('0.05');
  }

  static jettonMinterConfigToCell(config) {
    return beginCell()
      .storeCoins(0)
      .storeAddress(config.admin)
      .storeRef(config.content)
      .storeRef(config.wallet_code)
      .endCell();
  }

  static jettonContentToCell(content) {
    return beginCell().storeUint(content.type, 8).storeStringTail(content.uri).endCell();
  }

  static createFromAddress(address) {
    return new JettonMinter(address);
  }

  static createFromConfig(config, code, workchain = 0) {
    const data = JettonMinter.jettonMinterConfigToCell(config);
    const init = { code, data };
    return new JettonMinter(contractAddress(workchain, init), init);
  }

  async sendDeploy(provider, via, value) {
    await provider.internal(via, {
      value,
      sendMode: SendMode.PAY_GAS_SEPARATELY,
      body: beginCell().endCell()
    });
  }

  static jettonInternalTransfer(jetton_amount, forward_ton_amount, response_addr, query_id = 0) {
    return beginCell()
      .storeUint(Op.internal_transfer, 32)
      .storeUint(query_id, 64)
      .storeCoins(jetton_amount)
      .storeAddress(null)
      .storeAddress(response_addr)
      .storeCoins(forward_ton_amount)
      .storeBit(false)
      .endCell();
  }

  static mintMessage(from, to, jetton_amount, forward_ton_amount, total_ton_amount, query_id = 0) {
    const mintMsg = beginCell()
      .storeUint(Op.internal_transfer, 32)
      .storeUint(0, 64)
      .storeCoins(jetton_amount)
      .storeAddress(null)
      .storeAddress(from)
      .storeCoins(forward_ton_amount)
      .storeMaybeRef(null)
      .endCell();

    return beginCell()
      .storeUint(Op.mint, 32)
      .storeUint(query_id, 64)
      .storeAddress(to)
      .storeCoins(total_ton_amount)
      .storeCoins(jetton_amount)
      .storeRef(mintMsg)
      .endCell();
  }
  async sendMint(provider, via, to, jetton_amount, forward_ton_amount, total_ton_amount) {
    if (total_ton_amount <= forward_ton_amount) {
      throw new Error('Total ton amount should be > forward amount');
    }
    await provider.internal(via, {
      sendMode: SendMode.PAY_GAS_SEPARATELY,
      body: JettonMinter.mintMessage(
        this.address,
        to,
        jetton_amount,
        forward_ton_amount,
        total_ton_amount
      ),
      value: total_ton_amount + toNano('0.015')
    });
  }

  static discoveryMessage(owner, include_address) {
    return beginCell()
      .storeUint(Op.provide_wallet_address, 32)
      .storeUint(0, 64)
      .storeAddress(owner)
      .storeBit(include_address)
      .endCell();
  }

  async sendDiscovery(provider, via, owner, include_address, value = toNano('0.1')) {
    await provider.internal(via, {
      sendMode: SendMode.PAY_GAS_SEPARATELY,
      body: JettonMinter.discoveryMessage(owner, include_address),
      value: value
    });
  }

  static changeAdminMessage(newOwner) {
    return beginCell()
      .storeUint(Op.change_admin, 32)
      .storeUint(0, 64)
      .storeAddress(newOwner)
      .endCell();
  }

  async sendChangeAdmin(provider, via, newOwner) {
    await provider.internal(via, {
      sendMode: SendMode.PAY_GAS_SEPARATELY,
      body: JettonMinter.changeAdminMessage(newOwner),
      value: toNano('0.05')
    });
  }

  static changeContentMessage(content) {
    return beginCell()
      .storeUint(Op.change_content, 32)
      .storeUint(0, 64)
      .storeRef(content)
      .endCell();
  }

  async sendChangeContent(provider, via, content) {
    await provider.internal(via, {
      sendMode: SendMode.PAY_GAS_SEPARATELY,
      body: JettonMinter.changeContentMessage(content),
      value: toNano('0.05')
    });
  }

  async getWalletAddress(provider, owner) {
    const res = await provider.get('get_wallet_address', [
      { type: 'slice', cell: beginCell().storeAddress(owner).endCell() }
    ]);
    return res.stack.readAddress();
  }

  async getJettonData(provider) {
    const res = await provider.get('get_jetton_data', []);
    const totalSupply = res.stack.readBigNumber();
    const mintable = res.stack.readBoolean();
    const adminAddress = res.stack.readAddress();
    const content = res.stack.readCell();
    const walletCode = res.stack.readCell();
    return {
      totalSupply,
      mintable,
      adminAddress,
      content,
      walletCode
    };
  }

  async getTotalSupply(provider) {
    const res = await this.getJettonData(provider);
    return res.totalSupply;
  }

  async getAdminAddress(provider) {
    const res = await this.getJettonData(provider);
    return res.adminAddress;
  }

  async getContent(provider) {
    const res = await this.getJettonData(provider);
    return res.content;
  }
}

module.exports = { JettonMinter };
