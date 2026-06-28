-- Second Brain knowledge graph: adjacency-list tree (nodes) + notes (documents).
-- Public read via RLS; all writes go through the service role (RLS-bypassing) MCP server.

create table nodes (
  id uuid primary key default gen_random_uuid(),
  parent_id uuid references nodes(id) on delete restrict,   -- restrict: cannot delete a node that still has children (prevents accidental subtree wipe)
  title text not null,
  slug text not null,
  description text,
  color text,
  icon text,
  sort_order int default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique (parent_id, slug)
);
create index on nodes(parent_id);
-- unique(parent_id,slug) does NOT constrain roots (NULL parents are distinct in Postgres),
-- so enforce root-slug uniqueness explicitly.
create unique index nodes_root_slug_unique on nodes (slug) where parent_id is null;

create table documents (
  id uuid primary key default gen_random_uuid(),
  node_id uuid not null references nodes(id) on delete cascade,  -- deleting a node removes its own notes (intended)
  title text not null,
  body text,                       -- HTML (sanitized at write) OR Markdown (converted+sanitized at render), per body_format
  body_format text not null default 'html' check (body_format in ('html','markdown')),
  source_url text,
  tags text[] default '{}',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
create index on documents(node_id);

-- RLS: every row is world-readable (v1 has no draft/private gate); no write policy => only the
-- service role (which bypasses RLS) can mutate. Every MCP write is world-readable once synced.
alter table nodes enable row level security;
alter table documents enable row level security;
create policy "public read nodes" on nodes for select using (true);
create policy "public read documents" on documents for select using (true);

-- Seed: 3 EMPTY root domains only. All sub-topics and notes are added later via the MCP server.
insert into nodes (title, slug, description, color, icon, sort_order)
  values ('Software Engineering', 'software-engineering', 'Systems, code, and the craft of building software.', '#6366f1', '💻', 0);
insert into nodes (title, slug, description, color, icon, sort_order)
  values ('Music Learning', 'music-learning', 'Theory, instruments, and ear training.', '#ec4899', '🎵', 1);
insert into nodes (title, slug, description, color, icon, sort_order)
  values ('English Learning', 'english-learning', 'Vocabulary, grammar, and fluency.', '#22c55e', '📖', 2);
