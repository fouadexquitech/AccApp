import { Component, Input, TrackByFunction} from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';

@Component({
  selector: 'app-boq-list-table',
  templateUrl: './boq-list-table.component.html',
  styleUrls: ['./boq-list-table.component.css']
})
export class BoqListTableComponent {

  // @Input() set dummyData(data: any[] | null) {
  //   this.dummyDataSignal.set(data ?? []);
  //   this.limitSignal.set(this.defaultValue);
  // }

  // private defaultValue = 30;

  // private dummyDataSignal = signal<any[]>([]);
  // private limitSignal = signal<number>(this.defaultValue);

  // dataSourceSignal = computed(() => {
  //   const data = this.dummyDataSignal().slice(0, this.limitSignal());
  //   return new MatTableDataSource<any>(data);
  // });

  // displayedColumns: string[] = ['id', 'firstName', 'lastName', 'age'];

  // identity: TrackByFunction<any> = (_, item: any) => item.id;

  // onReset(): void {
  //   this.limitSignal.set(this.defaultValue);
  //   window.scrollTo(0, 0);
  // }

  // onNearEndScroll(): void {
  //   this.limitSignal.update((val : any) => val + this.defaultValue);
  // }

}
