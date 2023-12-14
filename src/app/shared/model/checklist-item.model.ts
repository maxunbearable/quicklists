import { RemoveChecklist } from '../model';

export interface ChecklistItem {
  id: string;
  checklistId: string;
  title: string;
  checked: boolean;
  date: Date;
  description?: string;
}

export type AddChecklistItem = {
  item: Omit<ChecklistItem, 'id' | 'checklistId' | 'checked'>;
  checklistId: ChecklistItem['id'];
};
export type EditChecklistItem = {
  id: ChecklistItem['id'];
  data: AddChecklistItem['item'];
};
export type RemoveChecklistItem = ChecklistItem['id'];
