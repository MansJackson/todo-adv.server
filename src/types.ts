import { Request } from "express";

export type User = {
  id: string;
  name: string;
  email: string;
  username: string;
  password: string;
};

export type List = {
  id: string;
  title: string;
  owner: string;
  editors: string[];
  items: string[];
}

export type UserRequest = Request & { user: User };
