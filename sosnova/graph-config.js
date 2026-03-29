export const NODES = [
  {
    id: 'master',
    label: 'Master Plan',
    stillPath: '../C8_kompresja.jpeg',
    stillAlt: 'Sosnova master plan',
    idleVideoPath: './master-plan-h265.mp4',
    backConnectionId: null
  },
  {
    id: 'house-1',
    label: 'House 1',
    stillPath: '../remove_the_parking_202603291940.png',
    stillAlt: 'Sosnova zoomed home detail',
    backConnectionId: 'master-house-1'
  },
  {
    id: 'house-2',
    label: 'House 2',
    stillPath: './2nd.png',
    stillAlt: 'Sosnova second zoomed home detail',
    backConnectionId: 'master-house-2'
  }
];

export const CONNECTIONS = [
  {
    id: 'master-house-1',
    fromNodeId: 'master',
    toNodeId: 'house-1',
    label: 'Master to House 1',
    maskPaths: {
      master: 'M 18 61 L 28 51 L 35 65 L 36 78 L 29 88 L 20 79 Z'
    },
    videoPath: '../sosnova-reversed-h265.mp4',
    reverseMode: 'asset',
    reverseVideoPath: '../sosnova-return-h265.mp4'
  },
  {
    id: 'master-house-2',
    fromNodeId: 'master',
    toNodeId: 'house-2',
    label: 'Master to House 2',
    maskPaths: {
      master: 'M 37 44 L 31 51 L 36 65 L 37 77 L 43 69 L 43 57 Z'
    },
    videoPath: './2nd-h265.mp4',
    reverseMode: 'asset',
    reverseVideoPath: './2nd-reversed-h265.mp4'
  },
  {
    id: 'between-houses',
    fromNodeId: 'house-1',
    toNodeId: 'house-2',
    label: 'House 1 to House 2',
    maskPaths: {
      'house-1': 'M 40 24 L 54 26 L 62 41 L 62 71 L 49 79 L 49 43 Z',
      'house-2': 'M 20 30 L 36 30 L 31 47 L 31 73 L 15 71 L 15 47 Z'
    },
    videoPath: './between-h265.mp4',
    reverseMode: 'asset',
    reverseVideoPath: './between-reversed-h265.mp4'
  }
];

export function getNodeById(nodeId) {
  return NODES.find((node) => node.id === nodeId) ?? null;
}

export function getConnectionById(connectionId) {
  return CONNECTIONS.find((connection) => connection.id === connectionId) ?? null;
}

export function getOutgoingConnections(nodeId) {
  return CONNECTIONS.filter((connection) => {
    if (connection.fromNodeId === nodeId && connection.maskPaths[nodeId]) {
      return true;
    }

    return connection.toNodeId === nodeId && connection.maskPaths[nodeId];
  }).map((connection) => createTraversal(connection, nodeId));
}

export function createTraversal(connection, currentNodeId) {
  if (connection.fromNodeId === currentNodeId) {
    return {
      connectionId: connection.id,
      sourceNodeId: currentNodeId,
      targetNodeId: connection.toNodeId,
      maskPath: connection.maskPaths[currentNodeId] ?? null,
      playback: {
        mode: 'forward',
        videoPath: connection.videoPath
      }
    };
  }

  if (connection.toNodeId === currentNodeId) {
    return {
      connectionId: connection.id,
      sourceNodeId: currentNodeId,
      targetNodeId: connection.fromNodeId,
      maskPath: connection.maskPaths[currentNodeId] ?? null,
      playback: {
        mode: connection.reverseMode,
        videoPath: connection.reverseMode === 'asset' ? connection.reverseVideoPath : connection.videoPath
      }
    };
  }

  return null;
}

export function getPreloadVideoPathsForNode(nodeId) {
  const paths = new Set();
  const node = getNodeById(nodeId);

  for (const traversal of getOutgoingConnections(nodeId)) {
    if (traversal?.playback?.videoPath) {
      paths.add(traversal.playback.videoPath);
    }
  }

  if (node?.backConnectionId) {
    const backConnection = getConnectionById(node.backConnectionId);
    const backTraversal = backConnection ? createTraversal(backConnection, nodeId) : null;

    if (backTraversal?.playback?.videoPath) {
      paths.add(backTraversal.playback.videoPath);
    }
  }

  return [...paths];
}

export function getAllRequiredAssetPaths() {
  const paths = new Set();

  for (const node of NODES) {
    if (node.stillPath) {
      paths.add(node.stillPath);
    }

    if (node.idleVideoPath) {
      paths.add(node.idleVideoPath);
    }
  }

  for (const connection of CONNECTIONS) {
    if (connection.videoPath) {
      paths.add(connection.videoPath);
    }

    if (connection.reverseVideoPath) {
      paths.add(connection.reverseVideoPath);
    }
  }

  return [...paths];
}
