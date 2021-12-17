const bumpPrompt = require('@jsdevtools/version-bump-prompt');
const { run, step } = require('./utils');
const semver = require('semver');
const currentVersion = require('../package.json').version;
const args = require('minimist')(process.argv.slice(2));
const fs = require('fs');

const actionPublishCanary =
  ['preminor', 'prepatch'].includes(args.version) && process.env.CI;

async function main() {
  // build all packages with types
  step('\nSelect bumpVersion...');
  const selectVersion = await bumpVersion();
  if (selectVersion) {
    step(
      `\nbumpVersion ${selectVersion.oldVersion} => ${selectVersion.newVersion}...`,
    );
  }

  // run tests before release
  step('\nRunning tests...');
  await test();

  // build all packages with types
  step('\nBuilding all packages...');
  await build();

  const { stdout } = await run('git', ['diff'], { stdio: 'pipe' });
  if (stdout) {
    if (process.env.CI) {
      step('\nSetting git info...');
      await run('git', [
        'config',
        '--global',
        'user.name',
        'github-actions[bot]',
      ]);
      await run('git', [
        'config',
        '--global',
        'user.email',
        'github-actions[bot]@users.noreply.github.com',
      ]);
    }
    step('\nCommitting changes...');

    // canary don't need to push
    if (!actionPublishCanary) {
      await run('git', ['add', '-A']);
      await run('git', [
        'commit',
        '-m',
        `release: v${selectVersion.newVersion}`,
      ]);
    }
  } else {
    console.log('No changes to commit.');
  }

  step('\nSetting npmrc ...');
  await writeNpmrc();

  if (selectVersion) {
    step('\nPublishing...');
    await publish(selectVersion.newVersion);
  } else {
    console.log('No new version:', selectVersion);
  }

  if (!actionPublishCanary) {
    // canary don't need to push
    // push to GitHub
    if (args.version !== 'prerelease') {
      step('\nPushing to GitHub...');
      await pushToGithub(selectVersion);
    }
  }
}

async function build() {
  await run('pnpm', ['build']);
}

async function test() {
  await run('pnpm', ['test']);
}

async function bumpVersion() {
  let version = args.version;
  if (version && actionPublishCanary) {
    const hash = +new Date();
    version = semver.inc(currentVersion, version, 'beta-' + hash);
  }

  return await bumpPrompt({
    files: ['package.json', 'packages/*/package.json'],
    release: version || '',
    push: false,
    tag: false,
  });
}

async function pushToGithub(selectVersion) {
  // push to GitHub
  await run('git', ['tag', `v${selectVersion.newVersion}`]);
  await run('git', [
    'push',
    'origin',
    `refs/tags/v${selectVersion.newVersion}`,
  ]);
  await run('git', ['push']);
}

async function publish(version) {
  let releaseTag = 'latest';
  if (args.version) {
    releaseTag = args.version;
  } else if (version.includes('alpha')) {
    releaseTag = 'alpha';
  } else if (version.includes('beta')) {
    releaseTag = 'beta';
  } else if (version.includes('rc')) {
    releaseTag = 'rc';
  }
  let publishArgs = ['-r', 'publish', '--access', 'public', '--no-git-checks'];
  if (version) {
    publishArgs = publishArgs.concat(['--tag', releaseTag]);
  }

  await run('pnpm', publishArgs);
}

async function writeNpmrc() {
  if (process.env.CI) {
    const npmrcPath = `${process.env.HOME}/.npmrc`;
    if (fs.existsSync(npmrcPath)) {
      console.info('Found existing .npmrc file');
    } else {
      console.info('No .npmrc file found, creating one');
      fs.writeFileSync(
        npmrcPath,
        `//registry.npmjs.org/:_authToken=${process.env.NPM_TOKEN}`,
      );
    }
  }
}

main().catch((err) => {
  console.error(err);
});
