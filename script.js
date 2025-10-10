let allPkms = []; //all Pokes, which are loaded

let currentPkms = []; //all Pokes, which are searched

let BASE_URL = `https://pokeapi.co/api/v2/pokemon/`

let PokeDetails = {}; //object with PokeDetails

let allResults =[]; //all loaded pkms with char(0).lowerCase

let evoChain  = {}; //object Evo-chain

let pokeEvolution = []; //array with current loaded poke-evolution; first is 0


function init() {
    let path = `?limit=20&offset=0`
    getPokemons(path);
}


// fetch the namesOfPokes
async function getPokemons (path) {
    try {
    let response = await fetch (BASE_URL + path)
    let responseAsJson = await response.json()
    let results = responseAsJson.results //Hier wird das results array aus json in ein array hineingeladen
    allResults = allResults.concat(results); //das sind dann alle Pokemons 
    loadPokes (results)
    await pokeDetails(allResults)
    renderPokes (); 
    } catch (error) {
      console.error("Ups, loading has not worked - please try again" , error)
}
}

// char(0).upperCase for the loaded Pkms
function loadPokes (results) {
    for (let i=0; i< results.length; i++) {
        let pokeName = results[i].name.charAt(0).toUpperCase() + results[i].name.slice(1);
        allPkms.push(pokeName) //array with names (char0 - upperCase)
    }  
}

//fetch PokeDetails and add to object PokeDetails
async function pokeDetails (allResults) {
    const offset =  Object.keys(PokeDetails).length
    for (let i = offset; i < allResults.length; i++)  
    {
    const detailResponse = await fetch(allResults[i].url);
    const pokeDetail = await detailResponse.json(); 
    PokeDetails[i] =pokeDetail //Object
    }
}

// render all loaded Pokes
function renderPokes () {
let contentRef = document.getElementById("names")
contentRef.innerHTML = ""; 
 for (let i= 0; i< allPkms.length; i++) {
    if (!PokeDetails[i].types[1]) {
        showPokeWithOneType (i)
    }
    else {showPokeWithTwoTypes (i)}
 }
 renderButton()
}

//search and put to currentPkms
function filterAndShowNames(filterWord) {
    let contentRef = document.getElementById("names")
    contentRef.innerHTML = ""; 
    if (filterWord.length < 3) {
    renderPokes()
  } else {
    currentPkms = allPkms.filter(name => name.toLowerCase().startsWith(filterWord.toLowerCase()));
    renderPokesSearch()
  } 
}

//show found Pokes
function renderPokesSearch() {
    let contentRef = document.getElementById("names")
    contentRef.innerHTML = ""; 
    for (let index= 0; index< currentPkms.length; index++) {
    const name = currentPkms[index]
    const i = allPkms.findIndex(p => p.toLowerCase() === name.toLowerCase());
    if (i === -1) continue; // if there`s no suitable index
    if (!PokeDetails[i].types[1]) {
      showPokeWithOneType(i);
    } else {
      showPokeWithTwoTypes(i);
    }
  }
  renderButton()
}

//load more Pokes
function renderMorePokes() {
    const offset = Object.keys(PokeDetails).length; 
    let path = `?limit=20&offset=${offset}`
    getMorePokemons(path);
}

async function getMorePokemons (path) {
    document.getElementById('loading').classList.remove('d_none');
    try {
    let response = await fetch (BASE_URL + path)
    let responseAsJson = await response.json()
    let results = responseAsJson.results //Hier wird das results array aus json in ein array hineingeladen
    allResults = allResults.concat(results); //das sind dann alle Pokemons 
    loadPokes (results)
    await pokeDetails(allResults)
    renderPokes (); 
    } catch (error) {
      console.error("Ups, loading has not worked - please try again" , error)
    } finally {
      document.getElementById('loading').classList.add('d_none');
    }
}

//render PokeDetails
function renderPokeDetails (i) {
  let abilities = getAbilities(i)
  if (!PokeDetails[i].types[1]) {
        getTemplateOneTyp (i, abilities)
    }
    else {
        getTemplateTwoTypes (i, abilities)
    }
}

function getAbilities (i) {
  let abilitiesPoke = [] ;  
  if (PokeDetails[i].abilities[0]) {
    abilitiesPoke.push(PokeDetails[i].abilities[0].ability.name) }
  if (PokeDetails[i].abilities[1]) {
    abilitiesPoke.push(PokeDetails[i].abilities[1].ability.name)}
  if (PokeDetails[i].abilities[2]) {
    abilitiesPoke.push(PokeDetails[i].abilities[2].ability.name)}
 return abilitiesPoke
}

