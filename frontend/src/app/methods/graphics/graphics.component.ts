import { Component, OnInit } from '@angular/core';
import { UtilsService } from 'src/app/services/utils.service';

@Component({
  selector: 'app-graphics',
  templateUrl: './graphics.component.html',
  styleUrls: ['./graphics.component.css'],
})

export class GraphicsComponent implements OnInit {
  //first form variables
  simplexType: string = 'default';
  variablesCount: number = 0;
  restrictionsCount: number = 0;
  vX1: number = 0;
  vX2: number = 0;
  res1: number = 0;
  res2: number =0;
  //generated form variables
  showGeneratedFields: boolean = false;
  equations: any = [];
  variablesCountList: any = [];
  //variable para guardar los puntos
  points: any = []; 
  X1: number = 0;
  X2: number = 0;
  div1: number=0 ;
  div2: number =0;
  //despeje(res: number, vX1: number) {}



  constructor(private _utils: UtilsService) {}

  ngOnInit(): void {}

  generateFields() {
    if (this.validations()) {
      this.equations = [];
      this.variablesCountList = [];
      let equationTemplate = '{';
      for (let j = 0; j < this.variablesCount; j++) {
        equationTemplate += `"X${j + 1}": 0,`;
        this.variablesCountList.push(`X${j + 1}`);
      }
      equationTemplate += '"op": "=",';
      equationTemplate += '"result": 0';
      equationTemplate += '}';

      console.log(JSON.parse(equationTemplate));

      for (let i = 0; i < this.restrictionsCount; i++) {
        this.equations.push(JSON.parse(equationTemplate));
      }

      this.showGeneratedFields = true;
    }
  }
  //Prueba de funcion para despejar variable
  /*despeje(res: number, X: number): number {
    let r = 0;
    return (r = res / X);
    console.log(r);
  }*/
  //fin de funcion para despeje de variable
  startSimplex() {
    this.X1 = 0;
    this.X2 = 0;
    //this.div1 =0;
    this.div2 =0;
    //var r;
    console.log('hola')
    for (var s = 0; s < this.equations.length; s++) {
      //if (this.equations[j].X1 == undefined || this.equations[j].X1 == '') {
          //this.equations[j].X1 = this.X1;
          //console.log('hola, esta es la prueba dentro de el X1');
      //}
          //if (this.equations[j].X2 == undefined || this.equations[j].X2 == '') {
            //this.equations[j].X2 = this.X2;
          //}
        console.log('hola');
        var vX1= this.equations[s].X1;
        var res1= this.equations[s].result;
        var div1=( res1/vX1);
        console.log(div1);
        //segunda fila
        var vX2= this.equations[s].X2;
        var res2= this.equations[s].result;
        var div2=(res2/vX2);
        console.log(div2);
      //}
      //this.div1=this.res/this.vX1;
      //this.div2=this.res1/this.vX2;
      this.points.push([div1,0]);
      this.points.push([0,div2]);
      console.log('El siguiente es el arreglo de points');
      console.log(this.points);
      //this.despeje(res,vX1);
    //console.log(despeje);
    }

    //X: Number = this.equations[0].X1;
    //vX2: Number = this.equations[0].X2;
    //res: Number = this.equations[0].result;
    //despeje(this.res,this.X);
    //console.log(despeje);
    //console.log(this.vX2);*/
    //console.log(this.equations[0].X1);
    //console.log(this.equations[0].X1);
    //console.log(this.equations[0].X2);
    //console.log(this.equations[0].result);

    switch (this.simplexType) {
      case 'Minimización':
        this.Minimizacion();
        break;
      case 'Maximización':
        this.Maximizacion();
        break;
    }
  }

  Maximizacion() {
    console.log('maxi');
  }
  Minimizacion() {
    console.log('mini');
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
