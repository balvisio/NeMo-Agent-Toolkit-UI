export const config = {
  runtime: 'edge',
  api: {
    bodyParser: {
      sizeLimit: '5mb',
    },
  },
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method !== 'GET') {
    return new Response('Method not allowed', { status: 405 });
  }

  try {
    // Get the file URL from query parameters or use a default
    const url = new URL(req.url);
    const fileUrl = url.searchParams.get('url') || 'http://127.0.0.1:8000/file';
    const filename = url.searchParams.get('filename') || 'downloadedFile';

    console.log('aiq - making file request to', { url: fileUrl });

    // Forward the request to the configured file endpoint
    const response = await fetch(fileUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/octet-stream',
        'Conversation-Id': req.headers.get('Conversation-Id') || '',
      },
    });

    console.log('aiq - received file response from server', response.status);

    if (!response.ok) {
      const errorMessage = await response.text();
      console.error('aiq - file request failed:', errorMessage);
      return new Response(errorMessage, { status: response.status });
    }

    // Get the file content
    const fileContent = await response.text();
    console.log('aiq - file content', fileContent);
    // Return the file with appropriate headers
    return new Response(fileContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
     //   'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'no-cache',
      },
    });

  } catch (error) {
    console.error('aiq - file download error:', error);
    return new Response('Internal server error', { status: 500 });
  }
};

export default handler;