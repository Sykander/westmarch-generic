import { access, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import ts from 'typescript';

const sourceExtensions = ['.tsx', '.ts'];
const rawSuffix = '?raw';

async function exists(filename) {
  try {
    await access(filename);
    return true;
  } catch {
    return false;
  }
}

export async function resolve(specifier, context, defaultResolve) {
  const isRaw = specifier.endsWith(rawSuffix);
  const cleanSpecifier = isRaw ? specifier.slice(0, -rawSuffix.length) : specifier;

  if (cleanSpecifier.startsWith('.') || cleanSpecifier.startsWith('/')) {
    const parentPath = context.parentURL
      ? path.dirname(fileURLToPath(context.parentURL))
      : process.cwd();
    const basePath = cleanSpecifier.startsWith('/')
      ? cleanSpecifier
      : path.resolve(parentPath, cleanSpecifier);
    const candidates = [
      basePath,
      ...sourceExtensions.map((extension) => `${basePath}${extension}`),
      ...sourceExtensions.map((extension) => path.join(basePath, `index${extension}`)),
    ];

    for (const candidate of candidates) {
      if (await exists(candidate)) {
        return {
          shortCircuit: true,
          url: `${pathToFileURL(candidate).href}${isRaw ? rawSuffix : ''}`,
        };
      }
    }
  }

  return defaultResolve(specifier, context, defaultResolve);
}

export async function load(url, context, defaultLoad) {
  if (url.endsWith(rawSuffix)) {
    const fileUrl = new URL(url);
    fileUrl.search = '';
    const source = await readFile(fileURLToPath(fileUrl), 'utf8');

    return {
      format: 'module',
      shortCircuit: true,
      source: `export default ${JSON.stringify(source)};`,
    };
  }

  if (sourceExtensions.some((extension) => url.endsWith(extension))) {
    const source = await readFile(fileURLToPath(url), 'utf8');
    const result = ts.transpileModule(source, {
      compilerOptions: {
        esModuleInterop: true,
        jsx: ts.JsxEmit.ReactJSX,
        module: ts.ModuleKind.ESNext,
        moduleResolution: ts.ModuleResolutionKind.Bundler,
        target: ts.ScriptTarget.ES2022,
      },
      fileName: fileURLToPath(url),
    });

    return {
      format: 'module',
      shortCircuit: true,
      source: result.outputText,
    };
  }

  return defaultLoad(url, context, defaultLoad);
}
