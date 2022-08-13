import { Component, OnInit } from '@angular/core';
import { UtilsService } from 'src/app/services/utils.service';

@Component({
  selector: 'app-simplex-two-fases',
  templateUrl: './simplex-two-fases.component.html',
  styleUrls: ['./simplex-two-fases.component.css'],
})
export class SimplexTwoFasesComponent implements OnInit {
  //first form variables
  simplexType: string = 'Minimización'; //'default';
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
  twoFaseCxCj: any = [];
  twoFaseMatrix: any = [];
  firstMatrix: any = [];
  firstRowPivotPositionList: any = [];
  historyMatrix: any = [];
  //fasesPositions
  faseOnePositionsR: any = [];
  faseOnePositionsX: any = [];
  fasetwoColPivotPositionList: any = [];
  //showMoreViews
  showFirstFase: boolean = false;
  showTwoFase: boolean = false;
  //visual titles
  XSs: any = [];
  RSs: any = [];
  SSs: any = [];
  HSs: any = [];
  rowSize: number = 0;
  positionToPrint: any = [];
  //limit
  limitOfFases: number = 40;

  tempArray: any = [];

  constructor(private _utils: UtilsService) {}

  ngOnInit(): void {}

  generateFields() {
    if (this.validations()) {
      this.chargeOnChange();
    }
  }

  chargeOnChange(){
    this.equations = [];
    this.variablesCountList = [];
    this.calculateRowEquations();
  }
  calculateRowEquations(){
    console.log("calculate");
    let tempVariableCountList = [];
    let operationEquationTemplate = '';
    let equationTemplate = '{';
    for (let j = 0; j < this.variablesCount; j++) {
      equationTemplate += `"X${j + 1}": 0,`;
      tempVariableCountList.push(`X${j + 1}`);
    }
    this.variablesCountList = tempVariableCountList;
    operationEquationTemplate = equationTemplate;
    operationEquationTemplate += `"type":"${this.simplexType.substring(
      0,
      3
    )} Z: "}`;
    equationTemplate += '"op": "=",';
    equationTemplate += '"result": 0';
    equationTemplate += '}';

    this.operationEquation = JSON.parse(operationEquationTemplate);
    let tempArrayEq = []
    for (let i = 0; i < this.restrictionsCount; i++) {
      tempArrayEq.push(JSON.parse(equationTemplate));
    }
    this.equations = tempArrayEq;

    console.log("ecuaciones");    
    console.log(this.equations);
    console.log("operationEquations");    
    console.log(this.operationEquation);

    this.showGeneratedFields = true;
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
    let result = this.generateValues(method, rValue);
    let
      CXCJ = result[0],
      UnUserMatrix = result[1],
      ZjCj = result[2],
      totalCountOfCol = result[3],
      countTotalRows =  result[4],
      R =  result[5],
      H =  result[6],
      S =  result[7],
      newMethod =  result[8],
      numberOfVariables = result[9];


    this.DoProcess(
      CXCJ,
      this.initialMatrix,
      ZjCj,
      totalCountOfCol,
      countTotalRows,
      R,
      H,
      S,
      method,
      numberOfVariables
    );
  }

