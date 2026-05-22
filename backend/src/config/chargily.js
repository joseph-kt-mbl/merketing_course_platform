import { ChargilyClient } from "@chargily/chargily-pay";


const CHARGILY_SECRET_KEY="test_sk_oUOPoHo4rjr7VBhC9aVk9a10Sy8DWcqTnye5ELR0";
const CHARGILY_MODE="test";

// const chargily = new ChargilyClient({
//   api_key: process.env.CHARGILY_SECRET_KEY,
//   mode: process.env.CHARGILY_MODE,
// });

const chargily = new ChargilyClient({
  api_key: CHARGILY_SECRET_KEY,
  mode: CHARGILY_MODE,
});

console.log("Chargily client initialized with mode:", CHARGILY_MODE);
console.log("Chargily API key set:", !!CHARGILY_SECRET_KEY);


export default chargily;