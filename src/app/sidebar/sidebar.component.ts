import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styles: ['.stretch { width:100% }']
})
export class SidebarComponent implements OnInit {


  constructor(public dialog: MatDialog) { }

  ngOnInit() {
  }

}
