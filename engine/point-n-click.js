const west = 0;
const south = 1;
const east = 2;
const north = 3;
const ontarget = 4;
const walk = 0;
const get = 1;
const use = 2;
const talk = 3;
const cellSizeX = 40;
const cellSizeY = 60;
const originalCellSizeX = 120;
const originalCellSizeY = 180;
const maximumBagSize = 4;
const bagCellSizeX = 50;
const bagCellSizeY = 50;
var hintText;
var svgDocument;
var modesDocument;
var doorAttribs = [];
var objects = [];
var landscape = new Array(8);
var heroX = 7;
var heroY = 7;
var targetX = 7;
var targetY = 7;
var direction = 1;
var directionY;
var phase = 2;
var phaseX;
var mode = walk;
var deletedObjects = {};
var currentScene;
var bag = [];
var bagDocument;

// Change the scene (this function will be called every moment)
function advance() {
    // Are we already in some door?
    for (i=0; i<doorAttribs.length; i++) {
        if (heroX == doorAttribs[i]['x'] &&
            heroY == doorAttribs[i]['y'])
        {
            hintText.nodeValue = "In door!";
            goDoor(doorAttribs[i]);
        }
    }
    // Movement
    if (heroX < targetX) {
        direction = east;
    } else if (heroX > targetX) {
        direction = west;
    } else if (heroY < targetY) {
        direction = south;
    } else if (heroY > targetY) {
        direction = north;
    } else {
        direction = ontarget;
    }
    var newHeroX = heroX;
    var newHeroY = heroY;
    switch (direction) {
    case east:
        newHeroX++;
        break;
    case west:
        newHeroX--;
        break;
    case south:
        newHeroY++;
        break;
    case north:
        newHeroY--;
        break;
    case ontarget:
        break;
    }
    if (landscape[newHeroY][newHeroX] != 1) {
        heroX = newHeroX;
        heroY = newHeroY;
    } else {
        targetX = heroX;
        targetY = heroY;
    }
    phase = ++phase % 2;
    phaseX = phase * originalCellSizeX;
    directionY = direction * originalCellSizeY;
    svgDocument.getElementById('hero').setAttribute(
        'viewBox',
        phaseX + ' ' + directionY + ' 120 180'
    );
    svgDocument.getElementById('hero').setAttribute(
        'x',
        heroX * cellSizeX
    );
    svgDocument.getElementById('hero').setAttribute(
        'y',
        heroY * cellSizeY
    );
}

// Change the scene
function goDoor(door) {
    // Remember scene name
    newScene = door['sceneName'];
    // Go to new coordinates
    // in new location
    heroX = door['newX'];
    heroY = door['newY'];
    // Stop 
    // FIXME: did we need
    // function for this?
    targetX = heroX;
    targetY = heroY;
    // Remove old doors
    doors = [];
    doorAttribs = [];
    var doorsContainer = svgDocument.getElementById('doors');
    var oldDoors = doorsContainer.getElementsByTagName('circle');
    var doorsCount = oldDoors.length;
    for (i = 0; i < doorsCount; i++) {
        doorsContainer.removeChild(oldDoors[i]);
    }
    // Remove old objects
    objects = [];
    var objectsContainer = svgDocument.getElementById('objects');
    var oldObjects = objectsContainer.getElementsByTagName('svg');
    var objectsCount = oldObjects.length;
    for (i = 0; i < objectsCount; i++) {
        objectsContainer.removeChild(oldObjects[i]);
    }
    loadScene(newScene);
}

function loadScene(sceneName) {
    // Remove old scene script
    var script = document.getElementById('sceneScript');
    if (script) {
        document.removeChild();
    }
    // Add new scene script
    var head = document.getElementsByTagName("head")[0];
    script = document.createElement('script');
    script.type = 'text/ecmascript';
    script.id = 'SceneScript';
    script.setAttribute('onload', 'sceneSetup()');
    script.src = sceneName + '.js';
    head.appendChild(script);
    // Remember new scene name
    currentScene = sceneName;
    // On the first load create array for deleted objects
    if (!deletedObjects[currentScene]) {
        deletedObjects[currentScene] = [];
    }
    // Load new background
    svgDocument.getElementById('backgroundImage').setAttributeNS(
        'http://www.w3.org/1999/xlink',
        'xlink:href',
        sceneName + '.png'
    );
}

