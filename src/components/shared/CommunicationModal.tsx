'use client';

import { useState, useEffect } from 'react';
import { Phone, MessageSquare, X, Send, Clock, CheckCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  makePhoneCall,
  sendSMS,
  getSMSConversation,
  formatPhoneNumber,
  formatCallDuration,
  getSMSTemplates,
  type CallLog,
  type SMSMessage,
} from '@/lib/communication';
import { format } from 'date-fns';

interface CommunicationModalProps {
  open: boolean;
  onClose: () => void;
  userId: string;
  contactName: string;
  contactPhone: string;
  requestId?: string;
}

export function CommunicationModal({
  open,
  onClose,
  userId,
  contactName,
  contactPhone,
  requestId,
}: CommunicationModalProps) {
  const [activeTab, setActiveTab] = useState<'call' | 'sms'>('sms');
  const [isCalling, setIsCalling] = useState(false);
  const [callComplete, setCallComplete] = useState(false);
  const [lastCall, setLastCall] = useState<CallLog | null>(null);
  const [smsMessage, setSmsMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [conversation, setConversation] = useState<SMSMessage[]>([]);
  const [templates] = useState(getSMSTemplates());

  useEffect(() => {
    if (open) {
      loadConversation();
    }
  }, [open, userId, contactPhone]);

  const loadConversation = () => {
    const messages = getSMSConversation(userId, contactPhone);
    setConversation(messages);
  };

  const handleMakeCall = async () => {
    setIsCalling(true);
    setCallComplete(false);

    try {
      const callLog = await makePhoneCall(userId, contactName, contactPhone, requestId);
      setLastCall(callLog);
      setCallComplete(true);
    } catch (error) {
      console.error('Error making call:', error);
    } finally {
      setIsCalling(false);
    }
  };

  const handleSendSMS = async () => {
    if (!smsMessage.trim()) return;

    setIsSending(true);

    try {
      await sendSMS(userId, contactName, contactPhone, smsMessage, requestId);
      setSmsMessage('');
      loadConversation();
    } catch (error) {
      console.error('Error sending SMS:', error);
    } finally {
      setIsSending(false);
    }
  };

  const handleUseTemplate = (template: string) => {
    setSmsMessage(template);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <div>
              <div className="text-xl font-bold">{contactName}</div>
              <div className="text-sm text-muted-foreground font-normal">
                {formatPhoneNumber(contactPhone)}
              </div>
            </div>
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'call' | 'sms')} className="flex-1 flex flex-col overflow-hidden">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="call" className="flex items-center gap-2">
              <Phone className="h-4 w-4" />
              Call
            </TabsTrigger>
            <TabsTrigger value="sms" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Text
            </TabsTrigger>
          </TabsList>

          {/* Call Tab */}
          <TabsContent value="call" className="flex-1 flex flex-col items-center justify-center space-y-6 p-6">
            {!isCalling && !callComplete && (
              <>
                <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center">
                  <Phone className="h-12 w-12 text-primary" />
                </div>
                <div className="text-center">
                  <h3 className="text-xl font-semibold mb-2">{contactName}</h3>
                  <p className="text-muted-foreground">
                    {formatPhoneNumber(contactPhone)}
                  </p>
                </div>
                <Button
                  size="lg"
                  className="w-full max-w-xs h-14 text-lg"
                  onClick={handleMakeCall}
                >
                  <Phone className="h-5 w-5 mr-2" />
                  Call Now
                </Button>
                <p className="text-sm text-muted-foreground text-center max-w-xs">
                  This is a simulated call. In production, this would connect to a real phone system.
                </p>
              </>
            )}

            {isCalling && (
              <>
                <div className="w-24 h-24 rounded-full bg-primary animate-pulse flex items-center justify-center">
                  <Phone className="h-12 w-12 text-white" />
                </div>
                <div className="text-center">
                  <h3 className="text-xl font-semibold mb-2">Calling...</h3>
                  <p className="text-muted-foreground">{contactName}</p>
                </div>
                <div className="flex gap-2">
                  <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </>
            )}

            {callComplete && lastCall && (
              <>
                <div className="w-24 h-24 rounded-full bg-green-500/10 flex items-center justify-center">
                  <CheckCheck className="h-12 w-12 text-green-500" />
                </div>
                <div className="text-center">
                  <h3 className="text-xl font-semibold mb-2 text-green-600">Call Completed</h3>
                  <p className="text-muted-foreground mb-1">{contactName}</p>
                  <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>Duration: {formatCallDuration(lastCall.duration)}</span>
                  </div>
                </div>
                <div className="w-full max-w-xs space-y-2">
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={handleMakeCall}
                  >
                    <Phone className="h-4 w-4 mr-2" />
                    Call Again
                  </Button>
                  <Button
                    variant="secondary"
                    className="w-full"
                    onClick={onClose}
                  >
                    Close
                  </Button>
                </div>
              </>
            )}
          </TabsContent>

          {/* SMS Tab */}
          <TabsContent value="sms" className="flex-1 flex flex-col overflow-hidden space-y-4 mt-0">
            {/* Quick Templates */}
            <div className="space-y-2">
              <div className="text-sm font-medium text-muted-foreground">Quick messages:</div>
              <div className="flex flex-wrap gap-2">
                {templates.map((template, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    className="text-xs"
                    onClick={() => handleUseTemplate(template.message)}
                  >
                    {template.label}
                  </Button>
                ))}
              </div>
            </div>

            {/* Conversation */}
            <div className="flex-1 overflow-y-auto bg-muted/30 rounded-lg p-4 space-y-3 min-h-[200px] max-h-[300px]">
              {conversation.length === 0 ? (
                <div className="flex items-center justify-center h-full text-sm text-muted-foreground">
                  No messages yet. Start a conversation!
                </div>
              ) : (
                [...conversation].reverse().map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.direction === 'sent' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-lg p-3 ${
                        msg.direction === 'sent'
                          ? 'bg-primary text-white'
                          : 'bg-white border border-border'
                      }`}
                    >
                      <p className="text-sm">{msg.message}</p>
                      <p
                        className={`text-xs mt-1 ${
                          msg.direction === 'sent'
                            ? 'text-white/70'
                            : 'text-muted-foreground'
                        }`}
                      >
                        {format(new Date(msg.timestamp), 'h:mm a')}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Message Input */}
            <div className="flex gap-2">
              <Textarea
                value={smsMessage}
                onChange={(e) => setSmsMessage(e.target.value)}
                placeholder="Type your message..."
                className="resize-none"
                rows={3}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendSMS();
                  }
                }}
              />
              <Button
                onClick={handleSendSMS}
                disabled={!smsMessage.trim() || isSending}
                size="lg"
                className="px-4"
              >
                <Send className="h-5 w-5" />
              </Button>
            </div>

            <p className="text-xs text-muted-foreground text-center">
              This is a simulated messaging system. Press Enter to send.
            </p>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
