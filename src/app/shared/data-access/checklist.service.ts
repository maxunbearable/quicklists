import {Injectable, computed, signal, inject, effect} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {catchError, EMPTY, Subject, tap} from 'rxjs';
import {AddChecklist, Checklist, EditChecklist} from '../model';
import uuidv4 from 'uuidv4';
import {StorageService} from "./storage.service";
import {ChecklistItemService} from "../../checklist/data-access";

export interface ChecklistsState {
  checklists: Checklist[];
  loaded: boolean;
  error: string | null;
}

@Injectable({
  providedIn: 'root',
})
export class ChecklistService {
  storageService = inject(StorageService);
  checklistItemService = inject(ChecklistItemService);
  // state
  private state = signal<ChecklistsState>({
    checklists: [],
    loaded: false,
    error: null,
  });

  // selectors
  checklists = computed(() => this.state().checklists);
  private checklistsLoaded$ = this.storageService.loadChecklists();
  loaded = computed(() => this.state().loaded);
  remove$ = this.checklistItemService.checklistRemoved$;

  // sources
  add$ = new Subject<AddChecklist>();
  edit$ = new Subject<EditChecklist>();

  constructor() {
    // reducers
    this.add$.pipe(
      tap((checklist) =>
          this.state.update((state) => ({
            ...state,
            checklists: [...state.checklists, this.addIdToChecklist(checklist)],
          })),
      takeUntilDestroyed(),
    )).subscribe();

    this.checklistsLoaded$.pipe(
      tap((checklists) =>
        this.state.update((state) => ({
          ...state,
          checklists,
          loaded: true,
        }))),
      catchError((err) => {
        this.state.update((state) => ({...state, error: err}));
        return EMPTY;
      }),
      takeUntilDestroyed(),
    )
      .subscribe();

    this.remove$.pipe(takeUntilDestroyed()).subscribe((id) =>
      this.state.update((state) => ({
        ...state,
        checklists: state.checklists.filter((checklist) => checklist.id !== id),
      }))
    );

    this.edit$.pipe(takeUntilDestroyed()).subscribe((update) =>
      this.state.update((state) => ({
        ...state,
        checklists: state.checklists.map((checklist) =>
          checklist.id === update.id
            ? { ...checklist, ...update.data }
            : checklist
        ),
      }))
    );

    // effects
    effect(() => {
      if (this.loaded()) {
        this.storageService.saveChecklists(this.checklists());
      }
    });
  }

  private addIdToChecklist(checklist: AddChecklist) {
    return {
      ...checklist,
      id: uuidv4(),
    };
  }
}
