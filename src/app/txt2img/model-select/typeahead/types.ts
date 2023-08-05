export interface Item {
  index: number;
  name: string;
  models: Model[];
}

export interface Model {
  name: string;
  description: string;
  path: string;
  is_public: boolean;
  is_active: boolean;
  tags: string[];
  info: string;
  type: string;
  version: string;
  image: string;
  id: number;
}