-- PDF Orchestrator - Cost Tracking and Job Queue Database Schema
-- SQLite schema for cost logging and fallback queue management

-- ====================
-- Cost Tracking Tables
-- ====================

-- Main cost log table
CREATE TABLE IF NOT EXISTS cost_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    timestamp TEXT NOT NULL,
    service TEXT NOT NULL,
    operation TEXT NOT NULL,
    cost_usd REAL NOT NULL,
    doc_slug TEXT,
    run_id TEXT,
    user TEXT,
    metadata TEXT,  -- JSON for additional context
    created_at TEXT DEFAULT (datetime('now'))
);

-- Indexes for fast querying
CREATE INDEX IF NOT EXISTS idx_cost_log_timestamp ON cost_log(timestamp);
CREATE INDEX IF NOT EXISTS idx_cost_log_service ON cost_log(service);
CREATE INDEX IF NOT EXISTS idx_cost_log_run_id ON cost_log(run_id);
CREATE INDEX IF NOT EXISTS idx_cost_log_date ON cost_log(date(timestamp));

-- Daily spend aggregation (materialized view alternative)
CREATE TABLE IF NOT EXISTS daily_spend (
    date TEXT PRIMARY KEY,
    total_cost_usd REAL NOT NULL,
    document_count INTEGER DEFAULT 0,
    api_call_count INTEGER DEFAULT 0,
    last_updated TEXT DEFAULT (datetime('now'))
);

-- Monthly spend aggregation
CREATE TABLE IF NOT EXISTS monthly_spend (
    year_month TEXT PRIMARY KEY,  -- Format: 'YYYY-MM'
    total_cost_usd REAL NOT NULL,
    document_count INTEGER DEFAULT 0,
    api_call_count INTEGER DEFAULT 0,
    last_updated TEXT DEFAULT (datetime('now'))
);

-- ====================
-- Job Queue Tables
-- ====================

-- Fallback queue for circuit breaker
CREATE TABLE IF NOT EXISTS job_queue (
    id TEXT PRIMARY KEY,  -- UUID
    job_type TEXT NOT NULL,
    payload TEXT NOT NULL,  -- JSON
    status TEXT NOT NULL DEFAULT 'queued',  -- queued, processing, completed, failed
    attempts INTEGER DEFAULT 0,
    max_attempts INTEGER DEFAULT 3,
    error TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    expires_at TEXT NOT NULL,
    last_attempt_at TEXT,
    completed_at TEXT
);

-- Indexes for efficient queue processing
CREATE INDEX IF NOT EXISTS idx_job_queue_status ON job_queue(status);
CREATE INDEX IF NOT EXISTS idx_job_queue_created ON job_queue(created_at);
CREATE INDEX IF NOT EXISTS idx_job_queue_expires ON job_queue(expires_at);
CREATE INDEX IF NOT EXISTS idx_job_queue_processing ON job_queue(status, attempts, expires_at);

-- ====================
-- Circuit Breaker State
-- ====================

-- Track circuit breaker state per service
CREATE TABLE IF NOT EXISTS circuit_breaker_state (
    service TEXT PRIMARY KEY,
    state TEXT NOT NULL DEFAULT 'CLOSED',  -- CLOSED, OPEN, HALF_OPEN
    failure_count INTEGER DEFAULT 0,
    last_failure_time TEXT,
    last_state_change TEXT DEFAULT (datetime('now')),
    metadata TEXT  -- JSON for additional state
);

-- ====================
-- Alert History
-- ====================

-- Track sent alerts to avoid spam
CREATE TABLE IF NOT EXISTS alert_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    alert_type TEXT NOT NULL,
    message TEXT NOT NULL,
    metadata TEXT,  -- JSON
    sent_at TEXT DEFAULT (datetime('now'))
);

-- Index for recent alerts
CREATE INDEX IF NOT EXISTS idx_alert_history_sent ON alert_history(sent_at);
CREATE INDEX IF NOT EXISTS idx_alert_history_type ON alert_history(alert_type);

-- ====================
-- Helper Views
-- ====================

-- View: Recent high-cost operations
CREATE VIEW IF NOT EXISTS recent_high_cost AS
SELECT
    timestamp,
    service,
    operation,
    cost_usd,
    doc_slug,
    run_id
FROM cost_log
WHERE cost_usd > 0.25
ORDER BY timestamp DESC
LIMIT 100;

-- View: Today's spending
CREATE VIEW IF NOT EXISTS today_spend AS
SELECT
    SUM(cost_usd) as total_cost,
    COUNT(*) as operation_count,
    COUNT(DISTINCT doc_slug) as document_count
FROM cost_log
WHERE date(timestamp) = date('now');

-- View: This month's spending
CREATE VIEW IF NOT EXISTS month_spend AS
SELECT
    SUM(cost_usd) as total_cost,
    COUNT(*) as operation_count,
    COUNT(DISTINCT doc_slug) as document_count
FROM cost_log
WHERE strftime('%Y-%m', timestamp) = strftime('%Y-%m', 'now');

-- View: Pending queue items
CREATE VIEW IF NOT EXISTS pending_queue AS
SELECT
    id,
    job_type,
    attempts,
    max_attempts,
    created_at,
    expires_at
FROM job_queue
WHERE status = 'queued'
  AND attempts < max_attempts
  AND datetime(expires_at) > datetime('now')
ORDER BY created_at ASC;

-- ====================
-- Initialization
-- ====================

-- Insert initial daily spend record if not exists
INSERT OR IGNORE INTO daily_spend (date, total_cost_usd)
VALUES (date('now'), 0.0);

-- Insert initial monthly spend record if not exists
INSERT OR IGNORE INTO monthly_spend (year_month, total_cost_usd)
VALUES (strftime('%Y-%m', 'now'), 0.0);

-- ====================
-- Maintenance Queries
-- ====================

-- To be run periodically (cleanup script):

-- Delete expired jobs (older than 24 hours)
-- DELETE FROM job_queue WHERE datetime(expires_at) < datetime('now', '-1 day');

-- Archive old cost logs (older than 1 year)
-- DELETE FROM cost_log WHERE datetime(timestamp) < datetime('now', '-1 year');

-- Vacuum database to reclaim space
-- VACUUM;