// Clear hint text
function clearHint() {
    switch (mode) {
    case walk:
        hintText.nodeValue = "Go to ";
        break;
    case get:
        hintText.nodeValue = "Get ";
        break;
    case use:
        hintText.nodeValue = "Use ";
        break;
    case talk:
        hintText.nodeValue = "Talk to ";
        break;
    }
}

// Go to clicked position
function onClickToBackground(evt) {
    if (mode == walk) {
        targetX = parseInt(evt.clientX / cellSizeX);
        targetY = parseInt(evt.clientY / cellSizeY);
    }
}

function onClickToObject(evt) {
    // User click to logical coordinates (clickX, clickY)
    var clickX = parseInt(evt.clientX / cellSizeX);
    var clickY = parseInt(evt.clientY / cellSizeY);
    // ...according to action mode:
    switch (mode) {
    case walk:
        targetX = clickX;
        targetY = clickY;
        break;
    case get:
        if ((Math.abs(heroX - clickX)) < 2 &&
             Math.abs(heroY - clickY) < 2)
        {
            getObjectToBag(clickX, clickY);
        }
        break;
    case use:
        if ((Math.abs(heroX - clickX)) < 2 &&
             Math.abs(heroY - clickY) < 2)
        {
            useObject(clickX, clickY);
        }
        break;
    case talk:
        if ((Math.abs(heroX - clickX)) < 2 &&
             Math.abs(heroY - clickY) < 2)
        {
            alert('talk');
        }
        break;
    }
}

// Event dispatcher: redirects "mouseOver" events
function onMouseOverElement(evt) {
    if (evt.target.id.match('door')) {
        if (mode == walk) {
            hintText.nodeValue = hintText.nodeValue +
                evt.target.getElementsByTagName('desc')[0].firstChild.nodeValue;
        }
    } else if (evt.target.id.match('object')) {
        hintText.nodeValue =  hintText.nodeValue +
            evt.target.parentNode.getAttribute('desc');
    } else {
        clearHint();
    }
}

// Collect objects
function getObjectToBag(objectX, objectY) {
    if (bag.length >= maximumBagSize) {
        alert("The bag is full");
        return;
    }
    var objectToGet;
    for (i=0; i<objects.length; i++) {
        if (objects[i]['x'] == objectX &&
            objects[i]['y'] == objectY)
        {
            if (!objects[i]['portable']) {
                return;
            }
            objectToGet = svgDocument.getElementById(
                'object' + i + 'container'
            );
            svgDocument.getElementById('objects').removeChild(
                objectToGet
            );
            deletedObjects[currentScene].push(objects[i]['name']);
            bag.push(objects[i]);
            objectToGet.setAttribute(
                'x',
                (bagCellSizeX * (bag.length - 1)) +
                    (bagCellSizeX / 2) -
                    (objectToGet.getAttribute('width') / 2) +
                    2 * bag.length
            );
            objectToGet.setAttribute(
                'y',
                (bagCellSizeY / 2) -
                    objectToGet.getAttribute('height') / 2
            );
            bagDocument.getElementById('bagPicture').appendChild(
                objectToGet
            );
        }
    }
}

// Use object
function useObject(objectX, objectY) {
    for (i=0; i<objects.length; i++) {
        if (objects[i]['x'] == objectX &&
            objects[i]['y'] == objectY)
        {
            if (objects[i]['use'] != null) {
                objects[i]['use']();
            }
        }
    }
}

// Create door
function createDoor(x, y, targetScene, newX, newY) {
    var n = doorAttribs.push({}) - 1;
    doorAttribs[n]['x'] = x;
    doorAttribs[n]['y'] = y;
    doorAttribs[n]['sceneName'] = targetScene;
    doorAttribs[n]['newX'] = newX;
    doorAttribs[n]['newY'] = newY;
    var newDoor = svgDocument.createElementNS(
        'http://www.w3.org/2000/svg',
        'circle'
    );
    newDoor.setAttribute('cx', (x * cellSizeX) + (cellSizeX / 2));
    newDoor.setAttribute('cy', (y * cellSizeY) + (cellSizeY / 2));
    newDoor.setAttribute('r', '20');
    newDoor.setAttribute('fill', 'lightpink');
    newDoor.setAttribute('stroke', 'lightcoral');
    newDoor.setAttribute('stroke-width', '4');
    newDoor.setAttribute('id', 'door-to-' + targetScene);
    var newTitle = svgDocument.createElement('title');
    newTitle.appendChild(svgDocument.createTextNode(targetScene));
    newDoor.appendChild(newTitle);
    var newDescription = svgDocument.createElement('desc');
    newDescription.appendChild(svgDocument.createTextNode(targetScene));
    newDoor.appendChild(newDescription);
    // On click go to door
    newDoor.addEventListener(
        'click',
        onClickToBackground,
        false
    );
    // On mouse over show hint
    newDoor.addEventListener(
        'mouseover',
        onMouseOverElement,
        false
    );
    svgDocument.getElementById('doors').appendChild(
        newDoor
    );
}

