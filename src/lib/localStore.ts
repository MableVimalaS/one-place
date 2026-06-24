// Offline storage for audio files the user owns, kept in the browser via IndexedDB.
// Files never leave the device — they play locally with no internet and no upload.

const DB_NAME = 'oneplace-local'
const STORE = 'tracks'
const VERSION = 1

export interface StoredTrack {
  id: string
  title: string
  addedAt: number
  blob: Blob
}

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, VERSION)
    req.onupgradeneeded = () => {
      const db = req.result
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE, { keyPath: 'id' })
      }
    }
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
}

function run<T>(mode: IDBTransactionMode, fn: (store: IDBObjectStore) => IDBRequest): Promise<T> {
  return openDb().then(
    (db) =>
      new Promise<T>((resolve, reject) => {
        const tx = db.transaction(STORE, mode)
        const req = fn(tx.objectStore(STORE))
        req.onsuccess = () => resolve(req.result as T)
        req.onerror = () => reject(req.error)
      }),
  )
}

export async function addFile(file: File): Promise<void> {
  const track: StoredTrack = {
    id: crypto.randomUUID(),
    title: file.name.replace(/\.[^.]+$/, ''),
    addedAt: Date.now(),
    blob: file,
  }
  await run('readwrite', (store) => store.put(track))
}

export function list(): Promise<StoredTrack[]> {
  return run<StoredTrack[]>('readonly', (store) => store.getAll())
}

export async function rename(id: string, title: string): Promise<void> {
  const existing = await run<StoredTrack | undefined>('readonly', (store) => store.get(id))
  if (!existing) return
  await run('readwrite', (store) => store.put({ ...existing, title }))
}

export async function remove(id: string): Promise<void> {
  await run('readwrite', (store) => store.delete(id))
}
