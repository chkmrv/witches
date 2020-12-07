
let brew = 0
let learn = 0
let count = 1
let recipt = []
let brewID = 0
let goBrew = false

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

let checkIngredients = (inventory, recipt, castList, brewList) => {
    let needCast = null
    console.error('checkIngredients', recipt)
    // if i neew ingredients to do BREW
    needCast = inventory.findIndex((inv, index) => (inv + recipt[index] < 0))
    // needCast = inventory.lastIndexOf((inv, index) => (inv + recipt[index] < 0))

    console.error('needCast index', needCast) // 3
    if (needCast !== -1) {
        // find quickest way to cast number 3
        let id = findProperSpell(needCast, inventory, castList, brewList)
        // need more ingredients for best spell
        console.error('findProperSpell', id)
        // let castListID = checkID(id, inventory, castList)

        console.error('castListID here', id)
        return id
    } else {
        return null
    }
}

// quickest way to cast number

let findProperSpell = (needCast, inventory, castList, brewList) => {
    // if (needCast === 0) return castList[needCast].castable ? castList[needCast].actionId : 0
    // find good recipts with needed Cast
    let reciptsList = castList.filter((item) => item.deltaCast[needCast] > 0 && item.castable)
    // console.error('reciptsList filter', reciptsList)
    if (reciptsList.length > 0) {
        // add steps and ingredients
        reciptsList = reciptsList.map((item) => {
            let ingredient = 0
            let steps = 0
            item.deltaCast.forEach((item, index) => {
                if (item < 0) {
                    if (index === 0) {
                        steps += Math.abs(Math.floor(item/2)) + 1
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
        // reciptsList.sort((a, b) => b.ingredient - a.ingredient)
        reciptsList.sort((a, b) => {
            if (a.steps < b.steps) return -1;
            if (b.steps > a.steps) return 1;
            if (b.steps === a.steps) {
                if (a.ingredient < b.ingredient) return 1
                if (b.ingredient > a.ingredient) return -1
                return 0;
            }
        })
        // console.error('reciptsList', reciptsList)
        // check if castable by inventory space
        let id = 0

        const invPlace = 10 - inventory.reduce((a, b) => a + b, 0)
        let noPlace = reciptsList[id].deltaCast.reduce((a, b) => a + b) > invPlace // !!! here trouble
        // if (noPlace)

        // no place to cast +2 
        // let noPlace = false
        // reciptsList[id].deltaCast.forEach((spellIng, i) => {
        //     // if (spellIng < 0 && inventory[i] + spellIng < 0) noPlace = true 
        //     if (reciptsList[id].ingredient > invPlace) noPlace = true
        // })
//         checkIngredients [ 0, -2, -2, -2 ]
// needCast index 3
// noPlace false 1 {
//   actionId: 87,
//   castable: true,
//   repeatable: true,
//   deltaCast: [ -5, 0, 0, 2 ],
//   steps: 4,
//   ingredient: 2
// }
// noPlace new id 0
        // [ 2, -2, 0, 1 ],
        // [ 3, 0, 0, 2 ],
        //    Not enough space in inventory for spell 78
        console.error('noPlace', noPlace, invPlace, reciptsList[id]) // deltaCast: [ -4, 0, 1, 1 ],

        if (noPlace) id = reciptsList.findIndex((el) => {
            let sum = el.deltaCast.reduce((a, b) => a + b, 0)
            return (sum >= 0 && sum <= invPlace)
        })
            console.error('noPlace new id', id)
        if (id === -1) {
            console.error('id === -1 CHANGE RECIPT AND SEARCH IF I CAN CAST')
            recipt = findFastest(brewList, brew, inventory)
            console.error('recipt -1', recipt)
            if (goBrew) return null
            else return 0
        }
            // console.error('!!!reciptsList', id, reciptsList[id])
        // check here if need more ingredient for cast from reciptsList
        let needIngredient = inventory.findIndex((inv, index) => (inv + reciptsList[id].deltaCast[index] < 0))
        console.error('needIngredient', needIngredient) // 2 

        
        if (needIngredient !== -1) {
            console.error('recurcia')
            count = Math.abs(reciptsList[id].deltaCast[needIngredient])
            // let here = findProperSpell(needIngredient, inventory, castList)
            // go to full cast list
            while (inventory[needIngredient - 1] === 0) needIngredient-- // 1
            // console.error('recurcia here found', reciptsList)
            // console.error('recurcia here found castList', castList)
            return castList[needIngredient].castable ? castList[needIngredient].actionId : 0
        } else {
            console.error('check if all good')
            return reciptsList[id].castable ? reciptsList[id].actionId : 0
        }

        return id
    } else return 0
}

let shouldLearn = (freeLearn, inventoryList, castList) => {
    if (freeLearn) {
        if (freeLearn.tomeIndex === 0 || (freeLearn.tomeIndex === 1 && inventoryList[0] > 0)) {
            castList.push(freeLearn.deltaLearn)
            return freeLearn.actionId
        }
    }
    return null
}

let findRecipt = (brewList, brew, inventoryList, recipeStepMap) => {
    let totalSteps = 0

    for (let i = 0; i < brewList.length; i++) {
        totalSteps += brewList[i].steps
    }
    
    const avgSteps = totalSteps / brewList.length
    const brewListSort = brewList.sort((a,b)=> b.price - a.price)
    const newReciptObject = brewListSort.find((el) => (el.steps <= Math.ceil(avgSteps+1)))

    if (brew < 5) {
        recipt = recipeStepMap.values().next().value.delta
        brewID = recipeStepMap.entries().next().value[0]
        console.error('recipt AVR', recipt ) 
    } else {
        recipt = findFastest(brewList, brew, inventoryList)
        console.error('recipt 2', recipt ) 
        // recipt = recipeStepMap.get(smallerStepID).delta
        // recipt = recipeStepMap.get(biggerPriceID).delta
    }

    return recipt
}

let findFastest = (brewList, brew, inventoryList) => {
    console.error('brew!!!!' ) 
    let newID = 0
    let readyBrew = []
    let needMoreIng = 99

    const brewListSort = brewList.sort((a,b)=> b.price - a.price)
    // delta [] check inventary by each index
    // see how many ingredients need more, choose with less
    // [0, 0 , -3, -2] [0, 0 , 2, 2]
    brewListSort.forEach((el,i) => {
        let fastest = 0
        el.delta.forEach((item, index) => {
            if (inventoryList[index] + item <= 0) fastest += Math.abs(inventoryList[index] + item)
        })

        if (fastest < needMoreIng) {
            needMoreIng = fastest
            readyBrew = el.delta
            newID = el.actionId
        }
    })

    brewID = newID
    if (needMoreIng === 0) goBrew = true
    console.error('readyBrew', readyBrew, needMoreIng)
    return readyBrew
}

// game loop ////////////////////////////////////////////////////////////////////////////////////////////////////////// /////////////////////////////////////////////////////////////////////// 
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

    
    const mySpell = (id) => castList.find((el) => (el.actionId === id && el.castable))

    for (let i = 0; i < 2; i++) {
        var inputs = readline().split(' ');
        const inv0 = parseInt(inputs[0]); // tier-0 ingredients in inventory
        const inv1 = parseInt(inputs[1]);
        const inv2 = parseInt(inputs[2]);
        const inv3 = parseInt(inputs[3]);
        const score = parseInt(inputs[4]); // amount of rupees
        
        if (i === 0) {

            inventoryList = [inv0, inv1, inv2, inv3]
            /////// SEARCH FOR RECIPT
            recipt = findRecipt(brewList, brew, inventoryList, recipeStepMap )
            console.error('!!!!!!!!recipt', recipt, brewID)

            needCAST = checkIngredients(inventoryList, recipt, castList, brewList)
            // improve this
            // console.error('!!!!!!!!22222', needCAST)
            // console.error('recipt brewListSort', inv0 === 5, mySpell(92),!!mySpell(92), needCAST !== null)
            // // // if (inv0 === 4 && mySpell(86) && needCAST !== null) needCAST = 86
            // if (inv0 === 5 && !!mySpell(92) && needCAST !== null) needCAST = 92
        }
    }

    // console.error('count', count) 
    console.error('needCAST', needCAST)
    // console.error('recipeStepMap', recipeStepMap) 

    // in the first league: BREW <id> | WAIT; later: BREW <id> | CAST <id> [<times>] | LEARN <id> | REST | WAIT
    
    const invPlace = 10 - inventoryList.reduce((a, b) => a + b, 0)
    let noPlace = false
    castList.forEach((item) => {
        if (item.actionId === needCAST) {
            noPlace = item.deltaCast.reduce((a, b) => a + b) > invPlace
        }
    })

    console.error('new noPlace', noPlace)

    if (noPlace) needCAST = castList.findIndex((el) => {
        let sum = el.deltaCast.reduce((a, b) => a + b, 0)
        return (sum >= 0 && sum <= invPlace)
    })
   
        console.error('new noPlace id ', needCAST)


    let freeLearn = learnList.find((item) => item.taxCount > 1 || item.deltaLearn[3] > 0 || item.deltaLearn[0] < 0 || !item.repeatable )
    let learnID = shouldLearn(freeLearn, inventoryList, castList)
    console.error('learnList', learnList)

    if (learnID !== null && learn < 10) {
        learn++
        console.log('LEARN', learnID)
        // console.log('LEARN', learnList[0].actionId)
    } else if (needCAST !== null) {
        if (needCAST === 0) console.log('REST');
        else console.log('CAST', needCAST);
    } else {
        brew++
        recipt = []
        console.log('BREW', brewID);    
    }
}
