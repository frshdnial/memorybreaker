<?php
declare(strict_types=1);

namespace App\Controllers;

use App\ScoreRepository;
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;

final class ScoreController
{
    public function __construct(private ScoreRepository $scores, private array $config)
    {
    }

    public function health(Request $request, Response $response): Response
    {
        return $this->json($response, ['status' => 'ok', 'entries' => $this->scores->count()]);
    }

    public function index(Request $request, Response $response): Response
    {
        $limit = (int) ($request->getQueryParams()['limit'] ?? 10);
        $limit = max(1, min($limit, (int) $this->config['max_limit']));

        return $this->json($response, ['data' => $this->scores->top($limit)]);
    }

    public function store(Request $request, Response $response): Response
    {
        $body = $request->getParsedBody();
        if (!is_array($body)) {
            return $this->json($response, ['error' => 'Request body must be valid JSON.'], 400);
        }

        $errors = [];

        $name = preg_replace('/\s+/u', ' ', trim((string) ($body['name'] ?? '')));
        $max  = (int) $this->config['name_max_length'];
        if ($name === '' || mb_strlen($name) > $max) {
            $errors['name'] = "Name is required (max {$max} characters).";
        } elseif (!preg_match('/^[\p{L}\p{N} _.\-]+$/u', $name)) {
            $errors['name'] = 'Name may only contain letters, numbers, spaces, dot, dash and underscore.';
        }

        $score  = $this->intField($body, 'score');
        $timeMs = $this->intField($body, 'time_ms');
        $stages = $this->intField($body, 'stages_cleared');

        if ($score === null || $score < 0 || $score > $this->config['max_score']) {
            $errors['score'] = 'Score is out of range.';
        }
        if ($timeMs === null || $timeMs < $this->config['min_time_ms'] || $timeMs > $this->config['max_time_ms']) {
            $errors['time_ms'] = 'Time is out of range.';
        }
        if ($stages === null || $stages < 0 || $stages > $this->config['max_stages']) {
            $errors['stages_cleared'] = 'Stages cleared is out of range.';
        }

        if ($errors) {
            return $this->json($response, ['error' => 'Validation failed.', 'fields' => $errors], 422);
        }

        $entry = $this->scores->add(mb_strtoupper($name), $score, $timeMs, $stages);

        return $this->json($response, ['data' => $entry], 201);
    }

    private function intField(array $body, string $key): ?int
    {
        $value = $body[$key] ?? null;
        if (is_int($value)) {
            return $value;
        }
        if (is_string($value) && preg_match('/^\d+$/', $value)) {
            return (int) $value;
        }
        return null;
    }

    private function json(Response $response, array $payload, int $status = 200): Response
    {
        $response->getBody()->write(json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_THROW_ON_ERROR));
        return $response->withHeader('Content-Type', 'application/json')->withStatus($status);
    }
}
