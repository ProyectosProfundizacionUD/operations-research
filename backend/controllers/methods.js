const linear = require("linear-solve");

const linearSystem = async (req, res) => {
  let type =  req.body.type;
  let equation = req.body.equation;

  let restrictions = req.body.restrictions;
  let newMatrix = [];
  let newMatrixResult = [];
  for (let i = 0; i < restrictions.length; i++) {
    newMatrix.push([restrictions[i].X1, restrictions[i].X2]);
    newMatrixResult.push(restrictions[i].result);
  }

  let tempPoints = []; //aca guardamos los puntos de corte
  let tempArray = [];
  let tempResult = [];
  let posAlreadyUsed = [];
  for (let i = 0; i < newMatrix.length; i++) {
    tempArray = newMatrix[i];
    tempResult = newMatrixResult[i];
    posAlreadyUsed.push(i);
    for (let j = 0; j < newMatrix.length; j++) {
      if (i != j && !posAlreadyUsed.includes(j))
        tempPoints.push(
          linear.solve(
            [tempArray, newMatrix[j]],
            [tempResult, newMatrixResult[j]]
          )
        );
    }
  }

  let results = []
  let resultsRestrictions = []
  let validator = "";
  for (let i = 0; i < tempPoints.length; i++) {
    for (let j = 0; j < restrictions.length; j++) {
      if( j == 0 ){
        results.push(parseFloat((tempPoints[i][0] * equation.X1 + tempPoints[i][1] * equation.X2).toFixed(2)))
      }
      if(validator == "")
        switch (restrictions[j].op) {
          case "≤":
            if(tempPoints[i][0] * restrictions[j].X1 + tempPoints[i][1] * restrictions[j].X2 <= restrictions[j].result){

            } else {
              validator = "fallo";
            }
            break;
          case "≥":
            if(tempPoints[i][0] * restrictions[j].X1 + tempPoints[i][1] * restrictions[j].X2 >= restrictions[j].result){

            } else {
              validator = "fallo";
            }
            break;
          case "=":
            if(tempPoints[i][0] * restrictions[j].X1 + tempPoints[i][1] * restrictions[j].X2 == restrictions[j].result){

            } else {
              validator = "fallo";
            }
            break;
        }
    }
    resultsRestrictions.push(
      validator == "fallo" ? false : true
    )
    validator = ""
  }

  let selectedValue = 0;
  let newArray = [];
  resultsRestrictions.filter( (temp, index) => {
    if(temp == true){
      newArray.push(results[index])
      return results[index]
    }
  });
  //console.log(newArray);
  if(type === "Minimización"){
    selectedValue = Math.min(...newArray);
  } else {
    selectedValue = Math.max(...newArray);
  }

  let indexSelected = results.findIndex( (value) => value == selectedValue );

  return res.status(200).send({tempPoints, results, resultsRestrictions, selectedValue, indexSelected});
};
module.exports = { linearSystem };
