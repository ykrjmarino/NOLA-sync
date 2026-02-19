import express from 'express';
import axios from 'axios';
import dotenv from 'dotenv';


dotenv.config(); 

const app = express();
const port = process.env.PORT || 3001;

app.use(express.json());

// this is the endpoint the webhook will call
app.post('/webhook/nola', (req, res) => {
    const contact = req.body;
    console.log('Received contact:', contact);

    // for now, just send a 200 OK
    res.status(200).send('Webhook received');
});

//CLOVER TO GHL
// app.get('/sync/customers', sendToHighLevel); // http://localhost:3001/sync/customers








app.get("/", (req, res) => res.send("Backend is running wewewe"));

app.listen(port, () => {
  // db.connect();
  console.log(`✅ Backend running at http://localhost:${port} (ykrjm2025)`);
});