const buttons = document.documentElement.querySelectorAll('.button');
const history = document.documentElement.querySelector('.entry');
const resultScreen= document.documentElement.querySelector('.result');
const digits=[0,1,2,3,4,5,6,7,8,9];
let currentEntry='';
const operations=['NumpadAdd','NumpadMultiply','NumpadDivide','NumpadSubtract'];
const operations2=['add','multiply','divide','subtract'];
const symbols=['+','x','/','-'];
let lastResult='';
let operatedBoolean=false;
let nextEntryMustBeOperator=false;
let clearEntryCount=0;
let negativeResult=false;

function buildCurrentEntry(event, keypressValue){
    let entryValue='';
    !keypressValue ? entryValue=this.attributes.data.value : entryValue=keypressValue;
    if(history.innerText && history.innerText.charAt(0)=='-'){
        negativeResult=true;
    } else{
        negativeResult=false;
    }
    if(history.innerText!='' && (!symbols.some( element => history.innerText.includes(element)))){
        nextEntryMustBeOperator=true;
    } else {
        nextEntryMustBeOperator=false;
    }
    if(entryValue=='sign'){ // account for user entered negatives
        if(resultScreen.innerText && resultScreen.innerText.charAt(0)=='-'){
            resultScreen.innerText=resultScreen.innerText.slice(1);
            if(operatedBoolean){
                lastResult=resultScreen.innerText;
            } else {
                currentEntry=resultScreen.innerText;
            }
            return;
        }
        else if(resultScreen.innerText && resultScreen.innerText.charAt(0)!='-' && resultScreen.innerText.length<=6){
            resultScreen.innerText='-'.concat(resultScreen.innerText)
            if(operatedBoolean){
                lastResult=resultScreen.innerText;
            } else {
                currentEntry=resultScreen.innerText;
            }
            return;
        }
    } else if(entryValue.includes('clear') && !entryValue.includes('entry')){ //if clear button is pressed
        currentEntry='';
        lastResult='';
        history.innerText=lastResult;
        operatedBoolean=false;
        nextEntryMustBeOperator=false;
        resultScreen.innerText='0';
    } else if(entryValue.includes('entry')){ // if clear-entry button is pressed
        clearEntryCount++;
        if(clearEntryCount>=2){ //if CE pressed twice or more, same as clear
            currentEntry='';
            lastResult='';
            history.innerText=lastResult;
            operatedBoolean=false;
            nextEntryMustBeOperator=false;
            resultScreen.innerText='0';
            return;
        }
        if(operatedBoolean && lastResult){
            if(lastResult!='TooBig') history.innerText=lastResult.replaceAll('.',',');
            else history.innerText='';
            nextEntryMustBeOperator=true;
        }
        operatedBoolean=false;
        currentEntry=''
        lastResult ? resultScreen.innerText=currentEntry : resultScreen.innerText='0'
    }
    //if a digit button is pressed, concat with currentEntry 
    else if(!entryValue.includes('=') && !entryValue.includes('add') && !entryValue.includes('subtract') && !entryValue.includes('multiply') && !entryValue.includes('divide')){
        clearEntryCount=0;
        if(currentEntry.length>=7) return;
        if(nextEntryMustBeOperator) return;
        if(operatedBoolean){
            lastResult='';
            history.innerText=lastResult;
            currentEntry='';
            currentEntry=currentEntry.concat(entryValue);
            resultScreen.innerText=currentEntry;
            operatedBoolean=false;
            return;
        }
        if(entryValue.includes(',') && currentEntry.includes(',')) return;
        currentEntry=currentEntry.concat(entryValue);
        resultScreen.innerText=currentEntry;
    } else if(entryValue.includes('=')){ // equals sign pressed
        clearEntryCount=0;
        if(nextEntryMustBeOperator) return;
        if(!history.innerText) return;
        if(history.innerText && operatedBoolean){ //if we just keep pressing the enter button
            if(lastResult=='TooBig') return;
            //find most recent operator and most recent second entry;
            let [operator, a , b, symbolIndex] = parseExpression(history.innerText.replaceAll(',','.'));
            b=b.replaceAll('.',',') // account for decimals in new expression
            //update the history screen(expression)
            history.innerText=lastResult+operator+b+'=';
            [operator, a , b, symbolIndex] = parseExpression(history.innerText.replaceAll(',','.'));
            lastResult=operate(operator,a,b).toString().replaceAll('.',','); //get result of expression, account for decimals;
            if(lastResult.length>7 && lastResult.includes(',')) lastResult=lastResult.slice(0,7);
            if (lastResult.length>9) lastResult='TooBig';
            resultScreen.innerText=lastResult
            currentEntry='';
            return;
        }
        if(!currentEntry) return;//if there is no entry, we cant do any operations
        history.innerText=history.innerText+currentEntry+'=';
        let [operator, a , b, symbolIndex] = parseExpression(history.innerText.replaceAll(',','.'));
        lastResult=operate(operator,a,b).toString().replaceAll('.',',');
        if(lastResult.length>7 && lastResult.includes(',')) lastResult=lastResult.slice(0,7);
        if (lastResult.length>9) lastResult='TooBig';
        resultScreen.innerText=lastResult;
        currentEntry='';
    } else{ // operator button pressed
        clearEntryCount=0;
        if(operatedBoolean){ //if there was a lastResult
            history.innerText=lastResult.replaceAll('.',',') + symbols[operations2.findIndex(element => element.includes(entryValue))];
            resultScreen.innerText='';
            operatedBoolean=false;
            return;
        }
        if(!currentEntry && !nextEntryMustBeOperator) return;
        if(!nextEntryMustBeOperator){
            lastResult=currentEntry;
            let symbol = symbols[operations.findIndex(element => element.toLowerCase().includes(entryValue))]
            history.innerText=currentEntry.concat(symbol)
            currentEntry='';
            resultScreen.innerText=currentEntry;
        }
        if(nextEntryMustBeOperator){
            let symbolIndex=operations2.findIndex(element => entryValue.includes(element));
            history.innerText=history.innerText + symbols[symbolIndex];
            nextEntryMustBeOperator=false;
        }
    }
}

