"use server"

import { z } from 'zod';
import { headers } from 'next/headers';
import { addMessage } from '@/lib/contact/contact-log';
import { notifyNewContactMessage } from '@/lib/integrations/telegram';
import { sendEmail } from '@/lib/email/resend';
import { consumeRateLimit, getClientIp } from '@/lib/security/rate-limit';

const contactSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be 100 characters or fewer')
    .regex(/^[^\r\n\u0000-\u001f\u007f]+$/, 'Name contains unsupported characters'),
  email: z.string().email('Invalid email address').max(254, 'Email address is too long'),
  message: z
    .string()
    .min(10, 'Message must be at least 10 characters')
    .max(5000, 'Message must be 5000 characters or fewer'),
});

export interface ContactState {
  success: boolean;
  message: string;
  errors: {
    name?: string;
    email?: string;
    message?: string;
  };
}

/**
 * Server Action – validates and processes the contact form.
 * In production, wire this up to an email service (Resend, SendGrid, etc.).
 */
export async function submitContact(
  _prevState: ContactState,
  formData: FormData,
): Promise<ContactState> {
  const clientIp = getClientIp(await headers());
  const rateLimit = consumeRateLimit(`contact:${clientIp}`, 5, 60 * 60 * 1000);
  if (!rateLimit.allowed) {
    return {
      success: false,
      message: `Too many messages. Please try again in ${rateLimit.retryAfterSeconds} seconds.`,
      errors: {},
    };
  }

  // Sanitize input data
  const raw = {
    name: formData.get('name')?.toString().trim() || '',
    email: formData.get('email')?.toString().trim() || '',
    message: formData.get('message')?.toString().trim() || '',
  };

  // Validate input
  const result = contactSchema.safeParse(raw);

  if (!result.success) {
    const fieldErrors: ContactState['errors'] = {};
    for (const err of result.error.errors) {
      const field = err.path[0] as keyof ContactState['errors'];
      if (field) fieldErrors[field] = err.message;
    }
    return { success: false, message: '', errors: { ...fieldErrors } as ContactState['errors'] };
  }

  const data = result.data;
  const notificationRecipient = process.env.RESEND_TO;
  if (!notificationRecipient) {
    return { success: false, message: 'Contact email notification is not configured.', errors: {} };
  }

  try {
    // Store the message even if email delivery has a provider outage. The
    // visitor gets an accurate delivery state rather than a false success.
    const [, delivery] = await Promise.all([
      addMessage({
        name: data.name,
        email: data.email,
        message: data.message,
      }).then((saved) => {
        notifyNewContactMessage(saved.name, saved.email, saved.message).catch((error) => {
          console.error('Telegram notify error:', error);
        });
      }),
      sendEmail({
        to: notificationRecipient,
        subject: `New contact from ${data.name}`,
        replyTo: data.email,
        text: `Name: ${data.name}\nEmail: ${data.email}\n\n${data.message}`,
      }),
    ]);

    if (!delivery.ok) {
      console.error('Contact notification email failed:', delivery.error);
      return {
        success: true,
        message: 'Your message was received. Email notification is temporarily unavailable, but Daniel can still see it.',
        errors: {},
      };
    }

    return {
      success: true,
      message: "Message sent successfully! I'll get back to you soon.",
      errors: {},
    };
  } catch (error) {
    console.error('Contact form submission error:', error);
    return {
      success: false,
      message: 'Sorry, there was an error sending your message. Please try again.',
      errors: {},
    };
  }
}
