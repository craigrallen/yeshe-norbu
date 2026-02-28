import {
  Body, Container, Head, Heading, Hr, Html, Preview, Text, Link,
} from '@react-email/components';
import * as React from 'react';

interface PasswordResetProps {
  locale: 'sv' | 'en';
  userName: string;
  resetUrl: string;
}

const t = {
  sv: {
    preview: 'Återställ ditt lösenord',
    heading: 'Återställ lösenord',
    greeting: (name: string) => `Hej ${name},`,
    body: 'Klicka på knappen nedan för att återställa ditt lösenord. Länken är giltig i 1 timme.',
    cta: 'Återställ lösenord',
    ignore: 'Om du inte begärde detta kan du ignorera detta meddelande.',
    footer: 'Yeshin Norbu — Buddhistiskt center i Stockholm',
  },
  en: {
    preview: 'Reset your password',
    heading: 'Reset password',
    greeting: (name: string) => `Hi ${name},`,
    body: 'Click the button below to reset your password. The link is valid for 1 hour.',
    cta: 'Reset password',
    ignore: 'If you did not request this, you can safely ignore this email.',
    footer: 'Yeshin Norbu — Buddhist centre in Stockholm',
  },
};

/** Password reset email. */
export default function PasswordReset({ locale = 'sv', userName, resetUrl }: PasswordResetProps) {
  const s = t[locale];
  return (
    <Html lang={locale}>
      <Head />
      <Preview>{s.preview}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={heading}>{s.heading}</Heading>
          <Text style={text}>{s.greeting(userName)}</Text>
          <Text style={text}>{s.body}</Text>
          <Link href={resetUrl} style={button}>{s.cta}</Link>
          <Text style={meta}>{s.ignore}</Text>
          <Hr style={hr} />
          <Text style={footer}>{s.footer}</Text>
        </Container>
      </Body>
    </Html>
  );
}

const main = { backgroundColor: '#F9F7F4', fontFamily: 'Inter, system-ui, sans-serif' };
const container = { margin: '0 auto', padding: '40px 20px', maxWidth: '560px' };
const heading = { fontSize: '24px', color: '#1A1A1A' };
const text = { fontSize: '16px', color: '#1A1A1A', lineHeight: '1.5' };
const meta = { fontSize: '13px', color: '#6B6B6B', marginTop: '16px' };
const button = { display: 'inline-block', backgroundColor: '#1A1A1A', color: '#FFFFFF', padding: '12px 24px', borderRadius: '6px', textDecoration: 'none', fontSize: '16px', marginTop: '16px' };
const hr = { borderColor: '#E5E1DC', margin: '20px 0' };
const footer = { fontSize: '12px', color: '#6B6B6B', textAlign: 'center' as const };
