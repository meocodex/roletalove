import { Request, Response } from 'express';
import { z } from 'zod';
import { hashPassword, comparePassword, generateToken, refreshToken, extractTokenFromHeader } from './auth-utils';
import { dbService } from './db-service';

// Schemas de validação
const registerSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  phone: z.string().min(10, 'Telefone deve ter pelo menos 10 dígitos').max(15, 'Telefone inválido'),
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
  planType: z.enum(['basico', 'intermediario', 'completo']).default('basico')
});

const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'Senha obrigatória')
});

// Simulação de banco de dados (substituir por Drizzle na Fase 2.2)
export let MOCK_USERS: Array<{
  id: string;
  email: string;
  name: string;
  password: string;
  planType: 'basico' | 'intermediario' | 'completo';
  userRole: 'user' | 'admin' | 'super_admin';
  isActive: boolean;
  createdAt: Date;
  lastLoginAt?: Date;
}> = [
  // Usuário admin padrão para testes
  {
    id: 'admin-001',
    email: 'admin@roleta.app',
    name: 'Administrador',
    password: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj3nOcL2JEse', // password: admin123
    planType: 'completo',
    userRole: 'admin',
    isActive: true,
    createdAt: new Date(),
    lastLoginAt: new Date()
  }
];

// POST /api/auth/register
export async function registerUser(req: Request, res: Response) {
  try {
    const validatedData = registerSchema.parse(req.body);
    
    // Verificar se email já existe
    const existingUser = await dbService.findUserByEmail(validatedData.email);
    if (existingUser) {
      return res.status(400).json({
        error: 'Email already exists',
        message: 'Este email já está cadastrado'
      });
    }

    // Criar novo usuário (senha será hasheada no dbService)
    const newUser = await dbService.createUser({
      name: validatedData.name,
      phone: validatedData.phone,
      email: validatedData.email,
      password: validatedData.password,
      planType: validatedData.planType
    });

    // Gerar token
    const token = generateToken({
      id: newUser.id,
      email: newUser.email,
      name: newUser.name,
      planType: newUser.planType,
      userRole: newUser.userRole
    });

    res.status(201).json({
      message: 'Usuário criado com sucesso',
      user: newUser,
      token,
      expiresIn: '7d'
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'Dados inválidos',
        details: error.errors
      });
    }

    console.error('Register error:', error);
    res.status(500).json({
      error: 'Registration failed',
      message: 'Falha no cadastro'
    });
  }
}

// POST /api/auth/login
export async function loginUser(req: Request, res: Response) {
  try {
    const validatedData = loginSchema.parse(req.body);
    
    // Buscar usuário (com senha)
    const user = await dbService.findUserByEmail(validatedData.email);
    if (!user) {
      return res.status(401).json({
        error: 'Invalid credentials',
        message: 'Email ou senha incorretos'
      });
    }

    // Verificar se conta está ativa
    if (!user.isActive) {
      return res.status(401).json({
        error: 'Account disabled',
        message: 'Conta desativada'
      });
    }

    // Verificar senha
    const passwordValid = await comparePassword(validatedData.password, user.password);
    if (!passwordValid) {
      return res.status(401).json({
        error: 'Invalid credentials',
        message: 'Email ou senha incorretos'
      });
    }

    // Atualizar último login
    await dbService.updateUserLastLogin(user.id);

    // Gerar token
    const token = generateToken({
      id: user.id,
      email: user.email,
      name: user.name,
      planType: user.planType,
      userRole: user.userRole
    });

    // Retornar dados do usuário (sem senha) + token
    const { password, ...userWithoutPassword } = user;
    
    res.json({
      message: 'Login realizado com sucesso',
      user: userWithoutPassword,
      token,
      expiresIn: '7d'
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'Dados inválidos',
        details: error.errors
      });
    }

    console.error('Login error:', error);
    res.status(500).json({
      error: 'Login failed',
      message: 'Falha no login'
    });
  }
}

// POST /api/auth/refresh
export async function refreshUserToken(req: Request, res: Response) {
  try {
    const token = extractTokenFromHeader(req);
    
    if (!token) {
      return res.status(401).json({
        error: 'Token required',
        message: 'Token obrigatório'
      });
    }

    const newToken = refreshToken(token);
    
    if (!newToken) {
      return res.status(403).json({
        error: 'Token refresh failed',
        message: 'Falha ao renovar token'
      });
    }

    res.json({
      message: 'Token renovado com sucesso',
      token: newToken,
      expiresIn: '7d'
    });

  } catch (error) {
    console.error('Refresh token error:', error);
    res.status(500).json({
      error: 'Token refresh failed',
      message: 'Falha ao renovar token'
    });
  }
}

// POST /api/auth/logout
export function logoutUser(req: Request, res: Response) {
  // Com JWT stateless, logout é apenas do lado cliente
  // Em uma implementação mais robusta, manteria uma blacklist de tokens
  res.json({
    message: 'Logout realizado com sucesso'
  });
}

// GET /api/auth/me - Verificar usuário logado
export async function getCurrentUser(req: Request, res: Response) {
  const user = (req as any).user;
  
  if (!user) {
    return res.status(401).json({
      error: 'Not authenticated',
      message: 'Não autenticado'
    });
  }

  try {
    // Buscar dados atualizados do usuário
    const currentUser = await dbService.findUserById(user.id);
    
    if (!currentUser || !currentUser.isActive) {
      return res.status(401).json({
        error: 'User not found or inactive',
        message: 'Usuário não encontrado ou inativo'
      });
    }

    res.json({
      user: currentUser
    });

  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({
      error: 'Failed to get user data',
      message: 'Falha ao obter dados do usuário'
    });
  }
}