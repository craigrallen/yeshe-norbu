import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
  Row,
  Column,
} from '@react-email/components';
import * as React from 'react';

interface OrderItem {
  description: string;
  quantity: number;
  totalPriceSek: string;
}

interface OrderConfirmationProps {
  locale: 'sv' | 'en';
  customerName: string;
  orderNumber: number;
  items: OrderItem[];
  totalSek: string;
  paymentMethod: string;
  orderDate: string;
}

const t = {
  sv: {
    preview: 'Orderbekräftelse från Yeshe Norbu',
    heading: 'Tack för din beställning!',
    greeting: (name: string) => `Hej ${name},`,
    orderRef: 'Ordernummer',
    date: 'Datum',
    item: 'Beskrivning',
    qty: 'Antal',
    price: 'Pris',
    total: 'Totalt',
    payment: 'Betalmetod',
    footer: 'Yeshe Norbu — Buddhistiskt center i Stockholm',
  },
  en: {
    preview: 'Order confirmation from Yeshe Norbu',
    heading: 'Thank you for your order!',
    greeting: (name: string) => `Hi ${name},`,
    orderRef: 'Order number',
    date: 'Date',
    item: 'Description',
    qty: 'Qty',
    price: 'Price',
    total: 'Total',
    payment: 'Payment method',
    footer: 'Yeshe Norbu — Buddhist centre in Stockholm',
  },
};

/** Order confirmation email template. */
export default function OrderConfirmation({
  locale = 'sv',
  customerName,
  orderNumber,
  items,
  totalSek,
  paymentMethod,
  orderDate,
}: OrderConfirmationProps) {
  const s = t[locale];

  return (
    <Html lang={locale}>
      <Head />
      <Preview>{s.preview}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={heading}>{s.heading}</Heading>
          <Text style={text}>{s.greeting(customerName)}</Text>
          <Section>
            <Text style={meta}>
              {s.orderRef}: <strong>#{orderNumber}</strong>
            </Text>
            <Text style={meta}>
              {s.date}: {orderDate}
            </Text>
            <Text style={meta}>
              {s.payment}: {paymentMethod}
            </Text>
          </Section>
          <Hr style={hr} />
          <Section>
            <Row>
              <Column style={colHeader}>{s.item}</Column>
              <Column style={colHeaderSmall}>{s.qty}</Column>
              <Column style={colHeaderSmall}>{s.price}</Column>
            </Row>
            {items.map((item, i) => (
              <Row key={i}>
                <Column style={col}>{item.description}</Column>
                <Column style={colSmall}>{item.quantity}</Column>
                <Column style={colSmall}>{item.totalPriceSek} kr</Column>
              </Row>
            ))}
          </Section>
          <Hr style={hr} />
          <Text style={totalStyle}>
            {s.total}: <strong>{totalSek} kr</strong>
          </Text>
          <Hr style={hr} />
          <Text style={footer}>{s.footer}</Text>
        </Container>
      </Body>
    </Html>
  );
}

const main = { backgroundColor: '#F9F7F4', fontFamily: 'Inter, system-ui, sans-serif' };
const container = { margin: '0 auto', padding: '40px 20px', maxWidth: '560px' };
const heading = { fontSize: '24px', color: '#1A1A1A', marginBottom: '16px' };
const text = { fontSize: '16px', color: '#1A1A1A', lineHeight: '1.5' };
const meta = { fontSize: '14px', color: '#6B6B6B', margin: '4px 0' };
const hr = { borderColor: '#E5E1DC', margin: '20px 0' };
const colHeader = { fontSize: '12px', color: '#6B6B6B', fontWeight: 'bold' as const, width: '60%' };
const colHeaderSmall = { fontSize: '12px', color: '#6B6B6B', fontWeight: 'bold' as const, width: '20%', textAlign: 'right' as const };
const col = { fontSize: '14px', color: '#1A1A1A', width: '60%', padding: '4px 0' };
const colSmall = { fontSize: '14px', color: '#1A1A1A', width: '20%', textAlign: 'right' as const, padding: '4px 0' };
const totalStyle = { fontSize: '18px', color: '#1A1A1A', textAlign: 'right' as const };
const footer = { fontSize: '12px', color: '#6B6B6B', textAlign: 'center' as const, marginTop: '32px' };
