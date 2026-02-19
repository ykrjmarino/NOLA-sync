import express from 'express';
import axios from 'axios';
import dotenv from 'dotenv';


dotenv.config(); 

const app = express();
const port = process.env.PORT || 3001;


app.use(express.json());

// this is the endpoint the webhook will call
app.post('/webhook/nola', async (req, res) => {
  const ACCESS_TOKEN = process.env.ACCESS_TOKEN;
  const LOCATION_ID = process.env.LOCATION_ID;

  const contact = req.body;
  console.log('Received contact:', contact.contact_id, contact.first_name, contact.last_name);

  const source_contact_id = contact.contact_id; //haba naman variable name ya

  try {
    // Step 1: Fetch all contacts from NOLA (or apply allowed filters like email)
    const response = await axios.get(
      `https://services.leadconnectorhq.com/contacts`,
      {
        headers: {
          Accept: 'application/json',
          Version: '2021-07-28',
          Authorization: `Bearer ${ACCESS_TOKEN}`
        },
        params: {
          locationId: LOCATION_ID,
          limit: 100  // optional, you can page if more than 100
        }
      }
    );

    // Step 2: Filter in code by custom field intern_contact_id
    const existingContact = response.data.contacts.find(
      c => c.customFields?.intern_contact_id === source_contact_id
    );
    
    console.log('Existing NOLA contact:', existingContact);

    // Next: decide update or create based on existingContact
    if (existingContact) {
      console.log('Contact already exists in NOLA. Ready to update.');
    } else {
      console.log('Contact does not exist in NOLA. Ready to create.');
    }

    res.sendStatus(200);

/*
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
*/
    //res.status(200).send('Synced');
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