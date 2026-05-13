const axios = require('axios');

const NOWPAYMENTS_API = 'https://api.nowpayments.io/v1';

async function createPayment(amount, orderId, customerEmail) {
  const apiKey = process.env.NOWPAYMENTS_API_KEY;

  if (!apiKey) {
    return {
      mock: true,
      payment_id: `mock_${orderId}`,
      pay_address: process.env.LTC_WALLET_ADDRESS || 'LTC_WALLET_ADDRESS_NOT_SET',
      pay_amount: (amount / 80).toFixed(8),
      pay_currency: 'ltc',
      price_amount: amount,
      price_currency: 'usd',
      payment_status: 'waiting',
    };
  }

  try {
    const response = await axios.post(
      `${NOWPAYMENTS_API}/payment`,
      {
        price_amount: amount,
        price_currency: 'usd',
        pay_currency: 'ltc',
        order_id: orderId,
        order_description: `DragonzStore Order #${orderId}`,
        ipn_callback_url: `${process.env.BASE_URL}/api/payments/webhook`,
        customer_email: customerEmail,
      },
      {
        headers: {
          'x-api-key': apiKey,
          'Content-Type': 'application/json',
        },
      }
    );
    return response.data;
  } catch (err) {
    console.error('NOWPayments error:', err.response?.data || err.message);
    throw new Error('Payment creation failed');
  }
}

async function getPaymentStatus(paymentId) {
  const apiKey = process.env.NOWPAYMENTS_API_KEY;
  if (!apiKey) {
    return { payment_status: 'waiting', payment_id: paymentId };
  }
  try {
    const response = await axios.get(`${NOWPAYMENTS_API}/payment/${paymentId}`, {
      headers: { 'x-api-key': apiKey },
    });
    return response.data;
  } catch (err) {
    console.error('Status check error:', err.message);
    return null;
  }
}

module.exports = { createPayment, getPaymentStatus };
