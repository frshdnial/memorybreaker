-- ============================================================
-- PERSAKA 26/27 · Memory Codebreaker
-- MySQL / MariaDB schema for the leaderboard
-- Safe to run more than once (uses IF NOT EXISTS).
-- ============================================================

CREATE DATABASE IF NOT EXISTS persaka_codebreaker
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE persaka_codebreaker;

CREATE TABLE IF NOT EXISTS scores (
  id             INT UNSIGNED     NOT NULL AUTO_INCREMENT,
  player_name    VARCHAR(12)      NOT NULL,
  score          INT UNSIGNED     NOT NULL,
  time_ms        INT UNSIGNED     NOT NULL,
  stages_cleared TINYINT UNSIGNED NOT NULL DEFAULT 0,
  created_at     TIMESTAMP        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_rank (score, time_ms)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
