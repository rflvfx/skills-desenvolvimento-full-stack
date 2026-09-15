import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';

export function useSocket(userId?: number) {
  const [messages, setMessages] = useState<string[]>([]);

  useEffect(() => {
    if (!userId) return;
    const socket = io('http://localhost:4000');
    socket.on(`transaction:${userId}`, (data: any) => {
      setMessages(prev => [...prev, `Nova transacao: ${data.title}`]);
    });
    return () => { socket.disconnect(); };
  }, [userId]);

  return messages;
}
