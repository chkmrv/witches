
let brew = 0
let learn = 0
let count = 1
let recipt = []
let brewID = 0
let goBrew = false

let shouldLearn = (freeLearn, inventoryList, castList) => {
    if (freeLearn) {
        if (freeLearn.tomeIndex === 0 || (freeLearn.tomeIndex === 1 && inventoryList[0] > 0)) {
            castList.push(freeLearn.deltaLearn)
            return freeLearn.actionId
        }
    }
    return null
}

let checkFreeSpells = (castList, inventoryList) => {
    let reciptsList = castList.filter((item) => (
        item.deltaCast.every(el => (el >= 0)) && item.castable
    ))

    if (reciptsList.length > 0) {
        reciptsList.sort((a, b) => {
            if (a.value < b.value) return -1
            if (b.value > a.value) return 1
            return 0
        })

        console.error('checkFreeSpells reciptsList', reciptsList)

        let id = 0
        let inventorySum = inventoryList.reduce((a, b) => a + b, 0)
        let noPlace = reciptsList[id].deltaCast.reduce((a, b) => a + b) > (10 - inventorySum) // !!! here trouble,

        if (noPlace) return 0
        return reciptsList.length > 0 ? reciptsList[id].actionId : 0
    }

    return null
}

let checkIngredients = (inventory, recipt, castList, brewList) => {
    let needCast = null
    let needCastArr = null
    console.error('checkIngredients!', recipt, inventory) // [ 2, 0, 0, -1 ]
    // if i neew ingredients to do BREW
    for (var i = 0; i < inventory.length; i++) {
        if (inventory[i] + recipt[i] < 0) needCast = i
    }

    // needCast = [...inventory].reverse().findIndex((inv, index) => (inv + recipt[index] < 0))
    needCastArr = recipt.map((r, index) => ((r + inventory[index]) < 0 ? Math.abs(r + inventory[index]) : 0))

    console.error('needCast arr!', needCastArr) // [ 0, 0, 0, -1 ]
    console.error('needCast index', needCast)
    let arr = Number(needCastArr.join(''))

    console.error('needCast arr', arr) // no need anything if it 0
    if (arr === 0) return null
    if (needCast !== -1) {
        // find quickest way to cast
        let id = findProperSpell(needCast, inventory, castList, brewList, needCastArr)
        return id
    } else {
        return null
    }
}

// quickest way to cast number

let findProperSpell = (needCast, inventory, castList, brewList, needCastArr) => {
    // find good recipts with needed Cast
                                                                                            //    [ 0, -1, 0, -1 ]
    // let reciptsList = castList.filter((item) => item.deltaCast[needCast] > 0 && item.castable) [ -5, 1, 0, 1 ]
    let reciptsList = castList.filter((item) => (
        item.castable && item.deltaCast.find((el,i)=> (needCastArr[i] > 0 && el > 0) )
    ))
    // console.error('reciptsList', reciptsList)
    if (reciptsList.length > 0) {
        // by sorting castList, find shortest way 
        reciptsList.sort((a, b) => {
            if (a.value < b.value) return -1
            if (a.value > b.value) return 1
            return 0
        })
        console.error('reciptsList', reciptsList)
        id = 0
        // check here if need more ingredient for cast from reciptsList
        // let needIngredient = inventory.findIndex((inv, index) => (inv + reciptsList[id].deltaCast[index] < 0))

        // find if no need to cast anything
        // took one with more ingredients
        let needIngredient
        for (var i = 0; i < reciptsList.length; i++) {
            needIngredient = inventory.findIndex((inv, index) => (inv + reciptsList[i].deltaCast[index] < 0))
            console.error('needIngredient ====', needIngredient)
            console.error('needIngredient == i', i)
            if (needIngredient === -1) {
                id = i
                return reciptsList[id].castable ? reciptsList[id].actionId : 0
            }
        }

        // FIND HERE IF I CAN DO REPEATEBLE OR BEST ONE

        console.error('needIngredient to cast SPELL', needIngredient, id, reciptsList[id].actionId) // 2 
        // need to cast something for 0
        

        if (needIngredient !== -1) {
            count = Math.abs(reciptsList[id].deltaCast[needIngredient])
            // go to full cast list
            while (inventory[needIngredient - 1] === 0) needIngredient--
            return castList[needIngredient].castable ? castList[needIngredient].actionId : 0
        } else {
            return reciptsList[id].castable ? reciptsList[id].actionId : 0 ///here no nned
        }

        return id
    } else return 0
}

