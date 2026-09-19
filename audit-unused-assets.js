#!/usr/bin/env node
/**
 * ============================================================================
 * Web Project Unused Asset Auditor & Safe Quarantine Tool
 * ============================================================================
 * Identifies orphaned images, stylesheets, scripts, fonts, and assets that are
 * not referenced across HTML, JS, CSS, and JSON files in your project.
 *
 * Safety Features:
 *   - Dry-Run by default (no deletions without explicit flag)
 *   - Quarantine mode: moves suspect files to a temporary backup folder
 *   - Instant Restore option: reverts quarantined files if anything breaks
 *   - Dynamic reference detection & edge-case protection
 *
 * Usage:
 *   node audit-unused-assets.js                # Scan and print report (Safe preview)
 *   node audit-unused-assets.js --quarantine   # Move unused files to .quarantine_backup/
 *   node audit-unused-assets.js --restore      # Restore quarantined files back
 *   node audit-unused-assets.js --json         # Output JSON report
 * ============================================================================
 */

const fs = require('fs');
const path = require('path');

// Target directory to scan (default: current directory)
const PROJECT_ROOT = process.cwd();

// Directories and files to always ignore
const IGNORED_DIRS = new Set([
  'node_modules',
  '.git',
  '.netlify',
  '.gemini',
  '.quarantine_backup',
  'dist',
  'build',
  '.cache'
]);

const IGNORED_FILES = new Set([
  'package.json',
  'package-lock.json',
  'audit-unused-assets.js',
  '.env',
  '.gitignore',
  'netlify.toml',
  'robots.txt',
  'sitemap.xml',
  'database.sqlite',
  'database.sqlite-journal'
]);

// Essential project entry points that must NEVER be considered unused
const ESSENTIAL_ENTRY_POINTS = new Set([
  'index.html',
  'server.js',
  'app.js',
  'style.css',
  'database.js',
  'auth-utils.js',
  'spa-router.js'
]);

// Extensions that parse content to find references to other files
const SCANNER_EXTENSIONS = new Set([
  '.html',
  '.htm',
  '.js',
  '.jsx',
  '.mjs',
  '.css',
  '.scss',
  '.json'
]);

// Asset extensions eligible for orphaned check
const ASSET_EXTENSIONS = new Set([
  // Images
  '.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp', '.ico', '.avif',
  // Stylesheets & Scripts
  '.css', '.js', '.mjs',
  // Media & Documents
  '.mp4', '.webm', '.mp3', '.pdf',
  // Fonts
  '.woff', '.woff2', '.ttf', '.eot', '.otf',
  // Data
  '.json', '.csv', '.xml'
]);

// Helper: Format bytes to human readable string
function formatBytes(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Recursively traverse directory and gather file paths
function getAllFiles(dir, fileList = []) {
  if (!fs.existsSync(dir)) return fileList;
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    const relPath = path.relative(PROJECT_ROOT, fullPath).replace(/\\/g, '/');

    if (entry.isDirectory()) {
      if (!IGNORED_DIRS.has(entry.name)) {
        getAllFiles(fullPath, fileList);
      }
    } else if (entry.isFile()) {
      if (!IGNORED_FILES.has(entry.name)) {
        fileList.push({
          fullPath,
          relPath,
          basename: entry.name,
          ext: path.extname(entry.name).toLowerCase(),
          size: fs.statSync(fullPath).size
        });
      }
    }
  }

  return fileList;
}

// Extract all reference strings, paths, and URLs from code
function extractReferences(files) {
  const contentPool = [];

  for (const file of files) {
    if (!SCANNER_EXTENSIONS.has(file.ext)) continue;
    try {
      const content = fs.readFileSync(file.fullPath, 'utf8');
      contentPool.push({ file: file.relPath, content });
    } catch (err) {
      console.warn(`Could not read ${file.relPath}: ${err.message}`);
    }
  }

  return contentPool;
}

