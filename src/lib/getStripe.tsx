import { loadStripe } from '@stripe/stripe-js';

let stripePromise;
const getStripe = () => {
  if (!stripePromise) {
    stripePromise = loadStripe('pk_live_51P8ODnFhq89QYbdaNsAahoNImWZaz6Q1S0RejES7805KUFtICvP7Gl6rvrMqwFWXUiGdqoHUMNzxW5t7UjvYnUWG00dvcNKbe1');
  }
  return stripePromise;
};

export default getStripe;