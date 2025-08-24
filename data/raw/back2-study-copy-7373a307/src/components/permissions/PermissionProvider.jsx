import React, { createContext, useContext } from 'react';
import { usePermissions } from './usePermissions';
import PermissionPrompt from './PermissionPrompt';

const PermissionContext = createContext();

export function PermissionProvider({ children, language = 'he' }) {
  const permissionHook = usePermissions();
  const { pendingPrompt, handlePermissionResponse } = permissionHook;

  return (
    <PermissionContext.Provider value={permissionHook}>
      {children}
      
      {/* Global permission prompt */}
      <PermissionPrompt
        permissionType={pendingPrompt?.type}
        isVisible={!!pendingPrompt}
        language={language}
        onAllow={() => handlePermissionResponse('granted')}
        onDeny={() => handlePermissionResponse('denied')}
        onLater={() => handlePermissionResponse('later')}
      />
    </PermissionContext.Provider>
  );
}

export function usePermissionContext() {
  const context = useContext(PermissionContext);
  if (!context) {
    throw new Error('usePermissionContext must be used within a PermissionProvider');
  }
  return context;
}