function parseExpression(exp){
    //get operator but must account for negative numbers
    let tempExp=exp;
    let negative=false;
    if(tempExp.charAt(0)=='-'){
        negative=true;
        tempExp=tempExp.slice(1)
    }
    let symbolIndex=tempExp.indexOf(symbols.find(symbol => tempExp.includes(symbol)))
    let operator=tempExp.charAt(symbolIndex);
    //get first number
    let firstNumber=tempExp.slice(0,symbolIndex)
    negative ? firstNumber='-'.concat(firstNumber):firstNumber;
    //get second number
    let secondNumber=tempExp.slice(symbolIndex+1,tempExp.length-1)
    return [operator,firstNumber,secondNumber,symbolIndex];
}
buttons.forEach(button =>{
    button.addEventListener('click',buildCurrentEntry)
})

function parseKeypress(event){//handle keyboard inputs rather than clicks
    //console.log(event.code)
    if(digits.some(digit => event.code.includes(digit))){ //a number was entered
        buildCurrentEntry(event, event.code[event.code.length-1])
        return;
    }
    let operationIndex=operations.findIndex(operation => event.code.includes(operation))
    if(operationIndex!=-1){ // an operation was entered
        buildCurrentEntry(event, operations2[operationIndex])
        return;
    }
    if(event.code=='Minus'){ //another check for subtract
        buildCurrentEntry(event,'subtract')
        return;
    }
    if(event.code.includes('Enter') || event.code.includes('Equal')){
        buildCurrentEntry(event,'=')
        return;
    }
    if(event.code.includes('Period') || event.code.includes('Comma') || event.code.includes('Decimal')){//use commas instead of periods
        buildCurrentEntry(event,',');
        return;
    }
    if(event.code.includes('Backspace') || event.code.includes('Delete')){//clear-entry buttons
        buildCurrentEntry(event,'entry')
        return;
    }

}

function operate(operator, a ,b){
    operatedBoolean=true;
    a=parseFloat(a);
    b=parseFloat(b);
    if (operator.toLowerCase().includes('+')){
        a+b<0 ? negativeResult=true: negativeResult=false;
        return a+b;
    }
    if (operator.toLowerCase().includes('-')){
        a-b < 0 ? negativeResult=true : negativeResult=false;
        return a-b
    }
    if (operator.toLowerCase().includes('x')){
        a*b<0 ? negativeResult=true:negativeResult=false;
        return a*b;
    }
    if (operator.toLowerCase().includes('/')){
        a/b<0 ? negativeResult=true : negativeResult=false;
        return a/b;
    }
}




//window.addEventListener('keypress',parseKeypress)
window.addEventListener('keydown',parseKeypress)
//code: NumpadDivide NumpadMultiply NumpadAdd NumpadSubtract NumpadDecimal NumpadEnter Numpad5 10 digit max