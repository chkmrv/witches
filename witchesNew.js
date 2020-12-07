/**
 * Auto-generated code below aims at helping you parse
 * the standard input according to the problem statement.
 **/
 // [-3,-1,-1,-2]
let countSteps = (delta) => {
    let step = 0
    delta.forEach((item, index) => {
        if (index === 0) {
            step += Math.abs(Math.floor(item/2))
        } else {
            step += Math.abs(item) * (index + 1)
        }
    })
    return step
}
// [0, 0, 0, -4] newRecipt
// [3, 0, 0, 0] inventory
// [                       castList
//     [2, 0, 0, 0],
//     [-1, 1, 0, 0],
//     [0, -1, 1, 0]
// ] 
let checkIngredients = (inventory, newRecipt, castList) => {
    let needCast = null
    needCast = inventory.findIndex((inv, index) => (inv + newRecipt[index] < 0))
    console.error('needCast index', needCast) // 3
    if (needCast !== -1) {
        // find quickest way to cast number 3
        let castListID = findNumber(needCast, inventory, castList)

        console.error('castListID here',castListID)
        return castListID
    } else {
        return null
    }
}

// quickest way to cast number
// needCast 3
//     [-2, 0, 0, 1], 1  (1 ingredient) -1
//     [0, 0, -1, 1], 1 + 1 + 1 (1 ingredient) -3
//     [-4, 0, 1, 1], 1 + 1 (2 ingredient) -2
//     [-4, -1, 1, 1], 1 + 1 + 1 + 1 (2 ingredient) -4

let findNumber = (needCast, inventory, castList) => {
    if (needCast === 0) return castList[needCast].castable ? castList[needCast].actionId : 0
    // find good recipts with needed Cast number
    let reciptsList = castList.filter((item) => item.deltaCast[needCast] > 0)
    // console.error('Cast number',reciptsList)
    reciptsList = reciptsList.map((item) => {
        let ingredient = 0
        let steps = 0
        item.deltaCast.forEach((item, index) => {
            if (item < 0) {
                if (index === 0) {
                    steps += Math.abs(Math.floor(item/2))
                } else {
                    steps += Math.abs(item) * (index + 1)
                }
            } else {
                ingredient += item
            }
        })
        return {...item, steps, ingredient}
    })
    
    // find shortest way by sorting castList
    // reciptsList.sort((a, b) => a.steps - b.steps)
    reciptsList.sort((a, b) => b.ingredient - a.ingredient)
    // check if castable
    // console.error('reciptsList', reciptsList)
    // console.error('reciptsList actionId best', reciptsList[0].actionId , reciptsList[0].deltaCast)
    let id = 0
    const invPlace = 10 - inventory.reduce((a, b) => a + b, 0)
    const noPlace = reciptsList[id].ingredient > invPlace
    if (noPlace) id = reciptsList.findIndex((el) => {
        let sum = el.deltaCast.reduce((a, b) => a + b, 0)
        console.error('=====', sum)
        return (sum >= 0 && sum <= invPlace)
    })
    // if (noPlace) id = reciptsList.findIndex((el) => (el.deltaCast.reduce((a, b) => a + b, 0) <= invPlace))
        // id++
        console.error('noPlace', noPlace)
        console.error('noPlace', reciptsList[id].ingredient)
        console.error('place in the inv', invPlace)
        console.error('id', id)

    // check here if need more ingredient for cast from reciptsList
    let needIngredient = inventory.findIndex((inv, index) => (inv + reciptsList[id].deltaCast[index] < 0))
    console.error('needIngredient', needIngredient) // 2
    console.error('reciptsList', reciptsList, id) // 2

    if (needIngredient !== -1) {
        while (inventory[needIngredient - 1] === 0) needIngredient--

        return castList[needIngredient].castable ? castList[needIngredient].actionId : 0
    } else {
        return reciptsList[id].castable ? reciptsList[id].actionId : 0
    }
}

