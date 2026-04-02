export const NODES = [
  {
    id: 'master',
    label: 'Master Plan',
    stillPath: './malente_master_plan.png',
    stillAlt: 'Malente master plan',
    idleVideoPath: './aerial_master_plan.mp4',
    backConnectionId: null
  },
  {
    id: 'close-up-2',
    label: 'Close Up',
    stillPath: './malente_close_up_2.png',
    stillAlt: 'Malente close up',
    backConnectionId: 'master-close-up-2'
  }
];

export const CONNECTIONS = [
  {
    id: 'master-close-up-2',
    fromNodeId: 'master',
    toNodeId: 'close-up-2',
    label: 'Master to Close Up',
    maskPaths: {
      master: 'M 45 54 L 65 54 L 66 77 L 43 77 Z'
    },
    videoPath: './master-plan-to-close-up-2.mp4',
    reverseMode: 'asset',
    reverseVideoPath: './master-plan-to-close-up-2-reversed.mp4'
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
