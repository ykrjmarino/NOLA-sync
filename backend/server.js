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
  console.log('Received full body:', contact);
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
      console.log('Contact already exists in NOLA. Ready to UPDATE.');
    } else {
      console.log('Contact does NOT exist in NOLA. Ready to CREATE.');

      const now = new Date().toISOString(); //timestamp if needed

      const createData = {
        firstName: contact.first_name,
        lastName: contact.last_name,
        name: contact.full_name || `${contact.first_name} ${contact.last_name}`,
        ...(contact.email ? { email: contact.email } : {}),   // only include if exists
        ...(contact.phone ? { phone: contact.phone } : {}),
        country: contact.country || '',
        address1: contact.location?.address || '',
        city: contact.location?.city || '',
        state: contact.location?.state || '',
        postalCode: contact.location?.postalCode || '',
        customFields: [
          { name: 'intern_contact_id', value: contact.contact_id }
        ],
        locationId: process.env.LOCATION_ID
    };

    const createResponse = await axios.post(
      'https://services.leadconnectorhq.com/contacts',
      createData,
      {
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          Version: '2021-07-28',
          Authorization: `Bearer ${ACCESS_TOKEN}`
        }
      }
    );

    console.log('Created new NOLA contact:', createResponse.data);
    }

    res.sendStatus(200);
  } catch (error) {
    const errData = error.response?.data;

    const isDuplicateEmail =
      error.response?.status === 400 &&
      errData?.message?.includes('does not allow duplicated contacts') &&
      errData?.meta?.matchingField === 'email';
      //only skip when it is specifically the duplicate email error
      //not all 400 errors should be ignored

    if (isDuplicateEmail) {
      console.log('Duplicate email found. Skipping creation. Existing contact ID:', errData.meta.contactId);
      return res.json({ status: 'skipped', reason: 'duplicate email' });
    } else {
      console.error('Error creating contact in NOLA x:', errData || error.message);
      return res.json({ status: 'Error syncing' });
    }
  }
});

app.get("/", (req, res) => res.send("Backend is running wewewe"));

app.listen(port, () => {
  // db.connect();
  console.log(`✅ Backend running at http://localhost:${port} (ykrjm2025)`);
});