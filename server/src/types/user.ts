// Як User зберігається в БД
export interface User {
  id: number;
  email: string;
  name: string;
  passwordHash: string;
  createdAt: Date;
  updatedAt: Date;
}

// DTO для запиту реєстрації
export interface CreateUserDTO {
  email: string;
  name: string;
  password: string;
  confirmPassword: string;
}

// DTO для збереження користувача в БД
export type CreateUserSafeDTO = Omit<CreateUserDTO, 'confirmPassword'>;

// DTO для відповіді
export type UserResponse = Omit<User, 'passwordHash'>;

// DTO для оновлення (всі поля необов’язкові)
export type UpdateUserDTO = Partial<CreateUserDTO>;
