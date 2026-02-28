import { Resend } from 'resend';
import type { ReactElement } from 'react';

let resendInstance: Resend | null = null;

function getResend(): Resend {
  if (!resendInstance) {
    const key = process.env.RESEND_API_KEY;
    if (!key) throw new Error('RESEND_API_KEY is required');
    resendInstance = new Resend(key);
  }
  return resendInstance;
}

const FROM_ADDRESS = {
  sv: 'Yeshin Norbu <noreply@yeshinnorbu.se>',
  en: 'Yeshin Norbu <noreply@yeshinnorbu.se>',
} as const;

export interface SendEmailParams {
  to: string;
  subject: string;
  react: ReactElement;
  locale?: 'sv' | 'en';
  replyTo?: string;
}

/**
 * Send a transactional email using Resend with locale-aware from address.
 * @param params - Email parameters
 */
export async function sendEmail(params: SendEmailParams): Promise<{ id: string }> {
  const resend = getResend();
  const locale = params.locale ?? 'sv';

  const { data, error } = await resend.emails.send({
    from: FROM_ADDRESS[locale],
    to: params.to,
    subject: params.subject,
    react: params.react,
    reply_to: params.replyTo,
  });

  if (error) {
    throw new Error(`Failed to send email: ${error.message}`);
  }

  return { id: data?.id ?? '' };
}
