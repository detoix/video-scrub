import test from 'node:test';
import assert from 'node:assert/strict';

import {
  CONNECTIONS,
  createTraversal,
  getConnectionById,
  getNodeById,
  getOutgoingConnections
} from './graph-config.js';

test('defines three nodes and three bidirectional connections for the triangle', () => {
  assert.equal(getNodeById('master')?.label, 'Master Plan');
  assert.equal(getNodeById('master')?.backConnectionId, null);
  assert.equal(getNodeById('master')?.idleVideoPath, './master-plan-web.mp4');
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
  assert.equal(reverseTraversal.playback.videoPath, './between-reversed-web.mp4');
});
