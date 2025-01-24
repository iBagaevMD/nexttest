export const Op = {
  transfer: 0xf8a7ea5,
  transfer_notification: 0x7362d09c,
  internal_transfer: 0x178d4519,
  excesses: 0xd53276db,
  burn: 0x595f07bc,
  burn_notification: 0x7bdd97de,

  provide_wallet_address: 0x2c76b973,
  take_wallet_address: 0xd1735400,
  mint: 21,
  change_admin: 3,
  change_content: 4
};

export const Errors = {
  invalid_op: 709,
  not_admin: 73,
  unouthorized_burn: 74,
  discovery_fee_not_matched: 75,
  wrong_op: 0xffff,
  not_owner: 705,
  not_enough_ton: 709,
  not_enough_gas: 707,
  not_valid_wallet: 707,
  wrong_workchain: 333,
  balance_error: 706
};
