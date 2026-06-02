export type StreamCallbacks = {
  onChunk: (chunk: string) => void;
  onConversationId: (conversationId: string) => void;
  onDone?: () => void;
  onError?: (err: any) => void;
};

export const sendMessageToBotStream = async (
  message: string,
  conversationId: string,
  storeId?: number,
  isAdmin?: boolean,
  callbacks?: StreamCallbacks
) => {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";
    const response = await fetch(
      `${baseUrl}/api/chat/conversation/stream`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message,
          conversation_id: conversationId || null,
          store_id: storeId || null,
          is_admin: isAdmin || false,
        }),
      }
    );

    if (!response.ok || !response.body) {
      throw new Error("Failed to connect to AI stream");
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder("utf-8");
    let buffer = "";

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });

      const events = buffer.split("\n\n");
      buffer = events.pop() || "";

      for (const event of events) {
        if (!event.trim()) continue;
        
        const lines = event.trim().split("\n");
        const typeLine = lines.find((l) => l.startsWith("event:"));
        const dataLine = lines.find((l) => l.startsWith("data:"));

        if (!dataLine) continue;

        const eventType = typeLine ? typeLine.slice(6).trim() : "message";
        const rawData = dataLine.slice(5).trim();

        if (rawData === "[DONE]") {
          callbacks?.onDone?.();
          return;
        }

        try {
          const json = JSON.parse(rawData);
          if (eventType === "message_chunk") {
            if (json.chunk) {
              callbacks?.onChunk(json.chunk);
            }
          } else if (eventType === "metadata") {
            if (json.conversation_id) {
              callbacks?.onConversationId(json.conversation_id);
            }
          }
        } catch (err) {
          console.error("Failed to parse event JSON", err, rawData);
        }
      }
    }

    callbacks?.onDone?.();
  } catch (err) {
    console.error("Streaming failed", err);
    callbacks?.onError?.(err);
  }
};
