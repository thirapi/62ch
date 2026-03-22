export interface LatestPostEntity {
  id: number
  postNumber: number
  type: "thread" | "reply"
  title: string | null
  excerpt: string
  createdAt: Date
  boardCode: string
  threadId: number | null
  capcode?: string | null
  // Preview fields
  threadSubject?: string | null
  threadExcerpt?: string | null
  threadImage?: string | null
}

export interface RecentImageEntity {
  id: number
  postNumber: number
  imageUrl: string
  createdAt: Date
  boardCode: string
  threadId: number
  isNsfw: boolean
  isSpoiler: boolean
  // Preview fields
  threadSubject?: string | null
  threadExcerpt?: string | null
}

export interface PostInfoEntity {
  id: number
  postNumber: number
  type: "thread" | "reply"
  content: string
  author: string
  createdAt: Date
  image?: string | null
  threadId: number
  boardCode: string
  isNsfw?: boolean
  isSpoiler?: boolean
  capcode?: string | null
}
