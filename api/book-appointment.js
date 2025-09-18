import { createClient } from '@supabase/supabase-js';
import { google } from 'googleapis';

// This is your new backend function in /api/book-appointment.js

export default async function handler(req, res) {
  // 1. Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Only POST requests are allowed' });
  }

  try {
    const { student_id, counsellor_name, appointment_time } = req.body;

    // --- Part A: Save to Supabase ---
    const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);
    const { data: supabaseData, error: supabaseError } = await supabase
      .from('appointments')
      .insert([{ student_id, counsellor_name, appointment_time, status: 'booked' }])
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
    
    // IMPORTANT: Replace this with your actual Spreadsheet ID
    const spreadsheetId = 'https://docs.google.com/spreadsheets/d/1-xnpAGhOd8kQgyYKYCPexdXHLt5fT_9WaJl1XcD6o_8/edit?gid=0#gid=0YOUR_SPREADSHEET_ID_HERE'; 
    
    // Append the data to your sheet
    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: 'Sheet1!A:E', // Make sure this matches your sheet name and columns
      valueInputOption: 'USER_ENTERED',
      resource: {
        values: [
          [
            supabaseData[0].id, // Get the ID from the Supabase record
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
    res.status(500).json({ message: 'An error occurred.' });
  }
}