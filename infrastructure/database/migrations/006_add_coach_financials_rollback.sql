-- Rollback: 006_add_coach_financials
ALTER TABLE coaches
    DROP COLUMN IF EXISTS scholarship_budget,
    DROP COLUMN IF EXISTS annual_cost_per_player;
