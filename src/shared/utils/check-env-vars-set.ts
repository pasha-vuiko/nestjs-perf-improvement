import fs from 'node:fs';

export function checkEnvVarsSet(exampleEnvFilePath: string): boolean {
  const exampleEnvFileContent = fs.readFileSync(exampleEnvFilePath, 'utf8');
  const parsedEnvFileContent = parseEnvFileContent(exampleEnvFileContent);

  const missingEnvVars = Object.keys(parsedEnvFileContent).filter(
    envVarName => !Object.hasOwn(process.env, envVarName),
  );

  if (missingEnvVars.length) {
    throw new Error(`Missing environment variables: \n${missingEnvVars.join(', ')}`);
  }

  return true;
}

function parseEnvFileContent(envFileContent: string): Record<string, string> {
  const keyValuePairs = envFileContent
    .split(/\r?\n/)
    .filter(Boolean)
    .filter(line => line.trim())
    .filter(line => !line.startsWith('#'))
    .map(line => line.split('=') as [string, string]);

  return Object.fromEntries(keyValuePairs);
}
