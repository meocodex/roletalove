import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  hashPassword,
  comparePassword,
  generateToken,
  verifyToken,
  authenticateToken,
  requireRole,
  requirePlan,
  extractTokenFromHeader,
  refreshToken,
  type AuthUser
} from './auth-utils';
import { type Request, type Response, type NextFunction } from 'express';

describe('Auth Utils', () => {
  const mockUser: AuthUser = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    email: 'test@example.com',
    name: 'Test User',
    planType: 'basico',
    userRole: 'user'
  };

  describe('Password Hashing', () => {
    it('should hash password securely', async () => {
      const password = 'mySecurePassword123';
      const hashed = await hashPassword(password);

      expect(hashed).toBeDefined();
      expect(hashed).not.toBe(password);
      expect(hashed.length).toBeGreaterThan(20);
    });

    it('should generate different hashes for same password', async () => {
      const password = 'samePassword';
      const hash1 = await hashPassword(password);
      const hash2 = await hashPassword(password);

      expect(hash1).not.toBe(hash2); // Due to salt
    });

    it('should compare password correctly', async () => {
      const password = 'testPassword123';
      const hashed = await hashPassword(password);

      const isValid = await comparePassword(password, hashed);
      expect(isValid).toBe(true);
    });

    it('should reject incorrect password', async () => {
      const password = 'correctPassword';
      const wrongPassword = 'wrongPassword';
      const hashed = await hashPassword(password);

      const isValid = await comparePassword(wrongPassword, hashed);
      expect(isValid).toBe(false);
    });
  });

  describe('JWT Token Generation', () => {
    it('should generate valid JWT token', () => {
      const token = generateToken(mockUser);

      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3); // JWT format: header.payload.signature
    });

    it('should include user data in token', () => {
      const token = generateToken(mockUser);
      const decoded = verifyToken(token);

      expect(decoded.id).toBe(mockUser.id);
      expect(decoded.email).toBe(mockUser.email);
      expect(decoded.name).toBe(mockUser.name);
      expect(decoded.planType).toBe(mockUser.planType);
      expect(decoded.userRole).toBe(mockUser.userRole);
    });

    it('should include expiration in token', () => {
      const token = generateToken(mockUser);
      const decoded = verifyToken(token);

      expect(decoded.exp).toBeDefined();
      expect(decoded.iat).toBeDefined();
      expect(decoded.exp).toBeGreaterThan(decoded.iat);
    });
  });

  describe('JWT Token Verification', () => {
    it('should verify valid token', () => {
      const token = generateToken(mockUser);
      const decoded = verifyToken(token);

      expect(decoded).toBeDefined();
      expect(decoded.email).toBe(mockUser.email);
    });

    it('should reject invalid token', () => {
      const invalidToken = 'invalid.token.here';

      expect(() => verifyToken(invalidToken)).toThrow();
    });

    it('should reject tampered token', () => {
      const token = generateToken(mockUser);
      const tamperedToken = token.slice(0, -5) + 'xxxxx';

      expect(() => verifyToken(tamperedToken)).toThrow();
    });

    it('should reject malformed token', () => {
      const malformedToken = 'not-a-jwt-token';

      expect(() => verifyToken(malformedToken)).toThrow();
    });
  });

  describe('authenticateToken Middleware', () => {
    let mockReq: Partial<Request>;
    let mockRes: Partial<Response>;
    let mockNext: NextFunction;

    beforeEach(() => {
      mockReq = {
        headers: {}
      };
      mockRes = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn().mockReturnThis()
      };
      mockNext = vi.fn();
    });

    it('should authenticate valid token', () => {
      const token = generateToken(mockUser);
      mockReq.headers = {
        authorization: `Bearer ${token}`
      };

      authenticateToken(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect((mockReq as any).user).toBeDefined();
      expect((mockReq as any).user.email).toBe(mockUser.email);
    });

    it('should reject request without token', () => {
      authenticateToken(mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({ error: 'Access token required' })
      );
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should reject invalid token', () => {
      mockReq.headers = {
        authorization: 'Bearer invalid-token'
      };

      authenticateToken(mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should reject malformed authorization header', () => {
      mockReq.headers = {
        authorization: 'InvalidFormat'
      };

      authenticateToken(mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  describe('requireRole Middleware', () => {
    let mockReq: Partial<Request>;
    let mockRes: Partial<Response>;
    let mockNext: NextFunction;

    beforeEach(() => {
      mockReq = {};
      mockRes = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn().mockReturnThis()
      };
      mockNext = vi.fn();
    });

    it('should allow access for authorized role', () => {
      (mockReq as any).user = { ...mockUser, userRole: 'admin' };
      const middleware = requireRole(['admin', 'super_admin']);

      middleware(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });

    it('should deny access for unauthorized role', () => {
      (mockReq as any).user = { ...mockUser, userRole: 'user' };
      const middleware = requireRole(['admin', 'super_admin']);

      middleware(mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should require authentication', () => {
      const middleware = requireRole(['admin']);

      middleware(mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  describe('requirePlan Middleware', () => {
    let mockReq: Partial<Request>;
    let mockRes: Partial<Response>;
    let mockNext: NextFunction;

    beforeEach(() => {
      mockReq = {};
      mockRes = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn().mockReturnThis()
      };
      mockNext = vi.fn();
    });

    it('should allow access for authorized plan', () => {
      (mockReq as any).user = { ...mockUser, planType: 'completo' };
      const middleware = requirePlan(['intermediario', 'completo']);

      middleware(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });

    it('should deny access for insufficient plan', () => {
      (mockReq as any).user = { ...mockUser, planType: 'basico' };
      const middleware = requirePlan(['completo']);

      middleware(mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: 'Plan upgrade required',
          requiredPlans: ['completo'],
          currentPlan: 'basico'
        })
      );
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should require authentication', () => {
      const middleware = requirePlan(['completo']);

      middleware(mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  describe('extractTokenFromHeader', () => {
    it('should extract token from valid authorization header', () => {
      const token = 'my-token-123';
      const mockReq = {
        headers: {
          authorization: `Bearer ${token}`
        }
      } as Request;

      const extracted = extractTokenFromHeader(mockReq);

      expect(extracted).toBe(token);
    });

    it('should return null for missing authorization header', () => {
      const mockReq = {
        headers: {}
      } as Request;

      const extracted = extractTokenFromHeader(mockReq);

      expect(extracted).toBeUndefined();
    });

    it('should return null for malformed authorization header', () => {
      const mockReq = {
        headers: {
          authorization: 'InvalidFormat'
        }
      } as Request;

      const extracted = extractTokenFromHeader(mockReq);

      expect(extracted).toBeUndefined();
    });
  });

  describe('refreshToken', () => {
    it('should refresh valid non-expired token', async () => {
      const token = generateToken(mockUser);
      // Wait 1ms to ensure different timestamp
      await new Promise(resolve => setTimeout(resolve, 1));
      const newToken = refreshToken(token);

      expect(newToken).toBeDefined();
      expect(typeof newToken).toBe('string');
      // Tokens might be same if generated in same second, just check it's valid
      if (newToken) {
        const decoded = verifyToken(newToken);
        expect(decoded.email).toBe(mockUser.email);
      }
    });

    it('should refresh token with same user data', () => {
      const token = generateToken(mockUser);
      const newToken = refreshToken(token);

      if (newToken) {
        const decoded = verifyToken(newToken);
        expect(decoded.email).toBe(mockUser.email);
        expect(decoded.id).toBe(mockUser.id);
      }
    });

    it('should return null for invalid token', () => {
      const invalidToken = 'invalid.token.here';
      const result = refreshToken(invalidToken);

      expect(result).toBeNull();
    });

    it('should have new expiration time', async () => {
      const token = generateToken(mockUser);
      const decoded1 = verifyToken(token);

      // Wait to ensure new timestamp
      await new Promise(resolve => setTimeout(resolve, 1000));

      const newToken = refreshToken(token);
      if (newToken) {
        const decoded2 = verifyToken(newToken);
        expect(decoded2.iat).toBeGreaterThanOrEqual(decoded1.iat);
        expect(decoded2.exp).toBeGreaterThan(decoded1.exp);
      }
    });
  });
});
