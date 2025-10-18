// Mock communication functions for phone calls and SMS

export interface CallLog {
  id: string;
  userId: string;
  contactName: string;
  contactPhone: string;
  direction: 'outgoing' | 'incoming';
  duration: number; // seconds
  timestamp: string;
  requestId?: string;
}

export interface SMSMessage {
  id: string;
  userId: string;
  contactName: string;
  contactPhone: string;
  message: string;
  direction: 'sent' | 'received';
  timestamp: string;
  requestId?: string;
}

/**
 * Simulates making a phone call
 * In a real app, this would integrate with a calling API
 */
export function makePhoneCall(
  userId: string,
  contactName: string,
  contactPhone: string,
  requestId?: string
): Promise<CallLog> {
  return new Promise((resolve) => {
    // Simulate call duration (3-8 minutes)
    const duration = Math.floor(Math.random() * 300) + 180;

    setTimeout(() => {
      const callLog: CallLog = {
        id: `call_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        userId,
        contactName,
        contactPhone,
        direction: 'outgoing',
        duration,
        timestamp: new Date().toISOString(),
        requestId,
      };

      // Store call log in localStorage
      const logs = getCallLogs(userId);
      logs.unshift(callLog);
      localStorage.setItem(`cfc_call_logs_${userId}`, JSON.stringify(logs.slice(0, 50))); // Keep last 50

      resolve(callLog);
    }, 2000); // Simulate 2 second "dialing" time
  });
}

/**
 * Simulates sending an SMS message
 * In a real app, this would integrate with an SMS API
 */
export function sendSMS(
  userId: string,
  contactName: string,
  contactPhone: string,
  message: string,
  requestId?: string
): Promise<SMSMessage> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const smsMessage: SMSMessage = {
        id: `sms_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        userId,
        contactName,
        contactPhone,
        message,
        direction: 'sent',
        timestamp: new Date().toISOString(),
        requestId,
      };

      // Store SMS in localStorage
      const messages = getSMSMessages(userId);
      messages.unshift(smsMessage);
      localStorage.setItem(`cfc_sms_${userId}`, JSON.stringify(messages.slice(0, 100))); // Keep last 100

      resolve(smsMessage);

      // Simulate auto-reply after 5-15 seconds
      const replyDelay = Math.floor(Math.random() * 10000) + 5000;
      setTimeout(() => {
        simulateIncomingSMS(userId, contactName, contactPhone, requestId);
      }, replyDelay);
    }, 500); // Simulate network delay
  });
}

/**
 * Simulates receiving an SMS message
 */
function simulateIncomingSMS(
  userId: string,
  contactName: string,
  contactPhone: string,
  requestId?: string
): void {
  const autoReplies = [
    "Thanks for the update! I'll be home.",
    "Great, thank you so much!",
    "Perfect timing, see you soon.",
    "Appreciate it! Looking forward to it.",
    "Thank you for helping our family!",
    "That works perfectly, thanks!",
  ];

  const reply = autoReplies[Math.floor(Math.random() * autoReplies.length)];

  const smsMessage: SMSMessage = {
    id: `sms_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    userId,
    contactName,
    contactPhone,
    message: reply,
    direction: 'received',
    timestamp: new Date().toISOString(),
    requestId,
  };

  const messages = getSMSMessages(userId);
  messages.unshift(smsMessage);
  localStorage.setItem(`cfc_sms_${userId}`, JSON.stringify(messages.slice(0, 100)));
}

/**
 * Get call logs for a user
 */
export function getCallLogs(userId: string): CallLog[] {
  try {
    const logs = localStorage.getItem(`cfc_call_logs_${userId}`);
    return logs ? JSON.parse(logs) : [];
  } catch {
    return [];
  }
}

/**
 * Get SMS messages for a user
 */
export function getSMSMessages(userId: string): SMSMessage[] {
  try {
    const messages = localStorage.getItem(`cfc_sms_${userId}`);
    return messages ? JSON.parse(messages) : [];
  } catch {
    return [];
  }
}

/**
 * Get SMS conversation for a specific contact
 */
export function getSMSConversation(
  userId: string,
  contactPhone: string
): SMSMessage[] {
  const allMessages = getSMSMessages(userId);
  return allMessages.filter((msg) => msg.contactPhone === contactPhone);
}

/**
 * Format phone number for display
 */
export function formatPhoneNumber(phone: string): string {
  // Remove all non-numeric characters
  const cleaned = phone.replace(/\D/g, '');

  // Format as (XXX) XXX-XXXX if 10 digits
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  }

  // Return as-is if not 10 digits
  return phone;
}

/**
 * Format call duration
 */
export function formatCallDuration(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Get quick SMS templates for common messages
 */
export function getSMSTemplates(): { label: string; message: string }[] {
  return [
    {
      label: "On my way",
      message: "Hi! I'm on my way to pick up your food delivery. I should arrive in about 15 minutes.",
    },
    {
      label: "Picked up food",
      message: "Great news! I've picked up your food from the food bank and I'm heading to your location now.",
    },
    {
      label: "Running late",
      message: "Hi, I'm running a few minutes behind schedule. I should arrive within 20 minutes. Thanks for your patience!",
    },
    {
      label: "Arrived",
      message: "I've arrived at your location with your food delivery. Let me know the best place to drop it off!",
    },
    {
      label: "Left at door",
      message: "Your food has been delivered and left at your door as requested. Enjoy and stay well!",
    },
    {
      label: "Confirm details",
      message: "Hi! I've accepted your food delivery request. Can you confirm the delivery address and any special instructions?",
    },
  ];
}
