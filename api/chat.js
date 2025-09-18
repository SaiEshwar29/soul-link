/*
 * This is your secure serverless function (your backend)
 * It lives in /api/chat.js
 */

export default async function handler(req, res) {
  // 1. Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // 2. Get the user's message and history from the front-end
  const { message, history } = await req.json();

  // 3. Get your secret API key from Vercel's "Environment Variables"
  // process.env.GEMINI_API_KEY is the secure way to access it
  const API_KEY = process.env.GEMINI_API_KEY;
  const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${AIzaSyBpIHC8j2O0AxHvyqjpyUAy4EM3exh2REI}`;

  // 4. Define your all-important System Prompt
  const MENTAL_HEALTH_SYSTEM_PROMPT = `You are 'Aura,' an empathetic and supportive listening assistant for mental wellness. Your role is to be a kind and non-judgmental space for users to express their feelings.

  Your rules are:
  1. You are NOT a therapist, doctor, or medical professional. You MUST NOT provide medical advice, diagnoses, or treatment plans.
  2. You CAN provide general wellness tips, such as mindfulness exercises, breathing techniques, and information on stress management.
  3. Always be encouraging and empathetic.
  4. CRITICAL SAFETY RULE: If a user mentions suicide, self-harm, wanting to die, or being in immediate danger, you MUST IMMEDIATELY stop the conversational persona and respond ONLY with:
  
     'It sounds like you are going through a very difficult time. If you are in crisis or need immediate support, please reach out to a professional. You can call or text 988 in the US and Canada, or call 111 in the UK. These services are free, confidential, and available 24/7. Please connect with them.'
  
  5. After providing that crisis response, do not continue the conversation about the topic.`;

  // 5. Build the "conversation history" to send to Google
  // We combine the system prompt, the past chat, and the new message
  const chatHistory = [
    {
      role: "user",
      parts: [{ text: MENTAL_HEALTH_SYSTEM_PROMPT }],
    },
    {
      role: "model",
      parts: [{ text: "I understand. I am Aura, a supportive listener. How are you feeling today?" }],
    },
    // Add all the previous messages from the chat
    ...history,
  ];

  const requestBody = {
    contents: [
      ...chatHistory, // The whole history
      {
        role: "user",
        parts: [{ text: message }], // The new user message
      },
    ],
  };

  // 6. Call the Google (Gemini) API
  try {
    const apiResponse = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    if (!apiResponse.ok) {
      throw new Error(`API error: ${apiResponse.statusText}`);
    }

    const apiData = await apiResponse.json();
    
    // 7. Send the bot's clean text response back to your front-end
    const botResponse = apiData.candidates[0].content.parts[0].text;
    res.status(200).json({ response: botResponse });

  } catch (error) {
    console.error("Backend Error:", error);
    res.status(500).json({ error: "Failed to get response from AI." });
  }
}