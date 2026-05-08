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

  try {
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
        const response = await fetch('https://api.resend.com/emails', {
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

        if (!response.ok) {
          console.error('Resend API error:', await response.text());
        }
      } catch (emailError) {
        console.error('Resend email failed:', emailError);
        // Proceed without blocking the user - log the error but don't fail the action
      }
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