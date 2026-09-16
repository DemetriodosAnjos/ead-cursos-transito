/**
 * Helper para geração de payload Pix no padrão oficial do Banco Central do Brasil (BRCode / EMVCo).
 */

function crc16(payload: string): string {
  let crc = 0xffff;
  const polynomial = 0x1021;

  for (let i = 0; i < payload.length; i++) {
    crc ^= payload.charCodeAt(i) << 8;
    for (let bit = 0; bit < 8; bit++) {
      if ((crc & 0x8000) !== 0) {
        crc = ((crc << 1) ^ polynomial) & 0xffff;
      } else {
        crc = (crc << 1) & 0xffff;
      }
    }
  }

  return crc.toString(16).toUpperCase().padStart(4, '0');
}

function formatTLV(id: string, value: string): string {
  const length = value.length.toString().padStart(2, '0');
  return `${id}${length}${value}`;
}

export function generateBacenPixPayload(params: {
  pixKey: string;
  merchantName: string;
  merchantCity: string;
  amount: number;
  txid: string;
  description?: string;
}): string {
  const { pixKey, merchantName, merchantCity, amount, txid, description } = params;

  // 00 - Payload Format Indicator
  let payload = formatTLV('00', '01');

  // 26 - Merchant Account Information (GUI + Chave + Info Adicional)
  const gui = formatTLV('00', 'br.gov.bcb.pix');
  const key = formatTLV('01', pixKey);
  const desc = description ? formatTLV('02', description.slice(0, 25)) : '';
  payload += formatTLV('26', `${gui}${key}${desc}`);

  // 52 - Merchant Category Code (0000 = genérico)
  payload += formatTLV('52', '0000');

  // 53 - Transaction Currency (986 = BRL)
  payload += formatTLV('53', '986');

  // 54 - Transaction Amount
  payload += formatTLV('54', amount.toFixed(2));

  // 58 - Country Code
  payload += formatTLV('58', 'BR');

  // 59 - Merchant Name (max 25 chars, sem acentos recomendados)
  const sanitizedName = merchantName.normalize('NFD').replace(/[\u0300-\u036f]/g, '').slice(0, 25);
  payload += formatTLV('59', sanitizedName || 'INTER PJ CURSOS');

  // 60 - Merchant City
  const sanitizedCity = merchantCity.normalize('NFD').replace(/[\u0300-\u036f]/g, '').slice(0, 15);
  payload += formatTLV('60', sanitizedCity || 'SAO PAULO');

  // 62 - Additional Data Field Template (txid)
  const txidField = formatTLV('05', txid.replace(/[^a-zA-Z0-9]/g, '').slice(0, 25) || '***');
  payload += formatTLV('62', txidField);

  // 63 - CRC16
  payload += '6304';
  const checksum = crc16(payload);

  return `${payload}${checksum}`;
}
