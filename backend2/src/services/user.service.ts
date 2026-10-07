export interface User {
    id: number;
    name: string;
}

export class UserService {
    private static users: User[] = [{ id: 1, name: 'Ghofur' }];

    static async getAllUsers(): Promise<User[]> {
        return this.users;
    }

    static async createUser(name: string): Promise<User> {
        const newUser: User = { id: Date.now(), name };
        this.users.push(newUser);
        return newUser;
    }
}