import { create } from 'zustand';
import { getItem, setItem, removeItem } from '@/utils/storage';
import { StorageEnum } from '#/enum';

// Zustand store for managing project ID
const useProjectStore = create((set) => ({
  projectId: getItem(StorageEnum.ProjectId) || '',
  actions: {
    setProjectId: (projectId) => {
      set({ projectId });
      setItem(StorageEnum.ProjectId, projectId);
    },
    clearProjectId: () => {
      set({ projectId: '' });
      removeItem(StorageEnum.ProjectId);
    },
  },
}));

// Export hooks to access project ID state and actions
export const useProjectId = () => useProjectStore((state) => state.projectId);
export const useProjectActions = () => useProjectStore((state) => state.actions);
