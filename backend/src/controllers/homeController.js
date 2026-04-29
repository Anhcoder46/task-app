// GET /
export function home(req, res) {
  res.json({
    name: 'Order Management API',
    version: '1.0.0',
    endpoints: [
      'GET /api/health',
      'GET /api/orders',
      'POST /api/orders',
      'PATCH /api/orders/:id/status',
      'POST /api/orders/:id/attachment',
      'DELETE /api/orders/:id/attachment',
      'GET /api/messages',
      'POST /api/messages',
    ],
  });
}
