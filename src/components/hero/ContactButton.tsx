'use client';

import { useState } from 'react';
import { Phone, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CommunicationModal } from '@/components/shared/CommunicationModal';

interface ContactButtonProps {
  userId: string;
  contactName: string;
  contactPhone: string;
  requestId?: string;
  variant?: 'default' | 'outline' | 'secondary';
  size?: 'default' | 'sm' | 'lg';
  fullWidth?: boolean;
  showIcon?: boolean;
}

export function ContactButton({
  userId,
  contactName,
  contactPhone,
  requestId,
  variant = 'default',
  size = 'default',
  fullWidth = false,
  showIcon = true,
}: ContactButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button
        variant={variant}
        size={size}
        onClick={() => setIsOpen(true)}
        className={fullWidth ? 'w-full' : ''}
      >
        {showIcon && <Phone className="h-4 w-4 mr-2" />}
        Contact Requester
      </Button>

      <CommunicationModal
        open={isOpen}
        onClose={() => setIsOpen(false)}
        userId={userId}
        contactName={contactName}
        contactPhone={contactPhone}
        requestId={requestId}
      />
    </>
  );
}
