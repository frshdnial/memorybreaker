<?php
declare(strict_types=1);

use App\Controllers\ScoreController;
use App\Database;
use App\Middleware\CorsMiddleware;
use App\ScoreRepository;
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use Slim\Factory\AppFactory;
use Slim\Routing\RouteCollectorProxy;

require __DIR__ . '/../vendor/autoload.php';

$config = require __DIR__ . '/../config.php';

$app = AppFactory::create();
if ($config['base_path'] !== '') {
    $app->setBasePath($config['base_path']);
}

$controller = new ScoreController(
    new ScoreRepository(Database::connect($config['db'])),
    $config
);

$app->group('/api', function (RouteCollectorProxy $group) use ($controller) {
    $group->get('/health', [$controller, 'health']);
    $group->get('/leaderboard', [$controller, 'index']);
    $group->post('/scores', [$controller, 'store']);
});

// CORS pre-flight
$app->options('/{routes:.+}', fn (Request $req, Response $res): Response => $res);

$app->addRoutingMiddleware();
$app->addBodyParsingMiddleware();
$app->addErrorMiddleware($config['debug'], true, true);
$app->add(new CorsMiddleware($config['allowed_origins'])); // outermost: also decorates error responses

$app->run();
