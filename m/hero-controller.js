export function createHeroController({ reverseBlendWindow = 0.25 } = {}) {
  let state = {
    mode: 'node',
    currentNodeId: 'master',
    parentNodeId: null,
    pendingConnectionId: null,
    pendingBackConnectionId: null,
    pendingParentNodeId: null,
    pendingParentBackConnectionId: null,
    targetNodeId: null,
    backVisible: false,
    reverseBlendActive: false,
    currentBackConnectionId: null,
    currentParentBackConnectionId: null
  };

  function getState() {
    return {
      mode: state.mode,
      currentNodeId: state.currentNodeId,
      pendingConnectionId: state.pendingConnectionId,
      targetNodeId: state.targetNodeId,
      backVisible: state.backVisible,
      reverseBlendActive: state.reverseBlendActive
    };
  }

  function handleConnectionClick({ connectionId, targetNodeId, backConnectionId }) {
    if (state.mode !== 'node') {
      return { type: 'noop' };
    }

    state = {
      ...state,
      mode: 'forward',
      pendingConnectionId: connectionId,
      pendingBackConnectionId: backConnectionId,
      pendingParentNodeId: state.currentNodeId,
      pendingParentBackConnectionId: state.currentBackConnectionId,
      targetNodeId,
      backVisible: false,
      reverseBlendActive: false
    };

    return {
      type: 'play-forward',
      connectionId,
      targetNodeId
    };
  }

  function handleForwardEnded() {
    if (state.mode !== 'forward' || !state.pendingConnectionId || !state.targetNodeId) {
      return;
    }

    state = {
      mode: 'node',
      currentNodeId: state.targetNodeId,
      parentNodeId: state.pendingParentNodeId,
      pendingConnectionId: null,
      pendingBackConnectionId: null,
      pendingParentNodeId: null,
      pendingParentBackConnectionId: null,
      targetNodeId: null,
      backVisible: state.targetNodeId !== 'master',
      reverseBlendActive: false,
      currentBackConnectionId: state.pendingBackConnectionId,
      currentParentBackConnectionId: state.pendingParentBackConnectionId
    };
  }

  function handleBackClick() {
    if (state.mode !== 'node' || state.currentNodeId === 'master' || !state.currentBackConnectionId) {
      return { type: 'noop' };
    }

    const connectionId = state.currentBackConnectionId;
    const targetNodeId = state.parentNodeId ?? 'master';

    state = {
      ...state,
      mode: 'reverse',
      pendingConnectionId: connectionId,
      pendingBackConnectionId: null,
      targetNodeId,
      backVisible: false,
      reverseBlendActive: false
    };

    return {
      type: 'play-reverse',
      connectionId,
      targetNodeId
    };
  }

  function handleReverseProgress(currentTime) {
    if (state.mode !== 'reverse') {
      return;
    }

    state = {
      ...state,
      reverseBlendActive: currentTime <= reverseBlendWindow
    };
  }

  function handleReverseComplete() {
    if (state.mode !== 'reverse') {
      return;
    }

    const targetNodeId = state.targetNodeId;

    state = {
      mode: 'node',
      currentNodeId: targetNodeId,
      parentNodeId: null,
      pendingConnectionId: null,
      pendingBackConnectionId: null,
      pendingParentNodeId: null,
      pendingParentBackConnectionId: null,
      targetNodeId: null,
      backVisible: targetNodeId !== 'master',
      reverseBlendActive: false,
      currentBackConnectionId: state.currentParentBackConnectionId,
      currentParentBackConnectionId: null
    };
  }

  return {
    getState,
    handleConnectionClick,
    handleForwardEnded,
    handleBackClick,
    handleReverseProgress,
    handleReverseComplete
  };
}
