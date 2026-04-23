import { Types } from "mongoose";
import User, { IUser } from "../models/User.js";
import Company from "../models/Company.js";
import sendEmail from "../utils/send-email.js";
import AppError from "../utils/AppError.js";
import {
  USER_ROLES,
  USER_STATUSES,
  UserStatusValue,
} from "../constants/user.constants.js";
import {
  createUserSchema,
  listUsersQuerySchema,
  updateUserSchema,
  userIdSchema,
} from "../validators/user.validator.js";
import {
  CompanyRef,
  CreateUserInput,
  GroupedUsersResponse,
  ListUsersQuery,
  UpdateUserInput,
  UserRequestContext,
  UserResponse,
} from "../types/user.types.js";

const getCompanyId = (companyRef: CompanyRef): string | undefined => {
  if (!companyRef) return undefined;
  if (companyRef instanceof Types.ObjectId) return companyRef.toString();
  if ("_id" in companyRef) return companyRef._id.toString();
  return String(companyRef);
};

const getCompanyName = (companyRef: CompanyRef): string | undefined => {
  if (!companyRef || companyRef instanceof Types.ObjectId) return undefined;
  return "name" in companyRef ? companyRef.name : undefined;
};

const formatValidationError = (error: { issues: { message: string }[] }) =>
  error.issues.map((issue) => issue.message).join(", ");

interface UserFilter {
  _id?: string;
  companyId?: string | null;
  role?: string;
  isActive?: boolean;
}

