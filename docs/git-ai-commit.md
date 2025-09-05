# Git AI Commit

An intelligent git alias that uses Claude Code CLI to generate conventional commit messages automatically.

## 🚀 Features

- **AI-Powered**: Uses Claude Code CLI to analyze your staged changes
- **Conventional Commits**: Automatically follows conventional commit standards
- **Interactive**: Shows proposed message and asks for confirmation
- **Flexible**: Edit, regenerate, or cancel as needed
- **Smart Scoping**: Automatically detects appropriate scopes based on file changes
- **Error Handling**: Graceful fallbacks and helpful error messages

## 📦 Installation

### Global Installation (Recommended)

To use `git ai-commit` from any git repository:

```bash
# Run from this project root
./scripts/install-git-ai-commit.sh
```

This installation method:
- Copies the script to `~/.local/bin/git-ai-commit`
- Sets up a simple, compatible git alias: `git config --global alias.ai-commit '!git-ai-commit'`
- Works with all shell types (bash, zsh, fish, etc.)

### Local Usage (Alternative)

If you prefer not to install globally, run directly from project root:

```bash
./scripts/git-ai-commit.sh
```

This will:
- Copy the script to `~/.local/bin/git-ai-commit`
- Set up the global git alias
- Provide PATH configuration instructions if needed

## 🎯 Usage

### Basic Usage

1. **Stage your changes:**
   ```bash
   git add <files>
   ```

2. **Generate AI commit message:**
   ```bash
   git ai-commit
   ```

3. **Review and choose action:**
   - `y` - Commit with the generated message
   - `e` - Edit the message in your default editor
   - `r` - Regenerate a new message
   - `n` - Cancel the commit

### Examples

#### Single File Change
```bash
git add components/ui/button.tsx
git ai-commit
```
**Generated:** `feat(components): add hover effect to button component`

#### Multiple Related Files
```bash
git add components/provider-card.tsx hooks/use-providers.ts types/index.ts
git ai-commit
```
**Generated:** `feat(providers): add provider card component with data management`

#### Configuration Change
```bash
git add package.json
git ai-commit
```
**Generated:** `chore(deps): add react-query for data fetching`

#### Bug Fix
```bash
git add app/page.tsx
git ai-commit
```
**Generated:** `fix(dashboard): correct stats calculation for active providers`

#### Documentation
```bash
git add README.md docs/api.md
git ai-commit
```
**Generated:** `docs: update API documentation and usage examples`

## 🔧 Commit Types

The AI automatically selects appropriate conventional commit types:

| Type | Description | Example |
|------|-------------|---------|
| `feat` | New features | `feat(auth): add login validation` |
| `fix` | Bug fixes | `fix(api): handle null response data` |
| `docs` | Documentation | `docs: update installation guide` |
| `style` | Code style changes | `style: fix eslint warnings` |
| `refactor` | Code refactoring | `refactor(utils): simplify date formatting` |
| `test` | Tests | `test(hooks): add useProviders test cases` |
| `chore` | Maintenance | `chore(deps): update dependencies` |
| `perf` | Performance | `perf(dashboard): optimize chart rendering` |
| `ci` | CI/CD changes | `ci: add automated testing workflow` |
| `build` | Build system | `build: configure webpack optimization` |

## 📁 Scope Detection

The AI automatically detects scopes based on file patterns:

| Pattern | Scope | Example |
|---------|-------|---------|
| `components/**` | `components` | `feat(components): add modal dialog` |
| `hooks/**` | `hooks` | `feat(hooks): add useLocalStorage hook` |
| `types/**` | `types` | `feat(types): add user interface definitions` |
| `app/**` | `app` or specific page | `feat(dashboard): add analytics view` |
| `lib/**` | `lib` or `utils` | `feat(utils): add date formatting helpers` |
| `api/**` | `api` | `feat(api): add user endpoints` |
| `styles/**` or `*.css` | `styles` | `style(ui): update button spacing` |
| `package.json` | `deps` | `chore(deps): update react to v18` |
| `*.config.*` | `config` | `chore(config): update eslint rules` |
| `docs/**` or `*.md` | No scope | `docs: update contributing guide` |

## 🛠️ Requirements

- **Claude Code CLI**: Must be installed and accessible in PATH
- **Git**: Obviously needed for version control
- **Bash**: The script runs in bash shell

## 🔍 How It Works

1. **Change Analysis**: Examines `git diff --cached` to understand staged changes
2. **Context Building**: Gathers file names, change types, and diff content
3. **AI Generation**: Uses Claude Code CLI with structured prompt to generate message
4. **Message Validation**: Ensures the generated message meets basic quality standards
5. **User Interaction**: Presents options for commit, edit, regenerate, or cancel

## 🎨 Output Example

```
🤖 Git AI Commit
━━━━━━━━━━━━━━━━━
ℹ Analyzing staged changes...
ℹ Found changes in 2 file(s): components/provider-form.tsx, hooks/use-providers.ts
ℹ Generating commit message with Claude Code CLI...

Proposed commit message:
┌─────────────────────────────────────────────────────────────┐
│ feat(providers): add provider form with validation          │
└─────────────────────────────────────────────────────────────┘

Options:
  y - Commit with this message
  e - Edit the message
  r - Regenerate message
  n - Cancel

Choose [y/e/r/n]: _
```

## 🐛 Troubleshooting

### "Claude Code CLI not found"
Install Claude Code CLI from https://claude.ai/code and ensure it's in your PATH.

### "No staged changes found"
Stage your changes first with `git add <files>` before running `git ai-commit`.

### "Failed to generate commit message"
- Check that your staged changes are reasonable
- Ensure Claude Code CLI is working: `claude --version`
- Try regenerating with `r` option

### Git alias not working
If the git alias fails, you can run the script directly:
```bash
./scripts/git-ai-commit.sh
```

## 🔧 Advanced Configuration

### Custom Editor
The script respects your `$EDITOR` environment variable for message editing:
```bash
export EDITOR=nano  # or vim, code, etc.
```

### Alias Customization
You can create additional aliases for specific workflows:
```bash
git config alias.ai-fix '!git ai-commit && echo "Fix committed with AI message"'
```

## 🤝 Contributing

To improve the AI commit message generation:
1. Edit the prompt template in `scripts/git-ai-commit.sh`
2. Adjust the conventional commit type mappings
3. Enhance the scope detection patterns
4. Add more context to the analysis

The prompt template is located around line 90 in the script and can be customized for your team's commit message style.