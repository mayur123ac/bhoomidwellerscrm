import { NextResponse } from 'next/server';
import twilio from 'twilio';

export async function GET() {
  try {
    const AccessToken = twilio.jwt.AccessToken;
    const VoiceGrant = AccessToken.VoiceGrant;

    const token = new AccessToken(
      process.env.TWILIO_ACCOUNT_SID as string,
      process.env.TWILIO_API_KEY as string,
      process.env.TWILIO_API_SECRET as string,
      { identity: 'agent_browser_1' } // Identifies your laptop
    );

    const voiceGrant = new VoiceGrant({
      outgoingApplicationSid: process.env.TWILIO_TWIML_APP_SID as string,
      incomingAllow: false, 
    });

    token.addGrant(voiceGrant);

    return NextResponse.json({ token: token.toJwt() });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to generate token" }, { status: 500 });
  }
}