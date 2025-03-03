import { defineAction } from 'astro:actions';
import { z } from 'astro:schema';

export type User = {
  id: string;
  name: string;
  email: string;
  password: string;
  relatedUsers: string[];
};

const USERS: User[] = [
  {
    id: '1',
    name: 'Alice',
    email: 'alice@alice.com',
    password: 'password',
    relatedUsers: ['2', '3'],
  },
  {
    id: '2',
    name: 'Bob',
    email: 'bob@bob.com',
    password: 'password',
    relatedUsers: ['1', '3'],
  },
  {
    id: '3',
    name: 'Charlie',
    email: 'charlie@charlie.com',
    password: 'password',
    relatedUsers: ['1'],
  },
];

export const user = {
  getAllUsers: defineAction({
    handler: async () => {
      // wait 3 seconds
      await new Promise(resolve => setTimeout(resolve, 3000));
      return { users: USERS, serverTime: new Date().toLocaleTimeString() };
    },
  }),
  getUser: defineAction({
    input: z.object({
      id: z.string(),
    }),
    handler: input => {
      return USERS.find(user => user.id === input.id);
    },
  }),
  createUser: defineAction({
    input: z.object({
      name: z.string(),
      email: z.string(),
      password: z.string(),
    }),
    handler: input => {
      const newUser: User = {
        id: String(USERS.length + 1),
        name: input.name,
        email: input.email,
        password: input.password,
        relatedUsers: [],
      };
      USERS.push(newUser);
      return newUser;
    },
  }),
};
