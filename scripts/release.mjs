#!/usr/bin/env node

/**
 * Release Management System
 *
 * Automates the entire release process:
 * - Version bumping (semantic versioning)
 * - Changelog generation from sprint archives and git commits
 * - Release notes generation from gitban cards
 * - Git tagging with comprehensive metadata
 * - VERSION.md updates
 *
 * Usage:
 *   npm run release patch   # 0.0.2 -> 0.0.3
 *   npm run release minor   # 0.0.2 -> 0.1.0
 *   npm run release major   # 0.0.2 -> 1.0.0
 *
 * Options:
 *   --dry-run              Show what would happen without making changes
 *   --skip-tests           Skip running test suite before release
 *   --sprint=NAME          Associate release with specific sprint
 */

import { execSync } from 'child_process'
import { readFileSync, writeFileSync, readdirSync, statSync, existsSync } from 'fs'
import { join, basename } from 'path'

// Configuration
const CONFIG = {
  versionFile: 'VERSION.md',
  changelogFile: 'CHANGELOG.md',
  packageJson: 'package.json',
  gitbanArchiveDir: '.gitban/cards/archive/sprints',
  dryRun: process.argv.includes('--dry-run'),
  skipTests: process.argv.includes('--skip-tests'),
  sprintName: process.argv.find(arg => arg.startsWith('--sprint='))?.split('=')[1]
}

// Semantic versioning utilities
class VersionManager {
  constructor() {
    this.currentVersion = this.getCurrentVersion()
  }

  getCurrentVersion() {
    try {
      const pkg = JSON.parse(readFileSync(CONFIG.packageJson, 'utf8'))
      return pkg.version
    } catch (error) {
      console.error('❌ Failed to read current version from package.json')
      process.exit(1)
    }
  }

  bumpVersion(bumpType) {
    const [major, minor, patch] = this.currentVersion.split('.').map(Number)

    switch (bumpType) {
      case 'major':
        return `${major + 1}.0.0`
      case 'minor':
        return `${major}.${minor + 1}.0`
      case 'patch':
        return `${major}.${minor}.${patch + 1}`
      default:
        throw new Error(`Invalid bump type: ${bumpType}. Use major, minor, or patch`)
    }
  }

  updatePackageJson(newVersion) {
    if (CONFIG.dryRun) {
      console.log(`[DRY RUN] Would update package.json to ${newVersion}`)
      return
    }

    try {
      execSync(`npm version ${newVersion} --no-git-tag-version`, { stdio: 'inherit' })
      console.log(`✅ Updated package.json to v${newVersion}`)
    } catch (error) {
      console.error('❌ Failed to update package.json')
      throw error
    }
  }
}

// Sprint archive analyzer
class SprintAnalyzer {
  constructor() {
    this.archiveDir = CONFIG.gitbanArchiveDir
  }

  getRecentSprints(count = 5) {
    if (!existsSync(this.archiveDir)) {
      console.warn('⚠️  No sprint archives found')
      return []
    }

    const sprints = readdirSync(this.archiveDir)
      .filter(dir => dir.startsWith('sprint-'))
      .map(dir => {
        const path = join(this.archiveDir, dir)
        const manifestPath = join(path, '_sprint.json')

        if (!existsSync(manifestPath)) return null

        const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'))
        const stats = statSync(path)

        return {
          name: dir,
          path,
          manifest,
          createdAt: stats.birthtimeMs
        }
      })
      .filter(Boolean)
      .sort((a, b) => b.createdAt - a.createdAt)
      .slice(0, count)

    return sprints
  }

  getSprintSummary(sprint) {
    const { manifest } = sprint
    const totalCards = manifest.cards?.length || 0
    const metrics = manifest.metrics || {}

    return {
      name: sprint.name,
      displayName: manifest.sprint_name || sprint.name,
      cardsCompleted: totalCards,
      startDate: manifest.start_date,
      endDate: manifest.end_date,
      description: manifest.description,
      cards: manifest.cards || [],
      metrics
    }
  }

