import {Injectable, computed, signal, inject, effect} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {catchError, EMPTY, Subject, tap} from 'rxjs';
import {
  AddChecklistItem,
  ChecklistItem, EditChecklistItem, RemoveChecklist, RemoveChecklistItem,
} from '../../shared/model';
import uuidv4 from 'uuidv4';
import {StorageService} from "../../shared/data-access";

export interface ChecklistItemsState {
  checklistItems: ChecklistItem[];
  loaded: boolean;
  error: string | null;
}

@Injectable({
  providedIn: 'root',
})
export class ChecklistItemService {
  storageService = inject(StorageService);

  // state
  private state = signal<ChecklistItemsState>({
    checklistItems: [],
    loaded: false,
    error: null,
  });

  // selectors
  checklistItems = computed(() => this.state().checklistItems);
  private checklistsLoaded$ = this.storageService.loadChecklistItems();
  loaded = computed(() => this.state().loaded);

  // sources
  add$ = new Subject<AddChecklistItem>();
  remove$ =  new Subject<RemoveChecklistItem>();
  toggle$ = new Subject<ChecklistItem['id']>();
  edit$ =  new Subject<EditChecklistItem>();
  reset$ = new Subject<void>();
  checklistRemoved$ = new Subject<RemoveChecklist>();

  constructor() {
    this.add$.pipe(
      tap((checklistItem) =>
        this.state.update((state) => ({
          ...state,
          checklistItems: [
            ...state.checklistItems,
            {
              ...checklistItem.item,
              id: uuidv4(),
              checklistId: checklistItem.checklistId,
              checked: false,
            },
          ],
        }))),
      takeUntilDestroyed(),
    )
      .subscribe();

    this.toggle$.pipe(
      tap((checklistItemId) =>
        this.state.update((state) => ({
          ...state,
          checklistItems: state.checklistItems.map((item) =>
            item.id === checklistItemId
              ? { ...item, checked: !item.checked, date: new Date() }
              : item
          ),
        }))),
      takeUntilDestroyed(),
    )
      .subscribe();

    this.edit$.pipe(
      tap((checklistEditDto) =>
        this.state.update((state) => ({
          ...state,
          checklistItems: state.checklistItems.map((item) =>
            item.id === checklistEditDto.id
              ? { ...item, ...checklistEditDto.data }
              : item
          ),
        }))),
      takeUntilDestroyed(),
    )
      .subscribe();

    this.remove$.pipe(
      tap((checklistItemId) =>
        this.state.update((state) => ({
          ...state,
          checklistItems: state.checklistItems.filter((item) => item.id !== checklistItemId),
        }))
      ),
      takeUntilDestroyed(),
    )
      .subscribe();

    this.reset$.pipe(
      tap(() =>
        this.state.update((state) => ({
          ...state,
          checklistItems: state.checklistItems.map((item) =>
            ({ ...item, checked: false })
          ),
        }))),
      takeUntilDestroyed(),
    )
      .subscribe();

    this.checklistsLoaded$.pipe(
      tap((checklistItems) =>
        this.state.update((state) => ({
          ...state,
          checklistItems,
          loaded: true,
        }))
      ),
      catchError((err) => {
        this.state.update((state) => ({...state, error: err}));
        return EMPTY;
      }),
      takeUntilDestroyed(),
    )
      .subscribe();

    this.checklistRemoved$.pipe(
      tap((checklistId) =>
        this.state.update((state) => ({
          ...state,
          checklistItems: state.checklistItems.filter(
            (item) => item.checklistId !== checklistId
          ),
        }))
      ),
      takeUntilDestroyed(),
    ).subscribe();

    // effects
    effect(() => {
      if (this.loaded()) {
        this.storageService.saveChecklistItems(this.checklistItems());
      }
    });
  }

  getCompletedStateById(checklistId: string): string {
    const checklistItems = this.checklistItems().filter(item => item.checklistId === checklistId)
    return `${checklistItems.filter(item => item.checked).length}/${checklistItems.length}`
  }
}