let findFastest = (brewList, brew, inventoryList) => {
    console.error('brew!!!!' ) 
    let newID = 0
    let readyBrew = []
    let needMoreIng = 99

    const brewListSort = brewList.sort((a,b)=> b.price - a.price)
    // delta [] check inventary by each index
    // see how many ingredients need more, choose with less
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
    console.error('needMoreIng', needMoreIng)
    return readyBrew
}

let checkPlace = (needCast, castList, inventory) => {
        // check if castable by inventory space FUNCTION
        console.error('needCast checkPlace', needCast )
        let noPlace = false

        const invPlace = 10 - inventory.reduce((a, b) => a + b, 0)
        // let castObj = castList[needCast]
        let castObj = castList.find((item) => (item.actionId === needCast)) || castList[needCast]

        castObj.deltaCast.forEach((item, i)=> {
            if (item < 0 && inventory[i] + item < 0) noPlace = true // need find
            if (castObj.deltaCast.ingredient > invPlace) noPlace = true // need find
        })

        console.error('noPlace', noPlace, invPlace, castObj.deltaCast) // deltaCast: [ -4, 0, 1, 1 ],

        if (noPlace) { //find new Spell
            castList.findIndex((el) => {
                let sum = el.deltaCast.reduce((a, b) => a + b, 0)
                return (sum >= 0 && sum <= invPlace)
            })
        } else {
            return needCast
        }

        // let noPlace = castObj.deltaCast.reduce((a, b) => a + b) > invPlace // !!! here trouble,
        console.error('!!!!!!id === -1', id)
        // if (id === -1) {
        //     console.error('id === -1 CHANGE RECIPT AND SEARCH IF I CAN CAST')
        //     recipt = findFastest(brewList, brew, inventory)
        //     console.error('recipt -1', recipt)
        //     if (goBrew) return null
        //     else return 0
        // }
        /////// NO PLACE END
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
            brewList.push({actionId, price, delta: [delta0, delta1, delta2, delta3]})
        }
        if (actionType === 'CAST') {
            castList.push({actionId, castable, repeatable, deltaCast: [delta0, delta1, delta2, delta3]})
            // add Steps and Ingredients
            castList = castList.map((item) => {
                let value = Number(item.deltaCast.join(''))
                let ingredient = 0
                item.deltaCast.forEach((item, index) => {
                    if (item >= 0) ingredient += item
                })
                return {...item, ingredient, value: value ? value : 0}
            })
        }
        if (actionType === 'LEARN') {
            learnList.push({actionId, repeatable, tomeIndex, taxCount, deltaLearn: [delta0, delta1, delta2, delta3]})
        }
    }

    // const mySpell = (id) => castList.find((el) => (el.actionId === id && el.castable))

    for (let i = 0; i < 2; i++) {
        var inputs = readline().split(' ');
        const inv0 = parseInt(inputs[0]); // tier-0 ingredients in inventory
        const inv1 = parseInt(inputs[1]);
        const inv2 = parseInt(inputs[2]);
        const inv3 = parseInt(inputs[3]);
        const score = parseInt(inputs[4]); // amount of rupees
        
        if (i === 0) {
            inventoryList = [inv0, inv1, inv2, inv3]
        }
    }
    
    // check if there free one
    needCAST = checkFreeSpells(castList, inventoryList)

    /////// SEARCH FOR RECIPT

    recipt = findFastest(brewList, brew, inventoryList)
    
    
    console.error('recipt', recipt)

    if (needCAST === 0 || !needCAST) {
        needCAST = checkIngredients(inventoryList, recipt, castList, brewList)
        console.error('checkPlace ', needCAST)
        if (needCAST !== null) needCAST = checkPlace(needCAST, castList, inventoryList)
    }

    console.error('needCAST NOW ', needCAST)

    let freeLearn = learnList.find((item) => !item.repeatable || item.taxCount > 0)
    let learnID = shouldLearn(freeLearn, inventoryList, castList)
    // console.error('learnList', learnID, learnList)

    if (learnID !== null && learn < 11 && !goBrew) {
        learn++
        console.log('LEARN', learnID)
        // console.log('LEARN', learnList[0].actionId)
    } else if (needCAST !== null) {
        if (needCAST === 0) console.log('REST');
        else console.log('CAST', needCAST);
    } else {
        brew++
        goBrew = false
        recipt = []
        console.log('BREW', brewID);    
    }
}