  getSinceLastRelease() {
    // Get commits since last tag
    try {
      const lastTag = execSync('git describe --tags --abbrev=0 2>/dev/null || echo ""',
        { encoding: 'utf8' }).trim()

      if (!lastTag) {
        console.log('📝 No previous release tag found, using all history')
        return this.getRecentSprints()
      }

      console.log(`📝 Analyzing changes since ${lastTag}`)
      const sprints = this.getRecentSprints()

      // Filter sprints created after last tag
      const tagDate = new Date(execSync(`git log -1 --format=%aI ${lastTag}`,
        { encoding: 'utf8' }).trim()).getTime()

      return sprints.filter(sprint => sprint.createdAt > tagDate)
    } catch (error) {
      console.warn('⚠️  Could not determine last release, including recent sprints')
      return this.getRecentSprints(3)
    }
  }
}

// Changelog generator
class ChangelogGenerator {
  constructor(sprintAnalyzer) {
    this.sprintAnalyzer = sprintAnalyzer
  }

  generateReleaseNotes(version, sprints) {
    const date = new Date().toISOString().split('T')[0]
    const lines = []

    lines.push(`## [${version}] - ${date}\n`)

    // Sprint summaries
    if (sprints.length > 0) {
      lines.push('### Sprint Completions\n')
      sprints.forEach(sprint => {
        const summary = this.sprintAnalyzer.getSprintSummary(sprint)
        lines.push(`**${summary.displayName}** (${summary.cardsCompleted} cards)`)
        if (summary.description) {
          lines.push(`- ${summary.description}`)
        }
        lines.push('')
      })
    }

    // Get git commits since last tag
    try {
      const lastTag = execSync('git describe --tags --abbrev=0 2>/dev/null || echo ""',
        { encoding: 'utf8' }).trim()
      const commitRange = lastTag ? `${lastTag}..HEAD` : 'HEAD'
      const commits = execSync(`git log ${commitRange} --pretty=format:"%s" --no-merges`,
        { encoding: 'utf8' })
        .split('\n')
        .filter(Boolean)

      if (commits.length > 0) {
        lines.push('### Changes\n')

        const categorized = this.categorizeCommits(commits)

        if (categorized.features.length > 0) {
          lines.push('**Features:**')
          categorized.features.forEach(msg => lines.push(`- ${msg}`))
          lines.push('')
        }

        if (categorized.fixes.length > 0) {
          lines.push('**Bug Fixes:**')
          categorized.fixes.forEach(msg => lines.push(`- ${msg}`))
          lines.push('')
        }

        if (categorized.chores.length > 0) {
          lines.push('**Chores:**')
          categorized.chores.forEach(msg => lines.push(`- ${msg}`))
          lines.push('')
        }
      }
    } catch (error) {
      console.warn('⚠️  Could not generate commit list')
    }

    lines.push('---\n')
    return lines.join('\n')
  }

  categorizeCommits(commits) {
    const categorized = {
      features: [],
      fixes: [],
      chores: [],
      other: []
    }

    commits.forEach(msg => {
      if (msg.startsWith('feat')) {
        categorized.features.push(msg.replace(/^feat(\([^)]+\))?:\s*/, ''))
      } else if (msg.startsWith('fix')) {
        categorized.fixes.push(msg.replace(/^fix(\([^)]+\))?:\s*/, ''))
      } else if (msg.startsWith('chore') || msg.startsWith('docs') || msg.startsWith('test')) {
        categorized.chores.push(msg.replace(/^(chore|docs|test)(\([^)]+\))?:\s*/, ''))
      } else {
        categorized.other.push(msg)
      }
    })

    return categorized
  }

  updateChangelog(newVersion, releaseNotes) {
    if (CONFIG.dryRun) {
      console.log('[DRY RUN] Would prepend to CHANGELOG.md:')
      console.log(releaseNotes)
      return
    }

    try {
      let changelog = ''
      if (existsSync(CONFIG.changelogFile)) {
        changelog = readFileSync(CONFIG.changelogFile, 'utf8')
      } else {
        changelog = '# Changelog\n\nAll notable changes to this project will be documented in this file.\n\n'
      }

      // Insert new release notes after header
      const headerEnd = changelog.indexOf('\n\n') + 2
      const updated = changelog.slice(0, headerEnd) + releaseNotes + changelog.slice(headerEnd)

      writeFileSync(CONFIG.changelogFile, updated, 'utf8')
      console.log(`✅ Updated ${CONFIG.changelogFile}`)
    } catch (error) {
      console.error('❌ Failed to update CHANGELOG.md')
      throw error
    }
  }

  updateVersionMd(newVersion, sprints) {
    if (CONFIG.dryRun) {
      console.log(`[DRY RUN] Would update VERSION.md to v${newVersion}`)
      return
    }

    try {
      let content = readFileSync(CONFIG.versionFile, 'utf8')

      // Update current version
      content = content.replace(/## Current Version: \d+\.\d+\.\d+/,
        `## Current Version: ${newVersion}`)

      writeFileSync(CONFIG.versionFile, content, 'utf8')
      console.log(`✅ Updated ${CONFIG.versionFile}`)
    } catch (error) {
      console.error('❌ Failed to update VERSION.md')
      throw error
    }
  }
}

