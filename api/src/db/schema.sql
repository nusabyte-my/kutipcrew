CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS bills (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  total_amount DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'MYR',
  organizer_name VARCHAR(255) NOT NULL,
  organizer_contact VARCHAR(255),
  bank_name VARCHAR(255),
  bank_account VARCHAR(255),
  bank_holder VARCHAR(255),
  payment_qr_url TEXT,
  due_date TIMESTAMP WITH TIME ZONE,
  category VARCHAR(32) DEFAULT 'other' CHECK (category IN ('food','travel','utilities','rent','event','shopping','subscription','other')),
  tags TEXT[] DEFAULT '{}',
  split_mode VARCHAR(16) DEFAULT 'equal' CHECK (split_mode IN ('equal','custom','shares')),
  share_token VARCHAR(64) UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_bills_due_date ON bills(due_date);
CREATE INDEX IF NOT EXISTS idx_bills_category ON bills(category);

CREATE TABLE IF NOT EXISTS participants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  bill_id UUID REFERENCES bills(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(20),
  share_amount DECIMAL(10, 2) NOT NULL,
  share_weight DECIMAL(8, 2) DEFAULT 1.0,
  paid BOOLEAN DEFAULT FALSE,
  paid_at TIMESTAMP WITH TIME ZONE,
  payment_method VARCHAR(32) CHECK (payment_method IS NULL OR payment_method IN ('cash','bank_transfer','tng','duitnow','other')),
  payment_reference VARCHAR(255),
  confirmation_code VARCHAR(32),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS payment_confirmations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  participant_id UUID REFERENCES participants(id) ON DELETE CASCADE,
  confirmed_by VARCHAR(255),
  confirmed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  payment_method VARCHAR(32),
  notes TEXT
);

CREATE INDEX IF NOT EXISTS idx_participants_bill_id ON participants(bill_id);
CREATE INDEX IF NOT EXISTS idx_bills_share_token ON bills(share_token);
CREATE INDEX IF NOT EXISTS idx_participants_confirmation_code ON participants(confirmation_code);
CREATE INDEX IF NOT EXISTS idx_participants_paid ON participants(paid);
CREATE INDEX IF NOT EXISTS idx_payment_confirmations_participant ON payment_confirmations(participant_id, confirmed_at DESC);

CREATE TABLE IF NOT EXISTS chat_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  bill_id UUID REFERENCES bills(id) ON DELETE CASCADE,
  participant_id UUID REFERENCES participants(id) ON DELETE CASCADE,
  role VARCHAR(20) NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_chat_history_session ON chat_history(bill_id, participant_id, created_at);

CREATE TABLE IF NOT EXISTS bill_activity (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  bill_id UUID REFERENCES bills(id) ON DELETE CASCADE,
  participant_id UUID REFERENCES participants(id) ON DELETE SET NULL,
  type VARCHAR(32) NOT NULL,
  actor VARCHAR(255),
  amount DECIMAL(10, 2),
  notes TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_bill_activity_bill ON bill_activity(bill_id, created_at DESC);
