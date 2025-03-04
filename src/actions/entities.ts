import { db } from '@/db';
import { Entity } from '@/db/schema';
import { defineAction } from 'astro:actions';

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

export const entities = {
  getAllEntities: defineAction({
    handler: async () => {
      const entities = await db.select().from(Entity);
      return { entities, serverTime: new Date().toLocaleTimeString() };
    },
  }),
};
