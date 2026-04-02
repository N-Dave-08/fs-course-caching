export type User = { id: number; name: string; email: string };

const users = new Map<number, User>([
  [1, { id: 1, name: "Alice", email: "alice@example.com" }],
  [2, { id: 2, name: "Bob", email: "bob@example.com" }],
]);

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

export const fakeUserRepo = {
  async findById(id: number): Promise<User | null> {
    // Simulate DB latency so cache benefits are visible
    await sleep(50);
    return users.get(id) ?? null;
  },

  async create(data: Omit<User, "id">): Promise<User> {
    await sleep(50);
    const id = Math.max(0, ...users.keys()) + 1;
    const user: User = { id, ...data };
    users.set(id, user);
    return user;
  },

  async update(
    id: number,
    data: Partial<Omit<User, "id">>,
  ): Promise<User | null> {
    await sleep(50);
    const existing = users.get(id);
    if (!existing) return null;
    const updated: User = { ...existing, ...data };
    users.set(id, updated);
    return updated;
  },
};