// Audit candidate assets against the content pool
function auditProject(allFiles, contentPool) {
  const referencedFiles = [];
  const unusedFiles = [];

  // Combined all scanned text for fast baseline lookup
  const combinedContent = contentPool.map(c => c.content).join('\n');

  for (const file of allFiles) {
    // Skip scanner entry points or essential files
    if (ESSENTIAL_ENTRY_POINTS.has(file.basename) || ESSENTIAL_ENTRY_POINTS.has(file.relPath)) {
      referencedFiles.push({ ...file, reason: 'Essential Entry Point' });
      continue;
    }

    // Only audit recognized asset extensions and auxiliary HTML/JS/CSS
    if (!ASSET_EXTENSIONS.has(file.ext) && file.ext !== '.html') {
      continue;
    }

    // Matching techniques:
    // 1. Exact filename match (e.g. "navbar-demo.html" or "logo.png")
    // 2. Relative path match (e.g. "./assets/logo.png" or "assets/logo.png")
    // 3. Clean route match for HTML (e.g. href="become-a-tutor" for "become-a-tutor.html")
    const basename = file.basename;
    const cleanBasenameNoExt = path.basename(basename, file.ext);
    const relPathForward = file.relPath.replace(/\\/g, '/');

    // Build regex queries
    const exactBasenameRegex = new RegExp(`['"\\/\\(]${escapeRegExp(basename)}['"\\?\\)#]`, 'i');
    const exactRelRegex = new RegExp(escapeRegExp(relPathForward), 'i');
    
    // Check if filename appears as a standalone token or in strings
    const hasBasename = combinedContent.includes(basename);
    const hasRelPath = combinedContent.includes(relPathForward);
    const hasCleanRoute = file.ext === '.html' && new RegExp(`['"/]${escapeRegExp(cleanBasenameNoExt)}['"/?#]`, 'i').test(combinedContent);

    // Support extensionless JavaScript imports / requires: require('./routing-engine') or import from './utils'
    const hasExtensionlessImport = (file.ext === '.js' || file.ext === '.mjs') && (
      combinedContent.includes(`/${cleanBasenameNoExt}'`) ||
      combinedContent.includes(`/${cleanBasenameNoExt}"`) ||
      combinedContent.includes(`/${cleanBasenameNoExt}\``) ||
      new RegExp("['\"\\/`]" + escapeRegExp(cleanBasenameNoExt) + "['\"\\/?#]", 'i').test(combinedContent)
    );

    // Check all matching criteria
    const isMatched = hasBasename || hasRelPath || hasCleanRoute || hasExtensionlessImport || exactBasenameRegex.test(combinedContent) || exactRelRegex.test(combinedContent);

    if (isMatched) {
      referencedFiles.push({ ...file, reason: 'Referenced in code/markup' });
    } else {
      unusedFiles.push(file);
    }
  }

  return { referencedFiles, unusedFiles };
}

function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Quarantine unused files safely (preserving relative structure)
function quarantineFiles(unusedFiles) {
  const quarantineDir = path.join(PROJECT_ROOT, '.quarantine_backup');
  if (!fs.existsSync(quarantineDir)) {
    fs.mkdirSync(quarantineDir, { recursive: true });
  }

  const manifest = [];

  for (const file of unusedFiles) {
    const targetPath = path.join(quarantineDir, file.relPath);
    const targetDir = path.dirname(targetPath);

    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }

    fs.renameSync(file.fullPath, targetPath);
    manifest.push({ original: file.fullPath, quarantined: targetPath, relPath: file.relPath });
  }

  fs.writeFileSync(
    path.join(quarantineDir, 'quarantine-manifest.json'),
    JSON.stringify({ timestamp: new Date().toISOString(), files: manifest }, null, 2)
  );

  console.log(`\n📦 Successfully quarantined ${unusedFiles.length} files to '.quarantine_backup/' directory.`);
  console.log(`💡 Test your website now. If anything is missing, run: node audit-unused-assets.js --restore\n`);
}

