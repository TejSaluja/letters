type Recipient = 'tej' | 'ridhi';

interface SendLetterNotificationPayload {
  recipient: Recipient;
  author: string;
}

export async function sendLetterNotification(payload: SendLetterNotificationPayload): Promise<void> {
  const response = await fetch('/api/send-letter-notification', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || 'Failed to send letter notification');
  }
}
