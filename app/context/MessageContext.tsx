import { createContext, useContext, useEffect, useState } from 'react';
import { useEmbeddedSolanaWallet } from "@privy-io/expo";
import { supabase } from '../utils/supabase';

type Message = {
  id: string;
  sender_public_key: string;
  recipient_public_key: string;
  encrypted_content: string;
  created_at: string;
  is_read: boolean;
};

type MessagesContextType = {
  messages: Message[];
  sendMessage: (recipientKey: string, encryptedContent: string) => Promise<void>;
  markAsRead: (messageId: string) => Promise<void>;
};

const MessagesContext = createContext<MessagesContextType | null>(null);

export function MessagesProvider({ children }: { children: React.ReactNode }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const wallet = useEmbeddedSolanaWallet();

  useEffect(() => {
    if (!wallet?.wallets?.[0]?.publicKey) return;

    // Subscribe to new messages
    const subscription = supabase
      .channel('messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'encrypted_messages',
          filter: `recipient_public_key=eq.${wallet.wallets[0].publicKey}`,
        },
        (payload) => {
          setMessages((current) => [...current, payload.new as Message]);
        }
      )
      .subscribe();

    // Fetch existing messages
    fetchMessages();

    return () => {
      subscription.unsubscribe();
    };
  }, [wallet?.wallets?.[0]?.publicKey]);

  const fetchMessages = async () => {
    if (!wallet?.wallets?.[0]?.publicKey) return;

    const { data, error } = await supabase
      .from('encrypted_messages')
      .select('*')
      .or(`recipient_public_key.eq.${wallet.wallets[0].publicKey},sender_public_key.eq.${wallet.wallets[0].publicKey}`)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching messages:', error);
      return;
    }

    setMessages(data);
  };

  const sendMessage = async (recipientKey: string, encryptedContent: string) => {
    if (!wallet?.wallets?.[0]?.publicKey) return;

    const { error } = await supabase.from('encrypted_messages').insert({
      sender_public_key: wallet.wallets[0].publicKey,
      recipient_public_key: recipientKey,
      encrypted_content: encryptedContent,
    });

    if (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  };

  const markAsRead = async (messageId: string) => {
    const { error } = await supabase
      .from('encrypted_messages')
      .update({ is_read: true })
      .eq('id', messageId);

    if (error) {
      console.error('Error marking message as read:', error);
      return;
    }

    setMessages((current) =>
      current.map((msg) =>
        msg.id === messageId ? { ...msg, is_read: true } : msg
      )
    );
  };

  return (
    <MessagesContext.Provider value={{ messages, sendMessage, markAsRead }}>
      {children}
    </MessagesContext.Provider>
  );
}

export const useMessages = () => {
  const context = useContext(MessagesContext);
  if (!context) {
    throw new Error('useMessages must be used within a MessagesProvider');
  }
  return context;
};