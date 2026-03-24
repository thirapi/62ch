
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema/users';
import { User } from '@/lib/entities/user.entity';
import { eq } from 'drizzle-orm';

export interface IUserRepository {
  getUserByEmail(email: string): Promise<User | null>;
  findById(id: string): Promise<User | null>;
  create(data: Omit<User, 'id'>): Promise<User>;
  delete(id: string): Promise<void>;
}

export class UserRepository implements IUserRepository {
  async getUserByEmail(email: string): Promise<User | null> {
    const result = await db.query.users.findFirst({
      where: eq(users.email, email),
    });

    if (!result) return null;

    return {
      ...result,
      role: result.role as User['role'],
    };
  }

  async findById(id: string): Promise<User | null> {
    const result = await db.query.users.findFirst({
      where: eq(users.id, id),
    });

    if (!result) return null;

    return {
      ...result,
      role: result.role as User['role'],
    };
  }

  async create(data: Omit<User, 'id'>): Promise<User> {
    const id = crypto.randomUUID();
    const [row] = await db
      .insert(users)
      .values({
        id,
        email: data.email,
        hashedPassword: data.hashedPassword,
        role: data.role,
      })
      .returning();

    return {
      ...row,
      role: row.role as User['role'],
    };
  }

  async delete(id: string): Promise<void> {
    await db.delete(users).where(eq(users.id, id));
  }
}