// Main release orchestrator
class ReleaseManager {
  constructor() {
    this.versionManager = new VersionManager()
    this.sprintAnalyzer = new SprintAnalyzer()
    this.changelogGenerator = new ChangelogGenerator(this.sprintAnalyzer)
  }

  async run(bumpType) {
    console.log('🚀 Starting release process...\n')

    // 1. Run tests unless skipped
    if (!CONFIG.skipTests && !CONFIG.dryRun) {
      console.log('🧪 Running test suite...')
      try {
        execSync('npm test', { stdio: 'inherit' })
        console.log('✅ All tests passed\n')
      } catch (error) {
        console.error('❌ Tests failed, aborting release')
        process.exit(1)
      }
    }

    // 2. Calculate new version
    const currentVersion = this.versionManager.currentVersion
    const newVersion = this.versionManager.bumpVersion(bumpType)
    console.log(`📦 Version: ${currentVersion} → ${newVersion}\n`)

    // 3. Analyze sprints since last release
    console.log('📊 Analyzing sprint completions...')
    const sprints = this.sprintAnalyzer.getSinceLastRelease()
    console.log(`   Found ${sprints.length} sprint(s) since last release\n`)

    // 4. Generate release notes
    console.log('📝 Generating release notes...')
    const releaseNotes = this.changelogGenerator.generateReleaseNotes(newVersion, sprints)

    // 5. Update files
    this.versionManager.updatePackageJson(newVersion)
    this.changelogGenerator.updateChangelog(newVersion, releaseNotes)
    this.changelogGenerator.updateVersionMd(newVersion, sprints)

    // 6. Create git commit and tag
    if (!CONFIG.dryRun) {
      console.log('\n📌 Creating git commit and tag...')

      try {
        execSync('git add package.json package-lock.json CHANGELOG.md VERSION.md',
          { stdio: 'inherit' })

        const commitMsg = `feat(release): version ${newVersion}\n\n${releaseNotes}\n\n🤖 Generated with [Claude Code](https://claude.com/claude-code)\n\nCo-Authored-By: Claude <noreply@anthropic.com>`

        execSync(`git commit -m "${commitMsg.replace(/"/g, '\\"')}"`, { stdio: 'inherit' })

        const tagMsg = `Release v${newVersion}\n\n${releaseNotes}`
        execSync(`git tag -a v${newVersion} -m "${tagMsg.replace(/"/g, '\\"')}"`,
          { stdio: 'inherit' })

        console.log(`✅ Created commit and tag v${newVersion}`)
      } catch (error) {
        console.error('❌ Failed to create git commit/tag')
        throw error
      }
    }

    // 7. Summary
    console.log('\n✨ Release complete!\n')
    console.log(`Version: ${newVersion}`)
    console.log(`Sprint completions: ${sprints.length}`)

    if (!CONFIG.dryRun) {
      console.log('\n📤 Next steps:')
      console.log(`   git push origin main`)
      console.log(`   git push origin v${newVersion}`)
    }
  }
}

// CLI Entry point
async function main() {
  const args = process.argv.slice(2).filter(arg => !arg.startsWith('--'))
  const bumpType = args[0]

  if (!bumpType || !['major', 'minor', 'patch'].includes(bumpType)) {
    console.error('Usage: npm run release <major|minor|patch> [--dry-run] [--skip-tests]')
    process.exit(1)
  }

  const manager = new ReleaseManager()
  await manager.run(bumpType)
}

main().catch(error => {
  console.error('❌ Release failed:', error.message)
  process.exit(1)
})
