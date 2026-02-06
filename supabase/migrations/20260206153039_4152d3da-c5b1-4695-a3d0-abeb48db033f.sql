
-- Create shot_events table to track individual shots with position and outcome
CREATE TABLE public.shot_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  match_id UUID REFERENCES public.saved_matches(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  team TEXT NOT NULL CHECK (team IN ('home', 'away')),
  period INTEGER NOT NULL DEFAULT 0,
  outcome TEXT NOT NULL CHECK (outcome IN ('save', 'goal', 'on_target', 'off_target')),
  position_x REAL,
  position_y REAL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.shot_events ENABLE ROW LEVEL SECURITY;

-- RLS policy
CREATE POLICY "Users can manage own shot events"
  ON public.shot_events
  FOR ALL
  USING (auth.uid() = user_id);

-- Index for fast lookups by match
CREATE INDEX idx_shot_events_match_id ON public.shot_events(match_id);
