#!/usr/bin/env node

const fs = require('node:fs');
const path = require('node:path');

function rmdir(p) {
  if (fs.existsSync(p)) {
    fs.rmSync(p, { recursive: true, force: true, maxRetries: 3 });
    console.log('Removed:', p);
  }
}

function removeFiles(dir, patterns) {
  if (!fs.existsSync(dir)) return;

  const files = fs.readdirSync(dir);
  patterns.forEach(pattern => {
    const regex = new RegExp(`^${pattern.replace(/\*/g, '.*')}$`);
    files.forEach(file => {
      if (regex.test(file)) {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        if (stat.isDirectory()) {
          rmdir(filePath);
        } else {
          fs.unlinkSync(filePath);
          console.log('Removed:', filePath);
        }
      }
    });
  });
}

// Directories to remove
const dirs = ['node_modules', '.pnpm-store', 'dist', 'build', 'out', 'coverage', '.nyc_output'];

// Files to remove
const files = ['tsconfig.tsbuildinfo', '.tsbuildinfo'];

// Patterns to remove
const patterns = ['*.tsbuildinfo', '*.tmp', 'test-file.ts', 'empty.ts', 'test-log.txt', 'npm-debug.log*', 'yarn-debug.log*', 'yarn-error.log*', 'pnpm-debug.log*'];

// Clean root level
dirs.forEach(p => {
  rmdir(p)
});
files.forEach(p => {
  if (fs.existsSync(p)) {
    const stat = fs.statSync(p);
    if (stat.isDirectory()) {
      rmdir(p);
    } else {
      fs.unlinkSync(p);
      console.log('Removed:', p);
    }
  }
});
removeFiles('.', patterns);

// Clean packages subdirectories
['packages'].forEach(dir => {
  if (fs.existsSync(dir)) {
    fs.readdirSync(dir).forEach(sub => {
      const subPath = path.join(dir, sub);
      // Clean subdirectories
      dirs.forEach(p => {
        rmdir(path.join(subPath, p));
      });
      files.forEach(p => {
        const filePath = path.join(subPath, p);
        if (fs.existsSync(filePath)) {
          const stat = fs.statSync(filePath);
          if (stat.isDirectory()) {
            rmdir(filePath);
          } else {
            fs.unlinkSync(filePath);
            console.log('Removed:', filePath);
          }
        }
      });
      removeFiles(subPath, patterns);
    });
  }
});

console.log('Clean complete!');
