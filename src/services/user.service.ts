import { prisma } from "@/lib/db/prisma";
import { hashPassword } from "@/lib/auth/password";
import { requireRole } from "@/lib/permissions/rbac";
import type { CreateUserInput, UpdateUserInput } from "@/lib/validations/user";
import type { Role } from "@prisma/client";

export async function getStaffUsers() {
  await requireRole(["OWNER"]);

  return prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
      _count: {
        select: {
          orders: true,
        },
      },
    },
    orderBy: { createdAt: "asc" },
  });
}

export async function createStaffUser(input: CreateUserInput) {
  const currentSession = await requireRole(["OWNER"]);

  const existing = await prisma.user.findUnique({
    where: { email: input.email.toLowerCase().trim() },
  });

  if (existing) {
    throw new Error("Email ini telah digunakan oleh akun staf lain.");
  }

  const passwordHash = await hashPassword(input.password);

  const newUser = await prisma.user.create({
    data: {
      name: input.name.trim(),
      email: input.email.toLowerCase().trim(),
      passwordHash,
      role: input.role as Role,
      isActive: true,
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isActive: true,
      createdAt: true,
    },
  });

  await prisma.auditLog.create({
    data: {
      userId: currentSession.userId,
      action: "USER_CREATED",
      entity: "USER",
      entityId: newUser.id,
      details: {
        createdUserName: newUser.name,
        createdUserEmail: newUser.email,
        createdUserRole: newUser.role,
        createdBy: currentSession.email,
      },
    },
  });

  return newUser;
}

export async function toggleUserActiveStatus(userId: string, isActive: boolean) {
  const currentSession = await requireRole(["OWNER"]);

  if (currentSession.userId === userId) {
    throw new Error("Anda tidak dapat menonaktifkan akun Owner Anda sendiri.");
  }

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: { isActive },
    select: {
      id: true,
      name: true,
      email: true,
      isActive: true,
      role: true,
    },
  });

  await prisma.auditLog.create({
    data: {
      userId: currentSession.userId,
      action: isActive ? "USER_ACTIVATED" : "USER_DEACTIVATED",
      entity: "USER",
      entityId: userId,
      details: {
        targetUser: updatedUser.name,
        newStatus: isActive ? "ACTIVE" : "INACTIVE",
        performedBy: currentSession.email,
      },
    },
  });

  return updatedUser;
}

export async function updateUserRole(userId: string, role: Role) {
  const currentSession = await requireRole(["OWNER"]);

  if (currentSession.userId === userId && role !== "OWNER") {
    throw new Error("Anda tidak dapat mengubah peran Anda sendiri dari Owner.");
  }

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: { role },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
    },
  });

  await prisma.auditLog.create({
    data: {
      userId: currentSession.userId,
      action: "USER_ROLE_CHANGED",
      entity: "USER",
      entityId: userId,
      details: {
        targetUser: updatedUser.name,
        newRole: role,
        performedBy: currentSession.email,
      },
    },
  });

  return updatedUser;
}

export async function updateStaffUser(input: UpdateUserInput) {
  const currentSession = await requireRole(["OWNER"]);

  // 1. Check if user exists
  const existingUser = await prisma.user.findUnique({
    where: { id: input.userId },
  });

  if (!existingUser) {
    throw new Error("Pengguna tidak ditemukan.");
  }

  // 2. Prevent owner from demoting themselves away from OWNER
  if (currentSession.userId === input.userId && input.role !== "OWNER") {
    throw new Error("Anda tidak dapat mengubah peran Anda sendiri dari Owner.");
  }

  // 3. If email changed, check for duplicate email
  const targetEmail = input.email.toLowerCase().trim();
  if (targetEmail !== existingUser.email) {
    const emailConflict = await prisma.user.findUnique({
      where: { email: targetEmail },
    });
    if (emailConflict) {
      throw new Error("Email ini telah digunakan oleh akun staf lain.");
    }
  }

  // 4. Handle password hashing if provided
  let passwordHash: string | undefined;
  if (input.password && input.password.trim().length > 0) {
    if (input.password.trim().length < 6) {
      throw new Error("Kata sandi baru minimal 6 karakter.");
    }
    passwordHash = await hashPassword(input.password.trim());
  }

  // 5. Update user in database
  const updatedUser = await prisma.user.update({
    where: { id: input.userId },
    data: {
      name: input.name.trim(),
      email: targetEmail,
      role: input.role as Role,
      ...(passwordHash ? { passwordHash } : {}),
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isActive: true,
      updatedAt: true,
    },
  });

  // 6. Record audit log non-blocking
  prisma.auditLog
    .create({
      data: {
        userId: currentSession.userId,
        action: "USER_UPDATED",
        entity: "USER",
        entityId: updatedUser.id,
        details: {
          targetUser: updatedUser.name,
          email: updatedUser.email,
          role: updatedUser.role,
          passwordReset: Boolean(passwordHash),
          performedBy: currentSession.email,
        },
      },
    })
    .catch((err) => console.warn("Failed to create user update audit log:", err));

  return updatedUser;
}

export async function getRecentAuditLogs(limit: number = 20) {
  await requireRole(["OWNER"]);

  return prisma.auditLog.findMany({
    take: limit,
    orderBy: { createdAt: "desc" },
    include: {
      user: {
        select: {
          name: true,
          email: true,
          role: true,
        },
      },
    },
  });
}
