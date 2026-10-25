import { describe, it, expect } from 'vitest';
import { readFile } from 'node:fs/promises';

describe('Configuración inicial del backend', () => {
  it('el runner de pruebas está operativo', () => {
    expect(1 + 1).toBe(2);
  });

  it('expone los scripts esperados en package.json', async () => {
    const ruta = new URL('../package.json', import.meta.url);
    const pkg = JSON.parse(await readFile(ruta, 'utf8'));

    expect(Object.keys(pkg.scripts)).toEqual(
      expect.arrayContaining(['dev', 'start', 'test', 'test:watch', 'coverage', 'seed'])
    );
  });

  it('usa módulos ESM', async () => {
    const ruta = new URL('../package.json', import.meta.url);
    const pkg = JSON.parse(await readFile(ruta, 'utf8'));

    expect(pkg.type).toBe('module');
  });
});
