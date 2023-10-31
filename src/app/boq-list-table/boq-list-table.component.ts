import { Component, OnInit, ViewChild } from '@angular/core';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { noop as _noop } from 'lodash-es';

@Component({
  selector: 'app-boq-list-table',
  templateUrl: './boq-list-table.component.html',
  styleUrls: ['./boq-list-table.component.css']
})
export class BoqListTableComponent implements OnInit {

  ELEMENT_DATA: any[] = [];

  dataSource: MatTableDataSource<any>;
  limit: number = 0;
  start: number = 0;
  length: number = 50;
  displayedColumns: string[] = ['itemO'];
  full: boolean = true;
  @ViewChild(MatSort) sort: MatSort;
  
  constructor() { }

  ngOnInit() {
    
  }

  public setData(arr : any[])
  {   
      
      this.ELEMENT_DATA = [];
      this.ELEMENT_DATA = [...this.ELEMENT_DATA,...arr];
      this.limit = this.ELEMENT_DATA.length;
      this.getData();
  }

  handleScroll = (scrolled: boolean) => {
    
    if (scrolled && this.limit > 0) {
      this.start += this.length;
    }

   
    scrolled ? this.getData() : _noop();
  };
  hasMore = () => !this.dataSource || this.dataSource.data.length < this.limit;

  getData() {

    
    let data: any[] = this.dataSource
      ? [
          ...this.dataSource.data,
          ...this.ELEMENT_DATA.slice(this.start, this.start + this.length),
        ]
      : this.ELEMENT_DATA.slice(this.start, this.start + this.length);

    
    if(this.ELEMENT_DATA.length == 0)
    {
      data = [];
    }
    this.dataSource = new MatTableDataSource(data);
    this.dataSource.sort = this.sort;
  }

}
