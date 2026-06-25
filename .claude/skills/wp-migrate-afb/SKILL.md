---
name: wp-migrate-afb
description: "Migrates WordPress block content from the 'attributes-for-blocks' plugin (attributesForBlocks) to a native theme blockAttributes system. Verifies theme compatibility first, then migrates one post, all posts, or filtered by post type."
compatibility: "Requires WP-CLI (wp-local wrapper), Python 3, WordPress with a theme that has a native blockAttributes implementation."
---

# wp-migrate-afb

Migrates Gutenberg block attributes stored by the **Attributes for Blocks** plugin (`attributesForBlocks`) to a theme's native **blockAttributes** attribute system.

## When to use

- You're deprecating the `attributes-for-blocks` plugin in favour of a theme-native implementation.
- You need to migrate one post, a whole post type, or all posts at once.
- Safe to run multiple times (idempotent — blocks that already use `blockAttributes` are untouched).

## Inputs

The user provides one of:
- A **post ID** — migrate a single post.
- A **post type slug** — migrate all posts of that type.
- Nothing / "all" — migrate every post that contains `attributesForBlocks`.

## Procedure

### Step 0 — Verify theme compatibility

Before migrating anything, confirm the active theme has a native `blockAttributes` implementation:

1. Find the active theme directory. From the project root (WordPress root or theme root):
   - If inside a theme dir: check for `theme/inc/block-attributes.php` **or** `inc/block-attributes.php`.
   - If at WP root: run `wp-local theme get $(wp-local theme list --status=active --field=name)` to get the theme path, then check for `block-attributes.php` inside it.
2. Also confirm the JS side: grep for `blockAttributes` in the theme's compiled JS or source JS modules.
3. If neither file is found, **abort** and tell the user: "No native blockAttributes system detected in the active theme. Migration aborted."

### Step 1 — Find posts to migrate

Use WP-CLI to get post IDs that contain `attributesForBlocks`:

**Single post** (user provided ID):
```bash
# Just use that ID directly; verify it exists with: wp-local post get <id> --field=ID
```

**By post type**:
```bash
wp-local post list --post_type=<slug> --post_status=any --fields=ID --format=csv --posts_per_page=-1
# Then filter to those whose content contains attributesForBlocks
```

**All posts**:
```bash
wp-local post list --post_status=any --fields=ID,post_type --format=csv --posts_per_page=-1
```

For bulk operations, use Python to filter only posts whose content actually contains `attributesForBlocks` (to avoid unnecessary DB updates).

### Step 2 — Run the migration with Python

Use this Python logic for each post:

```python
import json, re

def migrate_post_content(content: str) -> tuple[str, int]:
    """
    Renames attributesForBlocks → blockAttributes in all Gutenberg block
    comment JSON objects. Returns (new_content, count_of_replacements).
    """
    count = 0

    def replace_in_comment(match):
        nonlocal count
        full = match.group(0)
        try:
            comment_inner = full[4:-3].strip()          # strip <!-- and -->
            space_idx = comment_inner.find(' ')
            if space_idx == -1:
                return full
            block_name = comment_inner[:space_idx]
            json_str   = comment_inner[space_idx:].strip()
            attrs = json.loads(json_str)
            if 'attributesForBlocks' not in attrs:
                return full
            attrs['blockAttributes'] = attrs.pop('attributesForBlocks')
            count += 1
            new_json = json.dumps(attrs, ensure_ascii=False, separators=(',', ':'))
            return f'<!-- {block_name} {new_json} -->'
        except Exception:
            return full

    # Matches Gutenberg block opening comments (single-line JSON)
    pattern = r'<!-- wp:[a-zA-Z0-9/]+ \{[^>]+\} -->'
    new_content = re.sub(pattern, replace_in_comment, content)
    return new_content, count
```

Workflow per post:
1. Get content: `wp-local post get <id> --field=post_content`
2. Run `migrate_post_content(content)`
3. If `count == 0`, skip (nothing to migrate).
4. If `count > 0`, update: `wp-local post update <id> --post_content="<new_content>"`

### Step 3 — Report

After processing, print a summary:

```
Migrated 4 block(s) in post 74380  (wp:heading ×1, wp:group ×2, wp:buttons ×1)
Migrated 3 block(s) in post 74381  ...
---
Total: 7 blocks migrated across 2 posts. 0 errors.
```

If any post update fails, report the post ID and error but continue with the rest.

### Step 4 — Verify in editor (optional but recommended)

After migration, open the first migrated post in the Gutenberg editor using Playwright:
- Navigate to `/wp-admin/post.php?post=<id>&action=edit`
- Use `wp.data` to select the first migrated block and confirm its `blockAttributes` are populated in the inspector panel.
- Check for 0 console errors.

## Notes

- The migration only touches block **comment JSON** — it does NOT modify the inline HTML attributes already in the saved block content. This is intentional: the theme's `render_block` PHP filter will apply `blockAttributes` to the rendered HTML, and for static blocks the existing inline attributes (written by the old plugin) are identical, so there's no duplication.
- Key order in the block comment JSON may change after migration (Python `json.dumps` outputs keys in insertion order with `attributesForBlocks`'s value moved to `blockAttributes`). This is harmless — Gutenberg ignores key order.
- The operation is **idempotent**: running it twice on already-migrated content is safe (no `attributesForBlocks` found → no changes).
- Always use `wp-local` (or the project's WP-CLI wrapper) — never bare `wp` — to ensure correct PHP/MySQL socket for Local by Flywheel sites.
