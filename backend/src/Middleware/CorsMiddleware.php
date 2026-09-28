<?php
declare(strict_types=1);

namespace App\Middleware;

use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use Psr\Http\Server\MiddlewareInterface;
use Psr\Http\Server\RequestHandlerInterface as Handler;

final class CorsMiddleware implements MiddlewareInterface
{
    /** @param string[] $allowedOrigins */
    public function __construct(private array $allowedOrigins)
    {
    }

    public function process(Request $request, Handler $handler): Response
    {
        $response = $handler->handle($request);
        $origin   = $request->getHeaderLine('Origin');

        if ($origin !== '' && in_array($origin, $this->allowedOrigins, true)) {
            $response = $response
                ->withHeader('Access-Control-Allow-Origin', $origin)
                ->withHeader('Vary', 'Origin')
                ->withHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
                ->withHeader('Access-Control-Allow-Headers', 'Content-Type, Accept')
                ->withHeader('Access-Control-Max-Age', '600');
        }

        return $response;
    }
}
