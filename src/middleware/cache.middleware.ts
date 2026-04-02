import { Request, Response, NextFunction } from "express";
import cacheService from "../services/cache.service";

export function cacheMiddleware(ttlSeconds: number = 300) {
  return async (req: Request, res: Response, next: NextFunction) => {
    // only cache GET requests
    if (req.method !== "GET") {
      return next();
    }

    const cacheKey = `cache:${req.originalUrl}`;

    // try to get from cache
    const cached = await cacheService.get(cacheKey);
    if (cached) {
      return res.json(cached);
    }

    // store original json method
    const originalJson = res.json.bind(res);

    // override json to cache response
    res.json = function (body: any) {
      cacheService.set(cacheKey, body, ttlSeconds);
      return originalJson(body);
    };

    next();
  };
}
