# Obsidian Plugin for Claude Code

Save, search, organize, and manage your Obsidian vault directly from Claude Code conversations.

## Install

```bash
# 1. Register the marketplace
claude plugin marketplace add https://github.com/nothinking/claude-obsidian-plugin

# 2. Install the plugin
claude plugin install obsidian
```

## Setup

After installing, run the setup command:

```
/obsidian:setup
```

This will:
1. Ask for your vault location (default: `~/claude-obsidian-vault`)
2. Create the folder structure (customizable)
3. Copy note templates
4. Check for Python3 (optional, enables semantic search)

## Commands

| Command | Description |
|---------|-------------|
| `/obsidian:setup` | Initialize or reconfigure vault |
| `/obsidian:save [topic]` | Save current conversation as a note |
| `/obsidian:recall [keyword]` | Search vault and bring notes into context |
| `/obsidian:organize` | Audit vault health (orphans, duplicates, tags) |
| `/obsidian:moc [topic]` | Create or update a Map of Content |

## Examples

```
/obsidian:save kafka consumer lag troubleshooting
/obsidian:recall kubernetes ingress
/obsidian:organize inbox
/obsidian:moc kafka
/obsidian:moc --suggest
```

## Vault Structure

Default folder layout (customizable via setup):

```
your-vault/
├── 00-inbox/       Unsorted notes
├── 10-work/        Work-related tech notes
├── 20-projects/    Side project notes
├── 30-learning/    Learning & study notes
├── 40-reference/   External articles & references
├── 90-archive/     Archived notes
├── _moc/           Maps of Content
├── _templates/     Note templates
└── .vectors/       Semantic search index (optional)
```

## Configuration

Stored at `~/.claude/plugins/config/obsidian.json`:

```json
{
  "vaultPath": "~/claude-obsidian-vault",
  "folders": {
    "inbox": "00-inbox",
    "work": "10-work",
    "projects": "20-projects",
    "learning": "30-learning",
    "reference": "40-reference",
    "archive": "90-archive",
    "moc": "_moc",
    "templates": "_templates"
  },
  "setupComplete": true
}
```

## Semantic Search (Optional)

If Python3 is available, the plugin enables semantic search via embeddings.
Without Python3, all commands still work using keyword-based search (Glob + Grep).

## License

MIT