  generateValues(method: string, rValue: number){
    this.initialMatrix = this.equations;
    this.faseOnePositionsR = [];
    this.faseOnePositionsX = [];
    this.firstRowPivotPositionList = [];
    this.rowSize = 0;

    let countNewVariables = 0;
    let countTotalRows = 0;
    let CxCjText = '{';
    let ZjCjText = '{';
    let CXCJ = {};
    let ZjCj = [];
    let R = 1;
    let H = 1;
    let S = 1;
    let numberOfVariables = 0;
    numberOfVariables +=  this.variablesCount;

    for (let o = 0; o < numberOfVariables; o++) {
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
    let totalCountOfCol = countNewVariables + numberOfVariables + 2;

    console.log('CxCj y ZjCj respectivamente:'); // !to delete
    console.log(CXCJ); // !to delete
    console.log(ZjCj); // !to delete
    console.log(totalCountOfCol); // !to delete
    console.log(countTotalRows); // !to delete
    console.log('Matriz inicial'); // !to delete
    console.log(this.initialMatrix); // !to delete

    this.visualListSetting(R, H, S, numberOfVariables);

    return [
      CXCJ,
      this.initialMatrix,
      ZjCj,
      totalCountOfCol,
      countTotalRows,
      R,
      H,
      S,
      method,
      numberOfVariables
    ]
  }

  visualListSetting(R: number, H: number, S: number, numberOfVariables: number){
    this.XSs = []
    this.RSs = []
    this.HSs = []
    this.SSs = []
    this.positionToPrint = []
    
    for (let i = 0; i < numberOfVariables; i++)
      this.XSs.push(`X${i + 1}`)
    for (let i = 0; i < R - 1; i++)
      this.RSs.push(`R${i + 1}`);
    for (let i = 0; i < H - 1; i++)
      this.HSs.push(`H${i + 1}`);    
    for (let i = 0; i < S - 1; i++)
      this.SSs.push(`S${i + 1}`);
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
    method: string,
    numberOfVariables: number
  ) {
    //Set a correct format to historyMatrix and initialCxCj
    this.CleanMatrix(countTotalRows, CxCj, ZjCj, R, H,S, numberOfVariables);
    this.firstMatrix = this.historyMatrix;
    for (let index = 0; index < countTotalRows; index++)
      this.faseOnePositionsX.push();
      
    console.log("initialCxCj");     // !to delete
    console.log(this.initialCxCj);  // !to delete
      
    let whileCount = 0;
    let result;
    let startRows = 0;
    let endRows = countTotalRows;
    
    do {
      //calcular zjcj, devuelve [endFase, selectedValue, selectedIndex]
      result = this.calculateCol(
        startRows,
        totalCountOfCol,
        endRows,
        method,
        this.historyMatrix,
        this.initialCxCj
      );

      this.historyMatrix = result[3];
      
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
          result[2],
          this.initialCxCj
        );

        startRows += countTotalRows + 1;
        endRows +=  countTotalRows + 1;
      } 
      console.log(result[0]);
      whileCount += 1;
      console.log(`number of cicles fase 1: ${whileCount}`);
      if(whileCount >= this.limitOfFases){
        result[0] = true;
        console.log("se ha detenido la ejecución del cliclo 1 para evitar romper el programa");        
      }
        
    } while (result[0] == false);
    console.log("fase 1 complete"); // !to delete
    console.log("Posiciones de R a suprimir"); // !to delete
    console.log(this.faseOnePositionsR); // !to delete
    console.log("Posiciones de col a incluir bi"); // !to delete
    console.log(this.faseOnePositionsX); // !to delete

