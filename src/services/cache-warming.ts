import cacheService from "./cache.service";

type User = { id: number; name: string; email: string };
const users: User[] = [
  { id: 1, name: "Alice", email: "alice@example.com" },
  { id: 2, name: "Bob", email: "bob@example.com" },
  { id: 3, name: "Jacob", email: "jacob@example.com" },
];

class CacheWarming {
  async warmOnStartup(): Promise<void> {
    for (const user of users.slice(0, 100)) {
      await cacheService.set(`user:${user.id}`, user, 3600);
    }
  }

  async scheduleWarm(): Promise<void> {
    for (const user of users.slice(0, 50)) {
      await cacheService.set(`user:${user.id}`, user, 3600);
    }
  }

  async warmUser(userId: number): Promise<void> {
    const user = users.find((u) => u.id === userId);
    if (user) {
      await cacheService.set(`user:${user.id}`, user, 3600);
    }
  }
}

export default new CacheWarming();
