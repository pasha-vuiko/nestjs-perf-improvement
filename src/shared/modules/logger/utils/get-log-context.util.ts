import { getConstructorName } from './get-constructor-name.util';

export function getLogContext(
  methodContext: any,
  methodName = '',
  methodArgs: any = [],
): string | undefined {
  if (!methodContext) {
    return '';
  }

  const constructorName = getConstructorName(methodContext);
  const argsToLog = getMethodArgsToLog(methodArgs);

  if (methodName && argsToLog.length) {
    return `${constructorName}.${methodName}( ${argsToLog} )`;
  }

  if (methodName) {
    return `${constructorName}.${methodName}()`;
  }

  return constructorName;
}

function getMethodArgsToLog(args: any[]): string {
  const stringifiedArgs = args
    .map(arg => shortArg(arg))
    .reduce((acc, curr) => acc + curr + ', ', '');

  return stringifiedArgs.substring(0, stringifiedArgs.length - 2);
}

function shortArg(arg: any): any {
  const MAX_ARG_LENGTH = 20;

  if (typeof arg === 'string') {
    return shortString(arg, MAX_ARG_LENGTH);
  }

  if (typeof arg === 'object') {
    return shortObject(arg, MAX_ARG_LENGTH);
  }

  return arg;
}

function shortObject(object: any, strLength: number): string {
  try {
    return shortString(JSON.stringify(object), strLength);
  } catch (e) {
    return '[object Object]';
  }
}

function shortString(str: string, strLength: number): string {
  return str.substring(0, strLength) + '...';
}