    console.log("start two fases");    
    this.showFirstFase = true;
    this.startTwoFases(totalCountOfCol, countTotalRows, startRows, endRows, H, S, method, numberOfVariables);
  }

  startTwoFases(
    totalCountOfCol: number,
    countTotalRows: number,
    startRows: number,
    endRows: number,
    H: number,
    S: number,
    method: string,
    numberOfVariables: number
  ){
    this.twoFaseCxCj = [];
    this.twoFaseMatrix = [];
    this.CleanFaseTwo(totalCountOfCol, countTotalRows, startRows, endRows, H, S, numberOfVariables);

    let result;
    let whileCount = 0;
    startRows = 0;
    endRows = countTotalRows;
    totalCountOfCol = totalCountOfCol - this.faseOnePositionsR.length;

    do {
      // * to modify
      result = this.calculateCol(
        startRows,
        totalCountOfCol,
        endRows,
        method,
        this.twoFaseMatrix,
        this.twoFaseCxCj
      );

      this.twoFaseMatrix = result[3];
      
      if(result[0] == false){
        console.log('History matrix'); // !to delete
        console.log(this.twoFaseMatrix); // !to delete

        for (let i = 0; i < countTotalRows + 1; i++) {
          this.twoFaseMatrix.push([]);          
        }
        
        this.twoFaseMatrix = this.calculateRows(
          totalCountOfCol,
          countTotalRows,
          startRows,
          endRows,
          this.twoFaseMatrix,
          result[2],
          this.twoFaseCxCj
        );

        startRows += countTotalRows + 1;
        endRows +=  countTotalRows + 1;
      } 
      console.log(result[0]);
      whileCount += 1;
      // * end modify
      console.log(`number of cicles fase 2: ${whileCount}`);
      if(whileCount >= this.limitOfFases){
        result[0] = true;
        console.log("se ha detenido la ejecución del cliclo 1 para evitar romper el programa");        
      }
    } while (result[0] == false);
    this.rowSize = countTotalRows;
    console.log("endProcess");
    this._utils.openSnackBarSuccesfullWithDuration("Se completado el algoritmo, haga scroll hacia abajo para ver los resultados", 8);
    this.showTwoFase = true;
  }

  calculateRows(
    totalCountOfCol: number,
    totalCountOfRows: number,
    startRows: number,
    endRows: number,
    historyMatrixTemp: any[],
    selectedIndex: number,
    faseCxCj: any[],
  ){
    console.log(`startrow: ${startRows}`); // !to delete
    console.log(`endrow: ${endRows}`); // !to delete
    console.log(`totalCountOfRows: ${totalCountOfRows}`); // !to delete
    
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
    
    let closestToZeroIndex = this.closestToZero(tempCandidates); // *en esta posicion enviaremos los valores de los x1
    // * estas lineas no afectan la segunda fase *
    this.faseOnePositionsX.push(selectedIndex);// *guardamos la posicion de la columna
    this.firstRowPivotPositionList.push(closestToZeroIndex);

    let indexRow = closestToZeroIndex + startRows;
    console.log("indexRow " + indexRow);  // !to delete

    let pivotRowNumber = historyMatrixTemp[indexRow][selectedIndex]; 
    
    //multiplicamos el inverso multiplicativo con la fila pivote
    let InverseMultiplicative = 1/pivotRowNumber;
    historyMatrixTemp[indexRow + totalCountOfRows + 1].push(faseCxCj[selectedIndex - 1])
    for (let i = 1; i < totalCountOfCol; i++) { //!! falta pushear el valor de x!
      historyMatrixTemp[indexRow + totalCountOfRows + 1].push(this.roundDecimals(historyMatrixTemp[indexRow][i] * InverseMultiplicative));
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
          
          tempNumber = this.roundDecimals((historyMatrixTemp[indexRow + totalCountOfRows + 1][j] * inverseAdit) + historyMatrixTemp[i - totalCountOfRows - 1][j]);
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
    method: string,
    historyMatrixTemp: any[],
    FaseCxCj: any[]
  ) {
    console.log("calculateColStarted");
    this.tempArray = [0];
    let tempItem = 0;
    for (let i = 1; i < totalCountOfCol; i++) {
      for (let j = rowToStart; j < totalCountOfRows; j++) {
        //console.log(`Estoy fallando por: ${historyMatrixTemp[j][0]} * ${historyMatrixTemp[j][i]}`); // ! to do
        
        tempItem += (historyMatrixTemp[j][0] * historyMatrixTemp[j][i])
        
        if(j == (totalCountOfRows - 1))
          if(i <= totalCountOfCol - 2)
            tempItem -= FaseCxCj[i - 1];
        
      }
      this.tempArray.push(this.roundDecimals(tempItem));
      tempItem = 0;
    }
    
    historyMatrixTemp[totalCountOfRows] = this.tempArray;
    this.positionToPrint.push(totalCountOfRows);  //* usado para pintar el front
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
    
    return [endFase, selectedValue, selectedIndex, historyMatrixTemp]
  }

  CleanFaseTwo(
    totalCountOfCol: number,
    countTotalRows: number,
    startRows: number,
    endRows: number,
    H: number,
    S: number,
    numberOfVariables: number
  ){
    console.log(`startRow ${startRows}, endRow${endRows}`); // !to delete 8 y 11
    let tempArray = [];
    //se forma el nuevo CxCj
    for (let i = 0; i < numberOfVariables; i++) {
      tempArray.push(this.operationEquation[`X${i+1}`]);
    }
    console.log(`CxCj - R ${this.initialCxCj.length} - ${this.faseOnePositionsR.length} = ${this.initialCxCj.length - this.faseOnePositionsR.length}`);
    console.log(`temp +1 ${tempArray.length - 1}`);
    
    
    for (let i = tempArray.length; i < this.initialCxCj.length; i++) {
      if(!this.faseOnePositionsR.includes(i)){
        tempArray.push(this.initialCxCj[i])
      }
    }
    tempArray.forEach(element => {
      this.twoFaseCxCj.push(element);
    });    

    console.log("RowPivotes"); // !to delete
    console.log(this.firstRowPivotPositionList); // !to delete
    console.log("twoFaseCxCj"); // !to delete
    console.log(this.twoFaseCxCj); // !to delete

    for (let i = 0; i < countTotalRows + 1; i++)
      this.twoFaseMatrix.push([]);

    let countRows = 0;
    tempArray = [];

    // ! firstRowPivotPositionList //[0, 1]
    // ! faseOnePositionsX // [1, 2]
    for (let i = 0; i < this.firstRowPivotPositionList.length; i++) {
      this.twoFaseMatrix[this.firstRowPivotPositionList[i]].push(this.twoFaseCxCj[this.faseOnePositionsX[i] - 1]);
    }

    for (let i = startRows; i < endRows; i++) {      
      for (let j = 1; j < totalCountOfCol; j++) {
        if(!this.faseOnePositionsR.includes(j - 1)){
          if((j - 1) == 0 && this.twoFaseMatrix[countRows].length == 0)
            this.twoFaseMatrix[countRows].push(this.historyMatrix[i][j - 1]);
          this.twoFaseMatrix[countRows].push(this.historyMatrix[i][j]);
        }
      }
      tempArray = [];
      countRows += 1;
    }
    console.log("twoFaseMatrix");
    console.log(this.twoFaseMatrix);    
    
  }

  CleanMatrix(
      countTotalRows: number, 
      CxCj: any, 
      ZjCj: any,
      R: number,
      H: number,
      S: number,
      numberOfVariables: number
    ){
    this.historyMatrix = [];
    this.tempArray = []
    //add CxCj
    for (let i = 0; i < countTotalRows; i++) {
      this.historyMatrix.push([this.initialMatrix[i][`CxCj${i+1}`]]);
    }
    //add X's
    for (let i = 0; i < this.initialMatrix.length; i++) {
      for (let j = 0; j < numberOfVariables; j++) {
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
        if(i == 0){
          this.tempArray.push(CxCj[`R${j+1}`]);
          this.faseOnePositionsR.push(this.tempArray.length - 1);
        }          
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
  roundDecimals(numb: number){
    var rounded = Math.round((numb + Number.EPSILON) * 100) / 100;
    return rounded;
  }
  Charge(event: any){
    if (
      this.simplexType != 'default' &&
      this.variablesCount > 1 &&
      this.variablesCount != undefined &&
      this.restrictionsCount > 1 &&
      this.restrictionsCount != undefined
    ) {
      this.chargeOnChange();
    }
  }
  validations() {
    if (
      this.simplexType == 'default' ||
      this.variablesCount <= 1 ||
      this.variablesCount == undefined ||
      this.restrictionsCount <= 1 ||
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
