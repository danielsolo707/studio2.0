"use server"

import { z } from 'zod';
import { addMessage } from '@/lib/contact-log';

const contactSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
});

export interface ContactState {
  success: boolean;
  message: string;
}

/**
 * Server Action – validates and processes the contact form.
 * In production, wire this up to an email service (Resend, SendGrid, etc.).
 */
export async function submitContact(
  _prevState: ContactState,
  formData: FormData,
): Promise<ContactState> {
  const raw = {
    name: formData.get('name'),
    email: formData.get('email'),
    message: formData.get('message'),
  };

  const result = contactSchema.safeParse(raw);

  if (!result.success) {
    const firstError = result.error.errors[0]?.message ?? 'Invalid input';
    return { success: false, message: firstError };
  }

  const data = result.data;

  // Persist message locally for dashboard access
  await addMessage({
    name: data.name,
    email: data.email,
    message: data.message,
  });

  // Send email via Resend (if configured)
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM;
  const to = process.env.RESEND_TO;

  if (apiKey && from && to) {
    try {
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          from,
          to,
          subject: `New contact from ${data.name}`,
          reply_to: data.email,
          text: `Name: ${data.name}\nEmail: ${data.email}\n\n${data.message}`,
        }),
      });
    } catch (error) {
      console.error('Resend email failed:', error);
      // Proceed without blocking the user
    }
  }

  return {
    success: true,
    message: "Message sent successfully! I'll get back to you soon.",
  };
}
