<?php
declare(strict_types=1);

namespace App;

use PDO;

/**
 * Ranking rule: higher score wins; on equal score the faster time wins.
 */
final class ScoreRepository
{
    public function __construct(private PDO $pdo)
    {
    }

    public function add(string $name, int $score, int $timeMs, int $stagesCleared): array
    {
        $stmt = $this->pdo->prepare(
            'INSERT INTO scores (player_name, score, time_ms, stages_cleared) VALUES (:n, :s, :t, :c)'
        );
        $stmt->execute([':n' => $name, ':s' => $score, ':t' => $timeMs, ':c' => $stagesCleared]);
        $id = (int) $this->pdo->lastInsertId();

        return [
            'id'             => $id,
            'player_name'    => $name,
            'score'          => $score,
            'time_ms'        => $timeMs,
            'stages_cleared' => $stagesCleared,
            'rank'           => $this->rankOf($score, $timeMs),
        ];
    }

    public function top(int $limit): array
    {
        $stmt = $this->pdo->prepare(
            'SELECT id, player_name, score, time_ms, stages_cleared, created_at
               FROM scores
           ORDER BY score DESC, time_ms ASC, id ASC
              LIMIT :limit'
        );
        $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
        $stmt->execute();

        $rows = $stmt->fetchAll();
        foreach ($rows as $i => &$row) {
            $row['id']             = (int) $row['id'];
            $row['score']          = (int) $row['score'];
            $row['time_ms']        = (int) $row['time_ms'];
            $row['stages_cleared'] = (int) $row['stages_cleared'];
            $row['rank']           = $i + 1;
        }
        unset($row);

        return $rows;
    }

    public function count(): int
    {
        return (int) $this->pdo->query('SELECT COUNT(*) FROM scores')->fetchColumn();
    }

    private function rankOf(int $score, int $timeMs): int
    {
        $stmt = $this->pdo->prepare(
            'SELECT COUNT(*) FROM scores WHERE score > :s1 OR (score = :s2 AND time_ms < :t)'
        );
        $stmt->execute([':s1' => $score, ':s2' => $score, ':t' => $timeMs]);
        return (int) $stmt->fetchColumn() + 1;
    }
}
