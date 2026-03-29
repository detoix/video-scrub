import test from 'node:test';
import assert from 'node:assert/strict';

import {
  CONNECTIONS,
  createTraversal,
  getConnectionById,
  getNodeById,
  getOutgoingConnections,
  getPreloadVideoPathsForNode
} from './graph-config.js';

test('defines three nodes and three bidirectional connections for the triangle', () => {
  assert.equal(getNodeById('master')?.label, 'Master Plan');
  assert.equal(getNodeById('master')?.backConnectionId, null);
  assert.equal(getNodeById('master')?.idleVideoPath, './master-plan-h265.mp4');
  assert.equal(getNodeById('house-1')?.stillPath, '../remove_the_parking_202603291940.png');
  assert.equal(getNodeById('house-1')?.backConnectionId, 'master-house-1');
  assert.equal(getNodeById('house-2')?.stillPath, './2nd.png');
  assert.equal(getNodeById('house-2')?.backConnectionId, 'master-house-2');
  assert.equal(CONNECTIONS.length, 3);
});

test('returns outgoing traversals for the current node with the right target ids', () => {
  const masterTraversals = getOutgoingConnections('master');
  assert.deepEqual(
    masterTraversals.map((traversal) => traversal.targetNodeId).sort(),
    ['house-1', 'house-2']
  );

  const house1Traversals = getOutgoingConnections('house-1');
  assert.deepEqual(house1Traversals.map((traversal) => traversal.targetNodeId), ['house-2']);
});

test('uses asset reversal for the between-houses connection', () => {
  const connection = getConnectionById('between-houses');
  const reverseTraversal = createTraversal(connection, 'house-2');

  assert.equal(reverseTraversal.targetNodeId, 'house-1');
  assert.equal(reverseTraversal.playback.mode, 'asset');
  assert.equal(reverseTraversal.playback.videoPath, './between-reversed-h265.mp4');
});

test('uses a dedicated return asset for house 1 back to master', () => {
  const connection = getConnectionById('master-house-1');
  const reverseTraversal = createTraversal(connection, 'house-1');

  assert.equal(reverseTraversal.targetNodeId, 'master');
  assert.equal(reverseTraversal.playback.mode, 'asset');
  assert.equal(reverseTraversal.playback.videoPath, '../sosnova-return-h265.mp4');
});

test('preloads only the master outgoing clips on the master node', () => {
  assert.deepEqual(getPreloadVideoPathsForNode('master').sort(), [
    '../sosnova-reversed-h265.mp4',
    './2nd-h265.mp4'
  ]);
});

test('preloads house-specific outgoing and back clips lazily on close-ups', () => {
  assert.deepEqual(getPreloadVideoPathsForNode('house-1').sort(), [
    '../sosnova-return-h265.mp4',
    './between-h265.mp4'
  ]);

  assert.deepEqual(getPreloadVideoPathsForNode('house-2').sort(), [
    './2nd-reversed-h265.mp4',
    './between-reversed-h265.mp4'
  ]);
});
