import express from 'express';
import axios from 'axios';
import dotenv from 'dotenv';


dotenv.config(); 

const app = express();
const port = process.env.PORT || 3001;
const ACCESS_TOKEN = process.env.ACCESS_TOKEN;
const LOCATION_ID = process.env.LOCATION_ID;

app.use(express.json());

// this is the endpoint the webhook will call
app.post('/webhook/nola', async (req, res) => {
  const contact = req.body;
  console.log('Received contact:', contact.contact_id, contact.first_name, contact.last_name);

  try {
    // Step 1: Search for existing contact in MAIN by custom field intern_contact_id
    const searchResponse = await axios.get(
      'https://services.leadconnectorhq.com/contacts/',
      {
        headers: {
          Authorization: `Bearer ${ACCESS_TOKEN}`,
          Version: '2021-07-28'
        },
        params: {
          query: contact.contact_id
        }
      }
    );

    const existingContact = searchResponse.data.contacts?.[0];

    if (existingContact) {
      // Step 2A: Update existing contact
      await axios.put(
        `https://services.leadconnectorhq.com/contacts/${existingContact.id}`,
        {
          firstName: contact.first_name,
          lastName: contact.last_name,
          locationId: LOCATION_ID
        },
        {
          headers: {
            Authorization: `Bearer ${ACCESS_TOKEN}`,
            Version: '2021-07-28'
          }
        }
      );
      console.log('✅ Updated contact in NOLA EventPro CRM Account');
    } else {
      // Step 2B: Create new contact
      await axios.post(
        'https://services.leadconnectorhq.com/contacts/',
        {
          firstName: contact.first_name,
          lastName: contact.last_name,
          locationId: LOCATION_ID,
          customFields: [
            {
              key: 'intern_contact_id',
              value: contact.contact_id
            }
          ]
        },
        {
          headers: {
            Authorization: `Bearer ${ACCESS_TOKEN}`,
            Version: '2021-07-28',
            'Content-Type': 'application/json'
          }
        }
      );
      console.log('✅ Created contact in NOLA EventPro CRM');
    }

    res.status(200).send('Synced');
  } catch (error) {
    console.error('Axios error:', error.response?.data || error.message);
    res.status(500).send('Error syncing');
  }
});

app.get("/", (req, res) => res.send("Backend is running wewewe"));

app.listen(port, () => {
  // db.connect();
  console.log(`✅ Backend running at http://localhost:${port} (ykrjm2025)`);
});