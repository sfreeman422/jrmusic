import assert from 'assert';
import { nowPlayingEmbed, queuedEmbed, queueListEmbed, infoEmbed, errorEmbed } from '../src/utils/embeds';
import { Track } from '../src/MusicQueue';

function makeTrack(title = 'Test Track'): Track {
  return new Track({
    url: 'https://example.com',
    title,
    duration: '3:00',
    requester: 'user#0001',
    thumbnail: 'https://example.com/thumb.jpg',
  });
}

{
  const embed = nowPlayingEmbed(makeTrack('Hello World'));
  assert.ok(embed.data.title?.includes('Now Playing'));
  assert.ok(embed.data.description?.includes('Hello World'));
  assert.strictEqual(embed.data.thumbnail?.url, 'https://example.com/thumb.jpg');
  console.log('✅ nowPlayingEmbed');
}

{
  const embed = queuedEmbed(makeTrack('Queue Song'), 5);
  assert.ok(embed.data.description?.includes('Queue Song'));
  assert.ok(embed.data.description?.includes('5'));
  console.log('✅ queuedEmbed');
}

{
  const tracks = Array.from({ length: 15 }, (_, i) => makeTrack(`Track ${i + 1}`));
  const embed = queueListEmbed(tracks, makeTrack('NP'), 1);
  assert.ok(embed.data.description?.includes('Track 1'));
  assert.ok(embed.data.footer?.text.includes('Page 1/2'));
  console.log('✅ queueListEmbed (pagination)');
}

{
  const embed = infoEmbed('Hello info');
  assert.ok(embed.data.description?.includes('Hello info'));
  console.log('✅ infoEmbed');
}

{
  const embed = errorEmbed('Something broke');
  assert.ok(embed.data.description?.includes('Something broke'));
  assert.ok(embed.data.description?.includes('❌'));
  console.log('✅ errorEmbed');
}

console.log('\n✅ All embed tests passed.');
