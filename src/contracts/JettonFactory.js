import {beginCell, contractAddress, SendMode, toNano} from '@ton/core'
import { JettonMinter } from './JettonMinter';

function jettonFactoryConfigToCell(config) {
  return beginCell()
    .storeRef(config.minterCode)
    .storeRef(config.walletCode)
    .storeRef(config.poolCode)
    .storeAddress(config.adminAddress)
    .storeCoins(config.feePerMille)
    .storeUint(config.maxDeployerSupplyPercent, 4)
    .endCell();
}

class JettonFactory {
  constructor(address, init) {
    this.address = address;
    this.init = init;
  }

  static createFromAddress(address) {
    return new JettonFactory(address);
  }

  static createFromConfig(config, code, workchain = 0) {
    const data = jettonFactoryConfigToCell(config);
    const init = { code, data };
    const address = contractAddress(workchain, init);
    return new JettonFactory(address, init);
  }

  estimatedDeployGasPrice = toNano('0.05');

  async sendDeploy(provider, via, value) {
    await provider.internal(via, {
      value,
      sendMode: SendMode.PAY_GAS_SEPARATELY,
      body: beginCell().endCell()
    });
  }

  static ops = {
    initiateNew: 1,
    onPoolDeployProceedToMinter: 2
  };

  static sendInitiateNew_estimatedValue = toNano('0.24');

  async sendInitiateNew(provider, via, value, config) {
    console.log(config, 'config');
    const content = JettonMinter.jettonContentToCell({
      type: 1,
      uri: config.metadataUri
    });

    const query_id = 0;
    await provider.internal(via, {
      value,
      sendMode: SendMode.PAY_GAS_SEPARATELY,
      body: beginCell()
        .storeUint(JettonFactory.ops.initiateNew, 32)
        .storeUint(query_id, 64)
        .storeCoins(config.totalSupply)
        .storeCoins(config.minimalPrice)
        .storeCoins(config.deployerSupplyPercent)
        .storeRef(content)
        .endCell()
    });
  }

  async getMaxDeployerSupplyPercent(provider) {
    const { stack } = await provider.get('max_deployer_supply_percent', []);
    return stack.readBigNumber();
  }
}

module.exports = { JettonFactory };
