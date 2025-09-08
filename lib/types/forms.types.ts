export type AuthFormState = {
  errors?: {
    firstName?: string[]
    lastName?: string[]
    email?: string[]
    password?: string[]
    confirmPassword?: string[]
    inviteCode?: string[]
    avatar?: string[]
    customAvatarUrl?: string[]
  }
  message?: string
} | undefined;