import { google } from "googleapis"
import config from "../config/index.js"

const TARGET_GROUP_RESOURCE_NAME = 'contactGroups/2338a44a8e739822'

interface newContact {
  firstName: string,
  lastName: string,
  email: string,
  phone: string,
  notes?: string
}

interface existingContact {
  resourceName: string,
  etag: string,
  firstName: string,
  lastName: string,
  email: string[],
  phone: string[],
  notes: string,
}
const getAuthorizedClient = () => {
  const oAuth2Client = new google.auth.OAuth2(
    config.googleOAuthClientId,
    config.googleOAuthClientSecret,
    "http://localhost:4000/api/v1/googleOAuth/success"
  );

  // Set the credentials using the stored refresh token
  oAuth2Client.setCredentials({
    refresh_token: config.googleOAuthRefreshToken,
  });

  return oAuth2Client;
}

const auth = getAuthorizedClient();
const people = google.people({ version: 'v1', auth });


async function searchContact(searchString: string) {
  try{
    const searchResponse = await people.people.searchContacts({
      query: searchString,
      readMask: 'names,emailAddresses,phoneNumbers,memberships,biographies',
      pageSize: 1,
    });
    console.log('Search response:') 
    console.log(searchResponse.data);
    // console.log(JSON.stringify(searchResponse.data,0,2));
    if (!searchResponse.data.results || searchResponse.data.results.length === 0) { 
      console.log('No contact found with the provided email.');
      return undefined;
    }
    return {
      resourceName: searchResponse.data.results?.[0]?.person?.resourceName || "",
      etag: searchResponse.data.results?.[0]?.person?.etag || "",
      firstName: searchResponse.data.results?.[0]?.person?.names?.[0]?.givenName || "",
      lastName: searchResponse.data.results?.[0]?.person?.names?.[0]?.familyName || "",
      email: searchResponse.data.results?.[0]?.person?.emailAddresses?.map(em => em.value).filter((e): e is string => typeof e === "string") || [],
      phone: searchResponse.data.results?.[0]?.person?.phoneNumbers?.map(ph => ph.value).filter((e): e is string => typeof e === "string") || [],
      notes: searchResponse.data.results?.[0]?.person?.biographies?.[0]?.value || ""
    }
    // return searchResponse.data.results?.[0]?.person as existingContact | undefined
    // return searchResponse.data.results?.[0]?.person
  } catch (error) {
    console.error('Error searching contact:', error);
    throw error; 
  }
}


export async function upsertContact(firstName: string, lastName: string, email: string, phone: string, notes: string = "") {
  try {
    const newContactData: newContact = { firstName, lastName, email, phone, notes };
    console.log(newContactData)
    const existingContact: existingContact | undefined = await searchContact(email ? email : phone);
    if (existingContact) {
      console.log('Contact already exists. Updating contact...');
      const updatedData =  prepareContactToUpdate(existingContact, newContactData);
      return await updateContact(
        updatedData.resourceName!,
        updatedData.etag!,
        updatedData.firstName, 
        updatedData.lastName, 
        updatedData.email, 
        updatedData.phone, 
        updatedData.notes
      );
    } else {
      console.log('Contact does not exist. Creating new contact...');
      return await createNewContact(firstName, lastName, email, phone, notes);
    } 
  } catch (error: any) {
    console.error('Error in upsertContact:', error.message);
    throw error;
  }

}

const prepareContactToUpdate = (existingContact: existingContact, newContact: newContact) => {
  let emails: string[] = existingContact.email || []
  let phones: string[] = existingContact.phone || []
  let notes: string = existingContact.notes || ""
  if( !!newContact.email && !emails.includes(newContact.email) ) {
    emails.push(newContact.email)
  }

  if( !!newContact.phone && !phones.includes(newContact.phone) ) {
    phones.push(newContact.phone)
  }

  if (existingContact.notes && newContact.notes && !existingContact.notes.includes(newContact.notes)) {
    notes = newContact.notes + "\n" + notes
  }

  return {
    resourceName: existingContact.resourceName || "",
    etag: existingContact.etag || "",
    firstName: existingContact.firstName || newContact.firstName || "",
    lastName: existingContact.lastName || newContact.lastName || "",
    email: emails,
    phone: phones,
    notes: notes
  }
}
  


export async function updateContact(resourceName: string, etag: string, firstName: string, lastName: string, email: string[], phone: string[], notes: string = "") {
  try {
    const updatedContactBody = {
      names: [
        {
          givenName: firstName,
          familyName: lastName,
          displayName: `${firstName} ${lastName}`,
        },
      ],
      emailAddresses: email.map(em => ({ value: em, type: 'work' })),
      phoneNumbers: phone.map(ph => ({ value: ph, type: 'mobile' })),
      biographies: [{ value: notes }],
      etag: etag
    };
    const updateResponse = await people.people.updateContact({
      resourceName, 
      updatePersonFields: 'names,emailAddresses,phoneNumbers,biographies',
      requestBody: updatedContactBody,
    });
    console.log('Successfully updated contact!');
    console.log(updateResponse.data);
    return updateResponse.data;
  } catch (error: any) {
    console.error('Error updating contact:', error.message);
    if (error.code === 401) {
      console.error(
        'Authentication Error: Access token might be invalid or scope is missing.'
      );
    }
    throw error;
  }
}

export async function createNewContact(firstName: string, lastName: string, email: string, phone: string, notes: string = "") {
  try {
    

    const contactBody = {
      names: [
        {
          givenName: firstName,
          familyName: lastName,
          displayName: `${firstName} ${lastName}`,
        },
      ],
      emailAddresses: [{ value: email, type: 'work' }],
      phoneNumbers: phone.split(',').map(ph => ({ value: ph, type: 'mobile' })),
      memberships: [
        {
          contactGroupMembership: {
            contactGroupResourceName: TARGET_GROUP_RESOURCE_NAME,
          },
        }
      ],
      biographies: [{ value: notes }],
    };

    const response = await people.people.createContact({
      requestBody: contactBody,
    });

    console.log('Successfully created new contact!');
    console.log(response.data)
    return response.data;
  } catch (error: any) {
    console.error('Error creating contact:', error.message);
    if (error.code === 401) {
      console.error(
        'Authentication Error: Access token might be invalid or scope is missing.'
      );
    }
    throw error;
  }
}


// upsertContact('a Test', 'User', 'test123@test.com', '1234567890', 'line 1');
// createNewContact('a Test', 'User', 'test123@test.com', '+1234567890', 'test notes\nline 2');
// searchContact('testcall@test.com').then(contact => console.log(contact)).catch(err => console.error(err));