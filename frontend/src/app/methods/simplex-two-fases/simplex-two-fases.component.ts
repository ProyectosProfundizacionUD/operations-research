import { Component, OnInit } from '@angular/core';
import { UtilsService } from 'src/app/services/utils.service';

@Component({
  selector: 'app-simplex-two-fases',
  templateUrl: './simplex-two-fases.component.html',
  styleUrls: ['./simplex-two-fases.component.css'],
})
export class SimplexTwoFasesComponent implements OnInit {
  //first form variables
  simplexType: string = 'default'; //'default';
  variablesCount: number = 0;
  restrictionsCount: number = 0;
  //generated form variables
  showGeneratedFields: boolean = false;
  operationEquation: any = {};
  equations: any = [];
  variablesCountList: any = [];
  //simplex process
  initialCxCj = [];
  initialMatrix: any = [];
  twoFaseCxCj = [];
  twoFaseMatrix: any = [];
  firstMatrix: any = [];
  historyMatrix: any = [];

  tempArray: any = [];

  constructor(private _utils: UtilsService) {}

  ngOnInit(): void {}

  generateFields() {
    if (this.validations()) {
      this.equations = [];
      this.variablesCountList = [];
      let operationEquationTemplate = '';
      let equationTemplate = '{';
      for (let j = 0; j < this.variablesCount; j++) {
        equationTemplate += `"X${j + 1}": 0,`;
        this.variablesCountList.push(`X${j + 1}`);
      }
      operationEquationTemplate = equationTemplate;
      operationEquationTemplate += `"type":"${this.simplexType.substring(
        0,
        3
      )} Z: "}`;
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
    console.log('Operacion y restricciones'); // !to delete
    // !to delete
    console.log(this.equations); // !to delete
    console.log(this.operationEquation); // !to delete

    switch (this.simplexType) {
      case 'Minimización':
        this.simplexProcess(1);
        break;
      case 'Maximización':
        this.simplexProcess(-1);
        break;
    }
  }

  Minix() {
    console.log('mini');
  }
  Max() {
    console.log('maxi');
  }

  simplexProcess(rValue: number) {
    this.initialMatrix = this.equations;

    let countNewVariables = 0;
    let countTotalRows = 0;
    let CxCjText = '{';
    let ZjCjText = '{';
    let CXCJ = {};
    let ZjCj = [];
    let R = 1;
    let H = 1;
    let S = 1;
    for (let o = 0; o < this.variablesCount; o++) {
      ZjCjText += `"X${o + 1}": 0,`;
      CxCjText += `"X${o + 1}": 0,`;
    }
    for (let i = 0; i < this.restrictionsCount; i++) {
      switch (this.equations[i].op) {
        case '≥':
          for (let k = 0; k < this.restrictionsCount; k++) {
            this.initialMatrix[k][`S${S}`] = 0;
            this.initialMatrix[k][`R${R}`] = 0;
          }
          this.initialMatrix[i][`S${S}`] = -1;
          this.initialMatrix[i][`R${R}`] = 1;
          this.initialMatrix[i][`CxCj${i+1}`] = rValue;

          countNewVariables += 2;
          countTotalRows += 1;
          ZjCjText += `"S${S}": 0,`;
          ZjCjText += `"R${R}": 0,`;

          CxCjText += `"S${S}": 0,`;
          CxCjText += `"R${R}": ${rValue},`;
          S += 1;
          R += 1;
          break;
        case '≤':
          for (let k = 0; k < this.restrictionsCount; k++) {
            this.initialMatrix[k][`H${H}`] = 0;
          }
          this.initialMatrix[i][`H${H}`] = 1;
          this.initialMatrix[i][`CxCj${i+1}`] = 0;

          countNewVariables += 1;
          countTotalRows += 1;
          ZjCjText += `"H${H}": 0,`;
          CxCjText += `"H${H}": 0,`;
          H += 1;
          break;
        case '=':
          for (let k = 0; k < this.restrictionsCount; k++) {
            this.initialMatrix[k][`R${R}`] = 0;
          }
          this.initialMatrix[i][`R${R}`] = 1;
          this.initialMatrix[i][`CxCj${i+1}`] = rValue;

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
    let totalCountOfCol = countNewVariables + this.variablesCount + 2;

    console.log('CxCj y ZjCj respectivamente:'); // !to delete
    console.log(CXCJ); // !to delete
    console.log(ZjCj); // !to delete
    console.log(totalCountOfCol); // !to delete
    console.log(countTotalRows); // !to delete
    console.log('Matriz inicial'); // !to delete
    console.log(this.initialMatrix); // !to delete

    this.DoProcess(
      CXCJ,
      this.initialMatrix,
      ZjCj,
      totalCountOfCol,
      countTotalRows,
      R,
      H,
      S
    );
  }

  DoProcess(
    CxCj: any,
    matrix: any,
    ZjCj: any,
    totalCountOfCol: number,
    countTotalRows: number,
    R: number,
    H: number,
    S: number
  ) {
    //Set a correct format to historyMatrix and initialCxCj
    this.CleanMatrix(countTotalRows, CxCj, ZjCj, R, H,S);
    this.firstMatrix = this.historyMatrix;

    console.log("initialCxCj");     // !to delete
    console.log(this.initialCxCj);  // !to delete
    
    
    //aqui comienza el while
    
    //calcular zjcj
    let result = this.calculateCol(
      totalCountOfCol,
      countTotalRows
      );
      
    // *pushear matriz original y zjcj (este ultimo una vez este calculado)
    //this.historyMatrix.push(Object.values(ZjCj));
    console.log('History matrix'); // !to delete
    console.log(this.historyMatrix); // !to delete

    // *validar si zjcj cumple con la validacion de minimizacion o maximizacion

    // *de no ser asi, calcular la fila pivote
    // *calcular las filas para la siguiente iteracion
    // *terminar do while y repetir iteración

    // **una vez terminada la primera fase comenzamos la segunda
  }

    calculateCol(
    totalCountOfCol: number,
    totalCountOfRows: number
  ) {
    console.log("calculateColStarted");
    this.tempArray = [0];
    let tempItem = 0;
    for (let i = 1; i < totalCountOfCol; i++) {
      for (let j = 0; j < totalCountOfRows; j++) {
        tempItem += (this.historyMatrix[j][0] * this.historyMatrix[j][i])
        
        if(j == (totalCountOfRows - 1))
          if(i < totalCountOfCol - 2)
            tempItem -= this.initialCxCj[i - 1];
        
      }
      this.tempArray.push(tempItem);
      tempItem = 0;
    }
    
    this.historyMatrix[totalCountOfRows] = this.tempArray;
  }

  CleanMatrix(
      countTotalRows: number, 
      CxCj: any, 
      ZjCj: any,
      R: number,
      H: number,
      S: number
    ){
    this.historyMatrix = [];
    this.tempArray = []
    //add CxCj
    for (let i = 0; i < countTotalRows; i++) {
      this.historyMatrix.push([this.initialMatrix[i][`CxCj${i+1}`]]);
    }
    //add X's
    for (let i = 0; i < this.initialMatrix.length; i++) {
      for (let j = 0; j < this.variablesCount; j++) {
        this.historyMatrix[i].push(this.initialMatrix[i][`X${j+1}`]);
        if(i == 0)
          this.tempArray.push(CxCj[`X${j+1}`]);        
      }
    }
    //add S's
    for (let i = 0; i < countTotalRows; i++) {
      for (let j = 0; j < S - 1; j++) {
        this.historyMatrix[i].push(this.initialMatrix[i][`S${j+1}`]);
        if(i == 0)
          this.tempArray.push(CxCj[`S${j+1}`]);   
      }
    }
    //add R's
    for (let i = 0; i < countTotalRows; i++) {
      for (let j = 0; j < R - 1; j++) {
        this.historyMatrix[i].push(this.initialMatrix[i][`R${j+1}`]);
        if(i == 0)
          this.tempArray.push(CxCj[`R${j+1}`]);   
      }
    }
    //add H's
      for (let i = 0; i < countTotalRows; i++) {
        for (let j = 0; j < H - 1; j++) {
          this.historyMatrix[i].push(this.initialMatrix[i][`H${j+1}`]);
          if(i == 0)
            this.tempArray.push(CxCj[`H${j+1}`]);   
        }
      }
    //add Results's
    for (let i = 0; i < countTotalRows; i++) {
      this.historyMatrix[i].push(this.initialMatrix[i][`result`]);
    }

    this.initialCxCj = this.tempArray;
    this.tempArray = (Object.values(ZjCj[0]))
    this.tempArray.push(0)
    this.historyMatrix.push(this.tempArray);
  }
  validations() {
    if (
      this.simplexType == 'default' ||
      this.variablesCount == 0 ||
      this.variablesCount == undefined ||
      this.restrictionsCount == 0 ||
      this.restrictionsCount == undefined
    ) {
      this._utils.openSnackBarError(
        'Debe ingresar correctamente todos los campos'
      );
      return false;
    }
    return true;
  }
}
