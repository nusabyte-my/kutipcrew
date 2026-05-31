import { db } from './client';
import fs from 'fs';
import path from 'path';

async function initDatabase() {
  console.log('🔧 Initializing database...');
  
  try {
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf-8');
    
    await db.query(schema);
    
    console.log('✅ KutipCrew database initialized!');
    console.log('🔫 The Crew\'s ledger is ready...');
  } catch (error) {
    console.error('❌ Failed to initialize database:', error);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

initDatabase();
