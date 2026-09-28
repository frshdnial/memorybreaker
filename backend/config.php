<?php
declare(strict_types=1);

// ---------------------------------------------------------------
// Minimal .env loader (no extra packages needed).
// Reads backend/.env and makes each KEY=VALUE available to getenv().
// Real environment variables (e.g. set in the terminal) take priority.
// ---------------------------------------------------------------
$envFile = __DIR__ . '/.env';
if (is_readable($envFile)) {
    foreach (file($envFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES) as $line) {
        $line = trim($line);
        if ($line === '' || $line[0] === '#' || !str_contains($line, '=')) {
            continue;
        }
        [$key, $value] = explode('=', $line, 2);
        $key   = trim($key);
        $value = trim($value);

        // strip optional surrounding quotes
        if (strlen($value) >= 2 && ($value[0] === '"' || $value[0] === "'") && $value[-1] === $value[0]) {
            $value = substr($value, 1, -1);
        }

        if (getenv($key) === false) {
            putenv("$key=$value");
        }
    }
}

return [
    'debug' => filter_var(getenv('APP_DEBUG') ?: 'false', FILTER_VALIDATE_BOOLEAN),

    // MySQL / MariaDB (Laragon + HeidiSQL)
    'db' => [
        'host'    => getenv('DB_HOST') ?: '127.0.0.1',
        'port'    => getenv('DB_PORT') ?: '3306',
        'name'    => getenv('DB_NAME') ?: 'persaka_codebreaker',
        'user'    => getenv('DB_USER') ?: 'root',
        'pass'    => getenv('DB_PASS') ?: '',
        'charset' => 'utf8mb4',
    ],

    // Comma separated list. Only needed when the Vue app is served from a different origin than the API.
    'allowed_origins' => array_filter(array_map(
        'trim',
        explode(',', getenv('ALLOWED_ORIGINS') ?: 'http://localhost:5173,http://127.0.0.1:5173')
    )),

    // Only needed if the API lives in a sub-folder, e.g. /memorybreaker
    'base_path' => getenv('BASE_PATH') ?: '',

    // Sanity limits for submitted scores (see frontend/src/config.js for the scoring formula).
    'max_score'       => 30000,
    'min_time_ms'     => 3000,
    'max_time_ms'     => 3600000,
    'max_stages'      => 5,
    'name_max_length' => 12,
    'max_limit'       => 100,
];