import 'fake-indexeddb/auto';
import '@testing-library/jest-dom/vitest';
import { afterEach, beforeEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import { webcrypto } from 'node:crypto';
import { Blob as NodeBlob, File as NodeFile } from 'node:buffer';
import { db } from '../db/database';

// O Blob do jsdom não sobrevive ao "structured clone" do fake-indexeddb (vira objeto comum).
// Nos navegadores reais o IndexedDB guarda Blobs normalmente; nos testes usamos o Blob nativo do Node.
Object.defineProperty(globalThis, 'Blob', { value: NodeBlob, configurable: true, writable: true });
Object.defineProperty(globalThis, 'File', { value: NodeFile, configurable: true, writable: true });

// jsdom não implementa crypto.subtle por completo; usa o do Node.
if (!globalThis.crypto?.subtle || !globalThis.crypto?.randomUUID) {
  Object.defineProperty(globalThis, 'crypto', { value: webcrypto, configurable: true });
}

// Banco limpo a cada teste: nenhum teste depende de outro.
beforeEach(async () => {
  sessionStorage.clear();
  db.close();
  await db.delete();
  await db.open();
});

afterEach(() => {
  cleanup();
});
