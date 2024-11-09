export interface UserListDetails {
  username: string;
  email: string;
  description: string;
}

export interface UserDetails {
  roleName: string;
  registrationDate: Date;
}

export interface Username {
  available: boolean;
}

export interface JwtPayload {
  userId: number;
  userName: string;
}
