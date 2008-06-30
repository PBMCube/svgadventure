function useObject1() {
    alert('You was used this rock');
}

function sceneSetup() {
    landscape = 
        [[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
         [0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
         [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
         [0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
         [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
         [0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0],
         [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
         [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]];
    dialogTreeMushroom = [];
    dialogTreeMushroom.push(
        {'start': '',
         'answers':
             [{'variant': 'Hello',
               'func': goPhrase,
               'arg': 1},
              {'variant': 'All your base are belong to us!',
               'func': goPhrase,
               'arg': 2}
             ]
        }
    );
    dialogTreeMushroom.push(
        {'start': 'Hello. I\'m a mushroom',
         'answers':
             [{'variant': 'I like mushrooms!',
               'func': clearPhraseVariants,
               'arg': null},
              {'variant': 'Bye',
               'func': clearPhraseVariants,
               'arg': null}
             ]
        }
    );
    dialogTreeMushroom.push(
        {'start': 'GTFO',
         'answers':
             [{'variant': 'Shut up',
               'func': clearPhraseVariants,
               'arg': null},
              {'variant': 'Show me the alert',
               'func': function(t) {alert(t); clearPhraseVariants()},
               'arg': 'Here it is'}
             ]
        }
    );
    createDoor(0, 0, 'scene002', 0, 6, 'sc001_door01.png');
    var n = createObject(5, 5, 20, 20, 'sc001_obj01.png', 'Crystal Rock 1');
    if (n != -1) {
        objects[n]['use'] = useObject1;
        objects[n]['portable'] = true;
    }
    n = createObject(9, 5, 40, 54, 'mushroom.png', 'Talking Mushroom');
    if (n != -1) {
        objects[n]['talking'] = true;
        objects[n]['dialog'] = dialogTreeMushroom;
    }
}
