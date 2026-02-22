import { NextResponse } from 'next/server';
import twilio from 'twilio';

export async function POST(request: Request) {
  try {
    // Twilio sends data as URL Encoded Form Data
    const formData = await request.formData();
    const toPhone = formData.get('To') as string;

    const twiml = new twilio.twiml.VoiceResponse();
    
    // Dial the number using your official Twilio Phone Number
    const dial = twiml.dial({ callerId: process.env.TWILIO_PHONE_NUMBER });
    dial.number(toPhone);

    return new NextResponse(twiml.toString(), {
      headers: { 'Content-Type': 'text/xml' },
    });
  } catch (error) {
    console.error(error);
    return new NextResponse("Error", { status: 500 });
  }
}