# Distribution Guide for HelloMoon MCP Server

This guide explains how to distribute your HelloMoon MCP server so other users can easily install and use it.

## Prerequisites

Before distributing, you'll need:
- A GitHub account
- An NPM account (create at [npmjs.com](https://npmjs.com))
- Git installed on your machine

## Step 1: Prepare Your GitHub Repository

### 1.1 Create a GitHub Repository
1. Go to [GitHub](https://github.com) and create a new repository
2. Name it `hellomoon-mcp-server`
3. Make it public so others can access it
4. Don't initialize with README (we already have one)

### 1.2 Update Package.json
Before publishing, update the following fields in `package.json`:
```json
{
  "author": {
    "name": "kodiii",
    "email": "your.actual.email@example.com",
    "url": "https://github.com/kodiii"
  },
  "repository": {
    "type": "git",
    "url": "https://github.com/kodiii/hellomoon-mcp-server.git"
  },
  "bugs": {
    "url": "https://github.com/kodiii/hellomoon-mcp-server/issues"
  },
  "homepage": "https://github.com/kodiii/hellomoon-mcp-server#readme"
}
```

### 1.3 Initialize Git and Push to GitHub
```bash
cd /Users/ricardoribeiro/Documents/Cline/MCP/hellomoon-server

# Initialize git (if not already done)
git init

# Add all files
git add .

# Make initial commit
git commit -m "Initial commit: HelloMoon MCP Server"

# Add your GitHub repository as origin
git remote add origin https://github.com/kodiii/hellomoon-mcp-server.git

# Push to GitHub
git branch -M main
git push -u origin main
```

## Step 2: Publish to NPM

### 2.1 Create NPM Account
1. Visit [npmjs.com](https://npmjs.com)
2. Sign up for a free account
3. Verify your email address

### 2.2 Login to NPM CLI
```bash
npm login
```
Enter your NPM username, password, and email.

### 2.3 Build and Test
```bash
# Build the project
npm run build

# Test that it works
npm test
```

### 2.4 Publish to NPM
```bash
# Publish the package
npm publish
```

If the name `hellomoon-mcp-server` is taken, you might need to:
1. Use a scoped package: `@your-username/hellomoon-mcp-server`
2. Choose a different name: `hellomoon-docs-mcp` or similar

## Step 3: Set Up Automated Publishing (Optional)

### 3.1 Create NPM Token
1. Go to [npmjs.com](https://npmjs.com)
2. Click on your profile → Access Tokens
3. Generate a new "Automation" token
4. Copy the token (it starts with `npm_`)

### 3.2 Add NPM Token to GitHub Secrets
1. Go to your GitHub repository
2. Click Settings → Secrets and variables → Actions
3. Click "New repository secret"
4. Name: `NPM_TOKEN`
5. Value: paste your NPM token
6. Click "Add secret"

### 3.3 Create Releases for Auto-Publishing
```bash
# Tag a release
git tag v1.0.0
git push origin v1.0.0
```

Or create a release through GitHub's web interface.

## Step 4: Documentation for Users

### 4.1 Installation Instructions
Users can install your server in several ways:

**Option 1: Direct NPM execution (Recommended)**
```bash
npx hellomoon-mcp-server
```

**Option 2: Global installation**
```bash
npm install -g hellomoon-mcp-server
hellomoon-mcp-server
```

**Option 3: Local installation**
```bash
npm install hellomoon-mcp-server
npx hellomoon-mcp-server
```

### 4.2 MCP Configuration
Users need to add this to their MCP settings:

**For Cline/Claude Dev:**
```json
{
  "mcpServers": {
    "hellomoon-docs": {
      "command": "npx",
      "args": ["hellomoon-mcp-server"],
      "disabled": false,
      "autoApprove": []
    }
  }
}
```

**For Claude Desktop:**
```json
{
  "mcpServers": {
    "hellomoon-docs": {
      "command": "npx",
      "args": ["hellomoon-mcp-server"]
    }
  }
}
```

## Step 5: Promote Your MCP Server

### 5.1 Update README
Make sure your README.md has:
- Clear installation instructions
- Usage examples
- Screenshots/GIFs if possible
- Troubleshooting section

### 5.2 Share in Communities
- Model Context Protocol Discord/forums
- Reddit communities (r/Claude, r/programming)
- Twitter/X with relevant hashtags
- Dev.to or Medium articles

### 5.3 Add to MCP Server Lists
Look for community-maintained lists of MCP servers and submit yours for inclusion.

## Versioning and Updates

### Semantic Versioning
Follow [semver](https://semver.org/):
- `1.0.0` → `1.0.1` (patch: bug fixes)
- `1.0.0` → `1.1.0` (minor: new features, backward compatible)
- `1.0.0` → `2.0.0` (major: breaking changes)

### Publishing Updates
```bash
# Update version in package.json
npm version patch  # or minor, major

# Build and test
npm run build
npm test

# Publish
npm publish

# Push tags to GitHub
git push origin main --tags
```

## Maintenance

### Monitor Usage
- Check NPM download stats
- Monitor GitHub issues and stars
- Respond to user feedback

### Keep Dependencies Updated
```bash
# Check for outdated packages
npm outdated

# Update dependencies
npm update

# Update major versions manually when needed
```

## Troubleshooting

### Common Issues
1. **Package name already exists**: Use a scoped name like `@username/hellomoon-mcp-server`
2. **Build fails**: Check TypeScript configuration and dependencies
3. **NPM publish fails**: Verify you're logged in and have correct permissions
4. **Users can't install**: Check that all required files are in the `files` array in package.json

### Support
- Create detailed issue templates in your GitHub repository
- Consider setting up GitHub Discussions for user questions
- Document common problems in your README

---

## Quick Reference Commands

```bash
# Development
npm run build        # Build the project
npm run watch        # Watch for changes
npm test            # Test the build

# Publishing
npm version patch   # Bump version
npm publish        # Publish to NPM
git push --tags    # Push tags to GitHub

# Maintenance
npm outdated       # Check for updates
npm audit          # Security audit
npm audit fix      # Fix security issues```