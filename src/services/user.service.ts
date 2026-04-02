import cacheService from "./cache.service";
import { fakeUserRepo, type User } from "../db/fake-user-repo";

class UserService {
  async getUserById(id: number): Promise<User | null> {
    const cacheKey = `user:${id}`;

    // Explicitly tell the cache we expect a User object
    const cached = await cacheService.get<User>(cacheKey);

    if (cached) {
      console.log(`[CACHE HIT] User ${id}`);
      return cached;
    }

    console.log(`[CACHE MISS] User ${id}`);
    const user = await fakeUserRepo.findById(id);

    if (user) {
      await cacheService.set(cacheKey, user, 300);
    }

    return user;
  }

  async createUser(data: { name: string; email: string }) {
    const user = await fakeUserRepo.create(data);

    const cacheKey = `user:${user.id}`;
    await cacheService.set(cacheKey, user, 300);

    return user;
  }

  async updateUser(id: number, data: Partial<User>) {
    const user = await fakeUserRepo.update(id, data);
    if (!user) return null;

    const cacheKey = `user:${id}`;
    await cacheService.set(cacheKey, user, 300);

    return user;
  }
}

export default new UserService();
