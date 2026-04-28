// GET /
export function home(req, res) {
  res.json({
    name: 'Task Management API',
    version: '1.0.0',
    endpoints: [
      'GET /api/health',
      'GET /api/tasks',
      'POST /api/tasks',
      'PATCH /api/tasks/:id/status',
      'POST /api/tasks/:id/attachment',
      'DELETE /api/tasks/:id/attachment',
      'GET /api/messages',
      'POST /api/messages',
    ],
  });
}
