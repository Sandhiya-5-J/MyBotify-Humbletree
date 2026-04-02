// type StreamCallbacks = {
//   onChunk: (chunk: string) => void;
//   onConversationId: (conversationId: string) => void;
//   onDone?: () => void;
//   onError?: (err: any) => void;
// };

// export const sendMessageToBotStream = async (
//   message: string,
//   callbacks: StreamCallbacks
// ) => {
//   try {
//     const response = await fetch(
//       `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/chat/conversation/stream`,
//       {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({ message }),
//       }
//     );

//     if (!response.ok || !response.body) throw new Error("No response body");

//     const reader = response.body.getReader();
//     const decoder = new TextDecoder("utf-8");

//     let buffer = "";

//     while (true) {
//       const { value, done } = await reader.read();
//       if (done) break;

//       buffer += decoder.decode(value, { stream: true });

//       const events = buffer.split("\n\n");
//       buffer = events.pop() || "";

//       for (const event of events) {
//         const lines = event.trim().split("\n");
//         const typeLine = lines.find((l) => l.startsWith("event:"));
//         const dataLine = lines.find((l) => l.startsWith("data:"));

//         if (!typeLine || !dataLine) continue;

//         const eventType = typeLine.slice(6).trim();
//         const json = JSON.parse(dataLine.slice(5).trim());

//         if (eventType === "message_chunk") {
//           if (json.chunk) callbacks.onChunk(json.chunk);
//         } else if (eventType === "metadata") {
//           if (json.conversation_id) callbacks.onConversationId(json.conversation_id);
//         }
//       }
//     }

//     callbacks.onDone?.();
//   } catch (err) {
//     console.error("Streaming failed", err);
//     callbacks.onError?.(err);
//   }
// };

// const handleSendMessage = async (text?: string) => {
  //   const userText = text || message.trim();
  //   if (!userText) return;
  //   if (!text) setMessage("");

  //   setMessages((prev) => [{ text: userText, isUser: true }, ...prev]);
  //   setMessages((prev) => [{ text: "", isUser: false }, ...prev]);

  //   let botResponse = "";

  //   await sendMessageToBotStream(userText, {
  //     onChunk: (chunk) => {
  //       botResponse += chunk;
  //       setMessages((prev) => [
  //         { text: botResponse, isUser: false },
  //         ...prev.filter((m) => m.text !== "" || m.isUser),
  //       ]);
  //       console.log("🧩 CHUNK:", chunk);
  //     },
  //     onConversationId: (id) => {
  //       setConversationId(id);
  //     },
  //     onDone: () => {
  //       // Optional: maybe show ✅ or end typing animation
  //     },
  //     onError: () => {
  //       setMessages((prev) => [
  //         { text: "Something went wrong. Try again.", isUser: false },
  //         ...prev.filter((m) => m.text !== "" || m.isUser),
  //       ]);
  //     },
  //   });
  // };
