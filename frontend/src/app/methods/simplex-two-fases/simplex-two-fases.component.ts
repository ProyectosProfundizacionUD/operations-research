import { Component, OnInit } from '@angular/core';
import { UtilsService } from 'src/app/services/utils.service';

@Component({
  selector: 'app-simplex-two-fases',
  templateUrl: './simplex-two-fases.component.html',
  styleUrls: ['./simplex-two-fases.component.css'],
})
export class SimplexTwoFasesComponent implements OnInit {
  //first form variables
  simplexType: string = 'Minimización';//'default';
  variablesCount: number = 0;
  restrictionsCount: number = 0;
  //generated form variables
  showGeneratedFields: boolean = false;
  operationEquation: any = {};
  equations: any = [];
  variablesCountList: any = [];
  //simplex process
  initialMatrix: any = [];

  constructor(
    private _utils: UtilsService
  ) {}

  ngOnInit(): void {}

  generateFields() {
    if (this.validations()) {
      this.equations = []
      this.variablesCountList = []
      let operationEquationTemplate = "";
      let equationTemplate = '{';
      for (let j = 0; j < this.variablesCount; j++) {
        equationTemplate += `"X${j+1}": 0,`;
        this.variablesCountList.push(`X${j+1}`)
      }
      operationEquationTemplate = equationTemplate;
      operationEquationTemplate += `"type":"${this.simplexType.substring(0, 3)} Z: "}`;
      equationTemplate += '"op": "=",';
      equationTemplate += '"result": 0';
      equationTemplate += '}';      
      
      this.operationEquation = JSON.parse(operationEquationTemplate);
      for (let i = 0; i < this.restrictionsCount; i++) {
        this.equations.push(JSON.parse(equationTemplate));
      }

      this.showGeneratedFields = true;
    }
  }

  startSimplex() {
    console.log(this.equations); // !to delete
    console.log(this.operationEquation); // !to delete
    
    switch (this.simplexType) {
      case 'Minimización':
        this.simplexProcess(this.Minix, 1);
        break;
      case 'Maximización':
        this.simplexProcess(this.Max, -1);
        break;
    }
  }

  Minix() {
    console.log('mini');
  }
  Max() {
    console.log('maxi');
  }

  simplexProcess(validationsType: any, rValue: number){
    let countCXCJwFields = 0;
    let countXbFields = 0;
    for (let i = 0; i < this.restrictionsCount; i++) {
      switch (this.equations[i].op) {
        case "≥":
          countCXCJwFields += 2;
          countXbFields += 1;
          break;
        case "≤":
          countCXCJwFields += 1;
          countXbFields += 1;
          break;
        case "=":
          countCXCJwFields += 1;
          countXbFields += 1;
          break;
      } 
    }
    console.log(countCXCJwFields);
    console.log(countXbFields);
    
  }

  validations() {
    if(
        this.simplexType == "default" ||
        this.variablesCount == 0 ||
        this.variablesCount == undefined ||
        this.restrictionsCount == 0 ||
        this.restrictionsCount == undefined
      ){
        this._utils.openSnackBarError("Debe ingresar correctamente todos los campos")
        return false;
    }
    return true;
  }
}
