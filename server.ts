import express from 'express';
import cors from 'cors';
import mercadopago from 'mercadopago';

const app = express();
const PORT = process.env.PORT || 3001;

mercadopago.configurations.setAccessToken('TEST-4948427125913404-052215-6a10ad76f00ede3192d156f79f8f8216-447634940');

app.use(cors());
app.use(express.json());

app.post('/subscribe', async (req, res) => {
  const { cardNumber, expirationDate, securityCode, cardholderName, email, identificationType, identificationNumber } = req.body;

  try {
    // 1. Verificar se o cliente já existe
    let customerResponse = await mercadopago.customers.search({ email });
    let customer;

    if (customerResponse.body.results.length > 0) {
      customer = customerResponse.body.results[0];
    } else {
      // 2. Criar cliente
      customer = await mercadopago.customers.create({
        email,
        first_name: cardholderName.split(' ')[0],
        last_name: cardholderName.split(' ').slice(1).join(' '),
        identification: {
          type: identificationType,
          number: identificationNumber,
        },
      });
    }

    // 3. Verificar se o cliente já tem cartões
    const cardsResponse = await mercadopago.customers.cards.list(customer.id);
    const existingCards = cardsResponse.body;

    // 4. Criar token do cartão
    const tokenResponse = await mercadopago.card_tokens.create({
      card_number: cardNumber,
      expiration_month: parseInt(expirationDate.split('/')[0], 10),
      expiration_year: parseInt(`20${expirationDate.split('/')[1]}`, 10),
      security_code: securityCode,
      cardholder: {
        name: cardholderName,
        identification: {
          type: identificationType,
          number: identificationNumber,
        },
      },
    });

    const cardToken = tokenResponse.body.id;

    // 5. Criar plano de assinatura
    const planResponse = await mercadopago.preapproval.create({
      payer_email: email,
      back_url: 'https://www.your-site.com',
      reason: 'Subscription to premium plan',
      external_reference: `SUBSCRIPTION-${customer.id}`,
      auto_recurring: {
        frequency: 1,
        frequency_type: 'months',
        transaction_amount: 100.0,
        currency_id: 'BRL',
        start_date: new Date().toISOString(),
        end_date: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString(),
      },
    });

    res.json({ success: true, preapprovalUrl: planResponse.body.init_point, existingCards });
  } catch (error) {
    console.error(error);
    res.status(500).send('Error creating subscription');
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
