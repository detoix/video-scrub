export function createHeroController({ reverseBlendWindow = 0.25 } = {}) {
  let state = {
    mode: 'node',
    currentNodeId: 'master',
    pendingConnectionId: null,
    pendingBackConnectionId: null,
    targetNodeId: null,
    backVisible: false,
    reverseBlendActive: false,
    currentBackConnectionId: null
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
      pendingConnectionId: null,
      pendingBackConnectionId: null,
      targetNodeId: null,
      backVisible: state.targetNodeId !== 'master',
      reverseBlendActive: false,
      currentBackConnectionId: state.pendingBackConnectionId
    };
  }

  function handleBackClick() {
    if (state.mode !== 'node' || state.currentNodeId === 'master' || !state.currentBackConnectionId) {
      return { type: 'noop' };
    }

    state = {
      ...state,
      mode: 'reverse',
      pendingConnectionId: state.currentBackConnectionId,
      pendingBackConnectionId: null,
      targetNodeId: 'master',
      backVisible: false,
      reverseBlendActive: false
    };

    return {
      type: 'play-reverse',
      connectionId: state.currentBackConnectionId,
      targetNodeId: 'master'
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

    state = {
      mode: 'node',
      currentNodeId: 'master',
      pendingConnectionId: null,
      pendingBackConnectionId: null,
      targetNodeId: null,
      backVisible: false,
      reverseBlendActive: false,
      currentBackConnectionId: null
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
