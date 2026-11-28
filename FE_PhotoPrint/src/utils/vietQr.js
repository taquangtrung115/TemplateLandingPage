export const vietQrBanks = {
  VCB: { name: 'Vietcombank', bin: '970436' },
  MB: { name: 'MB Bank', bin: '970422' },
  TCB: { name: 'Techcombank', bin: '970407' },
};

export const paymentStatuses = {
  Unpaid: 'Chưa thanh toán', PendingVerify: 'Chờ đối soát', Paid: 'Đã thanh toán', Refunded: 'Đã hoàn tiền',
  Verified: 'Đã đối soát', Rejected: 'Đã từ chối',
};

export const canUseVietQr = config => config.vietQrEnabled === true && Object.hasOwn(vietQrBanks, config.bankCode)
  && /^[0-9]{1,19}$/.test(config.bankAccountNumber || '') && Boolean(config.bankAccountName?.trim());

const field = (id, value) => id + String(value.length).padStart(2, '0') + value;

function crc16(value) {
  let crc = 0xffff;
  for (const byte of new TextEncoder().encode(value)) {
    crc ^= byte << 8;
    for (let step = 0; step < 8; step++) crc = ((crc << 1) ^ ((crc & 0x8000) ? 0x1021 : 0)) & 0xffff;
  }
  return crc.toString(16).toUpperCase().padStart(4, '0');
}

export function vietQrPayload(config, amount, memo) {
  const dynamic = amount != null || memo != null;
  if (!canUseVietQr(config) || (dynamic && (!Number.isSafeInteger(amount) || amount <= 0 || amount >= 1e13 || !/^[A-Z0-9 -]{1,25}$/.test(memo || '')))) return '';
  const beneficiary = field('00', vietQrBanks[config.bankCode].bin) + field('01', config.bankAccountNumber);
  const transfer = field('00', 'A000000727') + field('01', beneficiary) + field('02', 'QRIBFTTA');
  const payload = field('00', '01') + field('01', dynamic ? '12' : '11') + field('38', transfer) + field('53', '704')
    + (dynamic ? field('54', String(amount)) : '') + field('58', 'VN') + (dynamic ? field('62', field('08', memo)) : '') + '6304';
  return payload + crc16(payload);
}
