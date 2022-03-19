const CONTRACT_ADDRESS = "0xf0f2b46091ae752D9A2D6763092e889cc17deAc0";

const transformCharacterData = (characterData) => {
    return {
        name: characterData.name ,
        imageURI: characterData.imageURI ,
        hp: characterData.hp.toNumber() ,
        maxHp: characterData.maxHp.toNumber() ,
        attackDamage: characterData.attackDamage.toNumber() 

    }
}






export {CONTRACT_ADDRESS ,transformCharacterData };