import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

const ALLOWED_ORIGINS = [
  'https://wedsgaard.dk',
  'https://www.wedsgaard.dk',
  'https://ai-agent-website-wedsgaard.vercel.app', // Vercel deployment
  'http://localhost:3000', // Keep localhost for testing
  'http://127.0.0.1:3000'
];

export async function POST(request: NextRequest) {
  try {
    // Origin Verification
    const origin = request.headers.get('origin') || request.headers.get('referer');
    // Simple check: if origin is present, it must be in allowed list
    // Note: Some non-browser clients might not send origin, but for a browser widget it's standard
    if (origin) {
      const isAllowed = ALLOWED_ORIGINS.some(allowed => origin.startsWith(allowed));
      if (!isAllowed) {
        console.error(`Blocked request from unauthorized origin: ${origin}`);
        return NextResponse.json(
          { error: 'Unauthorized origin' },
          { status: 403 }
        );
      }
    }
    
    const body = await request.json();
    const { message, webhookUrl, sessionId, action = 'sendMessage' } = body;

    if (!message && action === 'sendMessage') {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    // Use provided webhookUrl or fallback to environment variable
    // Priority: 1. webhookUrl from request, 2. Environment variable
    const n8nWebhookUrl = webhookUrl || process.env.N8N_WEBHOOK_URL;

    if (!n8nWebhookUrl) {
      console.error('N8N_WEBHOOK_URL not configured');
      return NextResponse.json(
        { error: 'Webhook URL not configured. Please set N8N_WEBHOOK_URL environment variable or provide webhookUrl in request.' },
        { status: 500 }
      );
    }

    // Forward the request to n8n webhook
    // We use POST as it's the standard for n8n Chat Trigger to receive body parameters
    // This matches $json.chatInput and $json.sessionId usage in n8n
    console.log('Calling n8n webhook (POST):', n8nWebhookUrl);
    
    const payload = {
        action: action,
        sessionId: sessionId,
        chatInput: message // The key n8n expects for the message
    };

    const response = await fetch(n8nWebhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('n8n error response:', errorText);
      throw new Error(`n8n webhook returned ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    console.log('n8n response data:', data);

    // Extract the response from n8n
    // Adjust this based on your n8n webhook response structure
    const responseText =
      data.response ||
      data.message ||
      data.text ||
      data.output ||
      JSON.stringify(data);

    return NextResponse.json({
      response: responseText,
      success: true,
    });
  } catch (error) {
    console.error('Error in chat API:', error);
    return NextResponse.json(
      {
        error: 'Failed to process message',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

export async function OPTIONS(request: NextRequest) {
  const origin = request.headers.get('origin') || '';
  const isAllowed = ALLOWED_ORIGINS.some(allowed => origin.startsWith(allowed));
  
  // Return the specific origin if allowed, otherwise null (blocks it)
  const allowOrigin = isAllowed ? origin : 'null';

  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': allowOrigin,
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}

