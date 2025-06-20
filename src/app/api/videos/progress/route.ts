import { NextRequest } from "next/server";
import { progressEmitter } from "@/lib/progressEmitter";

export async function GET(req: NextRequest) {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      const handler = (ev: unknown) => {
        const msg = String(ev);
        console.log(`msg msg: ${msg}`);
        for (const line of msg.split(/\r?\n/)) {
          // console.log(`Progress log: ${line}`);

          controller.enqueue(encoder.encode(`data: ${line}\n`));
        }
        controller.enqueue(encoder.encode("\n"));
      };

      progressEmitter.on("log", handler);

      progressEmitter.once("end", () => {
        progressEmitter.off("log", handler); // remove progress listener
        controller.close(); // EOF
      });

      req.signal.addEventListener("abort", () => {
        progressEmitter.off("log", handler);
        controller.close();
      });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
