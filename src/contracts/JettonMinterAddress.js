import { Address, Cell } from '@ton/core'

import { JettonMinter } from './JettonMinter'
import { JETTON_MINTER_CODE_HEX, JETTON_WALLET_CODE_HEX, TON_CONTRACT_ADDRESS } from 'config';

const hexToCell = (hex) => Cell.fromBoc(Buffer.from(hex, 'hex'))[0];

export const getMinterAddress = (metadataUri) => {
    const minterContentCell = JettonMinter.jettonContentToCell({
        type: 1,
        uri: metadataUri,
    })
    const minter = JettonMinter.createFromConfig({
        content: minterContentCell,
        wallet_code: hexToCell(JETTON_WALLET_CODE_HEX),
        admin: Address.parse(TON_CONTRACT_ADDRESS),
    }, hexToCell(JETTON_MINTER_CODE_HEX))
    return minter.address
}
