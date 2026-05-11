import React, { useState, useEffect, useRef } from "react";
import { useLocation, Link } from "wouter";
import { useSession } from "@/lib/session";
import {
  useListConversations,
  useGetConversation,
  useSendMessage,
  useListUsers,
  useGetMessageStats,
  useLogout,
  getListConversationsQueryKey,
  getGetConversationQueryKey,
  getGetMessageStatsQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { deriveSharedKey, encryptMessage, decryptMessage } from "@/lib/crypto";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import {
  Lock,
  Send,
  ChevronDown,
  ChevronUp,
  Users,
  MessageSquare,
  BarChart2,
  LogOut,
  ShieldCheck,
  Plus,
  BookOpen,
  Eye,
  EyeOff,
} from "lucide-react";

interface DecryptedMessage {
  id: number;
  senderId: number;
  plaintext: string | null;
  ciphertextForRecipient: string;
  ciphertextForSender: string;
  ivForRecipient: string;
  ivForSender: string;
  createdAt: string;
  decryptionFailed?: boolean;
}

export default function Dashboard() {
  const { user, privateKeyBytes, logout } = useSession();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [selectedPartnerId, setSelectedPartnerId] = useState<number | null>(null);
  const [selectedPartnerPublicKey, setSelectedPartnerPublicKey] = useState<string | null>(null);
  const [selectedPartnerUsername, setSelectedPartnerUsername] = useState<string | null>(null);
  const [messageInput, setMessageInput] = useState("");
  const [decryptedMessages, setDecryptedMessages] = useState<DecryptedMessage[]>([]);
  const [showNewChat, setShowNewChat] = useState(false);
  const [expandedRaw, setExpandedRaw] = useState<Set<number>>(new Set());
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const logoutMutation = useLogout();
  const sendMessageMutation = useSendMessage();

  const { data: conversations, isLoading: convoLoading } = useListConversations();
  const { data: stats } = useGetMessageStats();
  const { data: allUsers } = useListUsers();
  const { data: rawMessages, isLoading: msgsLoading } = useGetConversation(
    selectedPartnerId ?? 0,
    { query: { enabled: !!selectedPartnerId, queryKey: getGetConversationQueryKey(selectedPartnerId ?? 0) } }
  );

  useEffect(() => {
    if (!user) setLocation("/");
  }, [user]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [decryptedMessages]);

  useEffect(() => {
    if (!rawMessages || !privateKeyBytes || !user) return;
    let cancelled = false;

    async function decryptAll() {
      if (!rawMessages || !privateKeyBytes || !user || !selectedPartnerPublicKey) return;

      const results: DecryptedMessage[] = [];
      for (const msg of rawMessages) {
        try {
          let plaintext: string;
          if (msg.senderId === user.id) {
            const selfKey = await deriveSharedKey(privateKeyBytes, user.publicKeySpki);
            plaintext = await decryptMessage(msg.ciphertextForSender, msg.ivForSender, selfKey);
          } else {
            const sharedKey = await deriveSharedKey(privateKeyBytes, selectedPartnerPublicKey);
            plaintext = await decryptMessage(msg.ciphertextForRecipient, msg.ivForRecipient, sharedKey);
          }
          results.push({ ...msg, plaintext, decryptionFailed: false });
        } catch {
          results.push({ ...msg, plaintext: null, decryptionFailed: true });
        }
      }
      if (!cancelled) setDecryptedMessages(results);
    }

    decryptAll();
    return () => { cancelled = true; };
  }, [rawMessages, privateKeyBytes, user, selectedPartnerPublicKey]);

  const handleSelectConversation = (partnerId: number, partnerPublicKey: string, partnerUsername: string) => {
    setSelectedPartnerId(partnerId);
    setSelectedPartnerPublicKey(partnerPublicKey);
    setSelectedPartnerUsername(partnerUsername);
    setShowNewChat(false);
    setDecryptedMessages([]);
  };

  const handleStartNewChat = (userId: number, publicKeySpki: string, username: string) => {
    setSelectedPartnerId(userId);
    setSelectedPartnerPublicKey(publicKeySpki);
    setSelectedPartnerUsername(username);
    setShowNewChat(false);
    setDecryptedMessages([]);
  };

  const handleSendMessage = async () => {
    if (!selectedPartnerId || !selectedPartnerPublicKey) {
      toast({ title: "No conversation selected", description: "Click the + button on the left to start a new chat first.", variant: "destructive" });
      return;
    }
    if (!messageInput.trim()) return;
    if (!privateKeyBytes || !user) {
      toast({ title: "Not logged in", description: "Please log in again.", variant: "destructive" });
      return;
    }

    const plaintext = messageInput.trim();
    setMessageInput("");

    try {
      const sharedKeyForRecipient = await deriveSharedKey(privateKeyBytes, selectedPartnerPublicKey);
      const sharedKeyForSelf = await deriveSharedKey(privateKeyBytes, user.publicKeySpki);

      const { ciphertext: ciphertextForRecipient, iv: ivForRecipient } = await encryptMessage(plaintext, sharedKeyForRecipient);
      const { ciphertext: ciphertextForSender, iv: ivForSender } = await encryptMessage(plaintext, sharedKeyForSelf);

      await sendMessageMutation.mutateAsync({
        data: { recipientId: selectedPartnerId, ciphertextForRecipient, ciphertextForSender, ivForRecipient, ivForSender }
      });

      queryClient.invalidateQueries({ queryKey: getGetConversationQueryKey(selectedPartnerId) });
      queryClient.invalidateQueries({ queryKey: getListConversationsQueryKey() });
      queryClient.invalidateQueries({ queryKey: getGetMessageStatsQueryKey() });
    } catch (err: any) {
      toast({ title: "Send failed", description: err.message, variant: "destructive" });
    }
  };

  const handleLogout = async () => {
    await logoutMutation.mutateAsync({});
    logout();
    setLocation("/");
  };

  const toggleRaw = (id: number) => {
    setExpandedRaw(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const newContactCandidates = allUsers?.filter(
    u => !conversations?.some(c => c.partnerId === u.id)
  ) ?? [];

  return (
    <div className="h-[100dvh] flex flex-col bg-background text-foreground font-mono overflow-hidden">
      <header className="flex items-center justify-between px-4 py-3 border-b border-border shrink-0">
        <div className="flex items-center gap-2 font-bold text-primary">
          <Lock className="w-5 h-5" />
          <span>CipherChat</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-xs text-muted-foreground hidden sm:block">
            Logged in as <span className="text-foreground">{user?.username}</span>
          </span>
          <Link href="/learn">
            <Button variant="ghost" size="sm" className="gap-2 text-xs">
              <BookOpen className="w-3 h-3" />
              Architecture
            </Button>
          </Link>
          <Button variant="ghost" size="sm" onClick={handleLogout} className="gap-2 text-xs text-muted-foreground">
            <LogOut className="w-3 h-3" />
            Logout
          </Button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <aside className="w-64 border-r border-border flex flex-col overflow-hidden shrink-0">
          <div className="p-3 border-b border-border space-y-1">
            <div className="text-xs text-muted-foreground uppercase tracking-widest mb-2">Stats</div>
            <div className="grid grid-cols-3 gap-1 text-center">
              <div className="bg-card border border-card-border p-2">
                <div className="text-primary text-sm font-bold">{stats?.totalSent ?? 0}</div>
                <div className="text-xs text-muted-foreground">Sent</div>
              </div>
              <div className="bg-card border border-card-border p-2">
                <div className="text-primary text-sm font-bold">{stats?.totalReceived ?? 0}</div>
                <div className="text-xs text-muted-foreground">Rcvd</div>
              </div>
              <div className="bg-card border border-card-border p-2">
                <div className="text-primary text-sm font-bold">{stats?.conversationCount ?? 0}</div>
                <div className="text-xs text-muted-foreground">Convos</div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between px-3 py-2 border-b border-border">
            <span className="text-xs text-muted-foreground uppercase tracking-widest">Conversations</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowNewChat(!showNewChat)}
              className="h-6 px-2 text-xs text-primary gap-1 border border-primary/30 hover:bg-primary/10"
            >
              <Plus className="w-3 h-3" />
              New chat
            </Button>
          </div>

          {showNewChat && (
            <div className="border-b border-border">
              <div className="px-3 py-1 text-xs text-muted-foreground bg-card">New conversation</div>
              {newContactCandidates.length === 0 ? (
                <div className="px-3 py-2 text-xs text-muted-foreground">No new users available</div>
              ) : (
                newContactCandidates.map(u => (
                  <button
                    key={u.id}
                    onClick={() => handleStartNewChat(u.id, u.publicKeySpki, u.username)}
                    className="w-full text-left px-3 py-2 text-sm hover:bg-secondary transition-colors flex items-center gap-2"
                  >
                    <Users className="w-3 h-3 text-muted-foreground" />
                    {u.username}
                  </button>
                ))
              )}
            </div>
          )}

          <div className="flex-1 overflow-y-auto">
            {convoLoading && <div className="p-3 text-xs text-muted-foreground">Loading...</div>}
            {conversations?.length === 0 && !convoLoading && (
              <div className="p-3 text-xs text-muted-foreground">
                No conversations yet. Click + to start one.
              </div>
            )}
            {conversations?.map(c => (
              <button
                key={c.partnerId}
                onClick={() => handleSelectConversation(c.partnerId, c.partnerPublicKeySpki, c.partnerUsername)}
                className={`w-full text-left px-3 py-3 border-b border-border hover:bg-secondary transition-colors ${selectedPartnerId === c.partnerId ? "bg-secondary border-l-2 border-l-primary" : ""}`}
              >
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">{c.partnerUsername}</span>
                  <Lock className="w-3 h-3 text-primary" />
                </div>
                <div className="text-xs text-muted-foreground mt-0.5">
                  {c.messageCount} message{c.messageCount !== 1 ? "s" : ""}
                </div>
              </button>
            ))}
          </div>

          <div className="p-3 border-t border-border">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <ShieldCheck className="w-3 h-3 text-primary" />
              <span>E2EE — keys in memory only</span>
            </div>
          </div>
        </aside>

        <main className="flex-1 flex flex-col overflow-hidden">
          {!selectedPartnerId ? (
            <div className="flex-1 flex flex-col items-center justify-center p-8 space-y-6">
              <Lock className="w-10 h-10 text-primary opacity-40" />
              <div className="w-full max-w-xs space-y-3">
                <div className="text-xs text-muted-foreground uppercase tracking-widest text-center mb-4">How to send a message</div>
                {[
                  { n: "1", text: 'Click "New chat" on the left sidebar' },
                  { n: "2", text: "Select a user from the dropdown list" },
                  { n: "3", text: "Type your message in the box below" },
                  { n: "4", text: 'Click "Send" — it encrypts before sending' },
                ].map(step => (
                  <div key={step.n} className="flex items-start gap-3 text-sm">
                    <span className="text-primary font-bold shrink-0 w-5">{step.n}.</span>
                    <span className="text-muted-foreground">{step.text}</span>
                  </div>
                ))}
              </div>
              <div className="text-xs text-muted-foreground font-mono bg-card border border-card-border px-3 py-2 text-center max-w-xs">
                To demo E2EE, open an incognito window and register a second account
              </div>
            </div>
          ) : (
            <>
              <div className="px-4 py-3 border-b border-border flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3">
                  <div>
                    <div className="text-sm font-bold">{selectedPartnerUsername}</div>
                    <div className="text-xs text-muted-foreground flex items-center gap-1">
                      <Lock className="w-3 h-3 text-primary" />
                      End-to-end encrypted
                    </div>
                  </div>
                </div>
                <div className="text-xs text-muted-foreground hidden sm:block font-mono">
                  ECDH P-256 / AES-256-GCM
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {msgsLoading && (
                  <div className="text-xs text-muted-foreground text-center">Fetching ciphertext...</div>
                )}
                {decryptedMessages.length === 0 && !msgsLoading && (
                  <div className="text-xs text-muted-foreground text-center mt-8">
                    No messages yet. Send the first encrypted message below.
                  </div>
                )}
                {decryptedMessages.map(msg => {
                  const isMe = msg.senderId === user?.id;
                  const showRaw = expandedRaw.has(msg.id);
                  return (
                    <div key={msg.id} className={`flex flex-col gap-1 ${isMe ? "items-end" : "items-start"}`}>
                      <div className={`max-w-[70%] px-3 py-2 border text-sm ${
                        isMe
                          ? "bg-primary/10 border-primary/30 text-foreground"
                          : "bg-card border-card-border text-foreground"
                      }`}>
                        {msg.decryptionFailed ? (
                          <span className="text-muted-foreground italic">[Encrypted — key unavailable]</span>
                        ) : (
                          <span>{msg.plaintext}</span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Lock className="w-2.5 h-2.5 text-primary" />
                        <span className="text-primary text-xs">ENCRYPTED</span>
                        <span>{new Date(msg.createdAt).toLocaleTimeString()}</span>
                        <button
                          onClick={() => toggleRaw(msg.id)}
                          className="flex items-center gap-1 hover:text-foreground transition-colors"
                          title="View raw ciphertext"
                        >
                          {showRaw ? <EyeOff className="w-2.5 h-2.5" /> : <Eye className="w-2.5 h-2.5" />}
                          raw
                        </button>
                      </div>
                      {showRaw && (
                        <div className="max-w-[70%] bg-card border border-card-border p-2 text-xs font-mono text-muted-foreground break-all">
                          <div className="text-primary text-xs mb-1">Ciphertext stored on server:</div>
                          <div className="break-all">{isMe ? msg.ciphertextForSender : msg.ciphertextForRecipient}</div>
                          <div className="text-primary text-xs mt-2 mb-1">IV:</div>
                          <div className="break-all">{isMe ? msg.ivForSender : msg.ivForRecipient}</div>
                        </div>
                      )}
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              <div className="px-4 py-3 border-t border-border shrink-0">
                <form
                  onSubmit={e => { e.preventDefault(); handleSendMessage(); }}
                  className="flex gap-2"
                >
                  <div className="flex-1 relative">
                    <Input
                      value={messageInput}
                      onChange={e => setMessageInput(e.target.value)}
                      placeholder="Type a message — it will be encrypted before sending..."
                      className="pr-24 font-mono text-sm"
                      disabled={sendMessageMutation.isPending}
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 text-xs text-primary">
                      <Lock className="w-3 h-3" />
                      <span>E2EE</span>
                    </div>
                  </div>
                  <Button type="submit" disabled={sendMessageMutation.isPending || !messageInput.trim()} className="gap-2">
                    <Send className="w-4 h-4" />
                    {sendMessageMutation.isPending ? "Encrypting..." : "Send"}
                  </Button>
                </form>
                <div className="mt-1 text-xs text-muted-foreground">
                  Encrypted with ECDH shared secret + AES-256-GCM — server stores ciphertext only
                </div>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}
