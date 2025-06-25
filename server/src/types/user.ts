// Як User зберігається в БД
export interface User {
  id: string;              // UUID
  email: string;
  name: string;
  passwordHash: string;
  createdAt: Date;
  updatedAt: Date;
}

// DTO для запиту реєстрації (з confirmPassword)
export interface CreateUserDTO {
  email: string;
  name: string;
  password: string;
  confirmPassword: string;
}

// DTO для збереження користувача в БД (без confirmPassword) - ?????????????
export type CreateUserSafeDTO = Omit<CreateUserDTO, 'confirmPassword'>;

// DTO для відповіді (без passwordHash) - ?????????????????
export type UserResponse = Omit<User, 'passwordHash'>;

// DTO для оновлення користувача (усі поля необов’язкові)
export type UpdateUserDTO = Partial<CreateUserDTO>;
