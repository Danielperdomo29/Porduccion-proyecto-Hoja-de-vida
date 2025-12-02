// Controlador para obtener información del usuario actual
exports.getCurrentUser = (req, res) => {
  if (!req.user) return res.status(401).json({ error: 'No autenticado' });
  res.json(req.user);
};

// Controlador para logout - VERSIÓN SIMPLIFICADA Y FUNCIONAL
exports.logout = (req, res) => {
  req.logout(function(err) {
    if (err) {
      console.error('Error durante logout:', err);
      return res.status(500).json({ 
        success: false,
        error: 'Error al cerrar sesión' 
      });
    }
    
    // Respuesta JSON simple que el frontend espera
    res.json({ 
      success: true, 
      message: 'Sesión cerrada correctamente' 
    });
  });
};