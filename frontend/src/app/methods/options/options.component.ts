import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-options',
  templateUrl: './options.component.html',
  styleUrls: ['./options.component.css']
})
export class OptionsComponent implements OnInit {
  isChargingFile: boolean = false;
  registerSequence: any = {};
  constructor() { }

  ngOnInit(): void {
  }
  makeAction(){

  }
}
