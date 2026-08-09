'use strict';

const assert = require('assert');
const { Track, MusicQueue } = require('../src/MusicQueue');

function makeTrack(title = 'Test Track') {
  return new Track({ url: 'https://example.com', title, duration: '3:00', requester: 'user#0001' });
}

// Track
{
  const t = makeTrack('My Song');
  assert.strictEqual(t.title, 'My Song');
  assert.strictEqual(t.duration, '3:00');
  assert.ok(t.toString().includes('My Song'));
  console.log('✅ Track: construction and toString');
}

// MusicQueue – basic enqueue/dequeue
{
  const q = new MusicQueue();
  assert.ok(q.isEmpty);
  q.enqueue(makeTrack('A'));
  q.enqueue(makeTrack('B'));
  assert.strictEqual(q.size, 2);
  assert.strictEqual(q.peek().title, 'A');
  const next = q.dequeue();
  assert.strictEqual(next.title, 'A');
  assert.strictEqual(q.size, 1);
  console.log('✅ MusicQueue: enqueue / dequeue / peek');
}

// MusicQueue – clear
{
  const q = new MusicQueue();
  q.enqueue(makeTrack('A'));
  q.enqueue(makeTrack('B'));
  q.clear();
  assert.ok(q.isEmpty);
  assert.strictEqual(q.size, 0);
  console.log('✅ MusicQueue: clear');
}

// MusicQueue – removeAt
{
  const q = new MusicQueue();
  q.enqueue(makeTrack('A'));
  q.enqueue(makeTrack('B'));
  q.enqueue(makeTrack('C'));
  const removed = q.removeAt(2);
  assert.strictEqual(removed.title, 'B');
  assert.strictEqual(q.size, 2);
  assert.strictEqual(q.tracks[1].title, 'C');
  assert.strictEqual(q.removeAt(99), null);
  console.log('✅ MusicQueue: removeAt');
}

// MusicQueue – loop mode
{
  const q = new MusicQueue();
  q.loop = true;
  q.enqueue(makeTrack('A'));
  q.enqueue(makeTrack('B'));
  const first = q.dequeue();
  assert.strictEqual(first.title, 'A');
  // A should have been re-appended
  assert.strictEqual(q.size, 2);
  assert.strictEqual(q.tracks[1].title, 'A');
  console.log('✅ MusicQueue: loop mode re-enqueues track');
}

// MusicQueue – shuffle preserves first track
{
  const q = new MusicQueue();
  ['A', 'B', 'C', 'D', 'E'].forEach((t) => q.enqueue(makeTrack(t)));
  q.shuffle();
  assert.strictEqual(q.size, 5);
  // After shuffle the first track is still 'A' (the originally-next track)
  assert.strictEqual(q.tracks[0].title, 'A');
  console.log('✅ MusicQueue: shuffle preserves first track');
}

console.log('\n✅ All MusicQueue tests passed.');
