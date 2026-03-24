# Obsidian Plugin for Claude Code

This plugin integrates Obsidian vault management into Claude Code conversations.

## Commands

- `/obsidian:setup` — Initialize vault (path, folders, dependencies)
- `/obsidian:save [topic]` — Save conversation content as a note
- `/obsidian:recall [keyword]` — Search vault and bring notes into context
- `/obsidian:organize [subcommand]` — Audit and clean up vault structure
- `/obsidian:moc [topic]` — Create or update Map of Content

## Configuration

Settings stored at `~/.claude/plugins/config/obsidian.json`.
All commands read this config first. If missing, they prompt the user to run `/obsidian:setup`.

## Key Conventions

- Never overwrite existing notes
- All organize changes require user confirmation
- Recall is read-only — never modifies notes
- Semantic search is optional — keyword search always works as fallback
