const BASE_URL = 'https://<any-domain>.com';

async function handleRequest(request) {
  try {
    // Handle CORS preflight requests
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          'Access-Control-Max-Age': '86400'
        }
      });
    }

    const url = new URL(request.url);
    url.host = new URL(BASE_URL).host;

    const headers = new Headers(request.headers);
    headers.set('Access-Control-Allow-Origin', '*');

    // Clone request body only when necessary
    let originalRequestBody = null;
    if (!['GET', 'HEAD'].includes(request.method) && request.body) {
      originalRequestBody = await request.clone().arrayBuffer();
    }

    const modifiedRequest = new Request(url.toString(), {
      headers,
      method: request.method,
      body: originalRequestBody,
      redirect: 'follow'
    });

    const response = await fetch(modifiedRequest);

    // Set full CORS headers
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    };

    return new Response(response.body, {
      headers: {
        ...Object.fromEntries(response.headers),
        ...corsHeaders
      },
      status: response.status,
      statusText: response.statusText
    });

  } catch (error) {
    return new Response(`Error: ${error.message}`, {
      status: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'text/plain'
      }
    });
  }
}

addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request));
});

// For compatibility with Workers scripts
export default {
  async fetch(request, env, ctx) {
    return await handleRequest(request);
  },
};
