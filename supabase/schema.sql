CREATE TABLE game_rooms (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  room_code TEXT UNIQUE NOT NULL,
  status TEXT DEFAULT 'waiting' CHECK (status IN ('waiting', 'playing', 'finished')),
  current_turn INT DEFAULT 0,
  winner_id UUID REFERENCES players(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE players (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  room_id UUID REFERENCES game_rooms(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  position INT DEFAULT 0 CHECK (position >= 0 AND position <= 100),
  color TEXT DEFAULT 'blue',
  joined_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE game_moves (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  room_id UUID REFERENCES game_rooms(id) ON DELETE CASCADE,
  player_id UUID REFERENCES players(id) ON DELETE CASCADE,
  dice_roll INT NOT NULL CHECK (dice_roll >= 1 AND dice_roll <= 6),
  from_position INT NOT NULL,
  to_position INT NOT NULL,
  move_type TEXT DEFAULT 'normal' CHECK (move_type IN ('normal', 'elephant', 'mud', 'win', 'bounce')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE game_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_moves ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read" ON game_rooms FOR SELECT USING (true);
CREATE POLICY "Public insert" ON game_rooms FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update" ON game_rooms FOR UPDATE USING (true);

CREATE POLICY "Public read" ON players FOR SELECT USING (true);
CREATE POLICY "Public insert" ON players FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update" ON players FOR UPDATE USING (true);

CREATE POLICY "Public read" ON game_moves FOR SELECT USING (true);
CREATE POLICY "Public insert" ON game_moves FOR INSERT WITH CHECK (true);

CREATE INDEX idx_players_room ON players(room_id);
CREATE INDEX idx_game_moves_room ON game_moves(room_id);
CREATE INDEX idx_game_rooms_code ON game_rooms(room_code);

BEGIN;
  DROP PUBLICATION IF EXISTS supabase_realtime;
  CREATE PUBLICATION supabase_realtime;
COMMIT;

ALTER PUBLICATION supabase_realtime ADD TABLE game_rooms;
ALTER PUBLICATION supabase_realtime ADD TABLE players;
ALTER PUBLICATION supabase_realtime ADD TABLE game_moves;
