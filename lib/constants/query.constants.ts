export const USER_AVATAR_SELECT_QUERY = {
  id: true,
  firstName: true,
  fullName: true,
  initials: true,
  avatar: true,
  customAvatar: true,
  team: {
    select: { name: true }
  }
}

export const ASSET_DETAILS_SELECT_QUERY = {
  id: true,
  title: true,
  category: true,
  imageUrls: true,
  createdAt: true,
  currentPhase: true,
  status: true,
  revisionNumber: true,
  revisionDescription: true,
  uploader: {
    select: USER_AVATAR_SELECT_QUERY
  },
  votes: {
    select: {
      id: true,
      voteType: true,
      phase: true,
      weight: true,
      user: {
        select: USER_AVATAR_SELECT_QUERY
      }
    }
  }
}

export const ASSET_REVISION_SELECT_QUERY = {
  id: true,
  imageUrls: true,
  createdAt: true,
  status: true,
  revisionNumber: true,
  revisionDescription: true,
  uploader: {
    select: USER_AVATAR_SELECT_QUERY
  }
}