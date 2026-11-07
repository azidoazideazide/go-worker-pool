import assert from 'node:assert/strict';
import { test } from 'node:test';
import { cssDurationMs } from './css-time.ts';

test('authored millisecond tokens stay milliseconds', () => {
	assert.equal(cssDurationMs('420ms', 1), 420);
	assert.equal(cssDurationMs('150ms', 1), 150);
	assert.equal(cssDurationMs('260ms', 1), 260);
});

test('minified second tokens convert back to milliseconds', () => {
	assert.equal(cssDurationMs('.42s', 1), 420);
	assert.equal(cssDurationMs('0.15s', 1), 150);
	assert.equal(cssDurationMs('.26s', 1), 260);
	assert.equal(cssDurationMs('.2s', 1), 200);
	assert.equal(cssDurationMs('.7s', 1), 700);
});

test('missing or unreadable values use the fallback', () => {
	assert.equal(cssDurationMs('', 420), 420);
	assert.equal(cssDurationMs('   ', 420), 420);
	assert.equal(cssDurationMs('fast', 420), 420);
});
