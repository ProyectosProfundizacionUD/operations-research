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
    console.log("Operacion y restricciones"); // !to delete
    // !to delete
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
    this.initialMatrix = this.equations;

    let countNewVariables = 0;
    let countTotalRows = 0;
    let CxCjText = "{"
    let ZjCjText = "{"
    let CXCJ = {};
    let ZjCj = [];
    let R = 1;
    let H = 1;
    let S = 1;    
    for (let o = 0; o < this.variablesCount; o++) {
      ZjCjText += `"X${o+1}": 0,`
      CxCjText += `"X${o+1}": 0,`
    }
    for (let i = 0; i < this.restrictionsCount; i++) {
      switch (this.equations[i].op) {
        case "≥":
          for (let k = 0; k < this.restrictionsCount; k++) {
            this.initialMatrix[k][`S${S}`] = 0;
            this.initialMatrix[k][`R${R}`] = 0;
          }
          this.initialMatrix[i][`S${S}`] = -1;
          this.initialMatrix[i][`R${R}`] = 1;
          this.initialMatrix[i][`CxCj${i}`] = rValue;

          countNewVariables += 2;
          countTotalRows += 1;
          ZjCjText += `"S${S}": 0,`;
          ZjCjText += `"R${R}": 0,`;

          CxCjText += `"S${S}": 0,`;
          CxCjText += `"R${R}": ${rValue},`;
          S += 1;
          R += 1;
          break;
        case "≤":
          for (let k = 0; k < this.restrictionsCount; k++) {
            this.initialMatrix[k][`H${H}`] = 0;
          }
          this.initialMatrix[i][`H${H}`] = 1;
          this.initialMatrix[i][`CxCj${i}`] = 0;

          countNewVariables += 1;
          countTotalRows += 1;
          ZjCjText += `"H${H}": 0,`;
          CxCjText += `"H${H}": 0,`;
          H += 1;
          break;
        case "=":
          for (let k = 0; k < this.restrictionsCount; k++) {
            this.initialMatrix[k][`R${R}`] = 0;
          }
          this.initialMatrix[i][`R${R}`] = 1;
          this.initialMatrix[i][`CxCj${i}`] = rValue;

          countNewVariables += 1;
          countTotalRows += 1;
          ZjCjText += `"R${R}": 0,`;
          CxCjText += `"R${R}": ${rValue},`;
          R += 1;
          break;
      }
    }
    CxCjText += `"Xb": "Bi"}`;
    ZjCjText += `"Z": 0}`;
    CXCJ = JSON.parse(CxCjText);
    ZjCj.push(JSON.parse(ZjCjText));
    R = 1;
    H = 1;
    S = 1;
    let totalCountOfCol = countNewVariables + this.variablesCount + 2;

    console.log("CxCj y ZjCj respectivamente:");// !to delete
    console.log(CXCJ);// !to delete
    console.log(ZjCj);// !to delete
    console.log(totalCountOfCol);// !to delete
    

    this.DoProcess(CXCJ, this.initialMatrix, ZjCj, validationsType);
  }

  DoProcess(CxCj: any, matrix: any, ZjCj: any, validationsType: any){
    console.log("Matriz inicial");// !to delete
    console.log(this.initialMatrix);// !to delete

    let historyResults = [];
    
    
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
