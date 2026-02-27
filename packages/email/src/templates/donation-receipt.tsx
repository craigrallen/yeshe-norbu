import {
  Body, Container, Head, Heading, Hr, Html, Preview, Text,
} from '@react-email/components';
import * as React from 'react';

interface DonationReceiptProps {
  locale: 'sv' | 'en';
  donorName: string;
  amountSek: string;
  isRecurring: boolean;
  date: string;
  dedication?: string;
}

const t = {
  sv: {
    preview: 'Tack för din gåva till Yeshe Norbu',
    heading: 'Tack för din gåva!',
    greeting: (name: string) => `Hej ${name},`,
    oneTime: (amount: string, date: string) => `Vi har mottagit din gåva på ${amount} kr den ${date}.`,
    recurring: (amount: string) => `Din månatliga gåva på ${amount} kr har registrerats.`,
    dedication: 'Tillägnan',
    org: 'Yeshe Norbu (MindfulnessApps Sweden AB)',
    orgNum: 'Organisationsnummer: 559192-2448',
    footer: 'Yeshe Norbu — Buddhistiskt center i Stockholm',
  },
  en: {
    preview: 'Thank you for your donation to Yeshe Norbu',
    heading: 'Thank you for your donation!',
    greeting: (name: string) => `Hi ${name},`,
    oneTime: (amount: string, date: string) => `We have received your donation of ${amount} kr on ${date}.`,
    recurring: (amount: string) => `Your monthly donation of ${amount} kr has been registered.`,
    dedication: 'Dedication',
    org: 'Yeshe Norbu (MindfulnessApps Sweden AB)',
    orgNum: 'Organisation number: 559192-2448',
    footer: 'Yeshe Norbu — Buddhist centre in Stockholm',
  },
};

/** Donation receipt email. */
export default function DonationReceipt({ locale = 'sv', donorName, amountSek, isRecurring, date, dedication }: DonationReceiptProps) {
  const s = t[locale];
  return (
    <Html lang={locale}>
      <Head />
      <Preview>{s.preview}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={heading}>{s.heading}</Heading>
          <Text style={text}>{s.greeting(donorName)}</Text>
          <Text style={text}>
            {isRecurring ? s.recurring(amountSek) : s.oneTime(amountSek, date)}
          </Text>
          {dedication && (
            <>
              <Text style={meta}><strong>{s.dedication}:</strong></Text>
              <Text style={text}>{dedication}</Text>
            </>
          )}
          <Hr style={hr} />
          <Text style={meta}>{s.org}</Text>
          <Text style={meta}>{s.orgNum}</Text>
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
const meta = { fontSize: '14px', color: '#6B6B6B', margin: '4px 0' };
const hr = { borderColor: '#E5E1DC', margin: '20px 0' };
const footer = { fontSize: '12px', color: '#6B6B6B', textAlign: 'center' as const };
