import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode.react';

interface PixQrCodeProps {
  chave: string;
  name: string;
  city: string;
  message: string;
  amount: number;
  isRecurrent?: boolean; // Optional flag for recurring payments
   // Optional flag for recurring payments
  startDate?: string; // Start date for recurring payments
  frequency?: string; // Frequency for recurring payments (e.g., 'monthly', 'weekly')
  duration?: number;
}

const PixQrCodeGenerator: React.FC<PixQrCodeProps> = ({ chave, name, city, message, amount, isRecurrent = false, startDate, frequency, duration }) => {
    const [qrCode, setQrCode] = useState('');

    const generatePixPayload = () => {
      const payloadFormatIndicator = '000201';
      const merchantAccountInformation = `26${(14 + chave.length).toString().padStart(2, '0')}0014BR.GOV.BCB.PIX01${chave.length.toString().padStart(2, '0')}${chave}`;
      const merchantCategoryCode = '52040000';
      const transactionCurrency = '5303986';
      const transactionAmount = `54${amount.toFixed(2).length.toString().padStart(2, '0')}${amount.toFixed(2)}`;
      const countryCode = '5802BR';
      const merchantName = `59${name.length.toString().padStart(2, '0')}${name}`;
      const merchantCity = `60${city.length.toString().padStart(2, '0')}${city}`;
      const additionalDataFieldTemplate = `62${(4 + message.length).toString().padStart(2, '0')}05${message.length.toString().padStart(2, '0')}${message}`;

      const crc16 = '6304'; 
  console.log(message)
      const payloadWithoutCRC = `${payloadFormatIndicator}${merchantAccountInformation}${merchantCategoryCode}${transactionCurrency}${transactionAmount}${countryCode}${merchantName}${merchantCity}${additionalDataFieldTemplate}${crc16}`;
  
      const crc = calculateCRC16(payloadWithoutCRC ).toString(16).toUpperCase().padStart(4, '0');
      const payload = payloadWithoutCRC + crc;
      
      console.log(payload);
      return payload;
    };
  
    const calculateCRC16 = (input: string): number => {
      let crc = 0xFFFF;
      for (let i = 0; i < input.length; i++) {
        crc ^= input.charCodeAt(i) << 8;
        for (let j = 0; j < 8; j++) {
          if ((crc & 0x8000) !== 0) {
            crc = (crc << 1) ^ 0x1021;
          } else {
            crc = crc << 1;
          }
        }
      }
      return crc & 0xFFFF;
    };

    useEffect(() => {
        const payload = generatePixPayload();
        // Here you can use a library to generate the QR code image from the payload string
        // For example: setQrCode(generateQrCodeImage(payload));
        setQrCode(payload); // Temporarily set the payload as qrCode for demonstration purposes
      }, [chave, name, city, message, amount, isRecurrent]);

      const qrCodes = <QRCode fgColor={'#FFFFFF'} bgColor={'#02A8A8'} value={generatePixPayload()} size={170} className='rounded-md'/>
  
 
console.log('teste','00020126570014BR.GOV.BCB.PIX0135victorhugodejesusoliveira@gmail.com520400005303986540510.005802BR5911Victor Hugo6014Belo Horizonte62170513PAGAMENTO123D63040790')
  return (
    <div className=''>
      {qrCodes}
    </div>
  );
};

export default PixQrCodeGenerator;