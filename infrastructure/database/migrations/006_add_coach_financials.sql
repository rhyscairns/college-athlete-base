-- Migration: 006_add_coach_financials
-- Description: Adds scholarship budget and annual cost per player to the coaches table

ALTER TABLE coaches
    ADD COLUMN IF NOT EXISTS scholarship_budget NUMERIC(12, 2),
    ADD COLUMN IF NOT EXISTS annual_cost_per_player NUMERIC(12, 2);

COMMENT ON COLUMN coaches.scholarship_budget IS 'Total annual scholarship budget available to the coach';
COMMENT ON COLUMN coaches.annual_cost_per_player IS 'Annual cost of attendance per player at this university';
