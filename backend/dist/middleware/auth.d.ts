import type { Request, Response, NextFunction } from 'express';
import type { RoleName } from '../types/database.types.js';
export declare function authenticateUser(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function optionalAuthenticateUser(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function requireActiveUser(req: Request, res: Response, next: NextFunction): void;
export declare function requireRoles(...allowedRoles: RoleName[]): (req: Request, res: Response, next: NextFunction) => void;
//# sourceMappingURL=auth.d.ts.map