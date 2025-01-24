import * as web3 from '@solana/web3.js';
import { bool, s32, seq, struct, u128, u32, u64, u8 } from 'marshmallow';

export const buildInstructionFromIDL = (idl, instructionName, accounts, args, programAddress) => {
  const idlInstruction = idl.instructions.find((obj) => obj.name === instructionName);
  if (!idlInstruction) throw Error(`Instruction ${instructionName} not found`);
  // 1. Prerare accounts:
  const keys = [];
  idlInstruction.accounts.forEach((idlAcc) => {
    if (!accounts.hasOwnProperty(idlAcc.name)) throw Error(`Account ${idlAcc.name} not found`);
    if (!(accounts[idlAcc.name] instanceof web3.PublicKey))
      throw Error(`Account ${idlAcc.name} must be of type PublicKey`);
    if (idlAcc.address && accounts[idlAcc.name].toString() !== idlAcc.address)
      throw Error(`Account ${idlAcc.name} has incorrect address`);
    keys.push({
      pubkey: accounts[idlAcc.name],
      isSigner: idlAcc.signer === true,
      isWritable: idlAcc.writable === true
    });
  });
  // 2. Prepare data:
  const dataLayoutFields = [];
  idlInstruction.args.forEach((idlArg) => {
    if (!args.hasOwnProperty(idlArg.name)) throw Error(`Argument ${idlArg.name} not found`);
    if (idlArg.type === 'string') {
      const lenName = `_len_${idlArg.name}`;
      const arrName = `_arr_${idlArg.name}`;
      args[lenName] = args[idlArg.name].length;
      args[arrName] = Buffer.from(args[idlArg.name]);
      dataLayoutFields.push(u32(lenName));
      dataLayoutFields.push(seq(u8(), args[idlArg.name].length, arrName));
      return;
    }
    if (typeof idlArg.type === 'object') {
      if (idlArg.type.array && idlArg.type.array[0] === 'u8') {
        dataLayoutFields.push(seq(u8(), 32, idlArg.name));
        return;
      }
      throw Error(`Unknown type from IDL: ${idlArg.type}`);
    }
    switch (idlArg.type) {
      case 'u8':
        dataLayoutFields.push(u8(idlArg.name));
        break;
      case 'u64':
        dataLayoutFields.push(u64(idlArg.name));
        break;
      case 'u128':
        dataLayoutFields.push(u128(idlArg.name));
        break;
      case 'i32':
        dataLayoutFields.push(s32(idlArg.name));
        break;
      case 'bool':
        dataLayoutFields.push(bool(idlArg.name));
        break;
      default:
        throw Error(`Unknown type from IDL: ${idlArg.type}`);
    }
  });
  const dataLayout = struct(dataLayoutFields);
  const data = Buffer.alloc(dataLayout.span);
  dataLayout.encode(args, data);
  const aData = Buffer.from([...idlInstruction.discriminator, ...data]);
  // 3. Build instruction:
  const programId = new web3.PublicKey(programAddress || idl.address);
  const instruction = new web3.TransactionInstruction({
    keys,
    programId,
    data: aData
  });
  return instruction;
};

export const signMessage = async (signer, message) => {
  try {
    const encodedMessage = new TextEncoder().encode(message);
    const signedMessage = await signer.signMessage(encodedMessage, 'utf8');
    return {
      signature: signedMessage.signature,
      publicKey: signedMessage.publicKey.toString()
    };
  } catch (error) {
    console.error('Error signing message:', error);
    return null;
  }
};

export const buildSolanaExplorerLink = (txHash) => {
  return `https://solscan.io/tx/${txHash}`;
};

export const isUserRejectedError = (error) => {
  return error?.message?.includes(`User rejected`);
};
