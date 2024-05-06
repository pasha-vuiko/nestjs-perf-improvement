export function getConstructorName(constructor: any): string | undefined {
  return constructor ? constructor.__proto__.constructor.name : undefined;
}
