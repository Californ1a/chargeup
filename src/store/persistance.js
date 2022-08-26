/** Tries to persist storage without ever prompting user.
  @returns {Promise<string>}
    "never" In case persisting is not ever possible. Caller don't bother
      asking user for permission.
    "prompt" In case persisting would be possible if prompting user first.
    "persisted" In case this call successfully silently persisted the storage,
      or if it was already persisted.
		https://dexie.org/docs/StorageManager
*/
export default async function tryPersistWithoutPromtingUser() {
	if (!navigator.storage || !navigator.storage.persisted) {
		return 'never';
	}
	let persisted = await navigator.storage.persisted();
	if (persisted) {
		return 'persisted';
	}
	if (!navigator.permissions || !navigator.permissions.query) {
		return 'prompt'; // It MAY be successful to prompt. Don't know.
	}
	const permission = await navigator.permissions.query({
		name: 'persistent-storage',
	});
	if (permission.state === 'granted') {
		persisted = await navigator.storage.persist();
		if (persisted) {
			return 'persisted';
		}
		throw new Error('Failed to persist');
	}
	if (permission.state === 'prompt') {
		return 'prompt';
	}
	return 'never';
}
