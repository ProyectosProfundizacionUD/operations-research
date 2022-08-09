import { Component, OnInit } from '@angular/core';
import { concat } from 'rxjs';
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
        this.simplexProcess("min", 1);
        break;
      case 'Maximización':
        this.simplexProcess("max", -1);
        break;
    }
  }

  simplexProcess(method: string, rValue: number) {
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
      S,
      method
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
    S: number,
    method: string
  ) {
    //Set a correct format to historyMatrix and initialCxCj
    this.CleanMatrix(countTotalRows, CxCj, ZjCj, R, H,S);
    this.firstMatrix = this.historyMatrix;

    console.log("initialCxCj");     // !to delete
    console.log(this.initialCxCj);  // !to delete
    
    let result;
    let startRows = 0;
    let endRows = countTotalRows;
    
    do {
      //calcular zjcj, devuelve [endFase, selectedValue, selectedIndex]
      result = this.calculateCol(
        startRows,
        totalCountOfCol,
        endRows,
        method
      );
      
      if(result[0] == false){
        console.log('History matrix'); // !to delete
        console.log(this.historyMatrix); // !to delete

        for (let i = 0; i < countTotalRows + 1; i++) {
          this.historyMatrix.push([]);          
        }
        
        this.historyMatrix = this.calculateRows(
          totalCountOfCol,
          countTotalRows,
          startRows,
          endRows,
          this.historyMatrix,
          result[2]
        );

        // *de no ser asi, calcular la fila pivote
        // *calcular las filas para la siguiente iteracion
        // *terminar do while y repetir iteración

        // **una vez terminada la primera fase comenzamos la segunda
        
        // *subimos las variables de las filas para la siguiente iteración
        startRows += countTotalRows + 1;
        endRows +=  countTotalRows + 1;
      } 
      console.log(result[0]);
      //result[0] = true; 
          
    } while (result[0] == false);    
    console.log("termino");
    
  }

  calculateRows(
    totalCountOfCol: number,
    totalCountOfRows: number,
    startRows: number,
    endRows: number,
    historyMatrixTemp: any[],
    selectedIndex: number
  ){
    console.log(`startrow: ${startRows}`);
    console.log(`endrow: ${endRows}`);
    console.log(`totalCountOfRows: ${totalCountOfRows}`);
    
    console.log("startCalculateRow");
    let tempCandidates = []
    let tempNumber;
    for (let i = startRows; i < endRows; i++) {
      if(historyMatrixTemp[i][selectedIndex] != 0){
        
        tempNumber = historyMatrixTemp[i][totalCountOfCol - 1] / historyMatrixTemp[i][selectedIndex];
        console.log(`${historyMatrixTemp[i][totalCountOfCol - 1]} / ${historyMatrixTemp[i][selectedIndex]} = ${tempNumber}`);
        tempCandidates.push(tempNumber);
      }      
    }
    console.log("DivResultCandidates"); // !to delete
    console.log(tempCandidates); // !to delete
    
    let indexRow = this.closestToZero(tempCandidates) + startRows;
    console.log("indexRow " + indexRow);  // !to delete

    let pivotRowNumber = historyMatrixTemp[indexRow][selectedIndex];
    console.log(`PivotRow: ${pivotRowNumber}`); // !to delete
    
    //multiplicamos el inverso multiplicativo con la fila pivote
    let InverseMultiplicative = 1/pivotRowNumber;
    historyMatrixTemp[indexRow + totalCountOfRows + 1].push(this.initialCxCj[selectedIndex - 1])
    for (let i = 1; i < totalCountOfCol; i++) { //!! falta pushear el valor de x!
      historyMatrixTemp[indexRow + totalCountOfRows + 1].push(parseFloat((historyMatrixTemp[indexRow][i] * InverseMultiplicative).toFixed(2)));
    }

    //sacamos el resto de filas
    let inverseAdit = 0;
    tempNumber = 0
    for (let i = startRows + totalCountOfRows + 1; i < endRows + totalCountOfRows + 1; i++) {
      inverseAdit = historyMatrixTemp[i - totalCountOfRows - 1][selectedIndex] * - 1
      for (let j = 1; j < totalCountOfCol; j++) {
        if(i != (indexRow + totalCountOfRows + 1)){
          if(j == 1)
            historyMatrixTemp[i].push(historyMatrixTemp[i - totalCountOfRows - 1][0])  
          
          tempNumber = (historyMatrixTemp[indexRow + totalCountOfRows + 1][j] * inverseAdit) + historyMatrixTemp[i - totalCountOfRows - 1][j];
          //console.log(`${historyMatrixTemp[indexRow + totalCountOfRows + 1][j]}*${inverseAdit}+${historyMatrixTemp[i - totalCountOfRows - 1][j]}=${tempNumber}`); //! to delete
        }
        if(i != (indexRow + totalCountOfRows + 1))
          historyMatrixTemp[i].push(tempNumber);
      }
    }

    console.log(historyMatrixTemp); //! to delete
    return historyMatrixTemp;
  }

  calculateCol(
    rowToStart: number,
    totalCountOfCol: number,
    totalCountOfRows: number,
    method: string
  ) {
    console.log("calculateColStarted");
    this.tempArray = [0];
    let tempItem = 0;
    for (let i = 1; i < totalCountOfCol; i++) {
      for (let j = rowToStart; j < totalCountOfRows; j++) {
        //console.log(`Estoy fallando por: ${this.historyMatrix[j][0]} * ${this.historyMatrix[j][i]}`); // ! to do
        
        tempItem += (this.historyMatrix[j][0] * this.historyMatrix[j][i])
        
        if(j == (totalCountOfRows - 1))
          if(i <= totalCountOfCol - 2)
            tempItem -= this.initialCxCj[i - 1];
        
      }
      this.tempArray.push(tempItem);
      tempItem = 0;
    }
    
    this.historyMatrix[totalCountOfRows] = this.tempArray;
    console.log(`arrayTemporal`);
    console.log(this.tempArray);
    
    
    //eliminamos Z para validar entre el resto de numeros cual es el menor
    let newArray = [0]
    newArray = newArray.concat(this.tempArray);
    newArray.pop()    

    console.log("arrayTemporalModificado");    
    console.log(newArray);
    

    let selectedValue = 0;
    let selectedIndex;
    let endFase = false;
    if(method === "min"){
      selectedValue = Math.max(...newArray);
      endFase = selectedValue <= 0 ? true : false;
    } else {
      selectedValue = Math.min(...newArray);
      endFase = selectedValue >= 0 ? true : false;
    }

    console.log(selectedValue);
    selectedIndex = this.tempArray.findIndex( (value: number) => value == selectedValue)
    console.log(`index: ${selectedIndex}, value: ${selectedValue}, end: ${endFase}`);
    
    return [endFase, selectedValue, selectedIndex]
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
  closestToZero(numbers: number[]) {
    if(!numbers.length){
        return 0;
    }
    
    let index = 0;
    let closest = 0;
    
    for (let i = 0; i < numbers.length ; i++) {
        if (closest === 0) {
            closest = numbers[i];
            index = i;
        } else if (numbers[i] > 0 && numbers[i] <= Math.abs(closest)) {
            closest = numbers[i];
            index = i;
        } else if (numbers[i] < 0 && - numbers[i] < Math.abs(closest)) {
            closest = numbers[i];
            index = i;
        }
    }

    console.log("closet to zero: " + closest); // !to delete
    
    return index;
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
