import {Component, EventEmitter, Input, Output} from '@angular/core';
import { RouterLink } from '@angular/router';
import { Checklist } from '../../../shared/model';
import {CommonModule} from "@angular/common";

@Component({
  standalone: true,
  selector: 'app-checklist-header',
  template: `
    <header>
      <a routerLink="/home" class="btn btn-primary">&#x2190; Back</a>
      <h1 class="my-4">
        {{ checklist.title }}
      </h1>
      @if (checklist.description) {
        <h5 class="my-3">
            Description: {{ checklist.description }}
        </h5>
        <h5 class="my-3 text-secondary">upd: {{ checklist.date | date:'short' }}</h5>
      }
      <div class="my-2">
        <button class="btn btn-success" (click)="addItem.emit()">Add item</button>
      </div>
    </header>
  `,
  imports: [RouterLink, CommonModule],
})
export class ChecklistHeaderComponent {
  @Input({ required: true }) checklist!: Checklist;
  @Output() addItem = new EventEmitter<void>();
}