//function to show main
function renderMain(i, event) {
  // document.getElementById("all_details").innerHTML ="";
  preventBubbling(event)
  renderPokeDetails (i)
}

//function to show stat
function renderStat (i, event) {
  preventBubbling(event)
  // document.getElementById("all_details").innerHTML ="";
  renderStatTemplate(i)
}

//functions for evolution
//main-function
async function fetchEvoAndRender(i, event) {
  preventBubbling(event)
  let name = allPkms[i].charAt(0).toLowerCase() + allPkms[i].slice(1)
  let Id= await getEvoChainId (name)
  await getEvoChain (Id)
  getEvoArray(); 
  let ifp = findIndexOfFirstEvoPoke ()
  let isp = findIndexOfSecondEvoPoke ()
  let itp = findIndexOfThirdEvoPoke ()
  document.getElementById("blue_overlay").innerHTML =""; 
  renderEvoTemplate(ifp,isp,itp,i)
}

async function getEvoChainId (name) {
  const evoChainIdResponse = await fetch (`https://pokeapi.co/api/v2/pokemon-species/${name}`)
  const evoChainIdData = await evoChainIdResponse.json(); 
  const evoChainUrl = evoChainIdData.evolution_chain.url
  const getId = evoChainUrl.split('/').filter(Boolean); 
  let evoChainId = getId[getId.length - 1]
  return evoChainId
}

async function getEvoChain (Id){
  const response = await fetch (`https://pokeapi.co/api/v2/evolution-chain/${Id}/`)
  const evoChainData = await response.json(); 
  evoChain = evoChainData.chain
}

function getEvoArray () {
  let firstPoke = evoChain.species.name
  pokeEvolution.push(firstPoke.charAt(0).toUpperCase() + firstPoke.slice(1))
  if (evoChain.evolves_to[0].species.name){ 
  let secondPoke = evoChain.evolves_to[0].species.name
  pokeEvolution.push(secondPoke.charAt(0).toUpperCase() + secondPoke.slice(1)) }
  if (evoChain.evolves_to[0].evolves_to[0].species.name) {
  let thirdPoke = evoChain.evolves_to[0].evolves_to[0].species.name
  pokeEvolution.push(thirdPoke.charAt(0).toUpperCase() + thirdPoke.slice(1)) }
}

//functions to find index of EvoPokes
function findIndexOfFirstEvoPoke () {
  let iFirstPoke = allPkms.findIndex(p => p === pokeEvolution[0])
  return iFirstPoke
}

function findIndexOfSecondEvoPoke () {
  let iSecondPoke = allPkms.findIndex(p => p === pokeEvolution[1])
  return iSecondPoke
}

function findIndexOfThirdEvoPoke () {
  let iThirdPoke = allPkms.findIndex(p => p === pokeEvolution[2])
  return iThirdPoke
}

//show nextPoke

function nextPokeRight(i, event) {
  i++
  preventBubbling(event)
  document.getElementById("blue_overlay").innerHTML = ""; 
  pokeEvolution = []; 
  if (i<allPkms.length) {
    renderPokeDetails (i)
  }
  else {
    i=0
    renderPokeDetails (i)
  }
}

function nextPokeLeft(i, event) {
  i--
  preventBubbling(event)
  document.getElementById("blue_overlay").innerHTML = ""; 
  pokeEvolution = []; 
  if (i= 0) {
    i= allPkms.length - 1
    renderPokeDetails (i) }
  else {renderPokeDetails (i) }
}

//prevent event bubbling + open/close
function preventBubbling(event) {
   event.stopPropagation()
}

function showDetails(i) {
  document.getElementById("names").classList.add("d_none")
  document.getElementById("button").classList.add("d_none")
  document.getElementById("blue_overlay").classList.remove("d_none")
  document.getElementById("body").classList.add("noscroll")
  renderPokeDetails(i)
}

function closeDialogue() {
  document.getElementById("blue_overlay").classList.add("d_none")
  document.getElementById("body").classList.remove("noscroll")
  document.getElementById("names").classList.remove("d_none")
  document.getElementById("button").classList.remove("d_none")
  pokeEvolution = []; 
}