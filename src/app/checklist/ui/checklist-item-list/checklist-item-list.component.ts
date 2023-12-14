import {Component, EventEmitter, Input, Output} from '@angular/core';
import {ChecklistItem, EditChecklistItem, RemoveChecklistItem} from '../../../shared/model';
import {CommonModule} from "@angular/common";

@Component({
  standalone: true,
  selector: 'app-checklist-item-list',
  template: `
    <section>
      <button class="btn-lg btn-secondary" (click)="reset.emit()">Reset All</button>
      <ul class="list-group m-3">
        @for (item of checklistItems; track item.id) {
          <li class="list-group-item d-flex align-items-center my-2">
            <h3 class="mx-2">&#x2022;</h3>
            @if (item.checked) {
              <span class="mx-2">✅</span>
            }
          <span class="col-2 d-flex flex-column">
            <span>{{ item.title }}</span>
            @if (item.description) {
                <span class="text-secondary">{{ item.description }}</span>
            }
          </span>
          <p class="my-2 text-secondary">upd: {{ item.date | date:'short' }}</p>
         <div>
           <button class="btn btn-success mx-1" (click)="toggle.emit(item.id)">Check</button>
           <button class="btn btn-primary mx-1" (click)="edit.emit(item)">Edit</button>
           <button class="btn btn-danger mx-1" (click)="remove.emit(item.id)">Delete</button>
         </div>
      </li>
        } @empty {
          <div>
            <h2>Add an item</h2>
            <p>Click the add button to add your first item to this quicklist</p>
          </div>
        }
      </ul>
    </section>
  `,
  imports: [CommonModule],
})
export class ChecklistItemListComponent {
  @Input({ required: true }) checklistItems!: ChecklistItem[];
  @Output() toggle  = new EventEmitter<RemoveChecklistItem>;
  @Output() reset  = new EventEmitter<void>;
  @Output() remove  = new EventEmitter<RemoveChecklistItem>;
  @Output() edit = new EventEmitter<ChecklistItem>();
}