let brew = 0
// game loop
while (true) {
    const actionCount = parseInt(readline()); // the number of spells and recipes in play
    
    let brewList = []
    let smallerStep = 99
    let smallerStepID = 0
    let biggerPrice = 0
    let biggerPriceID = 0
    let castList = []
    let cleanInv = []
    let learnList = []
    let inventoryList = []
    let needCAST = null
    let recipeStepMap = new Map()

    for (let i = 0; i < actionCount; i++) {
        var inputs = readline().split(' ');
        const actionId = parseInt(inputs[0]); // the unique ID of this spell or recipe
        const actionType = inputs[1]; // in the first league: BREW; later: CAST, OPPONENT_CAST, LEARN, BREW
        const delta0 = parseInt(inputs[2]); // tier-0 ingredient change
        const delta1 = parseInt(inputs[3]); // tier-1 ingredient change
        const delta2 = parseInt(inputs[4]); // tier-2 ingredient change
        const delta3 = parseInt(inputs[5]); // tier-3 ingredient change
        const price = parseInt(inputs[6]); // the price in rupees if this is a potion
        const tomeIndex = parseInt(inputs[7]); // in the first two leagues: always 0; later: the index in the tome if this is a tome spell, equal to the read-ahead tax
        const taxCount = parseInt(inputs[8]); // in the first two leagues: always 0; later: the amount of taxed tier-0 ingredients you gain from learning this spell
        const castable = inputs[9] !== '0'; // in the first league: always 0; later: 1 if this is a castable player spell
        const repeatable = inputs[10] !== '0'; // for the first two leagues: always 0; later: 1 if this is a repeatable player spell

        if (actionType === 'BREW') {
            let steps = countSteps([delta0, delta1, delta2, delta3])
            brewList.push({actionId, steps, price, delta: [delta0, delta1, delta2, delta3]})

            if (!recipeStepMap.has(actionId)) {
                
                recipeStepMap.set(actionId, {steps, price, delta: [delta0, delta1, delta2, delta3]})

                if (steps < smallerStep) {
                    smallerStep = steps
                    smallerStepID = actionId
                }
                if (price > biggerPrice) {
                    biggerPrice = price
                    biggerPriceID = actionId
                }
            }
        }
 
        if (actionType === 'CAST') {
            castList.push({actionId, castable, repeatable, deltaCast: [delta0, delta1, delta2, delta3]})
        }
        if (actionType === 'LEARN') {
            learnList.push({actionId, repeatable, tomeIndex, taxCount, deltaLearn: [delta0, delta1, delta2, delta3]})
        }
    }

    // let newRecipt = recipeStepMap.get(smallerStepID).delta
    let newRecipt
    if (brew < 6) {
        newRecipt = recipeStepMap.values().next().value.delta
        smallerStepID = recipeStepMap.entries().next().value[0]
    } else {
        newRecipt = recipeStepMap.get(smallerStepID).delta
        // newRecipt = recipeStepMap.get(biggerPriceID).delta
    }
    console.error('newRecipt smallerStepID', newRecipt ) 
    // let totalSteps = 0;
    // for(let i = 0; i < brewList.length; i++) {
    //     totalSteps += brewList[i].steps;
    // }
    // let avgSteps = totalSteps / recipeStepMap.length;

    // const brewListSort = brewList.sort((a,b)=> b.price - a.price)
    // console.error('newRecipt brewListSort', brewListSort)
    // for (let i = 0; i < brewListSort.length; i++) {
    //     console.error('newRecipt brewListSort[i].step', brewListSort[i].steps, avgSteps ) 
    //     if (brewListSort[i].steps <= Math.ceil(avgSteps)) newRecipt = brewListSort[i].delta
    // }
    // console.error('newRecipt avgSteps, high price', newRecipt ) 

    const mySpell = (id) => castList.find((el) => (castList.actionId === id))

    for (let i = 0; i < 2; i++) {
        var inputs = readline().split(' ');
        const inv0 = parseInt(inputs[0]); // tier-0 ingredients in inventory
        const inv1 = parseInt(inputs[1]);
        const inv2 = parseInt(inputs[2]);
        const inv3 = parseInt(inputs[3]);
        const score = parseInt(inputs[4]); // amount of rupees
        inventoryList = [inv0, inv1, inv2, inv3]
        if (i === 0) {
            needCAST = checkIngredients([inv0, inv1, inv2, inv3], newRecipt, castList)
        }
        if (inv0 === 4 && mySpell(86) && needCAST !== null) needCAST = 86
        if (inv0 === 5 && mySpell(91) && needCAST !== null) needCAST = 91
    }


    console.error('needCAST', needCAST) 
    console.error('recipeStepMap', recipeStepMap) 

    // in the first league: BREW <id> | WAIT; later: BREW <id> | CAST <id> [<times>] | LEARN <id> | REST | WAIT
    let freeLearn = learnList.find((item) => item.taxCount > 1 || item.deltaLearn[3] > 0 || !item.repeatable )
    // console.error('freeLearn', freeLearn)
    // if enough ingredients
    let enoughIngredients = inventoryList.some((item, i) => 
        freeLearn.deltaLearn[i] < 0 && (item + freeLearn.deltaLearn[i] < 0)
    )

    console.error('notEnoughIngredients', enoughIngredients) 

    if (freeLearn && freeLearn.tomeIndex < 1 && !enoughIngredients) {
        castList.push(freeLearn.deltaLearn)
        console.log('LEARN', freeLearn.actionId)
    } else if (needCAST !== null) {
        if (needCAST !== 0) console.log('CAST', needCAST);
        else console.log('REST');
    } else {
        brew++
        console.log('BREW', smallerStepID);    
    }
}

// Not enough ingredients to learn 29
