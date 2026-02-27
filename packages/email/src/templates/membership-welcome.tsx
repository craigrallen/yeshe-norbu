import {
  Body, Container, Head, Heading, Hr, Html, Preview, Text,
} from '@react-email/components';
import * as React from 'react';

interface MembershipWelcomeProps {
  locale: 'sv' | 'en';
  memberName: string;
  planName: string;
  features: string[];
}

const t = {
  sv: {
    preview: 'Välkommen som medlem i Yeshe Norbu!',
    heading: 'Välkommen!',
    greeting: (name: string) => `Hej ${name},`,
    body: (plan: string) => `Tack för att du blivit medlem! Du är nu registrerad som ${plan}-medlem.`,
    includes: 'Ditt medlemskap inkluderar:',
    footer: 'Yeshe Norbu — Buddhistiskt center i Stockholm',
  },
  en: {
    preview: 'Welcome to Yeshe Norbu!',
    heading: 'Welcome!',
    greeting: (name: string) => `Hi ${name},`,
    body: (plan: string) => `Thank you for becoming a member! You are now registered as a ${plan} member.`,
    includes: 'Your membership includes:',
    footer: 'Yeshe Norbu — Buddhist centre in Stockholm',
  },
};

/** Membership welcome email. */
export default function MembershipWelcome({ locale = 'sv', memberName, planName, features }: MembershipWelcomeProps) {
  const s = t[locale];
  return (
    <Html lang={locale}>
      <Head />
      <Preview>{s.preview}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={heading}>{s.heading}</Heading>
          <Text style={text}>{s.greeting(memberName)}</Text>
          <Text style={text}>{s.body(planName)}</Text>
          <Text style={text}>{s.includes}</Text>
          <ul>
            {features.map((f, i) => (
              <li key={i} style={listItem}>{f}</li>
            ))}
          </ul>
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
const listItem = { fontSize: '14px', color: '#1A1A1A', marginBottom: '4px' };
const hr = { borderColor: '#E5E1DC', margin: '20px 0' };
const footer = { fontSize: '12px', color: '#6B6B6B', textAlign: 'center' as const };
