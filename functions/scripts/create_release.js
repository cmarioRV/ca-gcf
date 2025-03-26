const { execSync, spawnSync } = require('child_process');
const readline = require('readline');

const message = (text) => {
  console.log(`\n######################################################################`);
  console.log(`# ${text}`);
  console.log(`######################################################################\n`);
};

const getLatestTag = () => {
  return execSync('git describe --tags "$(git rev-list --tags --max-count=1)"').toString().trim();
};

const calculateReleaseVersion = (latestTag) => {
  const parts = latestTag.split('.');
  if (parts.length !== 2) {
    console.error(`${latestTag} no es una versión válida`);
    process.exit(1);
  }
  const minor = parseInt(parts[0], 10) + 1;
  return `${minor}.0`;
};

const runCommand = (command) => {
  execSync(command, { stdio: 'inherit' });
};

const confirmAction = (question) => {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(['y', 'yes', ''].includes(answer.trim().toLowerCase()));
    });
  });
};

(async () => {
  try {
    message('>>> Starting release');

    // Comprobar si GH CLI está instalado
    try {
      execSync('gh --version', { stdio: 'ignore' });
    } catch (e) {
      console.error('ERROR: gh CLI no está instalado. Por favor instálalo primero.');
      process.exit(1);
    }

    runCommand('gh auth status');

    // Comprobar rama actual
    const currentBranch = execSync('git rev-parse --abbrev-ref HEAD').toString().trim();
    if (currentBranch !== 'develop') {
      console.error('ERROR: Debes estar en la rama develop');
      process.exit(1);
    }

    // Comprobar cambios pendientes
    const status = execSync('git status --porcelain').toString().trim();
    if (status) {
      console.error('ERROR: Tienes cambios sin comitear. Limpia la rama primero.');
      process.exit(1);
    }

    message('>>> Pulling develop');
    runCommand('git pull origin develop');

    message('>>> Pulling tags');
    runCommand('git fetch --prune --prune-tags origin');

    // Obtener versión de release
    const latestTag = getLatestTag();
    const releaseVersion = calculateReleaseVersion(latestTag);

    message(`>>> Release: ${releaseVersion}`);

    const confirmed = await confirmAction(`Last release version was '${latestTag}', do you want to create '${releaseVersion}' [Y/n]: `);
    if (!confirmed) {
      message('Action cancelled exiting...');
      process.exit(1);
    }

    const branchName = `release/${releaseVersion}`;

    message(`>>>>> Creating branch '${branchName}' from develop...`);

    runCommand(`git checkout -b ${branchName} develop`);
    runCommand(`git push origin ${branchName}`);
    runCommand(`gh pr create --base main --head ${branchName} --title "Release - ${releaseVersion}" --fill`);

    message('✅ Release branch created successfully!');

  } catch (error) {
    console.error('❌ Error executing release:', error.message);
    process.exit(1);
  }
})();
