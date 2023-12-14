import {Component, EventEmitter, inject, Input, Output} from '@angular/core';
import {Checklist, RemoveChecklist} from '../../../shared/model';
import {RouterLink} from "@angular/router";
import {CommonModule} from "@angular/common";
import {ChecklistItemService} from "../../../checklist/data-access";

@Component({
  standalone: true,
  selector: 'app-checklist-list',
  template: `
    <div>
      <ul class="list-group m-3">
        @for (checklist of checklists; track checklist.id) {
        <li class="list-group-item d-flex align-items-center my-2">
          <h3>&#x2022;</h3>
          <span class="mx-4 my-2">({{ checklistItemService.getCompletedStateById(checklist.id) }})</span>
          <a href="#" class="text-decoration-none mx-5 col-3" routerLink="/checklist/{{ checklist.id }}">
        {{ checklist.title }}
        </a>
        <p class="my-2 text-secondary">upd: {{ checklist.date | date:'short' }}</p>
        <div>
          <button class="mx-4 btn btn-primary" (click)="edit.emit(checklist)">Edit</button>
          <button class="btn btn-danger" (click)="delete.emit(checklist.id)">Delete</button>
        </div>
      </li>
        } @empty {
        <p>Click the add button to create your first checklist!</p>
        }
      </ul>
    </div>
  `,
  imports: [RouterLink, CommonModule],
})
export class ChecklistListComponent {
  @Input({ required: true }) checklists!: Checklist[];
  @Output() delete = new EventEmitter<RemoveChecklist>();
  @Output() edit = new EventEmitter<Checklist>();

  checklistItemService = inject(ChecklistItemService)
}