// Restore quarantined files
function restoreQuarantinedFiles() {
  const quarantineDir = path.join(PROJECT_ROOT, '.quarantine_backup');
  const manifestPath = path.join(quarantineDir, 'quarantine-manifest.json');

  if (!fs.existsSync(manifestPath)) {
    console.error(`❌ No quarantine manifest found at ${manifestPath}. Nothing to restore.`);
    return;
  }

  const { files } = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  let restoredCount = 0;

  for (const item of files) {
    if (fs.existsSync(item.quarantined)) {
      const originalDir = path.dirname(item.original);
      if (!fs.existsSync(originalDir)) {
        fs.mkdirSync(originalDir, { recursive: true });
      }
      fs.renameSync(item.quarantined, item.original);
      restoredCount++;
    }
  }

  console.log(`\n✅ Successfully restored ${restoredCount} files from quarantine back to project.`);
}

// Print formatted CLI summary
function printReport(referencedFiles, unusedFiles) {
  const totalAudited = referencedFiles.length + unusedFiles.length;
  const totalUnusedBytes = unusedFiles.reduce((sum, f) => sum + f.size, 0);

  console.log('\n' + '='.repeat(72));
  console.log('  🔍 WEB PROJECT UNUSED ASSET AUDIT REPORT (DRY-RUN / PREVIEW)');
  console.log('='.repeat(72));
  console.log(`📂 Project Root:        ${PROJECT_ROOT}`);
  console.log(`📊 Total Assets Found:  ${totalAudited}`);
  console.log(`✅ Active / In-Use:     ${referencedFiles.length}`);
  console.log(`⚠️  Potentially Unused:  ${unusedFiles.length} (${formatBytes(totalUnusedBytes)} potential savings)`);
  console.log('='.repeat(72));

  if (unusedFiles.length === 0) {
    console.log('\n✨ Great news! All scanned assets are referenced in your project.\n');
    return;
  }

  console.log('\n⚠️  UNREFERENCED ASSETS (Ready for review):');
  console.log('-'.repeat(72));
  console.log(
    '  ' +
    'File Path'.padEnd(46) +
    'Type'.padEnd(10) +
    'Size'
  );
  console.log('-'.repeat(72));

  unusedFiles.forEach((f, idx) => {
    const num = `${idx + 1}.`.padEnd(4);
    const displayPath = f.relPath.length > 40 ? '...' + f.relPath.slice(-37) : f.relPath;
    console.log(`  ${displayPath.padEnd(46)} ${f.ext.padEnd(10)} ${formatBytes(f.size)}`);
  });

  console.log('-'.repeat(72));
  console.log('\n🛡️  SAFE ACTION STEPS:');
  console.log('  1. Review the list above to ensure no dynamically generated paths are missed.');
  console.log('  2. Run with --quarantine to stage them in .quarantine_backup/ without deleting:');
  console.log('     node audit-unused-assets.js --quarantine');
  console.log('  3. Test your website locally (http://localhost:3000) to confirm everything works.');
  console.log('  4. If any file broke, easily undo with:');
  console.log('     node audit-unused-assets.js --restore');
  console.log('  5. Once satisfied, you can safely delete the .quarantine_backup/ folder.\n');
}

// Main Execution
function main() {
  const args = process.argv.slice(2);

  if (args.includes('--restore')) {
    restoreQuarantinedFiles();
    return;
  }

  const allFiles = getAllFiles(PROJECT_ROOT);
  const contentPool = extractReferences(allFiles);
  const { referencedFiles, unusedFiles } = auditProject(allFiles, contentPool);

  if (args.includes('--json')) {
    console.log(JSON.stringify({
      timestamp: new Date().toISOString(),
      summary: {
        totalAudited: referencedFiles.length + unusedFiles.length,
        inUseCount: referencedFiles.length,
        unusedCount: unusedFiles.length,
        unusedBytes: unusedFiles.reduce((s, f) => s + f.size, 0)
      },
      unusedFiles: unusedFiles.map(f => ({ path: f.relPath, size: f.size, ext: f.ext })),
      referencedFiles: referencedFiles.map(f => ({ path: f.relPath, reason: f.reason }))
    }, null, 2));
    return;
  }

  if (args.includes('--quarantine')) {
    if (unusedFiles.length === 0) {
      console.log('✨ No unused files found to quarantine.');
      return;
    }
    quarantineFiles(unusedFiles);
    return;
  }

  // Default: Preview Report
  printReport(referencedFiles, unusedFiles);
}

main();
