import { Component, computed, effect, inject, signal } from '@angular/core';
import { ChecklistService } from "../shared/data-access";
import { ActivatedRoute } from "@angular/router";
import { toSignal } from "@angular/core/rxjs-interop";
import { ChecklistHeaderComponent, ChecklistItemListComponent } from "./ui";
import { FormBuilder } from "@angular/forms";
import { ChecklistItemService } from "./data-access";
import { ChecklistItem } from "../shared/model";
import { FormModalComponent, ModalComponent } from "../shared/ui";

@Component({
  standalone: true,
  selector: 'app-checklist',
  template: `
    <div class="border m-5 shadow-lg rounded">
      @if (checklist(); as checklist) {
      <div class="m-5">
        <app-checklist-header [checklist]="checklist" (addItem)="checklistItemBeingEdited.set({})"/>
        <app-checklist-item-list
        [checklistItems]="items()"
        (reset)="checklistItemService.reset$.next()"
        (remove)="checklistItemService.remove$.next($event)"
        (edit)="checklistItemBeingEdited.set($event)"
        (toggle)="checklistItemService.toggle$.next($event)"
      />
      </div>

      }
      <app-modal [isOpen]="!!checklistItemBeingEdited()">
        <ng-template>
          <app-form-modal
            title="Create item"
            [formGroup]="checklistItemForm"
            (save)="onSaveChecklistItem()"
            (close)="checklistItemBeingEdited.set(null)"
          ></app-form-modal>
        </ng-template>
      </app-modal>
    </div>
  `,
  imports: [
    ChecklistHeaderComponent,
    ModalComponent,
    FormModalComponent,
    ChecklistItemListComponent,
  ]
})
export default class ChecklistComponent {
  checklistService = inject(ChecklistService);
  route = inject(ActivatedRoute);
  formBuilder = inject(FormBuilder);
  checklistItemService = inject(ChecklistItemService);

  checklistItemBeingEdited = signal<Partial<ChecklistItem> | null>(null);

  params = toSignal(this.route.paramMap);

  checklist = computed(() =>
    this.checklistService
      .checklists()
      .find((checklist) => checklist.id === this.params()?.get('id'))
  );

  items = computed(() =>
    this.checklistItemService
      .checklistItems()
      .filter((item) => item.checklistId === this.params()?.get('id'))
  );

  checklistItemForm = this.formBuilder.nonNullable.group({
    title: [''],
    description: [''],
  });

  constructor() {
    effect(() => {
      const checklistItem = this.checklistItemBeingEdited();

      if (!checklistItem) {
        this.checklistItemForm.reset();
      } else {
        this.checklistItemForm.patchValue({
          title: checklistItem.title,
          description: checklistItem.description,
        });
      }
    });
  }

  onSaveChecklistItem() {
    this.checklistItemBeingEdited()?.id
      ? this.checklistItemService.edit$.next({
        id: this.checklistItemBeingEdited()!.id!,
        data: { ...this.checklistItemForm.getRawValue(), date: new Date() },
      })
      : this.checklistItemService.add$.next({
        item: { ...this.checklistItemForm.getRawValue(), date: new Date() },
        checklistId: this.checklist()?.id!,
      })
  }
}
