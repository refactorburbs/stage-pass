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

export type UploadAssetFormState = {
  errors?: {
    imageUrl?: string[]
    title?: string[]
    category?: string[]
  }
  message?: string
} | undefined;

export type UpdateUserProfileFormState = {
  errors?: {
    customAvatar?: string[]
  }
  message?: string
} | undefined;