const toUserResponse = (user: IUser): UserResponse => {
  const companyId = getCompanyId(user.companyId as CompanyRef);
  const companyName = getCompanyName(user.companyId as CompanyRef);

  return {
    id: String(user._id),
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    role: user.role,
    permissions: user.permissions,
    companyId,
    company: companyId ? { id: companyId, name: companyName || "Unknown Company" } : undefined,
    isActive: user.isActive,
    status: user.isActive ? USER_STATUSES.ACTIVE : USER_STATUSES.DISABLED,
    isVerified: user.isVerified,
    isEmailVerified: user.isEmailVerified || user.isVerified,
    isFirstLogin: user.isFirstLogin,
    isModuleAssigned: user.isModuleAssigned,
    onboardingCompleted: user.onboarding?.completed || false,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
};

const getScopedUserFilter = (
  id: string,
  context: UserRequestContext
): UserFilter => {
  return context.isSuperAdmin ? { _id: id } : { _id: id, companyId: context.companyId };
};

const resolveCompany = async (
  requestedCompanyId: string | undefined,
  context: UserRequestContext
): Promise<{ id: string; name: string }> => {
  const companyId = context.isSuperAdmin ? requestedCompanyId : context.companyId || undefined;

  if (!companyId) {
    throw new AppError(403, "Company context required for user creation");
  }

  const company = await Company.findById(companyId).select("name");
  if (!company) {
    throw new AppError(404, "Company not found");
  }

  return {
    id: company._id.toString(),
    name: company.name,
  };
};

const sanitizePasswordPart = (value: string) =>
  value.replace(/[^a-zA-Z0-9]/g, "").slice(0, 16) || "Company";

const formatRoleForPassword = (role: string) =>
  role.charAt(0).toUpperCase() + role.slice(1).toLowerCase();

const generateTemporaryPassword = (companyName: string, role: string) => {
  const randomDigits = Math.floor(100 + Math.random() * 900);
  return `${sanitizePasswordPart(companyName)}@${formatRoleForPassword(role)}${randomDigits}`;
};

const hasAssignedModules = (permissions?: Record<string, Record<string, boolean | undefined>>) =>
  Boolean(
    permissions &&
      Object.values(permissions).some((modulePermissions) =>
        Object.values(modulePermissions || {}).some(Boolean)
      )
  );

const FULL_ACCESS_PERMISSIONS = {
  product: { view: true, create: true, update: true, delete: true },
  customer: { view: true, create: true, update: true, delete: true },
  sales: { view: true, create: true, update: true, delete: true },
  invoice: { view: true, create: true, update: true, delete: true },
  payment: { view: true, create: true, update: true, delete: true },
  report: { view: true, create: true, update: true, delete: true },
  user: { view: true, create: true, update: true, delete: true },
};

const resolveCreatePermissions = (
  role: string,
  permissions?: Record<string, Record<string, boolean | undefined>>
) => {
  if (role === USER_ROLES.ADMIN) {
    return FULL_ACCESS_PERMISSIONS;
  }

  return permissions || {};
};

const sendCredentialsEmail = async (
  email: string,
  firstName: string,
  companyName: string,
  temporaryPassword: string
) => {
  const loginUrl = `${process.env.FRONTEND_URL || "http://localhost:3000"}/login`;

  await sendEmail({
    to: email,
    subject: `Your Account Has Been Created at ${companyName}`,
    html: `
      <h2>Your Hisab Kitab account is ready</h2>
      <p>Hi ${firstName},</p>
      <p>Your account has been created for <strong>${companyName}</strong>.</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Temporary password:</strong> ${temporaryPassword}</p>
      <p>Login here: <a href="${loginUrl}">${loginUrl}</a></p>
      <p>You will be asked to change this password on your first login.</p>
      <p>If your account is not fully set up yet, please contact your company admin to assign modules.</p>
    `,
  });
};

export const userService = {
  async listUsers(rawQuery: unknown, context: UserRequestContext) {
    const parsed = listUsersQuerySchema.safeParse(rawQuery);
    if (!parsed.success) {
      throw new AppError(400, formatValidationError(parsed.error));
    }

    const query = parsed.data as ListUsersQuery;
    const filter: UserFilter = {};

    if (context.isSuperAdmin) {
      if (query.companyId) filter.companyId = query.companyId;
    } else {
      filter.companyId = context.companyId;
    }

    if (query.role) filter.role = query.role;
    if (query.status) filter.isActive = query.status === USER_STATUSES.ACTIVE;

    const dbQuery = User.find(filter)
      .select("-password -resetPasswordToken -verificationToken")
      .populate("companyId", "name")
      .sort({ createdAt: -1 });

    const shouldPaginate = Boolean(query.page && query.limit);
    const total = shouldPaginate ? await User.countDocuments(filter) : undefined;

    if (shouldPaginate && query.page && query.limit) {
      dbQuery.skip((query.page - 1) * query.limit).limit(query.limit);
    }

    const users = await dbQuery;

    return {
      data: users.map(toUserResponse),
      pagination:
        shouldPaginate && query.page && query.limit && typeof total === "number"
          ? {
              page: query.page,
              limit: query.limit,
              total,
              pages: Math.ceil(total / query.limit),
            }
          : undefined,
    };
  },

  async listUsersGrouped(context: UserRequestContext): Promise<GroupedUsersResponse[]> {
    const filter: UserFilter = context.isSuperAdmin
      ? {}
      : { companyId: context.companyId };

    const users = await User.find(filter)
      .select("-password -resetPasswordToken -verificationToken")
      .populate("companyId", "name")
      .sort({ createdAt: -1 });

    const grouped = new Map<string, GroupedUsersResponse>();

    for (const user of users) {
      const companyId = getCompanyId(user.companyId as CompanyRef) || "unassigned";
      const companyName = getCompanyName(user.companyId as CompanyRef);
      const current =
        grouped.get(companyId) ||
        {
          company:
            companyId === "unassigned"
              ? null
              : { id: companyId, name: companyName || "Unknown Company" },
          count: 0,
          users: [],
        };

      current.users.push(toUserResponse(user));
      current.count = current.users.length;
      grouped.set(companyId, current);
    }

    return Array.from(grouped.values());
  },

  async getUserById(id: string, context: UserRequestContext): Promise<UserResponse> {
    const parsed = userIdSchema.safeParse({ id });
    if (!parsed.success) {
      throw new AppError(400, formatValidationError(parsed.error));
    }

    const user = await User.findOne(getScopedUserFilter(id, context))
      .select("-password -resetPasswordToken -verificationToken")
      .populate("companyId", "name");

    if (!user) {
      throw new AppError(404, "User not found");
    }

    return toUserResponse(user);
  },

  async createUser(rawInput: CreateUserInput, context: UserRequestContext) {
    const parsed = createUserSchema.safeParse(rawInput);
    if (!parsed.success) {
      throw new AppError(400, formatValidationError(parsed.error));
    }

    const input = parsed.data;
    const company = await resolveCompany(input.companyId, context);

    if (input.role === USER_ROLES.SUPER_ADMIN) {
      throw new AppError(403, "Super admin users cannot be created from user management");
    }

    const role = input.role || USER_ROLES.USER;
    const permissions = resolveCreatePermissions(role, input.permissions);
    const generatedPassword = generateTemporaryPassword(company.name, role);

    const existingUser = await User.findOne({ email: input.email, companyId: company.id });
    if (existingUser) {
      throw new AppError(400, "User with this email already exists in this company");
    }

    const user = new User({
      firstName: input.firstName,
      lastName: input.lastName,
      email: input.email,
      password: generatedPassword,
      role,
      companyId: company.id,
      permissions,
      isActive: true,
      isVerified: true,
      isEmailVerified: true,
      isFirstLogin: true,
      isModuleAssigned: role === USER_ROLES.ADMIN ? true : hasAssignedModules(permissions),
      onboarding: {
        completed: role === USER_ROLES.ADMIN,
      },
    });

    await user.save();

    try {
      await sendCredentialsEmail(input.email, input.firstName, company.name, generatedPassword);
    } catch (error) {
      console.error("[createUser] Failed to send onboarding email:", error);
    }

    const savedUser = await User.findById(user._id)
      .select("-password -resetPasswordToken -verificationToken")
      .populate("companyId", "name");

    if (!savedUser) {
      throw new AppError(500, "Failed to load created user");
    }

    return toUserResponse(savedUser);
  },

  async updateUser(
    id: string,
    rawInput: UpdateUserInput,
    context: UserRequestContext
  ): Promise<UserResponse> {
    const idParsed = userIdSchema.safeParse({ id });
    if (!idParsed.success) {
      throw new AppError(400, formatValidationError(idParsed.error));
    }

    const parsed = updateUserSchema.safeParse(rawInput);
    if (!parsed.success) {
      throw new AppError(400, formatValidationError(parsed.error));
    }

    const input = parsed.data;
    const user = await User.findOne(getScopedUserFilter(id, context));

    if (!user) {
      throw new AppError(404, "User not found");
    }

    if (input.role === USER_ROLES.SUPER_ADMIN) {
      throw new AppError(403, "Super admin role cannot be assigned from user management");
    }

    if (input.companyId) {
      if (!context.isSuperAdmin) {
        throw new AppError(403, "Only super admins can move users between companies");
      }
      await resolveCompany(input.companyId, context);
      user.companyId = new Types.ObjectId(input.companyId);
    }

    if (input.firstName) user.firstName = input.firstName;
    if (input.lastName) user.lastName = input.lastName;
    if (input.role) {
      user.role = input.role;
      if (input.role === USER_ROLES.ADMIN) {
        user.permissions = FULL_ACCESS_PERMISSIONS;
        user.isModuleAssigned = true;
        user.onboarding.completed = true;
      }
    }
    if (input.permissions && user.role !== USER_ROLES.ADMIN) {
      user.permissions = input.permissions;
      user.isModuleAssigned = hasAssignedModules(input.permissions);
    }
    if (typeof input.isActive === "boolean") user.isActive = input.isActive;
    if (typeof input.isFirstLogin === "boolean") user.isFirstLogin = input.isFirstLogin;
    if (typeof input.isModuleAssigned === "boolean") user.isModuleAssigned = input.isModuleAssigned;

    await user.save();

    const savedUser = await User.findById(user._id)
      .select("-password -resetPasswordToken -verificationToken")
      .populate("companyId", "name");

    if (!savedUser) {
      throw new AppError(404, "User not found");
    }

    return toUserResponse(savedUser);
  },

  async toggleStatus(id: string, context: UserRequestContext): Promise<UserResponse> {
    const user = await User.findOne(getScopedUserFilter(id, context));

    if (!user) {
      throw new AppError(404, "User not found");
    }

    if (context.userId === id) {
      throw new AppError(400, "Cannot disable your own account");
    }

    user.isActive = !user.isActive;
    await user.save();

    const savedUser = await User.findById(user._id)
      .select("-password -resetPasswordToken -verificationToken")
      .populate("companyId", "name");

    if (!savedUser) {
      throw new AppError(404, "User not found");
    }

    return toUserResponse(savedUser);
  },

  async deleteUser(id: string, context: UserRequestContext): Promise<void> {
    if (context.userId === id) {
      throw new AppError(400, "Cannot delete your own user account");
    }

    const user = await User.findOneAndDelete(getScopedUserFilter(id, context));
    if (!user) {
      throw new AppError(404, "User not found");
    }
  },
};
