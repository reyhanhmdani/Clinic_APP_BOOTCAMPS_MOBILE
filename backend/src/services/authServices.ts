import { LoginInput } from '../validation/userSchema.js';
import prisma from '../config/prisma.js';
import { ApiError } from '../utils/apiError.js';
import bcrypt from 'bcryptjs';
import jwt, { JwtPayload } from 'jsonwebtoken';

export const loginService = async ({ email, password }: LoginInput) => {
  const existingUser = await prisma.user.findUnique({
    where: { email: email },
  });

  if (!existingUser || !(await bcrypt.compare(password, existingUser.password))) {
    throw new ApiError(401, 'email atau password salah');
  }

  const token = jwt.sign(
    {
      id: existingUser.id,
      username: existingUser.username,
      email: existingUser.email,
      role: existingUser.role,
    },
    process.env.JWT_SECRET as string,
    { expiresIn: process.env.JWT_EXPIRES_IN || ('24h' as any) },
  );

  const { password: _, ...userWithoutPassword } = existingUser;

  return {
    token,
    user: userWithoutPassword,
  };
};
