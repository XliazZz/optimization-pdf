type FieldHandlers = {
  applyEdit: () => void;
  closeEdit: () => void;
  hasChanges: () => boolean;
  shake: () => void;
};

let activeFieldId: string | null = null;
const registry = new Map<string, FieldHandlers>();

export const registerField = (id: string, handlers: FieldHandlers) => {
  registry.set(id, handlers);
};
export const requestOpen = (id: string): boolean => {
  if (activeFieldId === id) return true;

  if (activeFieldId !== null) {
    const active = registry.get(activeFieldId);
    if (active) {
      if (active.hasChanges()) {
        active.shake();
        return false;
      }
      active.closeEdit();
    }
  }

  activeFieldId = id;
  return true;
};

export const notifyClose = (id: string) => {
  if (activeFieldId === id) activeFieldId = null;
};
