export interface SecondBrainNode {
  id: string
  parent_id: string | null
  title: string
  slug: string
  description: string | null
  color: string | null
  icon: string | null
  sort_order: number
  created_at: string
  updated_at: string
}

export interface SecondBrainDocument {
  id: string
  node_id: string
  title: string
  body: string | null
  body_format: 'html' | 'markdown'
  source_url: string | null
  tags: string[]
  created_at: string
  updated_at: string
}

export interface NodeWithDocuments {
  node: SecondBrainNode
  documents: SecondBrainDocument[]
}

// Fetchers never throw into render; they return this shape. error===null means success.
export interface Result<T> {
  data: T | null
  error: string | null
}
