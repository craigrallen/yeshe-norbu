import {
  Body, Container, Head, Heading, Hr, Html, Preview, Section, Text, Link,
} from '@react-email/components';
import * as React from 'react';

interface EventRegistrationProps {
  locale: 'sv' | 'en';
  attendeeName: string;
  eventTitle: string;
  eventDate: string;
  eventTime: string;
  venue: string;
  bookingRef: string;
  qrCodeUrl?: string;
}

const t = {
  sv: {
    preview: 'Din anmälan är bekräftad!',
    heading: 'Anmälan bekräftad',
    greeting: (name: string) => `Hej ${name},`,
    confirmed: (event: string) => `Din plats på "${event}" är bokad.`,
    when: 'Datum och tid',
    where: 'Plats',
    ref: 'Bokningsreferens',
    qr: 'Visa din QR-kod vid incheckning.',
    footer: 'Yeshin Norbu — Buddhistiskt center i Stockholm',
  },
  en: {
    preview: 'Your registration is confirmed!',
    heading: 'Registration confirmed',
    greeting: (name: string) => `Hi ${name},`,
    confirmed: (event: string) => `Your spot at "${event}" is booked.`,
    when: 'Date and time',
    where: 'Venue',
    ref: 'Booking reference',
    qr: 'Show your QR code at check-in.',
    footer: 'Yeshin Norbu — Buddhist centre in Stockholm',
  },
};

/** Event registration confirmation email. */
export default function EventRegistration({
  locale = 'sv', attendeeName, eventTitle, eventDate, eventTime, venue, bookingRef, qrCodeUrl,
}: EventRegistrationProps) {
  const s = t[locale];
  return (
    <Html lang={locale}>
      <Head />
      <Preview>{s.preview}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={heading}>{s.heading}</Heading>
          <Text style={text}>{s.greeting(attendeeName)}</Text>
          <Text style={text}>{s.confirmed(eventTitle)}</Text>
          <Section style={details}>
            <Text style={meta}><strong>{s.when}:</strong> {eventDate}, {eventTime}</Text>
            <Text style={meta}><strong>{s.where}:</strong> {venue}</Text>
            <Text style={meta}><strong>{s.ref}:</strong> {bookingRef}</Text>
          </Section>
          {qrCodeUrl && (
            <Section style={{ textAlign: 'center' as const }}>
              <img src={qrCodeUrl} alt="QR Code" width="200" height="200" />
              <Text style={meta}>{s.qr}</Text>
            </Section>
          )}
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
const meta = { fontSize: '14px', color: '#1A1A1A', margin: '4px 0' };
const details = { backgroundColor: '#FFFFFF', padding: '16px', borderRadius: '8px', margin: '16px 0' };
const hr = { borderColor: '#E5E1DC', margin: '20px 0' };
const footer = { fontSize: '12px', color: '#6B6B6B', textAlign: 'center' as const };
