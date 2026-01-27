#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Data from the table: File name -> { folder, modified date }
const modifications = {
  'Demystifying NCCL': { folder: 'ml-systems', date: '2025-12-22' },
  'Ray summit notes': { folder: 'ml-systems', date: '2025-12-22' },
  'what is ray, anyway?': { folder: 'ml-systems', date: '2025-12-22' },
  'notes on interior design': { folder: 'guides', date: '2025-12-11' },
  'lead climbing field notes': { folder: 'guides', date: '2025-12-08' },
  'Garden Day 2': { folder: 'garden-days', date: '2025-12-07' },
  'Digital Spaces Reading Collection': { folder: 'internet', date: '2025-12-06' },
  'truths i know about writing': { folder: 'wip', date: '2025-11-30' },
  'acai': { folder: 'recipes', date: '2025-11-29' },
  'teriyaki sauce': { folder: 'recipes', date: '2025-11-29' },
  'pot roast': { folder: 'recipes', date: '2025-11-29' },
  'soba': { folder: 'recipes', date: '2025-11-29' },
  'alfredo': { folder: 'recipes', date: '2025-11-29' },
  'cider': { folder: 'recipes', date: '2025-11-29' },
  'veggies': { folder: 'recipes', date: '2025-11-29' },
  'popovers': { folder: 'recipes', date: '2025-11-29' },
  'banana cake': { folder: 'recipes', date: '2025-11-29' },
  'pineapplebun': { folder: 'recipes', date: '2025-11-29' },
  'pecans': { folder: 'recipes', date: '2025-11-29' },
  'noodles': { folder: 'recipes', date: '2025-11-29' },
  'miso': { folder: 'recipes', date: '2025-11-29' },
  'lasagna': { folder: 'recipes', date: '2025-11-29' },
  'curry': { folder: 'recipes', date: '2025-11-29' },
  'tofu': { folder: 'recipes', date: '2025-11-29' },
  'sfstreets route v1': { folder: 'community', date: '2025-11-29' },
  'long haul flights': { folder: 'guides', date: '2025-11-29' },
  'product recommendations': { folder: 'wip', date: '2025-11-29' },
  '2025-07-06': { folder: 'newsletter', date: '2025-11-29' },
  'bay area outdoor bouldering': { folder: 'guides', date: '2025-11-29' },
  'balatro': { folder: 'guides', date: '2025-11-29' },
  'my favorite internet writers': { folder: 'internet', date: '2025-11-24' },
  'The History of bencuan.me': { folder: 'about', date: '2025-11-24' },
  'colophons': { folder: 'internet', date: '2025-11-24' },
  '2025-06-13': { folder: 'newsletter', date: '2025-11-24' },
  "music i'm listening to": { folder: 'music', date: '2025-11-22' },
  'friendnet': { folder: 'personal', date: '2025-11-15' },
  "a list of everywhere I'm on the internet": { folder: 'personal', date: '2025-11-13' },
  'agency': { folder: 'personal', date: '2025-11-13' },
  'bookshelf': { folder: 'personal', date: '2025-11-13' },
  'Frameworks': { folder: 'about', date: '2025-11-09' },
  'Cool places on the internet': { folder: 'internet', date: '2025-11-09' },
  'Build Log': { folder: 'about', date: '2025-10-26' },
  'Garden Day 1': { folder: 'garden-days', date: '2025-10-26' },
  'Organizing fun events with friends': { folder: 'community', date: '2025-10-22' },
  'Things I want to do or organize': { folder: 'community', date: '2025-10-21' },
  'everything i know about keyboards': { folder: 'guides', date: '2025-10-20' },
  'gym routines': { folder: 'wip', date: '2025-10-19' },
  'fun berkeley classes you should consider taking': { folder: 'wip', date: '2025-08-09' },
  'Sending and receiving email from a custom domain': { folder: 'homelabbing', date: '2025-08-06' },
  "A local's guide to SF": { folder: 'community', date: '2025-08-03' },
  'skincare': { folder: 'wip', date: '2025-07-29' },
  'packing list for trips': { folder: 'wip', date: '2025-07-19' },
  'moodboard': { folder: 'wip', date: '2025-07-16' },
  'Self-hosting isso-comments': { folder: 'homelabbing', date: '2025-07-08' },
  'tips for major career decisions': { folder: 'wip', date: '2025-07-08' },
  'Obsidian Setup': { folder: 'about', date: '2025-07-06' },
  'Subscribe': { folder: '', date: '2025-07-06' },
  'Garden Design': { folder: 'about', date: '2025-07-06' },
  'examples of personal values docs': { folder: 'wip', date: '2025-07-04' },
  'Investigate Later': { folder: 'wip', date: '2025-07-04' },
  'Trip planning tips': { folder: 'community', date: '2025-06-25' },
  'Fonts and font foundries': { folder: 'internet', date: '2025-06-17' },
  'Reading list': { folder: 'wip', date: '2025-06-17' },
  'sparkly people': { folder: 'wip', date: '2025-06-17' },
  'Mapping the Internet': { folder: 'internet', date: '2025-06-17' },
  'Self-hosting goatcounter with Docker Compose': { folder: 'homelabbing', date: '2025-06-11' },
  'recovering a bricked icloud': { folder: 'wip', date: '2025-06-10' },
  'perplexity talk': { folder: 'wip', date: '2025-06-10' },
  'speakersafetyd': { folder: 'wip', date: '2025-06-10' },
  'strong opinions weakly held': { folder: 'wip', date: '2025-06-10' },
  'Inspiration': { folder: 'about', date: '2025-06-10' },
  'Contact Me': { folder: '', date: '2025-06-06' },
  'Rating Scales': { folder: 'personal', date: '2025-06-06' },
  'The Open Computing Facility': { folder: 'community', date: '2025-06-06' },
  'Note Stages': { folder: 'about', date: '2025-06-06' },
  'phone and desktop wallpapers': { folder: 'wip', date: '2025-06-06' },
  'linux commands i need': { folder: 'wip', date: '2025-06-05' },
  'dotfiles': { folder: 'homelabbing', date: '2025-06-04' },
  "A short list of things i don't want to self host": { folder: 'homelabbing', date: '2025-06-04' },
  'The Story of LaunchHacks': { folder: 'wip', date: '2025-06-03' },
  'ruina montium': { folder: 'wip', date: '2025-06-03' },
  'What Comes Around Goes Around': { folder: 'wip', date: '2025-06-02' },
  'plants': { folder: 'wip', date: '2025-05-27' },
  'new mac setup': { folder: 'wip', date: '2025-05-27' },
  'bluesky': { folder: 'wip', date: '2025-05-27' },
  'How to fetch dashcam footage from comma 3X': { folder: 'wip', date: '2025-05-27' },
  'buying glasses': { folder: 'wip', date: '2025-05-27' },
  'Civ 5 Strategy': { folder: 'wip', date: '2025-05-27' },
  'Yosemite trip template': { folder: 'community', date: '2025-05-27' },
};

