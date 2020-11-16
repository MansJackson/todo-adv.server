import { Request } from 'express';

export type User = {
  id: string;
  name: string;
  email: string;
  password: string;
  shared: string[];
};

export type List = {
  id: string;
  title: string;
  owner: {
    id: string,
    initials: string,
    mousePosition: { x: number, y: number },
    connected: boolean,
  };
  editors: {
    id: string,
    initials: string,
    mousePosition: { x: number, y: number },
    connected: boolean,
    color: number,
  }[];
  items: { id: string, text: string, completed: boolean }[];
};

export type AuthenticatedReq = Request & { user: User };
