import {
  Body, Container, Head, Heading, Hr, Html, Preview, Text, Link,
} from '@react-email/components';
import * as React from 'react';

interface MembershipRenewalProps {
  locale: 'sv' | 'en';
  memberName: string;
  planName: string;
  expiryDate: string;
  renewUrl: string;
}

const t = {
  sv: {
    preview: 'Ditt medlemskap förnyas snart',
    heading: 'Påminnelse om förnyelse',
    greeting: (name: string) => `Hej ${name},`,
    body: (plan: string, date: string) => `Ditt ${plan}-medlemskap löper ut den ${date}.`,
    cta: 'Förnya ditt medlemskap',
    footer: 'Yeshe Norbu — Buddhistiskt center i Stockholm',
  },
  en: {
    preview: 'Your membership is renewing soon',
    heading: 'Renewal reminder',
    greeting: (name: string) => `Hi ${name},`,
    body: (plan: string, date: string) => `Your ${plan} membership expires on ${date}.`,
    cta: 'Renew your membership',
    footer: 'Yeshe Norbu — Buddhist centre in Stockholm',
  },
};

/** Membership renewal reminder email. */
export default function MembershipRenewal({ locale = 'sv', memberName, planName, expiryDate, renewUrl }: MembershipRenewalProps) {
  const s = t[locale];
  return (
    <Html lang={locale}>
      <Head />
      <Preview>{s.preview}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={heading}>{s.heading}</Heading>
          <Text style={text}>{s.greeting(memberName)}</Text>
          <Text style={text}>{s.body(planName, expiryDate)}</Text>
          <Link href={renewUrl} style={button}>{s.cta}</Link>
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
const button = { display: 'inline-block', backgroundColor: '#1A1A1A', color: '#FFFFFF', padding: '12px 24px', borderRadius: '6px', textDecoration: 'none', fontSize: '16px', marginTop: '16px' };
const hr = { borderColor: '#E5E1DC', margin: '20px 0' };
const footer = { fontSize: '12px', color: '#6B6B6B', textAlign: 'center' as const };
