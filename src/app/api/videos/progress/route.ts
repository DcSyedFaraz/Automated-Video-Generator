import { NextRequest } from 'next/server';
import { progressEmitter } from '@/lib/progressEmitter';

export async function GET(req: NextRequest) {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      const send = (msg: string) => {
        controller.enqueue(encoder.encode(`data: ${msg}\n\n`));
      };
      const handler = (msg: string) => send(msg);
      progressEmitter.on('log', handler);

      req.signal.addEventListener('abort', () => {
        progressEmitter.off('log', handler);
        controller.close();
      });
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  });
}