function createObject(x, y,
                      xSize, ySize,
                      objectFile,
                      objectName)
{
    var localDeleted = deletedObjects[currentScene];
    if (!localDeleted.length < 1) {
        if (localDeleted.indexOf(objectName) != -1) {
            return;
        }
    }
    // Object information
    var n = objects.push({}) - 1;
    objects[n]['x'] = x;
    objects[n]['y'] = y;
    objects[n]['name'] = objectName;
    objects[n]['use'] = null;
    objects[n]['portable'] = false;
    // Object image
    var newObject = svgDocument.createElementNS(
        'http://www.w3.org/2000/svg',
        'svg'
    );
    newObject.setAttribute(
        'x',
        (x * cellSizeX) + ((cellSizeX / 2) - (xSize / 2))
    );
    newObject.setAttribute(
        'y',
        (y * cellSizeY) + (cellSizeY - ySize)
    );
    newObject.setAttribute('width', xSize);
    newObject.setAttribute('height', ySize);
    newObject.setAttribute(
        'viewBox',
        '0 0 ' + xSize + ' ' + ySize
    );
    newObject.setAttribute('id', 'object' + n + 'container')
    newObject.setAttribute('desc', objectName)
    var newObjectImage = svgDocument.createElementNS(
        'http://www.w3.org/2000/svg',
        'image'
    );
    newObjectImage.setAttributeNS(
        'http://www.w3.org/1999/xlink',
        'xlink:href',
        'sc001_obj01.png'
    );
    newObjectImage.setAttribute('width', xSize);
    newObjectImage.setAttribute('height', ySize);
    newObjectImage.setAttribute('id', 'object' + n);
    newObject.appendChild(newObjectImage);
    svgDocument.getElementById('objects').appendChild(
        newObject
    );
    // On mouse over show hint
    newObject.addEventListener(
        'mouseover',
        onMouseOverElement,
        false
    );
    // On click determine the repspective action
    newObject.addEventListener(
        'click',
        onClickToObject,
        false
    );
    svgDocument.getElementById('objects').appendChild(
        newObject
    );
    return n;
}

function changeMode(evt) {
    if (evt.target.id.match('go')) {
        mode = walk;
    } else if (evt.target.id.match('get')) {
        mode = get;
    } else if (evt.target.id.match('use')) {
        mode = use;
    } else if (evt.target.id.match('talk')) {
        mode = talk;
    }
    clearHint();
}

function init() {
    hintText = document.getElementById('hint').firstChild;
    // Connecting event listeners to viewport
    svgDocument=document.getElementById('gamescreen').contentDocument;
    // On click to background go to clicked postition
    svgDocument.getElementById('background').addEventListener('click',
      onClickToBackground,
      false
    );
    // On mouse over background crear hint field
    svgDocument.getElementById('background').addEventListener('mouseover',
      clearHint,
      false
    );
    // Connecting event listeners to controls
    modesDocument=document.getElementById('modes').contentDocument;
    // Adding event listener to mode buttons
    modesDocument.getElementById('go').addEventListener(
        'click',
        changeMode,
        false
    );
    modesDocument.getElementById('get').addEventListener(
        'click',
        changeMode,
        false
    );
    modesDocument.getElementById('use').addEventListener(
        'click',
        changeMode,
        false
    );
    modesDocument.getElementById('talk').addEventListener(
        'click',
        changeMode,
        false
    );
    bagDocument = document.getElementById('bag').contentDocument;
    // Loading initial scene
    loadScene('scene001');
    // Change all the scene every half second
    setInterval("advance()" , 500);
}
