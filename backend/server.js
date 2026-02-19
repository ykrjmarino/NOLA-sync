import express from 'express';
import axios from 'axios';
import cors from "cors";
import dotenv from 'dotenv';
import qs from 'qs';

import { getCloverCustomers, getCloverPayments } from './2_getClover.js';
import { sendToHighLevel } from './2_sentToGHL.js';

dotenv.config(); 

const app = express();
const port = process.env.PORT || 3001;

app.use(express.json());
app.use(cors({
  origin: "http://localhost:5173"
}));

//CLOVER
app.get('/clover/merchant', async (req, res) => { // http://localhost:3001/clover/merchant
  try {
    const response = await axios.get(
      `https://apisandbox.dev.clover.com/v3/merchants/${process.env.MERCHANT_ID}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.CLOVER_TOKEN}`,
          Accept: 'application/json',
        },
      }
    );
    res.json(response.data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch merchant' });
  }
});

app.get('/clover/customers', getCloverCustomers); // https://apisandbox.dev.clover.com/v3/merchants/FPSBMV494SH51/customers
app.get('/clover/payments', getCloverPayments); // https://apisandbox.dev.clover.com/v3/merchants/FPSBMV494SH51/payments

//CLOVER TO GHL
app.get('/sync/customers', sendToHighLevel); // http://localhost:3001/sync/customers








app.get("/", (req, res) => res.send("Backend is running wewewe"));

app.listen(port, () => {
  // db.connect();
  console.log(`✅ Backend running at http://localhost:${port} (ykrjm2025)`);
});