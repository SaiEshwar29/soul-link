import { createClient } from '@supabase/supabase-js';
import { google } from 'googleapis';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Only POST requests are allowed' });
  }

  try {
    // 1. Get the user's token from the request header
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'Authentication token is missing.' });
    }

    // 2. Create a Supabase client that is authenticated AS THE USER
    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_KEY, // This should be the anon key
      { global: { headers: { Authorization: `Bearer ${token}` } } }
    );

    // 3. Get the user securely on the backend from the token
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return res.status(401).json({ message: 'Invalid token.' });
    }

    const { student_id, counsellor_name, appointment_time } = req.body;

    // --- Part A: Save to Supabase ---
    // The user_id is now taken from the secure token, not the request body
    const { data: supabaseData, error: supabaseError } = await supabase
      .from('appointments')
      .insert([{ user_id: user.id, student_id, counsellor_name, appointment_time, status: 'booked' }])
      .select();

    if (supabaseError) {
      // The error from Supabase will be more specific now, e.g., if RLS fails
      throw new Error(`Supabase Error: ${supabaseError.message}`);
    }

    // --- Part B: Save to Google Sheets ---
    const credentials = JSON.parse(process.env.GOOGLE_CREDENTIALS);
    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: 'https://www.googleapis.com/auth/spreadsheets',
    });
    const sheets = google.sheets({ version: 'v4', auth });
    
    const spreadsheetId = process.env.SPREADSHEET_ID;
    
    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: 'Sheet1!A:E',
      valueInputOption: 'USER_ENTERED',
      resource: {
        values: [[
            supabaseData[0].id,
            student_id,
            counsellor_name,
            appointment_time,
            'booked'
        ]],
      },
    });

    res.status(200).json({ message: 'Appointment booked successfully!' });

  } catch (error) {
    console.error('Error in booking function:', error);
    res.status(500).json({ message: `An error occurred: ${error.message}` });
  }
}