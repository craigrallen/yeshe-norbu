-- Migration: add event_category_assignments junction table
CREATE TABLE IF NOT EXISTS event_category_assignments (
  event_id    UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES event_categories(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT eca_pk PRIMARY KEY (event_id, category_id)
);

CREATE INDEX IF NOT EXISTS eca_event_idx    ON event_category_assignments(event_id);
CREATE INDEX IF NOT EXISTS eca_category_idx ON event_category_assignments(category_id);
