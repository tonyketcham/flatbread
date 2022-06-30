import { execSync } from 'child_process';
import path from 'path';
import colors from 'kleur';
import { version } from '../package.json';
import fs from 'fs/promises';
import getPackagesManifest from './utils/packageManifest';

execSync('pnpm run build', { stdio: 'inherit' });

let command = 'npm publish --access public';

// if (version.includes('alpha')) command += ' --tag alpha';
if (version.includes('beta')) command += ' --tag beta';

const dirs = await fs.readdir('packages');

console.log(dirs);

const packages = await getPackagesManifest(dirs);

for (const { dirName, name, version } of packages) {
  try {
    execSync(command, {
      stdio: 'inherit',
      cwd: path.resolve(path.join('packages', dirName)),
    });
  } catch (_) {
    console.log(colors.red(`${name} ${version} failed to publish`));
  }
  console.log(colors.bold().green(`Published ${name} v${version}`));
}
