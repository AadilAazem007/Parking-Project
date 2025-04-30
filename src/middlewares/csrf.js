import crypto from 'crypto'

const generateCsrfToken = () => {
    return crypto.randomBytes(32).toString('hex');
};

const csrfProtection = (req, res, next) => {
    if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
        let token = req.cookies['csrf_token'];
        if (!token) {
            token = generateCsrfToken();
            res.cookie('csrf_token', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict'
            });
        }
        res.setHeader('X-CSRF-Token', token);
        req.csrfToken = () => token;
        return next();
    }

    const token = req.cookies['csrf_token'];
    const providedToken = req.headers['x-csrf-token'] || req.body._csrf;

    if (!token || !providedToken || token !== providedToken) {
        return res.status(403).json({
            success: false,
            message: 'Invalid CSRF token'
        });
    }

    next();
};

export default csrfProtection;