#!/usr/bin/env tsx
/**
 * Import all extracted WordPress data into the new Yeshe Norbu database.
 * 
 * Imports (in order):
 * 1. Users (from WC customers)
 * 2. Products
 * 3. Events (with venues nested)
 * 4. Memberships (from WC subscriptions mapped to PMPro levels)
 * 5. Orders
 * 6. Subscriptions
 * 
 * Run: tsx migration/import-data.ts
 */

import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '../packages/db/src/schema';
import { readFileSync } from 'fs';
import { join } from 'path';

// Load env
const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://localhost:5432/yeshe';

const sql = postgres(DATABASE_URL);
const db = drizzle(sql, { schema });

const OUT = join(__dirname, 'extracted');

function load<T = any>(name: string): T[] {
  const path = join(OUT, `${name}.json`);
  return JSON.parse(readFileSync(path, 'utf-8'));
}

async function main() {
  console.log('=== Yeshe Norbu Data Import ===\n');

  // 1. Import users from WC customers
  console.log('1. Importing users from WC customers...');
  const customers = load<any>('wc_customers');
  const userMap = new Map<number, string>(); // WC customer ID -> new user UUID
  
  for (const c of customers) {
    try {
      const [user] = await db.insert(schema.users).values({
        email: c.email,
        firstName: c.first_name || null,
        lastName: c.last_name || null,
        phone: c.billing?.phone || null,
        emailVerified: !!c.email,
        role: 'member',
        metadata: {
          wcCustomerId: c.id,
          wcUsername: c.username,
          dateCreated: c.date_created,
          billing: c.billing,
          shipping: c.shipping,
        },
      }).returning();
      userMap.set(c.id, user.id);
    } catch (err: any) {
      if (!err.message.includes('duplicate')) {
        console.error(`  Error importing user ${c.email}:`, err.message);
      }
    }
  }
  console.log(`  Imported ${userMap.size} users\n`);

  // 2. Import products
  console.log('2. Importing products...');
  const products = load<any>('wc_products');
  const productMap = new Map<number, string>();

  for (const p of products) {
    try {
      // Determine type
      let type: 'physical' | 'digital' | 'event' | 'membership' | 'donation' = 'physical';
      if (p.virtual || p.downloadable) type = 'digital';
      if (p.categories?.some((c: any) => c.slug.includes('member'))) type = 'membership';
      if (p.categories?.some((c: any) => c.slug.includes('event') || c.slug.includes('ticket'))) type = 'event';
      if (p.categories?.some((c: any) => c.slug.includes('donat'))) type = 'donation';

      const [product] = await db.insert(schema.products).values({
        name: { sv: p.name, en: p.name }, // TODO: translate from WPML if available
        slug: { sv: p.slug, en: p.slug },
        description: p.description ? { sv: p.description, en: p.description } : null,
        shortDescription: p.short_description ? { sv: p.short_description, en: p.short_description } : null,
        type,
        price: parseFloat(p.price || '0') * 100, // convert to cents
        compareAtPrice: p.regular_price ? parseFloat(p.regular_price) * 100 : null,
        sku: p.sku || null,
        stock: p.manage_stock ? p.stock_quantity : null,
        lowStockThreshold: p.low_stock_amount || null,
        weight: p.weight ? parseFloat(p.weight) : null,
        images: p.images?.map((img: any) => ({
          url: img.src,
          alt: img.alt || '',
        })) || [],
        metadata: {
          wcProductId: p.id,
          wcCategories: p.categories,
          wcTags: p.tags,
          virtual: p.virtual,
          downloadable: p.downloadable,
        },
      }).returning();
      productMap.set(p.id, product.id);
    } catch (err: any) {
      console.error(`  Error importing product ${p.name}:`, err.message);
    }
  }
  console.log(`  Imported ${productMap.size} products\n`);

  // 3. Import events
  console.log('3. Importing events...');
  const events = load<any>('events');
  const eventMap = new Map<number, string>();

  for (const e of events) {
    try {
      const venue = e.venue || {};
      const [event] = await db.insert(schema.events).values({
        title: { sv: e.title, en: e.title },
        slug: { sv: e.slug, en: e.slug },
        description: e.description ? { sv: e.description, en: e.description } : null,
        startTime: new Date(e.start_date),
        endTime: new Date(e.end_date),
        allDay: e.all_day,
        location: venue.venue ? {
          name: venue.venue,
          address: venue.address || '',
          city: venue.city || '',
          postalCode: venue.zip || '',
          country: venue.country || 'Sweden',
          lat: venue.geo_lat || null,
          lng: venue.geo_lng || null,
        } : null,
        capacity: null, // Not in WP data
        published: e.status === 'publish',
        metadata: {
          tribeEventId: e.id,
          organizer: e.organizer,
          categories: e.categories,
        },
      }).returning();
      eventMap.set(e.id, event.id);
    } catch (err: any) {
      console.error(`  Error importing event ${e.title}:`, err.message);
    }
  }
  console.log(`  Imported ${eventMap.size} events\n`);

  // 4. Import memberships (from WC subscriptions)
  console.log('4. Importing memberships...');
  const subscriptions = load<any>('wc_subscriptions');
  let membershipCount = 0;

  for (const sub of subscriptions) {
    try {
      const userId = userMap.get(sub.customer_id);
      if (!userId) continue;

      // Map subscription to membership tier
      const lineItems = sub.line_items || [];
      const membershipItem = lineItems.find((item: any) => 
        item.name?.toLowerCase().includes('member') ||
        item.name?.toLowerCase().includes('gym card')
      );

      if (!membershipItem) continue;

      // Determine tier based on product name
      let tier: 'friend' | 'supporter' | 'benefactor' = 'supporter';
      const name = membershipItem.name.toLowerCase();
      if (name.includes('friend')) tier = 'friend';
      else if (name.includes('non-profit')) tier = 'supporter';
      else if (name.includes('gym')) tier = 'supporter'; // "Mental Gym Card" -> supporter

      await db.insert(schema.memberships).values({
        userId,
        tier,
        startDate: new Date(sub.date_created),
        endDate: sub.status === 'cancelled' && sub.end_date ? new Date(sub.end_date) : null,
        autoRenew: sub.status === 'active',
        stripeSubscriptionId: sub.id.toString(), // Store WC sub ID for now
        metadata: {
          wcSubscriptionId: sub.id,
          status: sub.status,
          billingPeriod: sub.billing_period,
          billingInterval: sub.billing_interval,
        },
      });
      membershipCount++;
    } catch (err: any) {
      console.error(`  Error importing membership for sub ${sub.id}:`, err.message);
    }
  }
  console.log(`  Imported ${membershipCount} memberships\n`);

  // 5. Import orders
  console.log('5. Importing orders...');
  const orders = load<any>('wc_orders');
  let orderCount = 0;

  for (const o of orders) {
    try {
      const userId = userMap.get(o.customer_id);
      
      // Convert line items
      const items = (o.line_items || []).map((item: any) => ({
        productId: productMap.get(item.product_id) || null,
        productName: item.name,
        quantity: item.quantity,
        price: Math.round(parseFloat(item.price) * 100),
        total: Math.round(parseFloat(item.total) * 100),
      }));

      const [order] = await db.insert(schema.orders).values({
        userId: userId || null,
        orderNumber: o.number || o.id.toString(),
        items,
        subtotal: Math.round(parseFloat(o.total) * 100),
        tax: Math.round(parseFloat(o.total_tax || '0') * 100),
        shipping: Math.round(parseFloat(o.shipping_total || '0') * 100),
        total: Math.round(parseFloat(o.total) * 100),
        currency: o.currency || 'SEK',
        paymentMethod: o.payment_method || 'unknown',
        paymentStatus: o.status === 'completed' ? 'paid' : 
                       o.status === 'pending' ? 'pending' :
                       o.status === 'failed' ? 'failed' : 'pending',
        fulfillmentStatus: o.status === 'completed' ? 'fulfilled' : 'pending',
        customerEmail: o.billing?.email || null,
        billingAddress: o.billing ? {
          firstName: o.billing.first_name,
          lastName: o.billing.last_name,
          address1: o.billing.address_1,
          address2: o.billing.address_2 || null,
          city: o.billing.city,
          postalCode: o.billing.postcode,
          country: o.billing.country,
          phone: o.billing.phone || null,
        } : null,
        shippingAddress: o.shipping?.address_1 ? {
          firstName: o.shipping.first_name,
          lastName: o.shipping.last_name,
          address1: o.shipping.address_1,
          address2: o.shipping.address_2 || null,
          city: o.shipping.city,
          postalCode: o.shipping.postcode,
          country: o.shipping.country,
          phone: null,
        } : null,
        metadata: {
          wcOrderId: o.id,
          wcStatus: o.status,
          dateCreated: o.date_created,
          datePaid: o.date_paid,
        },
      }).returning();

      // Create audit log entry
      await db.insert(schema.salesAuditLog).values({
        orderId: order.id,
        action: 'order_created',
        performedBy: userId || null,
        context: 'migration',
        details: {
          source: 'wordpress_migration',
          wcOrderId: o.id,
          originalStatus: o.status,
        },
        timestamp: new Date(o.date_created),
      });

      orderCount++;
    } catch (err: any) {
      console.error(`  Error importing order ${o.number || o.id}:`, err.message);
    }
  }
  console.log(`  Imported ${orderCount} orders\n`);

  console.log('=== IMPORT COMPLETE ===');
  console.log(`Users: ${userMap.size}`);
  console.log(`Products: ${productMap.size}`);
  console.log(`Events: ${eventMap.size}`);
  console.log(`Memberships: ${membershipCount}`);
  console.log(`Orders: ${orderCount}`);

  await sql.end();
}

main().catch((err) => {
  console.error('Import failed:', err);
  process.exit(1);
});
