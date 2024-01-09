import { Component, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { noop as _noop } from 'lodash-es';

@Component({
  selector: 'app-boq-list-table',
  templateUrl: './boq-list-table.component.html',
  styleUrls: ['./boq-list-table.component.css']
})
export class BoqListTableComponent implements OnInit {
  @Output() selectBoqEvent = new EventEmitter<any>();
  @Output() editQtyEvent = new EventEmitter<any>();

  ELEMENT_DATA: any[] = [];

  dataSource: MatTableDataSource<any>;
  limit: number = 0;
  start: number = 0;
  length: number = 50;
  displayedColumns: string[] = ['select', 'boqItem', 'boqDiv','boqCtg', 'resDescription', 'boqUnitMesure', 'boqBillQty', 'boqQty',
  'boqScopeQty', 'boqUprice', 'finalNetAmount', 'totalUnitPrice', 'assignedPackage'];
  full: boolean = true;
  @ViewChild(MatSort) sort: MatSort;
  finalTotalPrice : number = 0;
  
  constructor() { }

  ngOnInit() {
    
  }

  public setData(arr : any[])
  {   
      this.start = 0;
      this.ELEMENT_DATA = [];
      this.ELEMENT_DATA = [...this.ELEMENT_DATA,...arr];
      
      this.limit = this.ELEMENT_DATA.length;
      
      this.getData(false);
  }

  public setFinalTotalPrice(newVal : number)
  {
     this.finalTotalPrice = newVal;
  }

  editQty(item : any)
  {
     this.editQtyEvent.emit({
      boqItem : item
     });
  }

  handleScroll = (scrolled: boolean) => {
    
    if (scrolled && this.limit > 0) {
      this.start += this.length;
    }

   
    scrolled ? this.getData(true) : _noop();
  };
  hasMore = () => !this.dataSource || this.dataSource.data.length < this.limit;

  getData(fromScroll : boolean) {

    let data: any[] = [];
    if(fromScroll)
    {
      data = this.dataSource
      ? [
          ...this.dataSource.data,
          ...this.ELEMENT_DATA.slice(this.start, this.start + this.length),
        ]
      : this.ELEMENT_DATA.slice(this.start, this.start + this.length);
    }
    else
    {
      data = this.ELEMENT_DATA.slice(this.start, this.start + this.length);
    }

    
    if(this.ELEMENT_DATA.length == 0)
    {
      data = [];
    }

    
    this.dataSource = new MatTableDataSource(data);
    this.dataSource.sort = this.sort;
  }

  OnBoqChecked(event : any, index : number)
  {
    let selectedBoqRow = this.ELEMENT_DATA[index];
    
    selectedBoqRow.isSelected = event.target.checked;
    if(event.target.checked)
    {
      this.finalTotalPrice += selectedBoqRow.boqUprice * selectedBoqRow.boqScopeQty;
    }
    else
    {
      this.finalTotalPrice -= selectedBoqRow.boqUprice * selectedBoqRow.boqScopeQty;
    }

    this.selectBoqEvent.emit({
      boqItem : selectedBoqRow

    });
   
  }

}
