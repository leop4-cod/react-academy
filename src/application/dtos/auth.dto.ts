export interface LoginRequestDto {
  username: string;
  password?: string;
}

export interface LoginResponseDto {
  token: string;
  user: {
    id: number;
    username: string;
    email: string;
    first_name: string;
    last_name: string;
    role?: string;
  };
}
