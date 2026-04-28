import { useState, useEffect, useRef, FormEvent } from 'react';
import { getSupabase } from '../lib/supabase';
import type { ChatMessage } from '../types';

export function ChatBox() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [userName, setUserName] = useState('');
  const [input, setInput] = useState('');
  const [isJoined, setIsJoined] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);
  const channelRef = useRef<ReturnType<ReturnType<typeof getSupabase>['channel']> | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const joinChat = (e: FormEvent) => {
    e.preventDefault();
    if (!userName.trim()) return;

    const supabase = getSupabase();
    const channel = supabase.channel('chat:public', {
      config: { presence: { key: userName.trim() } },
    });

    channel
      .on('broadcast', { event: 'message' }, ({ payload }) => {
        setMessages(prev => [...prev, payload as ChatMessage]);
      })
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        const users = Object.keys(state);
        setOnlineUsers(users);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({ user_name: userName.trim(), online_at: new Date().toISOString() });
        }
      });

    channelRef.current = channel;
    setIsJoined(true);
  };

  const sendMessage = (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !channelRef.current) return;

    const msg: ChatMessage = {
      user_name: userName.trim(),
      content: input.trim(),
      timestamp: Date.now(),
    };

    channelRef.current.send({
      type: 'broadcast',
      event: 'message',
      payload: msg,
    });

    // Also add to local state (sender doesn't receive their own broadcast)
    setMessages(prev => [...prev, msg]);
    setInput('');
  };

  useEffect(() => {
    return () => {
      if (channelRef.current) {
        const supabase = getSupabase();
        supabase.removeChannel(channelRef.current);
      }
    };
  }, []);

  return (
    <div className="chatbox chatbox-expanded" id="chatbox" style={{ position: 'relative', bottom: 'auto', right: 'auto', width: '100%', maxWidth: '800px', margin: '0 auto', height: '600px' }}>
      <div className="chatbox-content" style={{ height: '100%' }}>
        {!isJoined ? (
          <form onSubmit={joinChat} className="chat-join" id="chat-join-form">
            <h3>Tham gia Thảo luận Nhóm</h3>
            <p style={{marginBottom: '20px', color: '#a0aec0'}}>Nhập tên của bạn để tham gia vào phòng chat Realtime</p>
            <input
              type="text"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              placeholder="Nhập tên của bạn..."
              className="chat-input"
              id="chat-username"
              required
            />
            <button type="submit" className="chat-join-btn" id="chat-join-btn">
              🚀 Tham gia ngay
            </button>
          </form>
        ) : (
          <>
            <div className="chat-header">
              <div className="online-users">
                <span className="online-dot">●</span>
                {onlineUsers.length} người đang online: {onlineUsers.join(', ')}
              </div>
            </div>
            <div className="chat-messages" id="chat-messages">
              {messages.length === 0 && (
                <p className="chat-empty">Chưa có tin nhắn. Hãy gửi tin đầu tiên!</p>
              )}
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`chat-msg ${msg.user_name === userName.trim() ? 'chat-msg-mine' : ''}`}
                >
                  <span className="msg-author">{msg.user_name}</span>
                  <span className="msg-content">{msg.content}</span>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
            <form onSubmit={sendMessage} className="chat-send" id="chat-send-form">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Nhập tin nhắn..."
                className="chat-input"
                id="chat-message-input"
              />
              <button type="submit" className="chat-send-btn" id="chat-send-btn">
                📤
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
