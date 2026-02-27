import { createDb, membershipPlans, eventCategories, users, userRoles } from './index.js';
import { hash } from '@yeshe/auth/password';

async function seed() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error('DATABASE_URL is required');

  const db = createDb(url);

  console.log('Seeding membership plans...');
  await db.insert(membershipPlans).values([
    {
      slug: 'friend-annual',
      nameSv: 'Vän — Årsmedlemskap',
      nameEn: 'Friend — Annual Membership',
      descriptionSv: 'Stöd Yeshe Norbu som vän. Tillgång till medlemsevenemang.',
      descriptionEn: 'Support Yeshe Norbu as a friend. Access to member events.',
      priceSek: '300.00',
      intervalMonths: 12,
      features: ['Medlemsevenemang', 'Nyhetsbrev', '10% rabatt på kurser'],
    },
    {
      slug: 'nonprofit-yearly',
      nameSv: 'Ideell — Årsmedlemskap',
      nameEn: 'Non-Profit — Yearly Membership',
      descriptionSv: 'Fullständigt medlemskap med rösträtt vid årsmötet.',
      descriptionEn: 'Full membership with voting rights at annual meetings.',
      priceSek: '500.00',
      intervalMonths: 12,
      features: ['Rösträtt', 'Alla medlemsevenemang', '20% rabatt på kurser', 'Digitalt medlemskort'],
    },
    {
      slug: 'mental-gym-monthly',
      nameSv: 'Mental Gym — Månadsmedlemskap',
      nameEn: 'Mental Gym — Monthly Membership',
      descriptionSv: 'Obegränsad tillgång till meditationssessioner och mindfulness-program.',
      descriptionEn: 'Unlimited access to meditation sessions and mindfulness programs.',
      priceSek: '395.00',
      intervalMonths: 1,
      features: ['Obegränsade sessioner', 'Onlinekurser', 'Personlig uppföljning', 'Mental Gym-community'],
    },
  ]).onConflictDoNothing();

  console.log('Seeding event categories...');
  await db.insert(eventCategories).values([
    { slug: 'buddhism', nameSv: 'Buddhism', nameEn: 'Buddhism' },
    { slug: 'meditation', nameSv: 'Meditation', nameEn: 'Meditation' },
    { slug: 'mindfulness', nameSv: 'Mindfulness', nameEn: 'Mindfulness' },
    { slug: 'retreat', nameSv: 'Retreat', nameEn: 'Retreat' },
    { slug: 'live-streaming', nameSv: 'Direktsändning', nameEn: 'Live Streaming' },
  ]).onConflictDoNothing();

  console.log('Seeding admin user...');
  const passwordHash = await hash('changeme123!');
  const [adminUser] = await db.insert(users).values({
    email: 'admin@yeshinnorbu.se',
    emailVerified: true,
    passwordHash,
    firstName: 'Admin',
    lastName: 'Yeshe Norbu',
    locale: 'sv',
  }).onConflictDoNothing().returning();

  if (adminUser) {
    await db.insert(userRoles).values({
      userId: adminUser.id,
      role: 'admin',
    });
  }

  console.log('Seed complete.');
  process.exit(0);
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
