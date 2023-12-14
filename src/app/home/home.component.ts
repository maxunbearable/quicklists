import {Component, effect, inject, signal} from '@angular/core';
import {FormModalComponent, ModalComponent} from "../shared/ui";
import {Checklist} from "../shared/model";
import {FormBuilder, ReactiveFormsModule} from "@angular/forms";
import {ChecklistService} from "../shared/data-access";
import {ChecklistListComponent} from "./ui";

@Component({
  standalone: true,
  selector: 'app-home',
  templateUrl: 'home.component.html',
  imports: [
    ModalComponent,
    FormModalComponent,
    ChecklistListComponent,
  ]
})
export default class HomeComponent {
  formBuilder = inject(FormBuilder);
  checklistService = inject(ChecklistService);

  checklistBeingEdited = signal<Partial<Checklist> | null>(null);

  checklistForm = this.formBuilder.nonNullable.group({
    title: [''],
    description: [''],
  });

  constructor() {
    effect(() => {
      const checklist = this.checklistBeingEdited();

      if (!checklist) {
        this.checklistForm.reset();
      } else {
        this.checklistForm.patchValue({
          title: checklist.title,
          description: checklist.description,
        });
      }
    });
  }

  onSaveCheckList() {
    this.checklistBeingEdited()?.id
      ? this.checklistService.edit$.next({
        id: this.checklistBeingEdited()!.id!,
        data: { ...this.checklistForm.getRawValue(), date: new Date() }
      })
      : this.checklistService.add$.next({ ...this.checklistForm.getRawValue(), date: new Date() })
  }
}
