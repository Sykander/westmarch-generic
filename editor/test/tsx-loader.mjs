import { access, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import ts from 'typescript';

const sourceExtensions = ['.tsx', '.ts'];

async function exists(filename) {
  try {
    await access(filename);
    return true;
  } catch {
    return false;
  }
}

export async function resolve(specifier, context, defaultResolve) {
  if (specifier.startsWith('.') || specifier.startsWith('/')) {
    const parentPath = context.parentURL
      ? path.dirname(fileURLToPath(context.parentURL))
      : process.cwd();
    const basePath = specifier.startsWith('/') ? specifier : path.resolve(parentPath, specifier);
    const candidates = [
      basePath,
      ...sourceExtensions.map((extension) => `${basePath}${extension}`),
      ...sourceExtensions.map((extension) => path.join(basePath, `index${extension}`)),
    ];

    for (const candidate of candidates) {
      if (await exists(candidate)) {
        return {
          shortCircuit: true,
          url: pathToFileURL(candidate).href,
        };
      }
    }
  }

  return defaultResolve(specifier, context, defaultResolve);
}

export async function load(url, context, defaultLoad) {
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
