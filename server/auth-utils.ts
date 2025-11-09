import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { Request, Response, NextFunction } from 'express';

// Configurações
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-key-change-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  planType: string;
  userRole: string;
}

export interface JWTPayload extends AuthUser {
  iat: number;
  exp: number;
}

// Hash password
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 12;
  return bcrypt.hash(password, saltRounds);
}

// Compare password
export async function comparePassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

// Generate JWT token
export function generateToken(user: AuthUser): string {
  return jwt.sign(user, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  } as jwt.SignOptions);
}

// Verify JWT token
export function verifyToken(token: string): JWTPayload {
  return jwt.verify(token, JWT_SECRET) as JWTPayload;
}

// Middleware para autenticação
export function authenticateToken(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ 
      error: 'Access token required',
      message: 'Token de acesso obrigatório' 
    });
  }

  try {
    const decoded = verifyToken(token);
    (req as any).user = decoded;
    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(403).json({ 
        error: 'Invalid token',
        message: 'Token inválido' 
      });
    }
    
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(403).json({ 
        error: 'Token expired',
        message: 'Token expirado' 
      });
    }

    return res.status(500).json({ 
      error: 'Token verification failed',
      message: 'Falha na verificação do token' 
    });
  }
}

// Middleware para validar roles/planos
export function requireRole(roles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user as JWTPayload;
    
    if (!user) {
      return res.status(401).json({ 
        error: 'Authentication required',
        message: 'Autenticação obrigatória' 
      });
    }

    if (!roles.includes(user.userRole)) {
      return res.status(403).json({ 
        error: 'Insufficient permissions',
        message: 'Permissões insuficientes' 
      });
    }

    next();
  };
}

// Middleware para validar planos
export function requirePlan(plans: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user as JWTPayload;
    
    if (!user) {
      return res.status(401).json({ 
        error: 'Authentication required',
        message: 'Autenticação obrigatória' 
      });
    }

    if (!plans.includes(user.planType)) {
      return res.status(403).json({ 
        error: 'Plan upgrade required',
        message: `Plano ${plans.join(' ou ')} necessário`,
        requiredPlans: plans,
        currentPlan: user.planType
      });
    }

    next();
  };
}

// Utilitário para extrair token do header
export function extractTokenFromHeader(req: Request): string | null {
  const authHeader = req.headers['authorization'];
  const token = authHeader?.split(' ')[1];
  return token ?? null;
}

// Refresh token (implementação básica)
export function refreshToken(oldToken: string): string | null {
  try {
    const decoded = jwt.verify(oldToken, JWT_SECRET, { ignoreExpiration: true }) as JWTPayload;
    
    // Verificar se o token não é muito antigo (ex: máximo 30 dias)
    const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
    if (decoded.iat * 1000 < thirtyDaysAgo) {
      return null; // Token muito antigo
    }

    // Gerar novo token com os mesmos dados do usuário
    const { iat, exp, ...userPayload } = decoded;
    return generateToken(userPayload);
  } catch (error) {
    return null;
  }
}