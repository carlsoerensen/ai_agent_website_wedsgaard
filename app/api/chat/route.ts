import { NextRequest, NextResponse } from 'next/server';
import { getClientConfig, isAllowedDomain } from '@/lib/clients';

// Using Node.js runtime to support JSON imports from client configs
export const runtime = 'nodejs';

// Fallback allowed origins for backward compatibility
const FALLBACK_ALLOWED_ORIGINS = [
  'http://localhost:3000',
  'http://127.0.0.1:3000'
];

export async function POST(request: NextRequest) {
  try {
    const origin = request.headers.get('origin') || request.headers.get('referer') || '';
    const body = await request.json();
    const { message, clientId, sessionId, action = 'sendMessage' } = body;

    // Get client config
    let webhookUrl: string | null = null;
    let isOriginAllowed = false;

    if (clientId) {
      // New multi-client flow: validate using client config
      const config = getClientConfig(clientId);
      
      if (!config) {
        return NextResponse.json(
          { error: `Client "${clientId}" not found` },
          { status: 404 }
        );
      }

      // Validate origin against client's allowed domains
      if (origin) {
        isOriginAllowed = isAllowedDomain(config, origin);
        if (!isOriginAllowed) {
          console.error(`Blocked request from unauthorized origin: ${origin} for client: ${clientId}`);
          return NextResponse.json(
            { error: 'Unauthorized origin' },
            { status: 403 }
          );
        }
      } else {
        // No origin header - allow for server-side requests
        isOriginAllowed = true;
      }

      webhookUrl = config.webhookUrl;
    } else {
      // Legacy flow: use environment variable and fallback origins
      // This maintains backward compatibility with existing Wedsgaard embed
      if (origin) {
        const wedsgaardConfig = getClientConfig('wedsgaard');
        isOriginAllowed = FALLBACK_ALLOWED_ORIGINS.some(allowed => origin.startsWith(allowed)) ||
                         (wedsgaardConfig ? isAllowedDomain(wedsgaardConfig, origin) : false);
        
        if (!isOriginAllowed) {
          console.error(`Blocked request from unauthorized origin: ${origin}`);
          return NextResponse.json(
            { error: 'Unauthorized origin' },
            { status: 403 }
          );
        }
      }
      
      // Use environment variable for legacy flow
      webhookUrl = process.env.N8N_WEBHOOK_URL || null;
      
      // If no env var, try to get from wedsgaard config
      if (!webhookUrl) {
        const wedsgaardConfig = getClientConfig('wedsgaard');
        webhookUrl = wedsgaardConfig?.webhookUrl || null;
      }
    }

    if (!message && action === 'sendMessage') {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    if (!webhookUrl) {
      console.error('Webhook URL not configured');
      return NextResponse.json(
        { error: 'Webhook URL not configured' },
        { status: 500 }
      );
    }

    // Forward the request to n8n webhook
    console.log(`Calling n8n webhook for client ${clientId || 'legacy'}:`, webhookUrl);
    
    const payload = {
      action: action,
      sessionId: sessionId,
      chatInput: message,
      clientId: clientId || 'wedsgaard'
    };

    const response = await fetch(webhookUrl, {
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
  
  // Check if origin is allowed by any client config or fallback
  let isAllowed = FALLBACK_ALLOWED_ORIGINS.some(allowed => origin.startsWith(allowed));
  
  if (!isAllowed) {
    // Check against all client configs
    const wedsgaardConfig = getClientConfig('wedsgaard');
    const moerupConfig = getClientConfig('moerup');
    
    isAllowed = (wedsgaardConfig && isAllowedDomain(wedsgaardConfig, origin)) ||
                (moerupConfig && isAllowedDomain(moerupConfig, origin));
  }
  
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
