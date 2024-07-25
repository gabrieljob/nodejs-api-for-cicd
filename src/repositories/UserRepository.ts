import User, { UserModel } from "../entities/User";

export class UserRepository {
  async getAll(): Promise<UserModel[]> {
    try {
      const query = await User.findAll();
      return query;
    } catch {
      throw new Error();
    }
  }

  async createUser(user: User): Promise<UserModel> {
    try {
      const query = await User.create(
        {
          name: user.name,
          email: user.email,
          password: user.password,
          role: user.role,
        },
        {
          returning: true,
        }
      );
      return query;
    } catch (err: any) {
      throw new Error(err);
    }
  }

  async updateUser(id: number, user: User): Promise<UserModel> {
    try {
      await User.update(user, { where: { id }, returning: true });

      const query = await User.findOne({ where: { id } });

      if (query) {
        return query;
      }

      return user;
    } catch {
      throw new Error();
    }
  }

  async deleteUser(id: number): Promise<null> {
    try {
      await User.destroy({ where: { id } });
      return null;
    } catch {
      throw new Error();
    }
  }

  async login(email: string, password: string): Promise<UserModel | null> {
    try {
      const query = await User.findOne({ where: { email, password } });
      if (!query) return null;
      return query;
    } catch {
      throw new Error();
    }
  }

  async getById(id: number): Promise<UserModel | null> {
    try {
      const query = await User.findOne({ where: { id } });
      if (!query) return null;
      return query;
    } catch {
      throw new Error();
    }
  }
}
