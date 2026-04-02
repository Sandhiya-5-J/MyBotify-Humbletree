import React from "react";
import { Button } from "../ui/button";

type Props = {
  message: string;
  setMessage: (msg: string) => void;
  onSend: () => void;
};

const ChatInput = ({ message, setMessage, onSend }: Props) => {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };

  return (
    <div className="h-30 rounded-2xl flex flex-col bg-white p-2 border-2 border-grey-500">
      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={handleKeyDown}
        className="flex-1 outline-none resize-none caret-[#162120] rounded-2xl overflow-y-auto p-4 text-lg no-scrollbar whitespace-pre-wrap"
        placeholder="Feel free to ask me..."
      ></textarea>
      <div className="flex justify-end px-4 py-0">
        <Button
          onClick={onSend}
          disabled={!message.trim()}
          className="text-white bg-[#2E3E48] rounded-3xl px-4 py-2"
        >
          Start
        </Button>
      </div>
    </div>
  );
};

export default ChatInput;
