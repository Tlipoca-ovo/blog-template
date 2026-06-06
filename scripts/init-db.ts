import 'dotenv/config';
import { PrismaClient } from '../src/generated/prisma/client.js';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import bcrypt from 'bcryptjs';

const factory = new PrismaBetterSqlite3({ url: 'file:./dev.db' });
const prisma = new PrismaClient({ adapter: factory });

async function init() {
  const password = process.env.ADMIN_PASSWORD || 'changeme';
  const hashed = await bcrypt.hash(password, 10);

  try {
    await prisma.admin.create({ data: { password: hashed } });
    console.log('admin account created');
  } catch (e: any) {
    if (e.code === 'P2002') {
      console.log('admin account exists, skip');
    } else {
      throw e;
    }
  }

  try {
    await prisma.siteSettings.create({
      data: {
        id: 1,
        themeColors: JSON.stringify({ primary: '#3B82F6', background: '#FFFFFF', text: '#1F2937', secondary: '#6B7280', border: '#E5E7EB', card: '#FFFFFF', accent: '#10B981' }),
        fonts: JSON.stringify({ body: 'Noto Sans SC', heading: 'Noto Serif SC' }),
        layoutConfig: JSON.stringify({ sidebarPosition: 'right', navStyle: 'sticky' }),
        homepageModules: JSON.stringify([
          { name: 'featured', enabled: true, label: 'featured' },
          { name: 'categories', enabled: true, label: 'categories' },
          { name: 'recent', enabled: true, label: 'recent' },
          { name: 'tagCloud', enabled: true, label: 'tagCloud' }
        ]),
        seoConfig: JSON.stringify({ title: 'My Blog', description: 'blog template', keywords: 'blog' }),
        customCSS: ''
      }
    });
    console.log('site settings initialized');
  } catch (e: any) {
    if (e.code === 'P2002') {
      console.log('site settings exist, skip');
    } else {
      throw e;
    }
  }

  console.log('done');
  await prisma.$disconnect();
}

init().catch(e => { console.error(e); process.exit(1); });
