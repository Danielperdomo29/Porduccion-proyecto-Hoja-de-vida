// Controlador para obtener información del usuario actual
exports.getCurrentUser = (req, res) => {
  if (!req.user) {
    // Devolver 200 OK con user: null para evitar errores 401 en consola
    return res.json({ user: null });
  }
  res.json({ user: req.user });
};

// Controlador para logout - VERSIÓN SIMPLIFICADA Y FUNCIONAL
exports.logout = (req, res) => {
  req.logout(function (err) {
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