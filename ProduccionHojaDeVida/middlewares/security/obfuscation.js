const advancedObfuscation = (req, res, next) => {
    res.removeHeader('X-Powered-By');
    res.removeHeader('Server');
    res.setHeader('X-Backend-Server', 'nginx/1.18.0 (Ubuntu)');
    next();
};

module.exports = advancedObfuscation;
