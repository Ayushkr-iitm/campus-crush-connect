import { cn } from "@/lib/utils";

interface ChatBubbleProps {
  message: string;
  time: string;
  isSent: boolean;
}

const ChatBubble = ({ message, time, isSent }: ChatBubbleProps) => {
  return (
    <div className={cn("flex mb-3", isSent ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "max-w-[75%] px-4 py-2.5 rounded-2xl text-sm",
          isSent
            ? "gradient-bg text-primary-foreground rounded-br-md"
            : "bg-muted text-foreground rounded-bl-md"
        )}
      >
        <p>{message}</p>
        <p className={cn("text-[10px] mt-1", isSent ? "text-primary-foreground/60" : "text-muted-foreground")}>
          {time}
        </p>
      </div>
    </div>
  );
};

export default ChatBubble;
