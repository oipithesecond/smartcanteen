/**
 * seedUsers.js
 * Run once to create the initial role accounts in MongoDB Atlas.
 * Usage: node scripts/seedUsers.js
 */
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const dns = require('dns');
try { dns.setServers(['8.8.8.8', '8.8.4.4']); } catch (e) {}
const mongoose = require('mongoose');
const User = require('../models/User');

const MONGO_URI = process.env.MONGODB_URI;
if (!MONGO_URI) {
  console.error('❌ MONGODB_URI not set. Check backend/.env');
  process.exit(1);
}

const SEED_USERS = [
  {
    name: 'K. S. Rao',
    email: 'admin@smartcanteen.ap.gov',
    password: 'Admin@SC2026',
    role: 'ADMIN',
    assignedDistrict: null,
    title: 'State Dining Operations Director',
    department: 'AP State Canteen Authority - Amaravati Secretariat',
    badge: 'Statewide Admin',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
  },
  {
    name: 'Lakshmi Priya',
    email: 'amaravati@smartcanteen.ap.gov',
    password: 'Floor@SC2026',
    role: 'OUTLET_MANAGER',
    assignedDistrict: 'amaravati',
    title: 'Executive Head Chef - Amaravati',
    department: 'Secretariat & High Court Dining Complex',
    badge: 'Amaravati Floor',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80'
  },
  {
    name: 'Suresh Reddy',
    email: 'guntur@smartcanteen.ap.gov',
    password: 'Floor@SC2026',
    role: 'OUTLET_MANAGER',
    assignedDistrict: 'guntur',
    title: 'Kitchen Floor & Production Manager',
    department: 'Guntur Central Canteen Kitchen Floor',
    badge: 'Guntur Floor',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'
  },
  {
    name: 'K. Venkatesh',
    email: 'vijayawada@smartcanteen.ap.gov',
    password: 'Floor@SC2026',
    role: 'OUTLET_MANAGER',
    assignedDistrict: 'vijayawada',
    title: 'Transit Kitchen Floor Supervisor',
    department: 'Vijayawada Multi-Modal Kitchen Hub',
    badge: 'Vijayawada Floor',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80'
  }
];

async function seed() {
  await mongoose.connect(MONGO_URI, { dbName: 'smartcanteen' });
  console.log('✅ Connected to MongoDB Atlas (smartcanteen)');

  let created = 0;
  let skipped = 0;

  for (const u of SEED_USERS) {
    const exists = await User.findOne({ email: u.email });
    if (exists) {
      console.log(`  ⏭  Skipped (already exists): ${u.email}`);
      skipped++;
      continue;
    }
    const passwordHash = await User.hashPassword(u.password);
    await User.create({
      name: u.name,
      email: u.email,
      passwordHash,
      role: u.role,
      assignedDistrict: u.assignedDistrict,
      title: u.title,
      department: u.department,
      badge: u.badge,
      avatar: u.avatar
    });
    console.log(`  ✅ Created: ${u.email} (${u.role})`);
    created++;
  }

  console.log(`\nDone. Created: ${created}, Skipped: ${skipped}`);
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
