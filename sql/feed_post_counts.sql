create or replace function public.feed_post_counts(post_ids uuid[])
returns table (
  post_id uuid,
  likes_count bigint,
  comments_count bigint
)
language sql
stable
as $$
  select p.id as post_id,
         coalesce(l.likes_count, 0) as likes_count,
         coalesce(c.comments_count, 0) as comments_count
  from unnest(post_ids) as p(id)
  left join (
    select post_id, count(*)::bigint as likes_count
    from post_likes
    where post_id = any(post_ids)
    group by post_id
  ) l on l.post_id = p.id
  left join (
    select post_id, count(*)::bigint as comments_count
    from post_comments
    where post_id = any(post_ids)
    group by post_id
  ) c on c.post_id = p.id;
$$;
