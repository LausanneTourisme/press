import { config } from 'dotenv';
import fs from 'fs';
import { glob } from 'glob';

config();

const GRAPHQL_URL = process.env.GRAPHQL_URL;
const TOKEN = process.env.GRAPHQL_TOKEN;
const ARTICLES_DIR = new URL('../src/lib/mocks/responses/articles', import.meta.url).pathname;
const POSTS_DIR = new URL('../src/lib/mocks/responses/posts', import.meta.url).pathname;

const QUERY = `query GetArticle($id: Int, $slug: String, $locale: String){
    item: post(id: $id, slug: $slug locale: $locale){
        id
        languages
        name
        lead
        summary
        content
        medias(cover:true) {
            cloudinary_id
            copyright
            public_name
        }
        published_at
        seo {
            description
            noindex
            slug
        }
        tags {
            name
            public_name
        }
    }
}`;

async function fetchArticle(slug) {
  const res = await fetch(GRAPHQL_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${TOKEN}`
    },
    body: JSON.stringify({ variables: { slug }, query: QUERY })
  });
  return res.json();
}

// Collect slugs from all posts mock files
const postFiles = await glob(`${POSTS_DIR}/posts.*.json`);
const slugs = new Set();
for (const path of postFiles) {
  const data = JSON.parse(fs.readFileSync(path, 'utf-8'));
  for (const post of data?.data?.items?.data ?? []) {
    const slug = post?.seo?.slug;
    if (slug) slugs.add(slug);
  }
}

console.log(`Fetching ${slugs.size} articles...`);

const fetched = new Set();
let i = 0;
for (const slug of [...slugs].sort()) {
  i++;
  try {
    const data = await fetchArticle(slug);
    if (data?.data?.item) {
      // It's not a problem to overwrite existing files, as the content should be the same. This simplifies the logic. (same slug in FR, EN, DE result in the same content)
      fs.writeFileSync(`${ARTICLES_DIR}/${slug}.json`, JSON.stringify(data, null, 2));
      fetched.add(slug);
      console.log(`  [${i}/${slugs.size}] OK: ${slug}`);
    } else {
      console.warn(`  [${i}/${slugs.size}] EMPTY: ${slug}`);
    }
  } catch (e) {
    console.error(`  [${i}/${slugs.size}] ERROR: ${slug} → ${e.message}`);
  }
}

// Delete stale files
const existing = await glob(`${ARTICLES_DIR}/*.json`);
for (const path of existing) {
  const slug = path.replace(`${ARTICLES_DIR}/`, '').replace('.json', '');
  if (!fetched.has(slug)) {
    fs.unlinkSync(path);
    console.log(`  DELETED: ${slug}`);
  }
}

console.log(`\nDone. Fetched: ${fetched.size}, Deleted: ${existing.length - fetched.size}`);