const contentBase = path.join(__dirname, '..', 'content', 'vsh');

function updateFile(fileName, folder, modifiedDate) {
  const filePath = folder
    ? path.join(contentBase, folder, `${fileName}.md`)
    : path.join(contentBase, `${fileName}.md`);

  if (!fs.existsSync(filePath)) {
    console.log(`⚠️  File not found: ${filePath}`);
    return false;
  }

  let content = fs.readFileSync(filePath, 'utf-8');
  const hasFrontmatter = content.startsWith('---');

  if (hasFrontmatter) {
    const endOfFrontmatter = content.indexOf('---', 3);
    if (endOfFrontmatter === -1) {
      console.log(`⚠️  Malformed frontmatter in: ${filePath}`);
      return false;
    }
    let frontmatter = content.slice(0, endOfFrontmatter);
    const rest = content.slice(endOfFrontmatter);

    // Check if modified already exists
    if (/^modified:/m.test(frontmatter)) {
      frontmatter = frontmatter.replace(/^modified:.*$/m, `modified: ${modifiedDate}`);
    } else {
      frontmatter = frontmatter.trimEnd() + `\nmodified: ${modifiedDate}\n`;
    }
    content = frontmatter + rest;
  } else {
    // Add frontmatter
    content = `---\nmodified: ${modifiedDate}\n---\n${content}`;
  }

  fs.writeFileSync(filePath, content);
  console.log(`✅ Updated: ${filePath}`);
  return true;
}

let updated = 0, failed = 0;
for (const [fileName, { folder, date }] of Object.entries(modifications)) {
  if (updateFile(fileName, folder, date)) {
    updated++;
  } else {
    failed++;
  }
}

console.log(`\nDone! Updated ${updated} files, ${failed} failed.`);

