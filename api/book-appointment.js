import { createClient } from '@supabase/supabase-js';
import { google } from 'googleapis';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Only POST requests are allowed' });
  }

  try {
    const { user_id, student_id, counsellor_name, appointment_time } = req.body;

    // --- Part A: Save to Supabase ---
    const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);
    const { data: supabaseData, error: supabaseError } = await supabase
      .from('appointments')
      .insert([{ user_id, student_id, counsellor_name, appointment_time, status: 'booked' }])
      .select();

    if (supabaseError) {
      throw new Error(`Supabase Error: ${supabaseError.message}`);
    }

    // --- Part B: Save to Google Sheets ---
    const credentials = JSON.parse(process.env.GOOGLE_CREDENTIALS);
    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: 'https://www.googleapis.com/auth/spreadsheets',
    });
    const sheets = google.sheets({ version: 'v4', auth });
    
    const spreadsheetId = process.env.SPREADSHEET_ID; // Use environment variable for ID
    
    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: 'Sheet1!A:E',
      valueInputOption: 'USER_ENTERED',
      resource: {
        values: [
          [
            supabaseData[0].id,
            student_id,
            counsellor_name,
            appointment_time,
            'booked'
          ],
        ],
      },
    });

    res.status(200).json({ message: 'Appointment booked and saved to sheet!' });

  } catch (error) {
    console.error('Error in booking function:', error);
    res.status(500).json({ message: `An error occurred: ${error.message}` });
  }
}