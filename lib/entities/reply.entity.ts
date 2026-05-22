export interface ReplyEntity {
  id: number
  threadId: number
  content: string
  author: string
  createdAt: Date
  isDeleted: boolean
  isNsfw: boolean
  isSpoiler: boolean
  image?: string | null
  imageMetadata?: string | null
  deletionPassword?: string | null
  postNumber: number
  ipAddress?: string | null
  capcode?: string | null
}

export interface CreateReplyCommand {
  threadId: number
  content: string
  author?: string
  imageFile?: File | null
  imageUrl?: string
  imageMetadata?: string
  deletionPassword?: string
  isNsfw?: boolean
  isSpoiler?: boolean
  ipAddress?: string
  capcode?: string | null
}

export interface CreateReplyInput {
  threadId: number
  content: string
  author?: string
  image?: string | null
  imageMetadata?: string | null
  deletionPassword?: string | null
  isNsfw?: boolean
  isSpoiler?: boolean
  postNumber: number
  ipAddress?: string
  createdAt?: Date
  capcode?: string | null
}

export interface ReplyUI {
  id: number
  threadId: number
  content: string
  author: string
  createdAt: Date
  isDeleted: boolean
  isNsfw: boolean
  isSpoiler: boolean
  image?: string | null
  imageMetadata?: string | null
  postNumber: number
  posterId?: string
  capcode?: string | null
}